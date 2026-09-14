import { useMemo, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../design-system';
import { PresetSeatingWorkspace } from '../components/seating/PresetSeatingWorkspace';
import { seatingScenarios, type SeatingScenario } from './seatingQuantityScenarios';
import { createLocalAccountSeatingGateway, getLocalSeatingSelection, localSeatingScenario, selectLocalSeatingScenario, subscribeLocalSeating } from './localAccountSeating';

export default function AccountSeatingScreen({ eventId, role }: { eventId: string; role: 'admin' | 'graduate' }) {
  const { user, token } = useAuth();
  const selection = useSyncExternalStore(subscribeLocalSeating, getLocalSeatingSelection, getLocalSeatingSelection);
  const scenario = localSeatingScenario(selection);
  const gateway = useMemo(() => createLocalAccountSeatingGateway(user?.id ?? '', token ?? '', eventId, localSeatingScenario(selection)), [user?.id, token, eventId, selection]);
  return <div className="space-y-5">
    <section aria-label="Prueba del usuario" className="space-y-3 border-b border-amber-300/30 pb-4">
      <p className="text-sm text-amber-200">Prueba local · {user?.full_name} · capacidades simuladas</p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 max-w-full text-xs text-silver-300">Caso de prueba
          <select aria-label="Caso de prueba" value={scenario} onChange={event => selectLocalSeatingScenario(event.target.value as SeatingScenario)} className="mt-1 block w-full max-w-full rounded-lg bg-obsidian-800 p-3 text-sm text-silver-100">
            {Object.entries(seatingScenarios).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <Button variant="secondary" onClick={() => selectLocalSeatingScenario(scenario, true)}>Reiniciar caso</Button>
        <Link className="py-2 text-sm text-gold-300 underline" to={role === 'graduate' ? '/admin/login' : '/login'}>Entrar con el otro usuario</Link>
      </div>
    </section>
    <PresetSeatingWorkspace key={`${user?.id}:${eventId}:${selection}`} eventId={eventId} role={role} gateway={gateway} />
  </div>;
}
