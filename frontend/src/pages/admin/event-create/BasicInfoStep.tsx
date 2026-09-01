import React from 'react';
import { Input, Card, SectionHeader } from '../../../design-system';
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
    <div className="space-y-6 font-sans">
      {/* 1. Información General */}
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <SectionHeader
          title="Información general"
          description="Define los datos operativos principales de la graduación o evento."
        />

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

      {/* 2. Escuela / Carrera / Generación */}
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <SectionHeader
          title="Escuela / carrera / generación"
          description="Datos académicos e identidad institucional vinculada a la generación."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            id="eventInstitution"
            label="Escuela / institución"
            placeholder="Ej. Universidad Nacional Autónoma de México"
            value={draft.institution}
            onChange={(e) => updateDraft('institution', e.target.value)}
            iconStart="building"
          />

          <Input
            id="eventCareer"
            label="Carrera o facultad"
            placeholder="Ej. Licenciatura en Derecho"
            value={draft.career}
            onChange={(e) => updateDraft('career', e.target.value)}
            iconStart="users"
          />

          <Input
            id="eventGeneration"
            label="Generación"
            placeholder="Ej. 2023 - 2027"
            value={draft.generation}
            onChange={(e) => updateDraft('generation', e.target.value)}
            iconStart="calendar"
          />
        </div>
      </Card>
    </div>
  );
};
