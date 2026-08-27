import React from 'react';
import { Input, Card, Icon } from '../../../design-system';
import type { CreateEventDraft, UpdateCreateEventDraft } from './createEventDraft';

interface ThermoStepProps {
  draft: CreateEventDraft;
  updateDraft: UpdateCreateEventDraft;
}

export const ThermoStep: React.FC<ThermoStepProps> = ({
  draft,
  updateDraft,
}) => {
  const percentNum = Number(draft.thermoThresholdPercent) || 0;
  const clampedPercent = Math.max(0, Math.min(100, percentNum));

  return (
    <Card className="p-6 md:p-8 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-navy-900">Termo conmemorativo</h2>
        <p className="text-xs text-content-secondary">
          Define el umbral de pago requerido para habilitar el termo al graduado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <Input
            id="thermoThresholdPercent"
            label="Porcentaje para desbloquear el termo"
            type="number"
            min={0}
            max={100}
            placeholder="Ej. 70"
            value={draft.thermoThresholdPercent}
            onChange={(e) => updateDraft('thermoThresholdPercent', e.target.value)}
            helperText="Al alcanzar este porcentaje de pago, el termo estará disponible para solicitar."
            required
          />
        </div>

        {/* Visual Progress Preview */}
        <div className="p-6 bg-surface-low rounded-2xl border border-surface-high flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-navy-900 text-gold-400 flex items-center justify-center shadow-sm">
            <Icon name="ticket" size={28} />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-navy-900">
              {clampedPercent}%
            </span>
            <p className="text-xs font-medium text-content-secondary mt-1">
              Umbral configurado
            </p>
          </div>
          <div className="w-full bg-surface-highest h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gold-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${clampedPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
