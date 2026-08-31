import React, { useState, useCallback } from 'react';
import { Modal, Select, TextArea, Button, Alert } from '../../../design-system';
import type { MealOptionMock } from '../../../fixtures/layoutFixtures';
import type { GuestMealRow, LocalMealSelectionPreview } from './mealViewModel';

interface EditMealSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  graduateId: string;
  graduateName: string;
  knownGuests: GuestMealRow[];
  mealOptions: MealOptionMock[];
  /**
   * When true, override_reason becomes mandatory.
   * Only set when derived from real deadline data — never from an invented date.
   */
  isAfterDeadline: boolean;
  onPreviewSave: (preview: LocalMealSelectionPreview) => void;
}

/**
 * EditMealSelectionModal — UX-A-MEAL-002 / UX-A-MEAL-003
 *
 * While backend M5 is not integrated:
 * - Changes are reflected locally as a preview only.
 * - No "Guardado exitosamente" messaging is emitted.
 * - Identified as "Vista previa local — No guardada".
 *
 * When isAfterDeadline = true, the override reason field becomes required.
 */
export const EditMealSelectionModal: React.FC<EditMealSelectionModalProps> = ({
  isOpen,
  onClose,
  graduateId,
  graduateName,
  knownGuests,
  mealOptions,
  isAfterDeadline,
  onPreviewSave,
}) => {
  const [selectedGuestId, setSelectedGuestId] = useState(knownGuests[0]?.id ?? '');
  const [selectedOptionId, setSelectedOptionId] = useState(mealOptions[0]?.id ?? '');
  const [overrideReason, setOverrideReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  // Reset internal state when caller explicitly closes and re-opens
  const handleClose = useCallback(() => {
    setSelectedGuestId(knownGuests[0]?.id ?? '');
    setSelectedOptionId(mealOptions[0]?.id ?? '');
    setOverrideReason('');
    setReasonError('');
    onClose();
  }, [knownGuests, mealOptions, onClose]);

  const handleConfirm = () => {
    if (isAfterDeadline && overrideReason.trim().length === 0) {
      setReasonError('El motivo del cambio es obligatorio cuando la fecha límite ya venció.');
      return;
    }
    setReasonError('');

    const selectedGuest = knownGuests.find((g) => g.id === selectedGuestId);
    const selectedOption = mealOptions.find((o) => o.id === selectedOptionId);

    if (!selectedGuest || !selectedOption) return;

    const preview: LocalMealSelectionPreview = {
      guestId: selectedGuestId,
      guestName: selectedGuest.name,
      graduateId,
      newMealOptionId: selectedOptionId,
      newMealName: selectedOption.name,
      overrideReason: overrideReason.trim() || undefined,
      isLocalPreview: true,
    };

    onPreviewSave(preview);
    handleClose();
  };

  if (knownGuests.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Modificar opción de platillo" size="md">
        <p className="text-sm text-content-secondary">
          No hay información de integrantes disponible para este graduado.
        </p>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
        </div>
      </Modal>
    );
  }

  const guestOptions = knownGuests.map((g) => ({
    value: g.id,
    label: `${g.name} (${g.mealName || 'Sin selección'})`,
  }));

  const mealSelectOptions = mealOptions.map((o) => ({
    value: o.id,
    label: o.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modificar opción de platillo"
      description={`Graduado: ${graduateName}`}
      size="md"
    >
      <div className="flex flex-col gap-5">
        {/* Preview notice */}
        <Alert variant="warning" title="Vista previa local — No guardada">
          Integración con backend pendiente. Este cambio no se persiste y se revertirá al recargar o cambiar de evento.
        </Alert>

        {isAfterDeadline && (
          <Alert variant="warning" title="Fecha límite vencida">
            Cualquier modificación requiere un motivo justificado.
          </Alert>
        )}

        <Select
          label="Integrante a modificar"
          options={guestOptions}
          value={selectedGuestId}
          onChange={(e) => setSelectedGuestId(e.target.value)}
        />

        <Select
          label="Nueva opción de platillo"
          options={mealSelectOptions}
          value={selectedOptionId}
          onChange={(e) => setSelectedOptionId(e.target.value)}
        />

        <TextArea
          label="Motivo del cambio"
          required={isAfterDeadline}
          placeholder={
            isAfterDeadline
              ? 'Justificación requerida para cambios posteriores al cierre…'
              : 'Motivo del cambio (opcional)'
          }
          rows={3}
          value={overrideReason}
          onChange={(e) => {
            setOverrideReason(e.target.value);
            if (reasonError) setReasonError('');
          }}
          error={reasonError || undefined}
          helperText={
            isAfterDeadline ? 'Obligatorio cuando la selección ya está cerrada.' : undefined
          }
        />

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirmar vista previa
          </Button>
        </div>
      </div>
    </Modal>
  );
};
