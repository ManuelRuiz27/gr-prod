import React, { useMemo, useState } from 'react';
import { Button, Modal } from '../../design-system';
import { VISUAL_QA_GRADUATE_SEATING_STATES, VISUAL_QA_TABLES, type VisualTable } from '../../fixtures';
import { SeatingMapCanvas } from '../admin/tables/SeatingMapCanvas';
import { type SeatingTableViewModel } from '../admin/tables/seatingCoordinates';

export interface GraduateTableScreenProps { seatingStateId?: string; }

export const GraduateTableScreen: React.FC<GraduateTableScreenProps> = ({ seatingStateId = 'seating-andrea-partial' }) => {
  const seating = VISUAL_QA_GRADUATE_SEATING_STATES[seatingStateId] ?? VISUAL_QA_GRADUATE_SEATING_STATES['seating-andrea-partial'];
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<VisualTable | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const tables = VISUAL_QA_TABLES;
  const canvasTables: SeatingTableViewModel[] = useMemo(() => tables.map((table) => ({ ...table, assignments: [] })), [tables]);
  const selectedMembers = seating.members.filter((member) => selectedMemberIds.includes(member.id));
  const toggleMember = (id: string) => setSelectedMemberIds((current) => current.includes(id) ? current.filter((memberId) => memberId !== id) : [...current, id]);
  const canAssign = Boolean(selectedTable && selectedMembers.length && selectedTable.status === 'AVAILABLE' && selectedTable.available >= selectedMembers.length);
  const containsChild = selectedMembers.some((member) => /niñ|infantil/i.test(member.productType));

  if (!seating.isFinanciallyEligible) return <div className="mx-auto max-w-xl space-y-5 pb-16 font-sans animate-fadeIn"><h1 className="font-display text-2xl font-bold text-silver-50">Mesa</h1><p className="text-sm text-silver-300">La selección de mesa aún no está disponible.</p><a href="/graduate/payments"><Button variant="primary">Ver pagos</Button></a></div>;

  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 overflow-hidden pb-16 font-sans animate-fadeIn">
    <header><h1 className="font-display text-2xl font-bold text-silver-50">Mesa</h1></header>
    {assigned && <p className="text-sm text-status-success">Asignación preparada para Mesa {selectedTable?.number}.</p>}
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-start">
      <section className="order-2 space-y-3 lg:order-1">
        <SeatingMapCanvas tables={canvasTables} selectedTableId={selectedTable?.id ?? null} mode="graduate" onSelectTable={(id) => setSelectedTable(tables.find((table) => table.id === id) ?? null)} />
        <Button variant="ghost" size="sm" onClick={() => setListOpen((current) => !current)}>Ver como lista</Button>
        {listOpen && <div className="space-y-2 pt-2">{tables.map((table) => <div key={table.id} className="flex items-center justify-between gap-3 py-2 text-sm"><span className="text-silver-100">Mesa {table.number}</span><span className="text-silver-400">{table.available ? table.available + ' libres' : 'Completa'}</span>{table.available > 0 && <Button size="sm" variant="ghost" onClick={() => setSelectedTable(table)}>Seleccionar</Button>}</div>)}</div>}
      </section>
      <aside className="order-1 space-y-3 lg:order-2"><h2 className="text-sm font-semibold text-silver-100">¿A quién quieres ubicar?</h2><div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col">{seating.members.map((member) => <button key={member.id} type="button" onClick={() => toggleMember(member.id)} className={selectedMemberIds.includes(member.id) ? 'shrink-0 rounded-lg bg-gold-500 px-3 py-2 text-left text-sm text-obsidian-950' : 'shrink-0 rounded-lg bg-obsidian-900 px-3 py-2 text-left text-sm text-silver-200'}>{member.name}{member.assignedTableNumber ? ' · Mesa ' + member.assignedTableNumber : ''}</button>)}</div>{containsChild && <p className="text-xs text-silver-400">Verifica en qué mesa quedará el menor.</p>}<p className="text-xs text-silver-400">{selectedMembers.length ? selectedMembers.length + ' persona(s) seleccionada(s)' : 'Selecciona una o más personas.'}</p>{selectedTable && <div className="space-y-2 pt-2"><p className="font-medium text-silver-100">Mesa {selectedTable.number}</p><p className="text-sm text-silver-400">{selectedTable.available} lugares disponibles</p><Button variant="primary" size="sm" disabled={!canAssign} onClick={() => setAssigned(true)}>Asignar {selectedMembers.length || ''} persona{selectedMembers.length === 1 ? '' : 's'}</Button></div>}</aside>
    </div>
    {selectedTable && <Modal isOpen={Boolean(selectedTable)} onClose={() => setSelectedTable(null)} title={'Mesa ' + selectedTable.number} size="sm"><div className="space-y-4"><p className="text-sm text-silver-300">{selectedTable.available} lugares disponibles</p>{selectedMembers.map((member) => <p key={member.id} className="text-sm text-silver-100">{member.name}</p>)}<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setSelectedTable(null)}>Cancelar</Button><Button variant="primary" disabled={!canAssign} onClick={() => { setAssigned(true); setSelectedTable(null); }}>Asignar {selectedMembers.length} personas</Button></div></div></Modal>}
  </div>;
};
