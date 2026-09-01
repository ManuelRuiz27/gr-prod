import React, { useState } from 'react';
import { Modal, Button, TextArea } from '../../../design-system';
import type { EventLifecycleAction } from './eventLifecycle';

interface EventLifecycleDialogProps {
  eventName: string;
  action: EventLifecycleAction | null;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export const EventLifecycleDialog: React.FC<EventLifecycleDialogProps> = ({
  eventName,
  action,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!action) {
    return null;
  }

  function handleClose(): void {
    setReason('');
    setError('');
    onClose();
  }

  function handleConfirm(): void {
    if (action === 'CANCEL') {
      const trimmed = reason.trim();
      if (!trimmed) {
        setError('Ingresa el motivo de cancelación.');
        return;
      }
      setError('');
      onConfirm(trimmed);
    } else {
      onConfirm();
    }
  }

  const getActionConfig = () => {
    switch (action) {
      case 'OPEN':
        return {
          title: 'Abrir evento',
          message:
            'Los graduados podrán realizar las operaciones habilitadas para un evento abierto.',
          confirmText: 'Abrir evento',
          confirmVariant: 'primary' as const,
        };
      case 'CLOSE':
        return {
          title: 'Cerrar evento',
          message:
            'Los graduados ya no podrán realizar nuevas operaciones mientras el evento esté cerrado.',
          confirmText: 'Cerrar evento',
          confirmVariant: 'secondary' as const,
        };
      case 'REOPEN':
        return {
          title: 'Reabrir evento',
          message:
            'El evento volverá a estado abierto y las operaciones permitidas podrán reanudarse.',
          confirmText: 'Reabrir evento',
          confirmVariant: 'primary' as const,
        };
      case 'FINALIZE':
        return {
          title: 'Finalizar evento',
          message:
            'El evento quedará disponible únicamente para consulta.',
          confirmText: 'Finalizar evento',
          confirmVariant: 'primary' as const,
        };
      case 'CANCEL':
        return {
          title: 'Cancelar evento',
          message:
            'Las operaciones ordinarias quedarán bloqueadas. Los datos existentes no serán eliminados.',
          confirmText: 'Cancelar evento',
          confirmVariant: 'danger' as const,
        };
    }
  };

  const config = getActionConfig();

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={config.title}
    >
      <div className="space-y-4 pt-1 font-sans">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-silver-100">
            {eventName}
          </p>
          <p className="text-sm text-silver-400 leading-relaxed">
            {config.message}
          </p>
        </div>

        {action === 'CANCEL' && (
          <TextArea
            id="cancelReason"
            label="Motivo de cancelación"
            placeholder="Describe el motivo de la cancelación del evento..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            error={error}
            required
            rows={3}
          />
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-silver-800/80">
          <Button
            variant="ghost"
            type="button"
            onClick={handleClose}
            className="min-h-[44px]"
          >
            Cancelar
          </Button>
          <Button
            variant={config.confirmVariant}
            type="button"
            onClick={handleConfirm}
            className="min-h-[44px]"
          >
            {config.confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
