import React from 'react';
import { Input, Card, Icon, SectionHeader, Button } from '../../../design-system';
import type { CreateEventDraft, UpdateCreateEventDraft, CreateEventMealOptionDraft } from './createEventDraft';

interface OperationsStepProps {
  draft: CreateEventDraft;
  updateDraft: UpdateCreateEventDraft;
}

export const OperationsStep: React.FC<OperationsStepProps> = ({
  draft,
  updateDraft,
}) => {
  const percentNum = Number(draft.thermoThresholdPercent);
  const hasThreshold = draft.thermoThresholdPercent.trim() !== '' && !isNaN(percentNum);
  const clampedPercent = hasThreshold ? Math.max(0, Math.min(100, percentNum)) : 0;

  const handleAddMeal = () => {
    const newMeal: CreateEventMealOptionDraft = {
      id: `meal-${Date.now()}`,
      name: '',
      type: '',
    };
    updateDraft('mealOptions', [...draft.mealOptions, newMeal]);
  };

  const handleRemoveMeal = (id: string) => {
    const updated = draft.mealOptions.filter((m) => m.id !== id);
    updateDraft('mealOptions', updated);
  };

  const handleMealChange = (id: string, field: 'name' | 'type', value: string) => {
    const updated = draft.mealOptions.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    );
    updateDraft('mealOptions', updated);
  };

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
            description="Opciones de menú habilitadas en la selección de banquete para este evento."
            className="mb-0"
          />
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={handleAddMeal}
            iconStart="plus"
          >
            Agregar opción
          </Button>
        </div>

        {draft.mealOptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 rounded-card border border-dashed border-silver-800 bg-obsidian-900/40 text-center gap-2">
            <span className="text-xs font-semibold text-silver-300">Aún no hay opciones de platillo configuradas.</span>
            <p className="text-[11px] text-silver-400">
              Agrega los menús de banquete correspondientes a este evento.
            </p>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleAddMeal}
              className="mt-2"
              iconStart="plus"
            >
              Agregar primera opción
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {draft.mealOptions.map((meal, idx) => (
              <div
                key={meal.id}
                className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-silver-200">Opción {idx + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => handleRemoveMeal(meal.id)}
                    className="text-xs text-status-error hover:bg-status-error/10 h-7 px-2"
                  >
                    Eliminar
                  </Button>
                </div>
                <Input
                  id={`meal-name-${meal.id}`}
                  label="Nombre del menú"
                  placeholder="Ej. Menú Tradicional"
                  value={meal.name}
                  onChange={(e) => handleMealChange(meal.id, 'name', e.target.value)}
                />
                <Input
                  id={`meal-type-${meal.id}`}
                  label="Descripción / Detalles"
                  placeholder="Ej. 3 tiempos con corte de carne"
                  value={meal.type}
                  onChange={(e) => handleMealChange(meal.id, 'type', e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. Termo Conmemorativo */}
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <SectionHeader
          title="Termo"
          description="Define el umbral de pago requerido para habilitar la personalización del termo (configurable por evento)."
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
              helperText="Al alcanzar este porcentaje de pago acumulado, el termo estará disponible para solicitar."
            />
          </div>

          {/* Visual Progress Preview */}
          <div className="p-6 bg-obsidian-900 rounded-card border border-silver-800/80 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-obsidian-800 text-gold-400 border border-silver-700/60 flex items-center justify-center shadow-sm">
              <Icon name="cup" size={28} />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-silver-50 font-sans">
                {hasThreshold ? `${clampedPercent}%` : '—'}
              </span>
              <p className="text-xs font-medium text-silver-400 mt-1">
                {hasThreshold ? 'Umbral configurado' : 'Sin umbral configurado'}
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
