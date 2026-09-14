import { useParams } from 'react-router-dom';
import { PresetSeatingWorkspace } from '../../components/seating/PresetSeatingWorkspace';
import { LocalAccountSeating } from '../../components/seating/LocalAccountSeating';
import { defaultSeatingGateway } from '../../services/seating/presetSeatingGateway';
import type { SeatingGateway } from '../../services/seating/presetSeatingTypes';

export function AdminEventTablesScreen({ gateway = defaultSeatingGateway }: { gateway?: SeatingGateway }) {
  const { eventId } = useParams();
  if (!eventId) return <div className="space-y-2"><h1 className="font-display text-2xl text-silver-50">Mesas</h1>
    <p className="text-sm text-silver-300">Abre un evento para consultar su croquis.</p></div>;
  return <LocalAccountSeating eventId={eventId} role="admin"><PresetSeatingWorkspace key={`${gateway.mode}:${eventId}`} eventId={eventId} role="admin" gateway={gateway} /></LocalAccountSeating>;
}
