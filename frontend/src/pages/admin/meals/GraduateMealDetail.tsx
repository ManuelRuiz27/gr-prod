import React, { useState } from 'react';
import { Card, Badge, Button, Alert } from '../../../design-system';
import type { GraduateMealViewModel, GuestMealRow, LocalMealSelectionPreview } from './mealViewModel';
import type { MealOptionMock } from '../../../fixtures/layoutFixtures';
import { EditMealSelectionModal } from './EditMealSelectionModal';

interface GraduateMealDetailProps {
  graduate: GraduateMealViewModel;
  mealOptions: MealOptionMock[];
  /**
   * Only set when derived from real EventSettings.meals_deadline data.
   * Never infer this from an invented date.
   */
  isAfterDeadline: boolean;
  onClose: () => void;
}

/**
 * GraduateMealDetail — UX-A-MEAL-002 detail view.
 *
 * Lists known group members with their meal selections.
 * Provides the edit flow (with UX-A-MEAL-003 when isAfterDeadline).
 *
 * Only known guests from fixtures are shown.
 * If ticketCount > guests.length, an informational note is shown instead of inventing rows.
 */
export const GraduateMealDetail: React.FC<GraduateMealDetailProps> = ({
  graduate,
  mealOptions,
  isAfterDeadline,
  onClose,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [localPreviews, setLocalPreviews] = useState<LocalMealSelectionPreview[]>([]);

  const handlePreviewSave = (preview: LocalMealSelectionPreview) => {
    setLocalPreviews((prev) => {
      const next = prev.filter((p) => p.guestId !== preview.guestId);
      return [...next, preview];
    });
  };

  // Apply local previews on top of fixture data for display only
  const displayGuests: GuestMealRow[] = graduate.knownGuests.map((g) => {
    const preview = localPreviews.find((p) => p.guestId === g.id);
    if (preview) return { ...g, mealName: preview.newMealName };
    return g;
  });

  const hasLocalPreviews = localPreviews.length > 0;
  const hasGap = graduate.knownGuests.length < graduate.ticketCount;

  const getMealClass = (mealName: string) => {
    if (mealName === 'Vegano') return 'bg-emerald-50 border border-emerald-200 text-emerald-800';
    if (mealName === 'Vegetariano') return 'bg-blue-50 border border-blue-200 text-blue-800';
    return 'bg-navy-50 border border-navy-200 text-navy-800';
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <div className="flex flex-col gap-4 animate-fadeIn" data-testid="graduate-meal-detail">
        {/* Header */}
        <div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-navy-900 transition-colors mb-3"
            aria-label="Volver al listado"
          >
            ← Volver al listado
          </button>
          <h3 className="text-lg font-bold text-navy-900">
            Platillos de {graduate.fullName}
          </h3>
          {graduate.career && (
            <p className="text-xs text-content-secondary mt-0.5">{graduate.career}</p>
          )}
        </div>

        {/* Deadline banner */}
        {isAfterDeadline && (
          <Alert variant="warning" title="La selección para graduados está cerrada">
            Cualquier modificación debe incluir un motivo justificado.
          </Alert>
        )}

        {/* Preview notice */}
        {hasLocalPreviews && (
          <Alert variant="info" title="Vista previa local — No guardada">
            Los cambios reflejan modificaciones locales no persistidas. Se revertirán al cambiar de evento o recargar.
          </Alert>
        )}

        {/* Selections list */}
        <Card>
          <div className="p-4 border-b border-surface-low flex items-center justify-between">
            <h4 className="text-sm font-bold text-navy-900">Selección actual</h4>
            <Badge variant="neutral" size="sm">
              {graduate.knownGuests.length}{' '}
              {graduate.knownGuests.length === 1 ? 'integrante conocido' : 'integrantes conocidos'}
            </Badge>
          </div>

          {displayGuests.length === 0 ? (
            <div className="p-6 text-center text-sm text-content-secondary">
              No hay información de integrantes disponible.
            </div>
          ) : (
            <div className="divide-y divide-surface-low">
              {displayGuests.map((guest, idx) => {
                const isPreview = localPreviews.some((p) => p.guestId === guest.id);
                return (
                  <div
                    key={guest.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-surface-lowest/50 transition-colors"
                    data-testid={`meal-guest-row-${guest.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {getInitials(guest.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-content-primary">{guest.name}</p>
                        <p className="text-xs text-content-muted">
                          {idx === 0 ? 'Graduado' : 'Acompañante'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getMealClass(guest.mealName)}`}>
                        {guest.mealName}
                      </span>
                      {isPreview && (
                        <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          vista previa
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Gap note */}
          {hasGap && (
            <div className="px-4 py-3 border-t border-surface-low bg-surface-low/30 text-xs text-content-secondary">
              No hay información nominal adicional disponible.{' '}
              <span className="text-content-muted">
                ({graduate.ticketCount - graduate.knownGuests.length} lugar
                {graduate.ticketCount - graduate.knownGuests.length !== 1 ? 'es' : ''} sin datos en fixtures)
              </span>
            </div>
          )}
        </Card>

        {/* Admin action */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-navy-900">Modificar opción de platillo</h4>
              <p className="text-xs text-content-secondary mt-0.5">
                {isAfterDeadline
                  ? 'Requiere motivo justificado — la selección está cerrada.'
                  : 'Selecciona un integrante y asigna una opción diferente.'}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              iconStart="edit"
              onClick={() => setIsEditOpen(true)}
              disabled={graduate.knownGuests.length === 0}
            >
              Modificar
            </Button>
          </div>
        </Card>

        {/* Audit history */}
        <Card className="p-4">
          <h4 className="text-sm font-bold text-navy-900 mb-2">Historial de cambios</h4>
          <p className="text-xs text-content-secondary">
            No hay historial disponible. El registro de auditoría estará disponible cuando la integración con el backend esté activa.
          </p>
        </Card>
      </div>

      <EditMealSelectionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        graduateId={graduate.graduateId}
        graduateName={graduate.fullName}
        knownGuests={graduate.knownGuests}
        mealOptions={mealOptions}
        isAfterDeadline={isAfterDeadline}
        onPreviewSave={handlePreviewSave}
      />
    </>
  );
};
