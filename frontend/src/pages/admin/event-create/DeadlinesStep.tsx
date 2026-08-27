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
        <h2 className="text-lg font-bold text-navy-900">Fechas límite</h2>
        <p className="text-xs text-content-secondary">
          Establece los plazos límite para lugares, mesas y selección de menú (opcionales).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Places deadline card */}
        <div className="p-4 bg-surface-low rounded-xl border border-surface-high flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-lowest text-gold-600 flex items-center justify-center shadow-xs">
              <Icon name="users" size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-navy-900">Lugares</h3>
              <p className="text-[11px] text-content-secondary">Confirmación y asignación</p>
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
        <div className="p-4 bg-surface-low rounded-xl border border-surface-high flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-lowest text-gold-600 flex items-center justify-center shadow-xs">
              <Icon name="building" size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-navy-900">Mesas</h3>
              <p className="text-[11px] text-content-secondary">Reubicación entre mesas</p>
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
        <div className="p-4 bg-surface-low rounded-xl border border-surface-high flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-lowest text-gold-600 flex items-center justify-center shadow-xs">
              <Icon name="ticket" size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-navy-900">Platillos</h3>
              <p className="text-[11px] text-content-secondary">Selección y preferencias</p>
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
