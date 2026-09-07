import React, { useState, useCallback } from 'react';
import { Modal, Select, TextArea, Button, Alert } from '../../../design-system';
import type { MealOptionMock } from '../../../fixtures/layoutFixtures';
import type { GuestMealRow, LocalMealSelectionPreview } from './mealViewModel';

export interface EditMealSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  graduateId: string;
  graduateName: string;
  knownGuests: GuestMealRow[];
  mealOptions: MealOptionMock[];
  isAfterDeadline: boolean;
  onPreviewSave?: (preview: LocalMealSelectionPreview) => void;
  onSave?: (preview: LocalMealSelectionPreview) => void;
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
  onSave,
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

    const saveHandler = onSave || onPreviewSave;
    if (saveHandler) {
      saveHandler(preview);
    }
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
      title="Modificar platillo"
      description={`Graduado / Membresía: ${graduateName}`}
      size="md"
    >
      <div className="flex flex-col gap-4 font-sans text-xs">
        {isAfterDeadline && (
          <Alert variant="warning" title="Fecha límite vencida">
            Cualquier modificación posterior al cierre requiere un motivo justificado obligatorio.
          </Alert>
        )}

        {knownGuests.length > 1 && (
          <Select
            label="Integrante a modificar"
            options={guestOptions}
            value={selectedGuestId}
            onChange={(e) => setSelectedGuestId(e.target.value)}
          />
        )}

        {mealOptions.length <= 4 ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-silver-300">
              Opción de platillo
            </label>
            <div
              role="radiogroup"
              aria-label="Opciones de platillo"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {mealOptions.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-3 rounded-lg border text-left text-xs transition-colors flex items-center justify-between min-h-[44px] ${
                      isSelected
                        ? 'bg-gold-500/15 border-gold-500 text-gold-200 font-semibold'
                        : 'bg-obsidian-900 border-silver-800 text-silver-300 hover:border-silver-700 hover:text-silver-100'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {isSelected ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-gold-400 shrink-0" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full border border-silver-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <Select
            label="Nueva opción de platillo"
            options={mealSelectOptions}
            value={selectedOptionId}
            onChange={(e) => setSelectedOptionId(e.target.value)}
          />
        )}

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
            Guardar selección
          </Button>
        </div>
      </div>
    </Modal>
  );
};
