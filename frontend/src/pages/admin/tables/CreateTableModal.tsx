import React, { useState } from 'react';
import {
  Modal,
  Button,
  Input,
  Icon,
} from '../../../design-system';
import { type TableShape } from '../../../fixtures';

export interface CreateTableSubmitData {
  number: number;
  label: string;
  shape: TableShape;
  capacity: number;
}

export interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTableSubmitData) => void;
  suggestedNumber?: number;
}

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suggestedNumber = 1,
}) => {
  const [tableNumber, setTableNumber] = useState(String(suggestedNumber));
  const [shape, setShape] = useState<TableShape>('SQUARE');
  const [capacity, setCapacity] = useState('10');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedNumber = parseInt(tableNumber, 10);
    const parsedCapacity = parseInt(capacity, 10);

    if (isNaN(parsedNumber) || parsedNumber <= 0) {
      setErrorMsg('Ingresa un número de mesa válido mayor a 0.');
      return;
    }

    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      setErrorMsg('La capacidad de la mesa debe ser mayor a 0 lugares.');
      return;
    }

    onSubmit({
      number: parsedNumber,
      label: `Mesa ${parsedNumber}`,
      shape,
      capacity: parsedCapacity,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear mesa"
      description="Define la forma y capacidad de la nueva mesa en el croquis."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errorMsg && (
          <div className="p-3 bg-status-error-bg text-status-error text-xs rounded-xl flex items-center gap-2 border border-status-error/20">
            <Icon name="alert" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <Input
          label="Número de mesa"
          type="number"
          min="1"
          value={tableNumber}
          onChange={(e) => {
            setTableNumber(e.target.value);
            setErrorMsg('');
          }}
          placeholder="Ej. 35"
          required
        />

        {/* Shape Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-content-primary">Forma de la mesa</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShape('SQUARE')}
              className={`
                h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
                ${
                  shape === 'SQUARE'
                    ? 'border-navy-900 bg-navy-50 text-navy-900 shadow-sm'
                    : 'border-surface-highest bg-surface-lowest text-content-secondary hover:border-navy-300'
                }
              `}
            >
              <span className="w-3.5 h-3.5 rounded-sm border-2 border-current inline-block" />
              <span>Cuadrada</span>
            </button>
            <button
              type="button"
              onClick={() => setShape('ROUND')}
              className={`
                h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
                ${
                  shape === 'ROUND'
                    ? 'border-navy-900 bg-navy-50 text-navy-900 shadow-sm'
                    : 'border-surface-highest bg-surface-lowest text-content-secondary hover:border-navy-300'
                }
              `}
            >
              <span className="w-3.5 h-3.5 rounded-full border-2 border-current inline-block" />
              <span>Circular</span>
            </button>
          </div>
        </div>

        <Input
          label="Capacidad (Lugares)"
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => {
            setCapacity(e.target.value);
            setErrorMsg('');
          }}
          placeholder="10"
          required
        />

        {/* Backend Note */}
        <div className="p-3 bg-surface-low rounded-xl flex items-start gap-2 text-xs text-content-secondary border border-surface-high">
          <Icon name="info" size={16} className="text-navy-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            La mesa se creará en el canvas local. Integración con backend pendiente.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-low">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Crear mesa
          </Button>
        </div>
      </form>
    </Modal>
  );
};
