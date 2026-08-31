import React, { useState, useMemo } from 'react';
import {
  Modal,
  Button,
  Input,
  Badge,
  Icon,
} from '../../../design-system';
import {
  mockGraduatesList,
  type GraduateMock,
} from '../../../fixtures';
import { type SeatingTableViewModel, calculateTableOccupancy } from './seatingCoordinates';

export interface AssignGraduateModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: SeatingTableViewModel;
  eventId: string;
  onConfirmAssign: (graduateId: string, graduateName: string, places: number) => void;
}

export const AssignGraduateModal: React.FC<AssignGraduateModalProps> = ({
  isOpen,
  onClose,
  table,
  eventId,
  onConfirmAssign,
}) => {
  const stats = calculateTableOccupancy(table);
  const [search, setSearch] = useState('');
  const [selectedGraduate, setSelectedGraduate] = useState<GraduateMock | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isConfirmedFeedback, setIsConfirmedFeedback] = useState(false);

  // Strictly filter graduates by eventId
  const availableGraduates = useMemo(() => {
    return mockGraduatesList.filter((g) => g.eventId === eventId);
  }, [eventId]);

  const filteredGraduates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return availableGraduates.filter((g) => {
      if (!query) return true;
      return (
        g.fullName.toLowerCase().includes(query) ||
        g.career.toLowerCase().includes(query) ||
        g.email.toLowerCase().includes(query)
      );
    });
  }, [availableGraduates, search]);

  if (!isOpen) return null;

  const handleSelectGraduate = (graduate: GraduateMock) => {
    setSelectedGraduate(graduate);
    setErrorMsg('');

    // Capacity validation check
    if (graduate.ticketCount > stats.available) {
      setErrorMsg(
        `Los lugares requeridos por el graduado (${graduate.ticketCount} lugares) exceden la capacidad disponible de la mesa (${stats.available} lugares disponibles).`
      );
    }
  };

  const handleConfirm = () => {
    if (!selectedGraduate) {
      setErrorMsg('Selecciona un graduado para asignar.');
      return;
    }

    if (selectedGraduate.ticketCount > stats.available) {
      setErrorMsg(
        `No es posible asignar al graduado porque requiere ${selectedGraduate.ticketCount} lugares y la mesa solo tiene ${stats.available} disponibles.`
      );
      return;
    }

    onConfirmAssign(
      selectedGraduate.id,
      selectedGraduate.fullName,
      selectedGraduate.ticketCount
    );

    setIsConfirmedFeedback(true);
  };

  const handleClose = () => {
    setSelectedGraduate(null);
    setErrorMsg('');
    setIsConfirmedFeedback(false);
    onClose();
  };

  // Step 2: Non-persistent confirmation state (Explicit preview notice)
  if (isConfirmedFeedback && selectedGraduate) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
            <Icon name="info" size={28} />
          </div>

          <h2 className="text-lg font-bold font-display text-navy-900">
            Vista previa local registrada
          </h2>
          <p className="text-xs text-amber-800 font-medium mt-1">
            No guardado • Integración con backend pendiente
          </p>

          {/* Details */}
          <div className="w-full bg-surface-low rounded-2xl p-4 my-4 border border-surface-high text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-content-secondary">Mesa:</span>
              <span className="font-bold text-navy-900">Mesa {table.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-secondary">Graduado:</span>
              <span className="font-bold text-navy-900">{selectedGraduate.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-secondary">Lugares asignados:</span>
              <span className="font-bold text-navy-900">{selectedGraduate.ticketCount} lugares</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-secondary">Tipo de cambio:</span>
              <span className="font-semibold text-amber-700">Vista previa en interfaz</span>
            </div>
          </div>

          <p className="text-[11px] text-content-secondary mb-4 leading-relaxed">
            Esta asignación se muestra temporalmente en el canvas. La persistencia definitiva requiere integración con backend.
          </p>

          <Button variant="primary" fullWidth onClick={handleClose}>
            Entendido
          </Button>
        </div>
      </Modal>
    );
  }

  const isOverCapacity = selectedGraduate && selectedGraduate.ticketCount > stats.available;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Asignar graduado a Mesa ${table.number}`}
      description={`Capacidad disponible actual: ${stats.available} lugares.`}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {errorMsg && (
          <div className="p-3 bg-status-error-bg text-status-error text-xs rounded-xl flex items-start gap-2 border border-status-error/20">
            <Icon name="alert" size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search */}
        <Input
          placeholder="Buscar por graduado o carrera..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          iconStart="search"
          aria-label="Buscar graduado para asignación"
        />

        {/* Graduates List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-surface-low">
          {filteredGraduates.length === 0 ? (
            <div className="p-6 text-center text-xs text-content-secondary">
              No se encontraron graduados en este evento que coincidan con la búsqueda.
            </div>
          ) : (
            filteredGraduates.map((grad) => {
              const isSelected = selectedGraduate?.id === grad.id;
              const doesFit = grad.ticketCount <= stats.available;

              return (
                <div
                  key={grad.id}
                  onClick={() => handleSelectGraduate(grad)}
                  className={`
                    p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                    ${
                      isSelected
                        ? 'border-navy-900 bg-navy-50/60 shadow-sm'
                        : 'border-surface-high/60 bg-white hover:bg-surface-low/50 hover:border-navy-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {grad.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-900">{grad.fullName}</p>
                      <p className="text-[11px] text-content-secondary">
                        {grad.career} • {grad.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={doesFit ? 'primary' : 'error'} size="sm">
                      {grad.ticketCount} lugares
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selection Confirmation Bar */}
        {selectedGraduate && (
          <div className="p-3 bg-surface-low rounded-xl flex items-center justify-between text-xs border border-surface-high">
            <span className="text-content-secondary">Graduado seleccionado:</span>
            <span className="font-bold text-navy-900">
              {selectedGraduate.fullName} ({selectedGraduate.ticketCount} lugares)
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-low">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleConfirm}
            disabled={!selectedGraduate || !!isOverCapacity}
          >
            Confirmar asignación
          </Button>
        </div>
      </div>
    </Modal>
  );
};
