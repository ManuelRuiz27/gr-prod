import React, { useState } from 'react';
import {
  Modal,
  Button,
  Input,
  Icon,
} from '../../../design-system';
import { type TableShape } from '../../../fixtures';

export interface BulkCreateTablesSubmitData {
  quantity: number;
  shape: TableShape;
  capacity: number;
  startNumber: number;
}

export interface BulkCreateTablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BulkCreateTablesSubmitData) => void;
  suggestedStartNumber?: number;
}

export const BulkCreateTablesModal: React.FC<BulkCreateTablesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suggestedStartNumber = 1,
}) => {
  const [quantity, setQuantity] = useState('10');
  const [shape, setShape] = useState<TableShape>('SQUARE');
  const [capacity, setCapacity] = useState('10');
  const [startNumber, setStartNumber] = useState(String(suggestedStartNumber));
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQuantity = parseInt(quantity, 10);
    const parsedCapacity = parseInt(capacity, 10);
    const parsedStartNumber = parseInt(startNumber, 10);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setErrorMsg('Ingresa una cantidad válida mayor a 0 mesas.');
      return;
    }

    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      setErrorMsg('La capacidad de las mesas debe ser mayor a 0 lugares.');
      return;
    }

    if (isNaN(parsedStartNumber) || parsedStartNumber <= 0) {
      setErrorMsg('El número inicial debe ser mayor o igual a 1.');
      return;
    }

    onSubmit({
      quantity: parsedQuantity,
      shape,
      capacity: parsedCapacity,
      startNumber: parsedStartNumber,
    });

    onClose();
  };

  const endNumber = (parseInt(startNumber, 10) || 1) + (parseInt(quantity, 10) || 1) - 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear varias mesas"
      description="Genera múltiples mesas simultáneamente para distribuirlas en el croquis."
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errorMsg && (
          <div className="p-3 bg-status-error-bg text-status-error text-xs rounded-xl flex items-center gap-2 border border-status-error/20">
            <Icon name="alert" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Cantidad de mesas"
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setErrorMsg('');
            }}
            placeholder="Ej. 30"
            required
          />

          <Input
            label="Número inicial"
            type="number"
            min="1"
            value={startNumber}
            onChange={(e) => {
              setStartNumber(e.target.value);
              setErrorMsg('');
            }}
            placeholder="Ej. 1"
            required
          />
        </div>

        {/* Shape Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-content-primary">Forma de las mesas</label>
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
              <span>Cuadrada (SQUARE)</span>
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
              <span>Circular (ROUND)</span>
            </button>
          </div>
        </div>

        <Input
          label="Capacidad por mesa (Lugares)"
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

        {/* Preview Summary */}
        <div className="p-3.5 bg-navy-50 rounded-xl flex items-center justify-between text-xs text-navy-900 border border-navy-100">
          <span className="font-medium">Rango a generar:</span>
          <span className="font-bold font-mono">
            Mesa {startNumber || '1'} → Mesa {isNaN(endNumber) ? '1' : endNumber}
          </span>
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-surface-low rounded-xl flex items-start gap-2 text-xs text-content-secondary border border-surface-high">
          <Icon name="info" size={16} className="text-navy-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Las mesas se añadirán a la zona inicial del canvas para que puedas acomodarlas según el plano.
            Integración con backend persistente pendiente.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-low">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Generar mesas
          </Button>
        </div>
      </form>
    </Modal>
  );
};
