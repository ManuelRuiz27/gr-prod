import React from 'react';
import { Modal, Button } from '../../../design-system';

export interface ThermoTransitionModalProps {
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
  const confirmButtonLabel = isProduction ? 'Confirmar producción' : 'Confirmar entrega';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={`Graduado: ${graduateName}`}
      size="md"
    >
      <div className="flex flex-col gap-4 font-sans text-xs">
        <p className="text-sm text-silver-200">
          {isProduction
            ? `¿Confirmas que el termo conmemorativo de ${graduateName} pasa a estado "${targetStatusLabel}" para iniciar el proceso de producción?`
            : `¿Confirmas la entrega final del termo conmemorativo a ${graduateName}?`}
        </p>

        <div className="flex justify-end gap-3 pt-2 border-t border-silver-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmButtonLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
