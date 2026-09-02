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
  isAfterDeadline: boolean;
  onPreviewSave: (preview: LocalMealSelectionPreview) => void;
  initialGuestId?: string;
}

export const EditMealSelectionModal: React.FC<EditMealSelectionModalProps> = ({
  isOpen,
  onClose,
  graduateId,
  graduateName,
  knownGuests,
  mealOptions,
  isAfterDeadline,
  onPreviewSave,
  initialGuestId,
}) => {
  const [selectedGuestId, setSelectedGuestId] = useState(initialGuestId || knownGuests[0]?.id || '');
  const [selectedOptionId, setSelectedOptionId] = useState(mealOptions[0]?.id || '');
  const [overrideReason, setOverrideReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  // Reset internal state when caller explicitly closes and re-opens
  const handleClose = useCallback(() => {
    setSelectedGuestId(initialGuestId || knownGuests[0]?.id || '');
    setSelectedOptionId(mealOptions[0]?.id || '');
    setOverrideReason('');
    setReasonError('');
    onClose();
  }, [initialGuestId, knownGuests, mealOptions, onClose]);

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
        <p className="text-sm text-silver-400">
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
      description={`Graduado / Membresía: ${graduateName}`}
      size="md"
    >
      <div className="flex flex-col gap-4 font-sans text-xs">
        {/* Preview notice */}
        <Alert variant="warning" title="Vista previa local — No guardada">
          Integración con backend pendiente. Este cambio no se persiste y se revertirá al recargar o cambiar de evento.
        </Alert>

        {isAfterDeadline && (
          <Alert variant="warning" title="Fecha límite vencida">
            Cualquier modificación posterior al cierre requiere un motivo justificado obligatorio.
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

        <div className="flex justify-end gap-3 pt-2 border-t border-silver-800">
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
          >
            Confirmar vista previa
          </Button>
        </div>
      </div>
    </Modal>
  );
};
