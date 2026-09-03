import { Badge, Button, Card } from '../design-system';
import { demoApi } from './apiClient';
import { isMockDataMode } from './config';
import { useDemo } from './useDemo';
import type { DemoState } from './types';

export function DemoFlowPanel({ flow }: { flow: 'contract' | 'group' | 'seating' | 'meals' | 'thermo' | 'cancellation' | 'reports' }) {
  const { state } = useDemo();
  if (!isMockDataMode) return null;
  const firstMember = state.group_members[0];
  const error = (action: () => Promise<unknown>) => { void action().catch((reason) => window.alert(String(reason))); };
  const occupancy = state.tables.map((table) => `${table.label}: ${state.seating.assigned_member_ids.filter((value) => value.endsWith(`@${table.id}`)).length}/${table.capacity}`).join(' · ');
  const nextThermo: DemoState['thermo']['status'] | undefined = ({ LOCKED: 'AVAILABLE', AVAILABLE: 'REQUESTED', REQUESTED: 'IN_PRODUCTION', IN_PRODUCTION: 'DELIVERED', DELIVERED: undefined } as const)[state.thermo.status];
  return <Card className="p-3 border border-gold-500/30 bg-obsidian-900/80 text-xs" data-testid={`demo-flow-${flow}`}>
    <div className="flex flex-wrap items-center justify-between gap-2"><div><span className="font-bold text-gold-400">Demo interactiva</span><span className="ml-2 text-silver-400">Estado compartido</span></div><Badge variant="neutral" size="sm">{state.scenario}</Badge></div>
    {flow === 'contract' && <div className="mt-2 flex items-center justify-between gap-2"><span>Contrato: {state.contract_status}</span><Button size="sm" variant="secondary" disabled={state.contract_status !== 'PENDING_ACCEPTANCE'} onClick={() => error(() => demoApi.acceptContract(state.event_id))}>Aceptar contrato</Button></div>}
    {flow === 'group' && <div className="mt-2 flex items-center justify-between gap-2"><span>{state.group_members.length} integrantes · {state.products.map((item) => `${item.label} ×${item.quantity}`).join(', ')}</span><Button size="sm" variant="secondary" onClick={() => error(() => demoApi.addGroupMember(state.event_id, 'Invitado demo'))}>Agregar integrante</Button></div>}
    {flow === 'seating' && <div className="mt-2 flex items-center justify-between gap-2"><span>{state.seating.financially_eligible && state.seating.deadline_open ? occupancy : 'Selección bloqueada por condición del evento'}</span><Button size="sm" variant="secondary" disabled={!firstMember} onClick={() => error(() => demoApi.assignTables(state.event_id, [{ group_member_id: firstMember.id, table_id: 'tbl-25' }]))}>Asignar a Mesa 25</Button></div>}
    {flow === 'meals' && <div className="mt-2 flex items-center justify-between gap-2"><span>{state.meals.deadline_open ? `${state.meals.pending_count} platillos pendientes` : 'Fecha límite cerrada: solo lectura'}</span><Button size="sm" variant="secondary" disabled={!state.meals.deadline_open || !firstMember} onClick={() => error(() => demoApi.selectMeal(state.event_id, firstMember.id, 'meal-vegetarian'))}>Elegir vegetariano</Button></div>}
    {flow === 'thermo' && <div className="mt-2 flex items-center justify-between gap-2"><span>Termo: {state.thermo.status}</span>{nextThermo && <Button size="sm" variant="secondary" onClick={() => error(() => nextThermo === 'REQUESTED' ? demoApi.requestThermo(state.event_id) : demoApi.updateThermo(state.event_id, { status: nextThermo }))}>Cambiar a {nextThermo}</Button>}</div>}
    {flow === 'cancellation' && <div className="mt-2 flex items-center justify-between gap-2"><span>Quote {state.cancellation_quote.quote_id}: reembolso ${state.cancellation_quote.refund_due} · adeudo ${state.cancellation_quote.remaining_due}</span><Button size="sm" variant="danger" disabled={state.membership_status === 'CANCELLED'} onClick={() => error(() => demoApi.cancelMembership(state.event_id, state.graduate_membership_id, state.cancellation_quote.quote_id, 'Cancelación de demostración'))}>Confirmar cancelación</Button></div>}
    {flow === 'reports' && <div className="mt-2 text-silver-300">Cobrado ${state.payment_plan.totalPaid.toLocaleString('es-MX')} · allocations {state.payment_allocations.length} · {occupancy} · termo {state.thermo.status}</div>}
  </Card>;
}
