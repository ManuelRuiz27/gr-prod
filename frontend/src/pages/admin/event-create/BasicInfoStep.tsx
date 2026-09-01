import React from 'react';
import { Input, Card } from '../../../design-system';
import type { CreateEventDraft, UpdateCreateEventDraft } from './createEventDraft';

interface BasicInfoStepProps {
  draft: CreateEventDraft;
  updateDraft: UpdateCreateEventDraft;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  draft,
  updateDraft,
}) => {
  return (
    <Card className="p-6 md:p-8 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-silver-50">Información básica</h2>
        <p className="text-xs text-silver-400">
          Define los datos principales de la graduación o evento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Input
            id="eventName"
            label="Nombre del evento"
            placeholder="Ej. Graduación Facultad de Derecho 2027"
            value={draft.name}
            onChange={(e) => updateDraft('name', e.target.value)}
            iconStart="ticket"
            required
          />
        </div>

        <Input
          id="eventDate"
          label="Fecha"
          type="date"
          value={draft.eventDate}
          onChange={(e) => updateDraft('eventDate', e.target.value)}
          iconStart="calendar"
          required
        />

        <Input
          id="eventCapacity"
          label="Capacidad"
          type="number"
          min={1}
          placeholder="Ej. 500"
          value={draft.capacity}
          onChange={(e) => updateDraft('capacity', e.target.value)}
          iconStart="users"
          required
        />

        <div className="md:col-span-2">
          <Input
            id="eventVenue"
            label="Lugar"
            placeholder="Ej. Hotel Ritz Carlton, CDMX"
            value={draft.venue}
            onChange={(e) => updateDraft('venue', e.target.value)}
            iconStart="building"
            required
          />
        </div>
      </div>
    </Card>
  );
};
