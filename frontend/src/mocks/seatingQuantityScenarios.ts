import { defaultSeatingTemplate } from '../services/seating/seatingTemplate';
import { previewSeatingGateway } from '../services/seating/presetSeatingGateway';
import type { AllocationInput, SeatingGateway, SeatingSnapshot } from '../services/seating/presetSeatingTypes';

export const seatingScenarios = {
  preview: 'Vista previa sin capacidades',
  available: 'Mesas disponibles',
  partial: 'Ocupación parcial y grupo distribuible',
  full: 'Mesas completas',
  blocked: 'Mesas bloqueadas',
  'payment-required': 'Pago requerido pendiente',
  'deadline-closed': 'Fecha de selección terminada',
  'capacity-conflict': 'Otro graduado ocupa el cupo al confirmar',
  'version-conflict': 'La distribución cambia en otra sesión',
  'network-error': 'Falla de red al confirmar; reintento',
} as const;
export type SeatingScenario = keyof typeof seatingScenarios;
type Live = Extract<SeatingSnapshot, { mode: 'live' }>;
export interface SeatingScenarioPersistence {
  read: () => { state: Live; failOnce: boolean; receipts: [string, { body: string; snapshot: Live }][] } | null;
  write: (value: { state: Live; failOnce: boolean; receipts: [string, { body: string; snapshot: Live }][] }) => void;
}

/** Synthetic data for automated tests and DEV-only account/QA screens. Never used by the production preview. */
export function createSeatingScenarioSnapshot(eventId = 'test-event'): Live {
  return {
    mode: 'live', template: defaultSeatingTemplate,
    map: { event_id: eventId, template_id: defaultSeatingTemplate.id, template_version: 1,
      width: defaultSeatingTemplate.width, height: defaultSeatingTemplate.height, eligibility: 'ELIGIBLE',
      tables: defaultSeatingTemplate.tables.map((table, index) => ({ ...table, id: `table-${index + 1}`, template_key: table.key,
        capacity: 15, occupied: index === 0 ? 9 : index === 1 ? 15 : 0, available: index === 0 ? 6 : index === 1 ? 0 : 15,
        status: index === 2 ? 'BLOCKED' : 'AVAILABLE', shape: index === 3 ? 'ROUND' : table.shape })),
    },
    own: { version: 1, confirmed_places: 8, assigned_places: 2, unassigned_places: 6,
      allocations: [{ table_id: 'table-1', quantity: 2, named_quantity: 1 }] },
  };
}
function conflict(code: string): never { throw { response: { status: 409, data: { error: { code } } } }; }

