import React, { useMemo, useState } from 'react';
import { Alert, Button, EmptyState, Select } from '../../design-system';
import {
  VISUAL_QA_GRADUATE_MEALS_STATES,
  type VisualGraduateMealsState,
} from '../../fixtures/mealThermoVisualFixtures';

export interface GraduateMealsScreenProps {
  mealsStateId?: string;
}

export const GraduateMealsScreen: React.FC<GraduateMealsScreenProps> = ({
  mealsStateId = 'meals-andrea-active',
}) => {
  const mealsState: VisualGraduateMealsState =
    VISUAL_QA_GRADUATE_MEALS_STATES[mealsStateId] ??
    VISUAL_QA_GRADUATE_MEALS_STATES['meals-andrea-active'];
  const activeOptions = useMemo(
    () => mealsState.options.filter((option) => option.isActive),
    [mealsState.options],
  );
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      mealsState.members
        .filter((member) => member.selectedMealOptionId)
        .map((member) => [member.id, member.selectedMealOptionId as string]),
    ),
  );
  const [saved, setSaved] = useState(false);

  if (mealsState.members.length === 0) {
    return <EmptyState icon="group" title="No hay integrantes" description="Agrega integrantes para elegir sus platillos." />;
  }

  if (activeOptions.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-3 pb-16 font-sans animate-fadeIn">
        <h1 className="font-display text-2xl font-bold tracking-tight text-silver-50">Platillos</h1>
        <p className="text-sm text-silver-400">Aún no hay opciones disponibles para este evento.</p>
      </div>
    );
  }

  const options = activeOptions.map((option) => ({ value: option.id, label: option.name }));
  const canEdit = !mealsState.isDeadlineClosed;
  const hasSelections = Object.keys(selections).length > 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-7 pb-20 font-sans animate-fadeIn">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-silver-50">Platillos</h1>
        <p className="text-sm text-silver-400">Elige una opción para cada persona de tu grupo.</p>
      </header>

      {mealsState.isDeadlineClosed ? (
        <Alert variant="info">La selección de platillos ya está cerrada.</Alert>
      ) : mealsState.mealsDeadline ? (
        <Alert variant="warning">Puedes modificar tus elecciones hasta el {mealsState.mealsDeadline}.</Alert>
      ) : null}
      {saved && <Alert variant="success" onDismiss={() => setSaved(false)}>Tus elecciones están listas para revisión.</Alert>}

      <section aria-label="Platillo por persona" className="space-y-7">
        {mealsState.members.map((member) => {
          const selected = selections[member.id] ?? '';
          return (
            <div key={member.id} className="space-y-3">
              <div>
                <p className="text-sm font-medium text-silver-100">{member.name}</p>
                <p className="text-xs text-silver-400">{member.productType}</p>
              </div>
              {canEdit && activeOptions.length <= 4 ? (
                <fieldset className="space-y-2"><legend className="text-xs text-silver-400">Platillo</legend>{activeOptions.map((option) => <label key={option.id} className="flex items-center gap-2 text-sm text-silver-200"><input type="radio" name={`meal-${member.id}`} checked={selected === option.id} onChange={() => { setSelections((current) => ({ ...current, [member.id]: option.id })); setSaved(false); }} />{option.name}</label>)}</fieldset>
              ) : canEdit ? (
                <Select
                  label="Platillo"
                  value={selected}
                  onChange={(event) => {
                    setSelections((current) => ({ ...current, [member.id]: event.target.value }));
                    setSaved(false);
                  }}
                  options={[{ value: '', label: 'Seleccionar opción' }, ...options]}
                />
              ) : (
                <p className="text-sm text-silver-300">{member.selectedMealName || 'Sin selección registrada'}</p>
              )}
            </div>
          );
        })}
      </section>

      {canEdit && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!hasSelections}
          onClick={() => setSaved(true)}
        >
          Guardar elecciones
        </Button>
      )}
    </div>
  );
};
