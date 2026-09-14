export type PresetTableShape = 'SQUARE' | 'ROUND';
export interface TemplateTable {
  key: string;
  label: string;
  shape: PresetTableShape;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number | null;
}
export interface SeatingTemplate {
  id: string;
  version: number;
  name: string;
  width: number;
  height: number;
  background: string;
  tables: TemplateTable[];
}
export interface OperationalTable {
  id: string;
  template_key: string;
  capacity: number;
  occupied: number;
  available: number;
  status: 'AVAILABLE' | 'BLOCKED';
}
export interface TableAllocation {
  table_id: string;
  quantity: number;
  named_quantity: number;
}
export interface AllocationState {
  version: number;
  confirmed_places: number;
  assigned_places: number;
  unassigned_places: number;
  allocations: TableAllocation[];
}
export type SeatingEligibility = 'ELIGIBLE' | 'PAYMENT_REQUIRED' | 'DEADLINE_CLOSED' | 'EVENT_CLOSED' | 'MEMBERSHIP_INACTIVE';
export interface OperationalMap {
  event_id: string;
  template_id: string;
  template_version: number;
  width: number;
  height: number;
  eligibility: SeatingEligibility;
  tables: (OperationalTable & Omit<TemplateTable, 'key' | 'capacity'>)[];
}
export type SeatingSnapshot =
  | { mode: 'preview'; template: SeatingTemplate }
  | { mode: 'live'; template: SeatingTemplate; map: OperationalMap; own: AllocationState | null };
export interface AllocationInput {
  expected_version: number;
  allocations: { table_id: string; quantity: number }[];
}
export interface SeatingGateway {
  mode: 'preview' | 'http';
  load(eventId: string, role: 'admin' | 'graduate', signal: AbortSignal): Promise<SeatingSnapshot>;
  save(eventId: string, input: AllocationInput, idempotencyKey: string, signal: AbortSignal): Promise<SeatingSnapshot>;
}
export interface DisplayTable extends TemplateTable {
  id: string;
  occupied: number | null;
  available: number | null;
  status: 'AVAILABLE' | 'BLOCKED' | 'PENDING';
}
export function displayTables(snapshot: SeatingSnapshot): DisplayTable[] {
  if (snapshot.mode === 'preview') return snapshot.template.tables.map(table => ({
    ...table, id: table.key, occupied: null, available: null, status: 'PENDING',
  }));
  return snapshot.map.tables.map(table => ({ ...table, key: table.template_key }));
}
export function tableAppearance(table: DisplayTable) {
  if (table.capacity === null || table.status === 'PENDING') return { label: 'Capacidad pendiente', short: 'Pendiente', color: '#94a3b8', fill: '#202936' };
  if (table.status === 'BLOCKED') return { label: 'Bloqueada', short: 'Bloqueada', color: '#fca5a5', fill: '#39232c' };
  if (table.available === 0) return { label: 'Completa · 0 lugares disponibles', short: 'Completa', color: '#aab5c4', fill: '#303846' };
  return {
    label: `${table.available} lugares disponibles de ${table.capacity}`,
    short: `${table.available} libres`,
    color: (table.occupied ?? 0) > 0 ? '#fcd34d' : '#6ee7b7',
    fill: (table.occupied ?? 0) > 0 ? '#383222' : '#193730',
  };
}
