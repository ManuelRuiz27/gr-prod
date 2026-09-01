import React from 'react';
import { Input, Card, Icon, SectionHeader, Badge } from '../../../design-system';
import type { CreateEventDraft, UpdateCreateEventDraft } from './createEventDraft';

interface OperationsStepProps {
  draft: CreateEventDraft;
  updateDraft: UpdateCreateEventDraft;
}

export const OperationsStep: React.FC<OperationsStepProps> = ({
  draft,
  updateDraft,
}) => {
  const percentNum = Number(draft.thermoThresholdPercent) || 0;
  const clampedPercent = Math.max(0, Math.min(100, percentNum));

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Fechas Límite */}
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <SectionHeader
          title="Fechas límite"
          description="Establece los plazos de cierre para confirmación de lugares, mesas y selección de menú."
        />

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

      {/* 2. Platillos */}
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-silver-800/80 pb-4">
          <SectionHeader
            title="Platillos"
            description="Opciones de banquete habilitadas en la selección para graduados e invitados."
            className="mb-0"
          />
          <Badge variant="neutral" size="sm">
            {draft.mealOptions.length} menús configurados
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {draft.mealOptions.map((meal) => (
            <div
              key={meal.id}
              className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-obsidian-800 text-gold-400 border border-silver-700/60 flex items-center justify-center shrink-0">
                <Icon name="meal" size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-silver-100">{meal.name}</span>
                <span className="text-[11px] text-silver-400 mt-0.5 leading-relaxed">{meal.type}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Termo Conmemorativo */}
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <SectionHeader
          title="Termo"
          description="Define el umbral de pago requerido para habilitar la personalización del termo."
        />

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
          <div className="p-6 bg-obsidian-900 rounded-card border border-silver-800/80 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-obsidian-800 text-gold-400 border border-silver-700/60 flex items-center justify-center shadow-sm">
              <Icon name="cup" size={28} />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-silver-50 font-sans">
                {clampedPercent}%
              </span>
              <p className="text-xs font-medium text-silver-400 mt-1">
                Umbral configurado
              </p>
            </div>
            <div className="w-full bg-obsidian-800 h-2.5 rounded-full overflow-hidden border border-silver-800/60">
              <div
                className="bg-gold-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${clampedPercent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
