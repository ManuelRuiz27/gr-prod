import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PresetSeatingWorkspace } from '../../components/seating/PresetSeatingWorkspace';
import { LocalAccountSeating } from '../../components/seating/LocalAccountSeating';
import { defaultSeatingGateway } from '../../services/seating/presetSeatingGateway';
import type { SeatingGateway } from '../../services/seating/presetSeatingTypes';

export interface GraduateTableScreenProps { eventId?: string; gateway?: SeatingGateway }
export function GraduateTableScreen({ eventId: suppliedEventId, gateway = defaultSeatingGateway }: GraduateTableScreenProps) {
  const { memberships } = useAuth();
  const [params, setParams] = useSearchParams();
  const requested = suppliedEventId ?? params.get('event_id');
  const eventId = requested ?? (memberships.length === 1 ? memberships[0].event_id : '');
  // The preview belongs to the bundled template, never to an invented graduate or membership.
  if (gateway.mode === 'http' && !suppliedEventId && (!eventId || !memberships.some(item => item.event_id === eventId))) {
    return <div className="space-y-3"><h1 className="font-display text-2xl text-silver-50">Mesas</h1>
      <p className="text-sm text-silver-300">Selecciona uno de tus eventos para consultar sus mesas.</p>
      <label className="block text-sm text-silver-300" htmlFor="seating-event">Evento</label>
      <select id="seating-event" value="" onChange={event => setParams({ event_id: event.target.value })} className="max-w-full rounded-lg bg-obsidian-800 p-3 text-silver-100">
        <option value="" disabled>Selecciona un evento</option>
        {memberships.map(item => <option key={item.id} value={item.event_id}>{item.event?.name ?? item.event_id}</option>)}
      </select>
    </div>;
  }
  return <LocalAccountSeating eventId={eventId} role="graduate"><PresetSeatingWorkspace key={`${gateway.mode}:${eventId}`} eventId={eventId} role="graduate" gateway={gateway} /></LocalAccountSeating>;
}
