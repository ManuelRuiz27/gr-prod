import React, { useState } from 'react';
import { Card, Badge, Button, Alert } from '../../../design-system';
import type { GraduateMealViewModel, GuestMealRow, LocalMealSelectionPreview } from './mealViewModel';
import type { MealOptionMock } from '../../../fixtures/layoutFixtures';
import { EditMealSelectionModal } from './EditMealSelectionModal';

interface GraduateMealDetailProps {
  graduate: GraduateMealViewModel;
  mealOptions: MealOptionMock[];
  isAfterDeadline: boolean;
  onClose: () => void;
  onPreviewSave?: (preview: LocalMealSelectionPreview) => void;
}

export const GraduateMealDetail: React.FC<GraduateMealDetailProps> = ({
  graduate,
  mealOptions,
  isAfterDeadline,
  onClose,
  onPreviewSave,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [localPreviews, setLocalPreviews] = useState<LocalMealSelectionPreview[]>([]);

  const handlePreviewSave = (preview: LocalMealSelectionPreview) => {
    setLocalPreviews((prev) => {
      const next = prev.filter((p) => p.guestId !== preview.guestId);
      return [...next, preview];
    });
    if (onPreviewSave) onPreviewSave(preview);
  };

  // Apply local previews on top of fixture data for display only
  const displayGuests: GuestMealRow[] = graduate.knownGuests.map((g) => {
    const preview = localPreviews.find((p) => p.guestId === g.id);
    if (preview) return { ...g, mealName: preview.newMealName };
    return g;
  });

  const hasLocalPreviews = localPreviews.length > 0;
  const hasGap = graduate.knownGuests.length < graduate.ticketCount;

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <div className="flex flex-col gap-4 animate-fadeIn font-sans" data-testid="graduate-meal-detail">
        {/* Header */}
        <div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-silver-400 hover:text-silver-100 transition-colors mb-3"
            aria-label="Volver al listado"
          >
            ← Volver al listado
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold font-display text-silver-50">
              Platillos de {graduate.fullName}
            </h3>
            {graduate.contractFolio && (
              <Badge variant="gold" size="sm">
                {graduate.contractFolio}
              </Badge>
            )}
          </div>
          {graduate.career && (
            <p className="text-xs text-silver-400 mt-0.5">{graduate.career}</p>
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
        <Card className="bg-obsidian-850 border border-silver-800/80 p-0 overflow-hidden">
          <div className="p-4 border-b border-silver-800/80 flex items-center justify-between bg-obsidian-900/60">
            <h4 className="text-sm font-bold text-silver-100">Selección actual por integrante</h4>
            <Badge variant="neutral" size="sm">
              {graduate.knownGuests.length}{' '}
              {graduate.knownGuests.length === 1 ? 'integrante conocido' : 'integrantes conocidos'}
            </Badge>
          </div>

          {displayGuests.length === 0 ? (
            <div className="p-6 text-center text-sm text-silver-400">
              No hay información de integrantes disponible.
            </div>
          ) : (
            <div className="divide-y divide-silver-800/60">
              {displayGuests.map((guest) => {
                const isPreview = localPreviews.some((p) => p.guestId === guest.id);
                return (
                  <div
                    key={guest.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-obsidian-800/40 transition-colors"
                    data-testid={`meal-guest-row-${guest.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-obsidian-800 border border-silver-700 text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {getInitials(guest.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-silver-100">{guest.name}</p>
                        <p className="text-xs text-silver-400">Integrante</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-obsidian-900 border border-silver-700/80 text-silver-100">
                        {guest.mealName || 'Sin selección'}
                      </span>
                      {isPreview && (
                        <span className="text-[10px] text-status-warning font-semibold bg-obsidian-900 px-1.5 py-0.5 rounded border border-status-warning/40">
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
            <div className="px-4 py-3 border-t border-silver-800/80 bg-obsidian-900/40 text-xs text-silver-400">
              No hay información nominal adicional disponible.
            </div>
          )}
        </Card>

        {/* Admin action */}
        <Card className="p-4 bg-obsidian-850 border border-silver-800/80">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-silver-100">Modificar opción de platillo</h4>
              <p className="text-xs text-silver-400 mt-0.5">
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

        {/* Audit history note */}
        <Card className="p-4 bg-obsidian-850 border border-silver-800/80">
          <h4 className="text-sm font-bold text-silver-100 mb-2">Historial de cambios</h4>
          <p className="text-xs text-silver-400">
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
