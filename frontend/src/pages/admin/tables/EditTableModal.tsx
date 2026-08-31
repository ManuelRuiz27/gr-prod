import React, { useState } from 'react';
import {
  Modal,
  Button,
  Input,
  Icon,
} from '../../../design-system';
import { type TableMock } from '../../../fixtures';
import { calculateTableOccupancy } from './seatingCoordinates';

export interface EditTableSubmitData {
  tableId: string;
  number: number;
  label: string;
  capacity: number;
}

export interface EditTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableMock;
  onSubmit: (data: EditTableSubmitData) => void;
}

export const EditTableModal: React.FC<EditTableModalProps> = ({
  isOpen,
  onClose,
  table,
  onSubmit,
}) => {
  const stats = calculateTableOccupancy(table);
  const [tableNumber, setTableNumber] = useState(String(table.number));
  const [capacity, setCapacity] = useState(String(table.capacity));
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

    // Capacity validation: new_capacity >= occupied_places
    if (parsedCapacity < stats.occupied) {
      setErrorMsg(
        `La nueva capacidad (${parsedCapacity}) no puede ser menor a los lugares ya ocupados (${stats.occupied} lugares).`
      );
      return;
    }

    onSubmit({
      tableId: table.id,
      number: parsedNumber,
      label: `Mesa ${parsedNumber}`,
      capacity: parsedCapacity,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Mesa ${table.number}`}
      description="Modifica el número identificador y la capacidad de la mesa."
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
          required
        />

        <Input
          label="Capacidad de la mesa (Lugares)"
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => {
            setCapacity(e.target.value);
            setErrorMsg('');
          }}
          required
        />

        {stats.occupied > 0 && (
          <div className="p-3 bg-amber-50 rounded-xl flex items-start gap-2 text-xs text-amber-900 border border-amber-200">
            <Icon name="info" size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Esta mesa tiene actualmente <strong>{stats.occupied} lugares asignados</strong>.
              La capacidad mínima permitida es {stats.occupied}.
            </p>
          </div>
        )}

        {/* Backend Note */}
        <div className="p-3 bg-surface-low rounded-xl flex items-start gap-2 text-xs text-content-secondary border border-surface-high">
          <Icon name="info" size={16} className="text-navy-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Los cambios se aplicarán en el canvas local. Integración con backend persistente pendiente.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-low">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
};