/** Contract simulation: isolated state unless a DEV account storage adapter is supplied; no HTTP, payment or DB effects. */
export function createSeatingScenarioGateway(scenario: SeatingScenario, eventId = 'test-event', persistence?: SeatingScenarioPersistence): SeatingGateway {
  if (scenario === 'preview') return previewSeatingGateway;
  let state = createSeatingScenarioSnapshot(eventId);
  if (scenario === 'available') {
    state.map.tables.forEach(table => { table.occupied = 0; table.available = table.capacity; table.status = 'AVAILABLE'; });
    state.own = { version: 1, confirmed_places: 8, assigned_places: 0, unassigned_places: 8, allocations: [] };
  }
  if (scenario === 'full') state.map.tables.forEach(table => { table.occupied = table.capacity; table.available = 0; table.status = 'AVAILABLE'; });
  if (scenario === 'blocked') state.map.tables.forEach(table => { table.status = 'BLOCKED'; });
  if (scenario === 'payment-required') state.map.eligibility = 'PAYMENT_REQUIRED';
  if (scenario === 'deadline-closed') state.map.eligibility = 'DEADLINE_CLOSED';
  let failOnce = true;
  const receipts = new Map<string, { body: string; snapshot: Live }>();
  const restore = () => {
    const saved = persistence?.read();
    if (saved) {
      state = structuredClone(saved.state); failOnce = saved.failOnce; receipts.clear();
      saved.receipts.forEach(([key, value]) => receipts.set(key, value));
    }
  };
  const persist = () => persistence?.write({ state, failOnce, receipts: [...receipts.entries()] });
  restore();
  return {
    mode: 'http',
    async load(requestedEvent, role, signal) {
      signal.throwIfAborted();
      if (requestedEvent !== eventId) throw new Error('Evento de prueba no disponible.');
      restore();
      const snapshot = structuredClone(state);
      if (role === 'admin') snapshot.own = null;
      return snapshot;
    },
    async save(requestedEvent, input: AllocationInput, key, signal) {
      signal.throwIfAborted();
      if (requestedEvent !== eventId) throw new Error('Evento de prueba no disponible.');
      restore();
      const body = JSON.stringify(input);
      const receipt = receipts.get(key);
      if (receipt) {
        if (receipt.body !== body) conflict('IDEMPOTENCY_KEY_REUSED');
        return structuredClone(receipt.snapshot);
      }
      const own = state.own!;
      if (state.map.eligibility === 'PAYMENT_REQUIRED') conflict('SEATING_NOT_FINANCIALLY_ELIGIBLE');
      if (state.map.eligibility === 'DEADLINE_CLOSED') conflict('SEATING_DEADLINE_CLOSED');
      if (input.expected_version !== own.version) conflict('ALLOCATION_VERSION_CHANGED');
      if (failOnce && ['network-error', 'capacity-conflict', 'version-conflict'].includes(scenario)) {
        failOnce = false;
        if (scenario === 'network-error') { persist(); throw new Error('Falla de red simulada. Actualiza y vuelve a confirmar.'); }
        state = structuredClone(state);
        if (scenario === 'version-conflict') { state.own!.version += 1; persist(); conflict('ALLOCATION_VERSION_CHANGED'); }
        const increase = input.allocations.find(item => item.quantity > (own.allocations.find(a => a.table_id === item.table_id)?.quantity ?? 0));
        const table = state.map.tables.find(table => table.id === increase?.table_id);
        if (table) { table.occupied = table.capacity; table.available = 0; }
        persist();
        conflict('TABLE_CAPACITY_CHANGED');
      }
      const ids = new Set<string>();
      for (const item of input.allocations) {
        if (ids.has(item.table_id) || !Number.isSafeInteger(item.quantity) || item.quantity <= 0 || !state.map.tables.some(t => t.id === item.table_id)) conflict('INVALID_ALLOCATION');
        ids.add(item.table_id);
      }
      const total = input.allocations.reduce((sum, item) => sum + item.quantity, 0);
      if (total > own.confirmed_places) conflict('ALLOCATION_EXCEEDS_CONFIRMED_PLACES');
      const next = structuredClone(state);
      for (const table of next.map.tables) {
        const previous = own.allocations.find(item => item.table_id === table.id);
        const quantity = input.allocations.find(item => item.table_id === table.id)?.quantity ?? 0;
        if (quantity < (previous?.named_quantity ?? 0)) conflict('ALLOCATION_BELOW_NAMED_QUANTITY');
        if (table.status === 'BLOCKED' && quantity > (previous?.quantity ?? 0)) conflict('TABLE_BLOCKED');
        const occupied = table.occupied - (previous?.quantity ?? 0) + quantity;
        if (occupied > table.capacity) conflict('TABLE_CAPACITY_CHANGED');
        table.occupied = occupied; table.available = table.capacity - occupied;
      }
      next.own = { ...own, version: own.version + 1, assigned_places: total, unassigned_places: own.confirmed_places - total,
        allocations: input.allocations.map(item => ({ ...item, named_quantity: own.allocations.find(a => a.table_id === item.table_id)?.named_quantity ?? 0 })) };
      state = next;
      receipts.set(key, { body, snapshot: structuredClone(next) });
      persist();
      return structuredClone(next);
    },
  };
}
