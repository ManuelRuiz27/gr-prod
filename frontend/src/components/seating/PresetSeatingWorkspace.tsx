import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Modal } from '../../design-system';
import { usePresetSeating } from '../../services/seating/usePresetSeating';
import { displayTables, tableAppearance, type AllocationInput, type DisplayTable, type SeatingGateway, type SeatingSnapshot } from '../../services/seating/presetSeatingTypes';
import { PresetSeatingCanvas } from './PresetSeatingCanvas';

type LiveSnapshot = Extract<SeatingSnapshot, { mode: 'live' }>;
interface WorkspaceProps { eventId: string; role: 'admin' | 'graduate'; gateway: SeatingGateway }
const eligibilityMessages = {
  ELIGIBLE: '',
  PAYMENT_REQUIRED: 'Cubre el pago requerido del evento para elegir mesa.',
  DEADLINE_CLOSED: 'La fecha para elegir mesa ha terminado. Puedes consultar tu distribución.',
  EVENT_CLOSED: 'El evento no admite cambios de mesa.',
  MEMBERSHIP_INACTIVE: 'Tu participación no admite cambios de mesa.',
};
export function PresetSeatingWorkspace({ eventId, role, gateway }: WorkspaceProps) {
  const { snapshot, error, saving, refresh, save } = usePresetSeating(gateway, eventId, role);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (selectedId && window.matchMedia?.('(max-width: 1023px)').matches) panel.current?.focus({ preventScroll: true });
  }, [selectedId]);
  if (!snapshot) return <div className="space-y-4 py-6" aria-busy={!error}>
    <h1 className="font-display text-2xl text-silver-50">Mesas</h1>
    {error ? <><p role="alert">{error}</p><Button onClick={() => void refresh()}>Reintentar</Button></> :
      <div role="status" className="h-96 animate-pulse rounded-xl bg-obsidian-900 p-6 motion-reduce:animate-none">Cargando croquis…</div>}
  </div>;
  const tables = displayTables(snapshot);
  const selected = tables.find(table => table.id === selectedId) ?? null;
  const filtered = tables.filter(table => table.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const preview = snapshot.mode === 'preview';
  const selectTable = (id: string) => { setSelectedId(id); setNotice(''); };
  return <div className="w-full min-w-0 space-y-4 pb-8 font-sans">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="font-display text-2xl font-bold text-silver-50">Mesas</h1>
        <p className="mt-1 text-sm text-silver-400">{role === 'admin' ? 'Consulta la distribución del salón.' : 'Encuentra la mesa para ti y tus acompañantes.'}</p></div>
    </header>
    {preview && <p className="border-l-2 border-silver-500 pl-3 text-sm text-silver-300">Vista previa: capacidades pendientes.</p>}
    {error && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-amber-200"><span>{error}</span><Button variant="ghost" size="sm" disabled={saving} onClick={() => void refresh()}>Actualizar</Button></div>}
    {notice && <p role="status" className="text-sm text-emerald-200">{notice}</p>}
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-6">
      <div className="min-w-0 space-y-3">
        <form className="flex items-end gap-2" onSubmit={event => { event.preventDefault(); if (filtered.length === 1) selectTable(filtered[0].id); else setListOpen(true); }}>
          <div className="min-w-0 flex-1"><Input label="Buscar mesa" placeholder="Número de mesa" value={search} onChange={event => { setSearch(event.target.value); setListOpen(true); }} inputMode="numeric" /></div>
          <Button type="submit" variant="secondary">Buscar</Button>
        </form>
        <PresetSeatingCanvas template={snapshot.template} tables={tables} selectedId={selectedId} onSelect={selectTable} />
        <div aria-label="Leyenda de mesas" className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-silver-300">
          {preview ? <span><span className="mr-1.5 text-slate-400">□</span>Capacidad pendiente</span> :
            <><span><span className="mr-1.5 text-emerald-300">□</span>Disponible</span><span><span className="mr-1.5 text-amber-200">◩</span>Parcial</span><span>■ Completa</span><span className="text-red-200">× Bloqueada</span></>}
          <span className="text-gold-300">▣ Seleccionada</span>
        </div>
        <Button variant="ghost" size="sm" aria-expanded={listOpen} aria-controls="seating-table-list" onClick={() => setListOpen(value => !value)}>{listOpen ? 'Ocultar lista' : 'Ver como lista'}</Button>
        {listOpen && <div id="seating-table-list" className="max-h-80 overflow-y-auto" aria-label="Listado de mesas">
          {!filtered.length && <p className="py-4 text-sm text-silver-400">No encontramos esa mesa.</p>}
          {filtered.map(table => <button key={table.id} type="button" aria-pressed={selectedId === table.id} onClick={() => selectTable(table.id)}
            className={`flex min-h-12 w-full items-center justify-between gap-3 rounded px-3 py-3 text-left text-sm transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-gold-400 ${selectedId === table.id ? 'bg-gold-500/10 text-gold-200' : 'text-silver-200 hover:bg-obsidian-800'}`}>
            <span className="shrink-0">Mesa {table.label}</span><span className="text-right text-xs">{tableAppearance(table).label}</span>
          </button>)}
        </div>}
      </div>
      <aside ref={panel} tabIndex={-1} aria-label="Detalle de mesa" className={`${selected ? 'fixed inset-x-0 bottom-0 z-40 max-h-[55svh] overflow-y-auto rounded-t-2xl border-t border-silver-700 bg-obsidian-900 p-5 shadow-2xl motion-safe:animate-slideInBottom' : 'hidden'} min-w-0 space-y-5 focus:outline-none lg:static lg:z-auto lg:block lg:max-h-none lg:overflow-visible lg:rounded-none lg:border-l lg:border-t-0 lg:border-silver-800 lg:bg-transparent lg:p-0 lg:pl-5 lg:shadow-none`}>
        <div className="flex items-center justify-between gap-2"><h2 className="font-display text-xl text-silver-50">{selected ? `Mesa ${selected.label}` : 'Elige una mesa'}</h2>
          {selected && <Button variant="ghost" size="sm" className="min-h-11 min-w-11" aria-label="Cerrar detalle de mesa" onClick={() => { document.getElementById(`seating-table-${selected.id}`)?.focus({ preventScroll: true }); setSelectedId(null); }}>×</Button>}</div>
        {selected ? <div className="space-y-2 text-sm text-silver-300">
          <p>{selected.shape === 'SQUARE' ? 'Mesa cuadrada' : 'Mesa circular'}</p>
          <p className="text-silver-100">{tableAppearance(selected).label}</p>
          {selected.capacity !== null && <p>{selected.occupied} lugares ocupados · {selected.capacity} en total</p>}
        </div> : <p className="text-sm text-silver-400">Toca una mesa en el plano o búscala en la lista para consultar su detalle.</p>}
        {preview ? <div className="space-y-3"><p className="text-sm text-silver-400">La capacidad de las mesas está pendiente de confirmar.</p>
          {role === 'graduate' && <Button fullWidth disabled>Confirmar lugares</Button>}</div> : role === 'graduate' && snapshot.own &&
          <AllocationEditor key={snapshot.own.version} snapshot={snapshot} tables={tables} selected={selected} disabled={!!error || saving} saving={saving}
            onSelect={selectTable} onSave={async input => { const ok = await save(input); if (ok) setNotice('Tu distribución de lugares quedó confirmada.'); return ok; }} />}
        {!preview && role === 'admin' && <p className="text-xs text-silver-400">Disponibilidad actualizada mientras esta pantalla está abierta.</p>}
      </aside>
    </div>
  </div>;
}

interface EditorProps {
  snapshot: LiveSnapshot; tables: DisplayTable[]; selected: DisplayTable | null;
  disabled: boolean; saving: boolean; onSelect: (id: string) => void;
  onSave: (input: AllocationInput) => Promise<boolean>;
}
function AllocationEditor({ snapshot, tables, selected, disabled, saving, onSelect, onSave }: EditorProps) {
  const own = snapshot.own!;
  const [draft, setDraft] = useState<Record<string, number>>(() => Object.fromEntries(own.allocations.map(item => [item.table_id, item.quantity])));
  const [review, setReview] = useState<{ input: AllocationInput; signature: string } | null>(null);
  const total = Object.values(draft).reduce((sum, quantity) => sum + (Number.isFinite(quantity) ? quantity : 0), 0);
  const original = selected ? own.allocations.find(item => item.table_id === selected.id) : undefined;
  const quantity = selected ? draft[selected.id] ?? 0 : 0;
  const min = original?.named_quantity ?? 0;
  const max = selected ? Math.min(own.confirmed_places - total + (Number.isFinite(quantity) ? quantity : 0),
    (selected.status === 'BLOCKED' ? 0 : selected.available ?? 0) + (original?.quantity ?? 0)) : 0;
  const allocations = tables.filter(table => (draft[table.id] ?? 0) > 0).map(table => ({ table_id: table.id, quantity: draft[table.id] }));
  const dirty = tables.some(table => (draft[table.id] ?? 0) !== (own.allocations.find(item => item.table_id === table.id)?.quantity ?? 0));
  const valid = total <= own.confirmed_places && tables.every(table => {
    const next = draft[table.id] ?? 0, previous = own.allocations.find(item => item.table_id === table.id);
    return Number.isSafeInteger(next) && next >= (previous?.named_quantity ?? 0)
      && next <= (table.status === 'BLOCKED' ? 0 : table.available ?? 0) + (previous?.quantity ?? 0);
  });
  const eligible = snapshot.map.eligibility === 'ELIGIBLE';
  const signature = JSON.stringify([snapshot.map.eligibility, own, tables.map(table => [table.id, table.capacity, table.available, table.status])]);
  const reviewChanged = !!review && review.signature !== signature;
  const canConfirm = eligible && valid && dirty && !disabled;
  const change = (next: number) => { if (selected) setDraft(current => ({ ...current, [selected.id]: next })); };
  return <div className="space-y-5">
    <div className="space-y-1 text-sm text-silver-300"><p>{own.confirmed_places} lugares confirmados</p><p>{own.assigned_places} ubicados · {own.unassigned_places} pendientes de ubicar</p></div>
    {!eligible && <div className="space-y-2 text-sm text-amber-200"><p>{eligibilityMessages[snapshot.map.eligibility]}</p>
      {snapshot.map.eligibility === 'PAYMENT_REQUIRED' && <Link className="underline" to="/graduate/payments">Ver pagos</Link>}</div>}
    {selected && <div className="space-y-2">
      <label htmlFor="table-quantity" className="block text-sm text-silver-200">Lugares en esta mesa</label>
      <div className="flex items-center gap-2">
        <Button variant="secondary" aria-label="Quitar un lugar" disabled={!eligible || disabled || quantity <= min} onClick={() => change(quantity - 1)}>−</Button>
        <input id="table-quantity" type="number" min={min} max={max} step="1" inputMode="numeric" value={Number.isNaN(quantity) ? '' : quantity}
          disabled={!eligible || disabled} onChange={event => change(event.target.value === '' ? NaN : Number(event.target.value))}
          className="h-11 w-20 rounded-lg border border-silver-700 bg-obsidian-900 px-2 text-center text-silver-50 focus-visible:outline focus-visible:outline-gold-400" />
        <Button variant="secondary" aria-label="Agregar un lugar" disabled={!eligible || disabled || quantity >= max || Number.isNaN(quantity)} onClick={() => change(quantity + 1)}>+</Button>
      </div>
      <p className="text-xs text-silver-400">{min > 0 ? `${min} lugares ya tienen integrante identificado.` : 'Puedes completar los nombres después.'}</p>
    </div>}
    <div className="space-y-2"><h3 className="text-xs font-semibold uppercase tracking-wider text-silver-400">Tu distribución</h3>
      {allocations.length ? allocations.map(item => <button key={item.table_id} type="button" onClick={() => onSelect(item.table_id)} className="flex min-h-11 w-full items-center justify-between text-sm text-silver-200 hover:text-gold-300">
        <span>Mesa {tables.find(table => table.id === item.table_id)?.label}</span><span>{item.quantity} lugares</span>
      </button>) : <p className="text-sm text-silver-400">Aún no has ubicado lugares.</p>}
      {dirty && <p className="text-xs text-amber-200">Cambios pendientes de confirmar.</p>}
    </div>
    {!valid && <p role="alert" className="text-sm text-amber-200">Revisa la cantidad: debe respetar el cupo, tus lugares confirmados y los integrantes ya identificados.</p>}
    <Button fullWidth disabled={!canConfirm} onClick={() => setReview({ input: { expected_version: own.version, allocations }, signature })}>Revisar distribución</Button>
    <Modal isOpen={!!review} onClose={() => { if (!saving) setReview(null); }} title="Confirmar lugares" size="sm">
      <div className="space-y-4 text-sm text-silver-200">
        <p>Esta será la distribución de tus lugares confirmados.</p>
        {review?.input.allocations.map(item => <p key={item.table_id}>Mesa {tables.find(table => table.id === item.table_id)?.label}: {item.quantity} lugares</p>)}
        {!review?.input.allocations.length && <p>Todos tus lugares quedarán pendientes de ubicar.</p>}
        {reviewChanged && <p role="alert" className="text-amber-200">La disponibilidad cambió. Vuelve a revisar la distribución.</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" disabled={saving} onClick={() => setReview(null)}>Volver</Button>
          <Button disabled={!canConfirm || reviewChanged || saving} onClick={async () => { if (review) { await onSave(review.input); setReview(null); } }}>{saving ? 'Confirmando…' : 'Confirmar lugares'}</Button>
        </div>
      </div>
    </Modal>
  </div>;
}
