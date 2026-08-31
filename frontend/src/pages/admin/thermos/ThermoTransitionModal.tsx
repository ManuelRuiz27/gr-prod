import React from 'react';
import { Modal, Button, Alert } from '../../../design-system';

interface ThermoTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  graduateName: string;
  action: 'START_PRODUCTION' | 'MARK_DELIVERED';
  onConfirm: () => void;
}

export const ThermoTransitionModal: React.FC<ThermoTransitionModalProps> = ({
  isOpen,
  onClose,
  graduateName,
  action,
  onConfirm,
}) => {
  const isProduction = action === 'START_PRODUCTION';
  const title = isProduction ? 'Marcar en producción' : 'Marcar como entregado';
  const targetStatusLabel = isProduction ? 'En producción' : 'Entregado';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={`Graduado: ${graduateName}`}
      size="md"
    >
      <div className="flex flex-col gap-5">
        <Alert variant="warning" title="Vista previa local — No guardada">
          Integración con backend pendiente. Este cambio no se persiste y se revertirá al recargar o cambiar de evento.
        </Alert>

        <p className="text-sm text-content-primary">
          {isProduction
            ? `¿Confirmas que el termo conmemorativo de ${graduateName} pasa a estado "${targetStatusLabel}" para iniciar la fabricación en taller?`
            : `¿Confirmas la entrega final del termo conmemorativo a ${graduateName}?`}
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirmar vista previa
          </Button>
        </div>
      </div>
    </Modal>
  );
};
