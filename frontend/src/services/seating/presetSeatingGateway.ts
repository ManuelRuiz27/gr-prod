import { apiClient } from '../api/apiClient';
import { defaultSeatingTemplate, resolveSeatingTemplate } from './seatingTemplate';
import type { AllocationState, OperationalMap, SeatingEligibility, SeatingGateway, SeatingSnapshot } from './presetSeatingTypes';

const invalid = () => new Error('La información del croquis está incompleta. No se pueden confirmar lugares.');
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid();
  return value as Record<string, unknown>;
}
function string(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw invalid();
  return value;
}
function integer(value: unknown, min = 0): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min) throw invalid();
  return value;
}
function coordinate(value: unknown, min = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > 1) throw invalid();
  return value;
}
function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw invalid();
  return value;
}

/** Boundary decoder deliberately copies only public fields. Legacy payloads fail closed. */
export function decodeSeatingSnapshot(mapValue: unknown, ownValue: unknown, eventId: string): SeatingSnapshot {
  const source = record(mapValue);
  if (source.event_id !== eventId) throw invalid();
  const template = resolveSeatingTemplate(string(source.template_id), integer(source.template_version, 1));
  if (source.width !== template.width || source.height !== template.height) throw invalid();
  const eligibility = source.eligibility as SeatingEligibility;
  if (!['ELIGIBLE', 'PAYMENT_REQUIRED', 'DEADLINE_CLOSED', 'EVENT_CLOSED', 'MEMBERSHIP_INACTIVE'].includes(eligibility)) throw invalid();
  const keys = new Set(template.tables.map(table => table.key));
  const ids = new Set<string>();
  const tables: OperationalMap['tables'] = array(source.tables).map(value => {
    const table = record(value);
    const id = string(table.id);
    const key = string(table.template_key);
    if (ids.has(id) || !keys.delete(key)) throw invalid();
    ids.add(id);
    const capacity = integer(table.capacity, 1);
    const occupied = integer(table.occupied);
    const available = integer(table.available);
    if (occupied + available !== capacity) throw invalid();
    if (table.status !== 'AVAILABLE' && table.status !== 'BLOCKED') throw invalid();
    if (table.shape !== 'SQUARE' && table.shape !== 'ROUND') throw invalid();
    const x = coordinate(table.x), y = coordinate(table.y);
    const width = coordinate(table.width, Number.EPSILON), height = coordinate(table.height, Number.EPSILON);
    if (x - width / 2 < 0 || x + width / 2 > 1 || y - height / 2 < 0 || y + height / 2 > 1) throw invalid();
    return { id, template_key: key, capacity, occupied, available, status: table.status, shape: table.shape,
      label: string(table.label), x, y, width, height };
  });
  if (keys.size) throw invalid();
  let own: AllocationState | null = null;
  if (ownValue !== null) {
    const state = record(ownValue);
    const ownIds = new Set<string>();
    const allocations = array(state.allocations).map(value => {
      const item = record(value);
      const table_id = string(item.table_id);
      const quantity = integer(item.quantity, 1);
      const named_quantity = integer(item.named_quantity);
      const table = tables.find(t => t.id === table_id);
      if (!table || ownIds.has(table_id) || named_quantity > quantity || quantity > table.occupied) throw invalid();
      ownIds.add(table_id);
      return { table_id, quantity, named_quantity };
    });
    own = { version: integer(state.version), confirmed_places: integer(state.confirmed_places),
      assigned_places: integer(state.assigned_places), unassigned_places: integer(state.unassigned_places), allocations };
    if (own.assigned_places !== allocations.reduce((sum, item) => sum + item.quantity, 0)
      || own.assigned_places + own.unassigned_places !== own.confirmed_places) throw invalid();
  }
  return { mode: 'live', template, own, map: { event_id: eventId, template_id: template.id,
    template_version: template.version, width: template.width, height: template.height, eligibility, tables } };
}

export const previewSeatingGateway: SeatingGateway = {
  mode: 'preview',
  async load() { return { mode: 'preview', template: defaultSeatingTemplate }; },
  async save() { throw new Error('Este croquis está en vista previa.'); },
};
export const httpSeatingGateway: SeatingGateway = {
  mode: 'http',
  async load(eventId, role, signal) {
    if (!eventId) throw new Error('Selecciona un evento para consultar sus mesas.');
    const base = `/${role === 'admin' ? 'admin' : 'me'}/events/${encodeURIComponent(eventId)}`;
    const [map, own] = await Promise.all([
      apiClient.get<unknown>(`${base}/seating-map`, { signal }),
      role === 'graduate' ? apiClient.get<unknown>(`${base}/table-allocations`, { signal }) : Promise.resolve(null),
    ]);
    if (role === 'graduate' && own?.data == null) throw invalid();
    return decodeSeatingSnapshot(map.data, own?.data ?? null, eventId);
  },
  async save(eventId, input, idempotencyKey, signal) {
    const { data } = await apiClient.put<unknown>(`/me/events/${encodeURIComponent(eventId)}/table-allocations`, input,
      { signal, headers: { 'Idempotency-Key': idempotencyKey } });
    const body = record(data);
    return decodeSeatingSnapshot(body.map, body.allocation_state, eventId);
  },
};
// Explicit opt-in only after the quantity contract is deployed. No silent fallback to fake live data.
export const defaultSeatingGateway = import.meta.env.VITE_SEATING_SOURCE === 'http' ? httpSeatingGateway : previewSeatingGateway;

export function seatingRequestError(error: unknown): { conflict: boolean; message: string } {
  const failure = error as { response?: { status?: number; data?: { error?: { code?: string }; code?: string } } };
  const status = failure?.response?.status;
  const body = failure?.response?.data;
  const code = body?.error?.code ?? body?.code;
  const messages: Record<string, string> = {
    SEATING_NOT_FINANCIALLY_ELIGIBLE: 'Falta cubrir el pago requerido para elegir mesa.',
    SEATING_DEADLINE_CLOSED: 'La fecha para elegir mesa ha terminado.',
    TABLE_BLOCKED: 'Esta mesa está bloqueada. Elige otra mesa.',
    TABLE_CAPACITY_CHANGED: 'La disponibilidad cambió. Revisa las cantidades y confirma nuevamente.',
    ALLOCATION_VERSION_CHANGED: 'Tu distribución cambió en otra sesión. Revisa los lugares antes de confirmar.',
    ALLOCATION_BELOW_NAMED_QUANTITY: 'Reasigna primero los integrantes identificados de esta mesa.',
    ALLOCATION_EXCEEDS_CONFIRMED_PLACES: 'La cantidad supera tus lugares confirmados.',
  };
  return { conflict: status === 409, message: (code && messages[code]) ||
    (status === 401 || status === 403 ? 'No tienes acceso a las mesas de este evento.' :
      error instanceof Error && !('isAxiosError' in error) ? error.message : 'No pudimos actualizar el croquis. Reintenta antes de confirmar lugares.') };
}
