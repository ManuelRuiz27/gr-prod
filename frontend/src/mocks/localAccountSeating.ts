import { safeGetItem, safeSetItem, safeRemoveItem } from '../lib/storage';
import { decodeSeatingSnapshot } from '../services/seating/presetSeatingGateway';
import { createSeatingScenarioGateway, seatingScenarios, type SeatingScenario, type SeatingScenarioPersistence } from './seatingQuantityScenarios';
import { localTestAccounts, LOCAL_TEST_EVENT, LOCAL_TEST_TOKEN_PREFIX } from './localTestAccounts';
import type { SeatingGateway } from '../services/seating/presetSeatingTypes';

const PREFIX = 'gr.demo.seating-accounts.v1';
const CHANGE = 'gr:local-seating-scenario';
const selectionKey = `${PREFIX}.selection`;
type StoredSnapshot = NonNullable<ReturnType<SeatingScenarioPersistence['read']>>['state'];
function orientStoredSnapshot(snapshot: StoredSnapshot): StoredSnapshot {
  const map = snapshot.map;
  // Preserve local allocations and retry receipts saved before the orientation correction.
  if (map.template_id !== 'taller-2560' || map.width !== 1000 || map.height !== 1540) return snapshot;
  return { ...snapshot, map: { ...map, width: 1540, height: 1000,
    tables: map.tables.map(table => ({ ...table, x: table.y, y: Number((1 - table.x).toFixed(8)), width: table.height, height: table.width })) } };
}
export function getLocalSeatingSelection() { return safeGetItem(selectionKey) ?? 'partial:0'; }
export function localSeatingScenario(selection: string): SeatingScenario {
  const name = selection.split(':')[0];
  return Object.hasOwn(seatingScenarios, name) ? name as SeatingScenario : 'partial';
}
export function subscribeLocalSeating(listener: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === selectionKey || event.key === null) listener(); };
  window.addEventListener(CHANGE, listener);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(CHANGE, listener); window.removeEventListener('storage', onStorage); };
}
export function selectLocalSeatingScenario(scenario: SeatingScenario, reset = false) {
  if (reset) safeRemoveItem(`${PREFIX}.${scenario}`);
  safeSetItem(selectionKey, `${scenario}:${Date.now()}`);
  window.dispatchEvent(new Event(CHANGE));
}

/** Shared local event data, with a gateway bound to one seeded account and role. No backend writes. */
export function createLocalAccountSeatingGateway(accountId: string, token: string, eventId: string, scenario: SeatingScenario): SeatingGateway {
  const account = localTestAccounts.find(item => item.id === accountId && token === `${LOCAL_TEST_TOKEN_PREFIX}${item.id}`);
  const authorized = account && eventId === LOCAL_TEST_EVENT;
  const storageKey = `${PREFIX}.${scenario}`;
  const persistence: SeatingScenarioPersistence = {
    read() {
      try {
        const raw = safeGetItem(storageKey);
        if (!raw) return null;
        const saved = JSON.parse(raw) as ReturnType<SeatingScenarioPersistence['read']>;
        if (!saved || typeof saved.failOnce !== 'boolean' || !Array.isArray(saved.receipts)) return null;
        const oriented = orientStoredSnapshot(saved.state);
        const checked = decodeSeatingSnapshot(oriented.map, oriented.own, eventId);
        if (checked.mode !== 'live' || !checked.own) return null;
        return { ...saved, state: checked, receipts: saved.receipts.map(([key, receipt]) => [key, { ...receipt, snapshot: orientStoredSnapshot(receipt.snapshot) }]) };
      } catch { return null; }
    },
    write(value) { safeSetItem(storageKey, JSON.stringify(value)); },
  };
  const simulated = createSeatingScenarioGateway(scenario, eventId, authorized ? persistence : undefined);
  return {
    mode: simulated.mode,
    async load(requestedEvent, role, signal) {
      if (!authorized || requestedEvent !== eventId || account.role.toLowerCase() !== role) throw new Error('Este usuario de prueba no tiene acceso a esta vista o evento.');
      return simulated.load(requestedEvent, role, signal);
    },
    async save(requestedEvent, input, key, signal) {
      if (!authorized || requestedEvent !== eventId || account.role !== 'GRADUATE') throw new Error('Solo Andrea puede confirmar sus lugares de prueba.');
      // Serializes read/validate/write between tabs on browsers that implement Web Locks.
      if (typeof navigator !== 'undefined' && navigator.locks) {
        return navigator.locks.request(storageKey, { signal }, () => simulated.save(requestedEvent, input, key, signal));
      }
      return simulated.save(requestedEvent, input, key, signal);
    },
  };
}
