import React, { useState, useMemo } from 'react';
import {
  Card,
  Badge,
  Button,
  Select,
  Alert,
  Modal,
  Icon,
} from '../../design-system';
import {
  VISUAL_QA_GRADUATE_MEALS_STATES,
  type VisualGraduateMealsState,
  type VisualGroupMemberMeal,
  type VisualMealOption,
} from '../../fixtures/mealThermoVisualFixtures';

export interface GraduateMealsScreenProps {
  mealsStateId?: string;
}

export const GraduateMealsScreen: React.FC<GraduateMealsScreenProps> = ({
  mealsStateId = 'meals-andrea-active',
}) => {
  const mealsState: VisualGraduateMealsState =
    VISUAL_QA_GRADUATE_MEALS_STATES[mealsStateId] ||
    VISUAL_QA_GRADUATE_MEALS_STATES['meals-andrea-active'];

  // Local draft state for member meal selections
  const [members, setMembers] = useState<VisualGroupMemberMeal[]>(mealsState.members);
  const [draftSelections, setDraftSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    mealsState.members.forEach((m) => {
      if (m.selectedMealOptionId) {
        initial[m.id] = m.selectedMealOptionId;
      }
    });
    return initial;
  });

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isPreviewSuccess, setIsPreviewSuccess] = useState(false);

  // Active options available for new selections
  const activeOptions: VisualMealOption[] = useMemo(() => {
    return mealsState.options.filter((o) => o.isActive);
  }, [mealsState.options]);

  // Compute changed members comparing draftSelections vs members
  const changes = useMemo(() => {
    const list: {
      member: VisualGroupMemberMeal;
      oldMealName: string;
      newOption: VisualMealOption;
    }[] = [];

    members.forEach((m) => {
      const draftOptionId = draftSelections[m.id];
      if (draftOptionId && draftOptionId !== m.selectedMealOptionId) {
        const option = activeOptions.find((o) => o.id === draftOptionId);
        if (option) {
          list.push({
            member: m,
            oldMealName: m.selectedMealName || 'Sin selección previa',
            newOption: option,
          });
        }
      }
    });

    return list;
  }, [members, draftSelections, activeOptions]);

  const hasChanges = changes.length > 0;

  const handleSelectionChange = (memberId: string, optionId: string) => {
    setDraftSelections((prev) => ({
      ...prev,
      [memberId]: optionId,
    }));
    setIsPreviewSuccess(false);
  };

  const handleConfirmChanges = () => {
    // Apply local visual update
    setMembers((prev) =>
      prev.map((m) => {
        const draftOptionId = draftSelections[m.id];
        if (draftOptionId) {
          const opt = activeOptions.find((o) => o.id === draftOptionId);
          if (opt) {
            return {
              ...m,
              selectedMealOptionId: opt.id,
              selectedMealName: opt.name,
              isHistoricalInactive: false,
            };
          }
        }
        return m;
      })
    );

    setIsReviewOpen(false);
    setIsPreviewSuccess(true);
  };

  // -------------------------------------------------------------------------
  // 1. Scenario: No Options Configured
  // -------------------------------------------------------------------------
  if (activeOptions.length === 0 && mealsState.options.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto animate-fadeIn font-sans pb-16">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-bold text-silver-50">
            Selección de platillos
          </h1>
          <p className="text-xs text-silver-400">
            {mealsState.eventName}
          </p>
        </div>

        <Card className="p-8 bg-obsidian-850 border border-silver-800/80 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-obsidian-800 text-silver-400 flex items-center justify-center">
            <Icon name="meal" size={24} />
          </div>
          <h2 className="text-base font-bold text-silver-100">
            Aún no hay opciones de platillo disponibles
          </h2>
          <p className="text-xs text-silver-400 max-w-sm">
            El comité organizador definirá las opciones del menú próximamente.
          </p>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. Main Screen
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto animate-fadeIn font-sans pb-20">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold text-silver-50">
          Selección de platillos
        </h1>
        <p className="text-xs text-silver-400">
          {mealsState.eventName} • Asignación individual por integrante
        </p>
      </div>

      {/* Deadline Banners */}
      {mealsState.isDeadlineClosed ? (
        <Alert variant="info" title="Selección cerrada">
          La selección de platillos ya cerró. Las opciones registradas están en preparación con banquetes.
        </Alert>
      ) : mealsState.mealsDeadline ? (
        <Alert variant="warning" title="Fecha límite">
          Puedes modificar tus selecciones hasta el {mealsState.mealsDeadline}.
        </Alert>
      ) : null}

      {/* Preview Feedback */}
      {isPreviewSuccess && (
        <Alert variant="success" title="Cambios preparados en modo visual">
          El backend validará y guardará las selecciones definitivas cuando se active la persistencia.
        </Alert>
      )}

      {/* Selection Summary */}
      <Card className="p-4 bg-obsidian-850 border border-silver-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-silver-300 block">
            Integrantes en tu grupo
          </span>
          <span className="text-xs text-silver-400">
            Cada persona puede elegir su propio menú.
          </span>
        </div>
        <Badge variant="neutral" size="sm">
          {members.length} integrantes
        </Badge>
      </Card>

      {/* Member Meal Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-silver-400 px-1">
          Menú por integrante
        </h2>

        {members.map((member) => {
          const currentOptionId = draftSelections[member.id] || '';
          const hasSelected = !!currentOptionId;

          const selectOptions = activeOptions.map((opt) => ({
            value: opt.id,
            label: opt.name,
          }));

          return (
            <Card
              key={member.id}
              className="p-4 bg-obsidian-850 border border-silver-800/80 space-y-3 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-silver-50">
                      {member.name}
                    </span>
                    {member.isPrimary && (
                      <Badge variant="gold" size="sm">
                        Graduado titular
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-silver-400 block mt-0.5">
                    {member.productType}
                  </span>
                </div>

                {member.isHistoricalInactive ? (
                  <Badge variant="warning" size="sm">
                    Opción inactiva
                  </Badge>
                ) : hasSelected ? (
                  <Badge variant="success" size="sm">
                    Seleccionado
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Pendiente
                  </Badge>
                )}
              </div>

              {/* Inactive historical option notice */}
              {member.isHistoricalInactive && (
                <div className="p-2.5 bg-obsidian-900 rounded-lg text-xs text-status-warning border border-status-warning/30 flex items-center gap-2">
                  <Icon name="info" size={14} />
                  <span>
                    Selección actual: <strong>{member.selectedMealName}</strong> (Opción ya no disponible para nuevos cambios).
                  </span>
                </div>
              )}

              {/* Meal Selector or Read-only view */}
              {!mealsState.isDeadlineClosed ? (
                <div>
                  <Select
                    label="Opción de menú"
                    value={currentOptionId}
                    onChange={(e) => handleSelectionChange(member.id, e.target.value)}
                    options={[
                      { value: '', label: '— Seleccionar opción —' },
                      ...selectOptions,
                    ]}
                  />
                </div>
              ) : (
                <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800 text-xs text-silver-200">
                  <span className="text-silver-400 block text-[11px]">Platillo registrado:</span>
                  <span className="font-bold text-silver-100 text-sm">
                    {member.selectedMealName || 'Sin selección registrada'}
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Menu Options Catalogue Reference */}
      {activeOptions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-silver-400 px-1">
            Detalle de opciones del evento
          </h2>
          <div className="space-y-2">
            {activeOptions.map((opt) => (
              <Card key={opt.id} className="p-3.5 bg-obsidian-900 border border-silver-800/80 space-y-1">
                <span className="text-xs font-bold text-silver-100 block">
                  {opt.name}
                </span>
                {opt.description && (
                  <p className="text-[11px] text-silver-400 leading-relaxed">
                    {opt.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Save / Review Action */}
      {!mealsState.isDeadlineClosed && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            iconStart="check"
            disabled={!hasChanges}
            onClick={() => setIsReviewOpen(true)}
          >
            {hasChanges ? `Revisar cambios (${changes.length})` : 'Sin cambios pendientes'}
          </Button>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Confirmar selección de platillos"
        size="sm"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-silver-300">
            Revisa las modificaciones antes de confirmar:
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {changes.map(({ member, oldMealName, newOption }) => (
              <div
                key={member.id}
                className="p-3 bg-obsidian-900 rounded-xl border border-silver-800 space-y-1"
              >
                <div className="flex justify-between font-bold text-silver-100">
                  <span>{member.name}</span>
                  <Badge variant={member.isPrimary ? 'gold' : 'neutral'} size="sm">
                    {member.isPrimary ? 'Titular' : 'Integrante'}
                  </Badge>
                </div>
                <div className="text-[11px] text-silver-400 flex items-center gap-1.5 pt-1">
                  <span className="line-through">{oldMealName}</span>
                  <span>→</span>
                  <strong className="text-gold-400 font-semibold">{newOption.name}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-obsidian-900 rounded-xl text-[11px] text-silver-400 border border-silver-800">
            Confirmación en modo visual. El backend validará y guardará las selecciones definitivas.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-silver-800">
            <Button variant="secondary" size="sm" onClick={() => setIsReviewOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmChanges}>
              Confirmar selecciones
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
