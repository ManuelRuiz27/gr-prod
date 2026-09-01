import React from 'react';
import { Input, Card, Icon } from '../../../design-system';
import type { CreateEventDraft, UpdateCreateEventDraft } from './createEventDraft';

interface DeadlinesStepProps {
  draft: CreateEventDraft;
  updateDraft: UpdateCreateEventDraft;
}

export const DeadlinesStep: React.FC<DeadlinesStepProps> = ({
  draft,
  updateDraft,
}) => {
  return (
    <Card className="p-6 md:p-8 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-silver-50">Fechas límite</h2>
        <p className="text-xs text-silver-400">
          Establece los plazos límite para lugares, mesas y selección de menú (opcionales).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Places deadline card */}
        <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-obsidian-800 text-gold-400 border border-silver-700/60 flex items-center justify-center shadow-xs">
              <Icon name="users" size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-silver-100">Lugares</h3>
              <p className="text-[11px] text-silver-400">Confirmación y asignación</p>
            </div>
          </div>
          <Input
            id="placesDeadline"
            label="Fecha límite para lugares"
            type="date"
            value={draft.placesDeadline}
            onChange={(e) => updateDraft('placesDeadline', e.target.value)}
          />
        </div>

        {/* Table change deadline card */}
        <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-obsidian-800 text-gold-400 border border-silver-700/60 flex items-center justify-center shadow-xs">
              <Icon name="building" size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-silver-100">Mesas</h3>
              <p className="text-[11px] text-silver-400">Reubicación entre mesas</p>
            </div>
          </div>
          <Input
            id="tableChangeDeadline"
            label="Fecha límite para cambio de mesa"
            type="date"
            value={draft.tableChangeDeadline}
            onChange={(e) => updateDraft('tableChangeDeadline', e.target.value)}
          />
        </div>

        {/* Meals deadline card */}
        <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-obsidian-800 text-gold-400 border border-silver-700/60 flex items-center justify-center shadow-xs">
              <Icon name="ticket" size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-silver-100">Platillos</h3>
              <p className="text-[11px] text-silver-400">Selección y preferencias</p>
            </div>
          </div>
          <Input
            id="mealsDeadline"
            label="Fecha límite de platillos"
            type="date"
            value={draft.mealsDeadline}
            onChange={(e) => updateDraft('mealsDeadline', e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};
