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

export interface SelectedMemberAssignment {
  groupMemberId: string;
  memberName: string;
}

export interface AssignGraduateModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: SeatingTableViewModel;
  eventId: string;
  onConfirmAssign: (
    graduateId: string,
    graduateName: string,
    places: number,
    selectedMembers?: SelectedMemberAssignment[]
  ) => void;
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
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isConfirmedFeedback, setIsConfirmedFeedback] = useState(false);

  // Filter graduates strictly by eventId
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

  // Derived nominal members for selected graduate
  const membersOfSelectedGraduate = useMemo(() => {
    if (!selectedGraduate) return [];
    if (selectedGraduate.guests && selectedGraduate.guests.length > 0) {
      return selectedGraduate.guests.map((gst, idx) => ({
        id: gst.id || `gm-${selectedGraduate.id}-${idx}`,
        name: gst.name,
        isPrimary: idx === 0,
      }));
    }
    // Fallback: titular + generic acompañantes if no guests array
    const list = [{ id: `gm-${selectedGraduate.id}-0`, name: selectedGraduate.fullName, isPrimary: true }];
    for (let i = 1; i < (selectedGraduate.ticketCount || 1); i++) {
      list.push({ id: `gm-${selectedGraduate.id}-${i}`, name: `Acompañante #${i} de ${selectedGraduate.fullName}`, isPrimary: false });
    }
    return list;
  }, [selectedGraduate]);

  if (!isOpen) return null;

  const handleSelectGraduate = (graduate: GraduateMock) => {
    setSelectedGraduate(graduate);
    setErrorMsg('');

    // Pre-select all members if they fit, or 1 member
    if (graduate.guests && graduate.guests.length > 0) {
      setSelectedMemberIds(graduate.guests.map((g) => g.id));
    } else {
      setSelectedMemberIds([`gm-${graduate.id}-0`]);
    }
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
    setErrorMsg('');
  };

  const placesToAssign = selectedMemberIds.length > 0 ? selectedMemberIds.length : (selectedGraduate?.ticketCount || 0);

  const handleConfirm = () => {
    if (!selectedGraduate) {
      setErrorMsg('Selecciona un graduado o integrantes para asignar.');
      return;
    }

    if (placesToAssign > stats.available) {
      setErrorMsg(
        `Las personas seleccionadas (${placesToAssign} personas) exceden la capacidad disponible de la mesa (${stats.available} lugares disponibles).`
      );
      return;
    }

    const selectedMembersData: SelectedMemberAssignment[] = membersOfSelectedGraduate
      .filter((m) => selectedMemberIds.includes(m.id))
      .map((m) => ({ groupMemberId: m.id, memberName: m.name }));

    onConfirmAssign(
      selectedGraduate.id,
      selectedGraduate.fullName,
      placesToAssign,
      selectedMembersData.length > 0 ? selectedMembersData : undefined
    );

    setIsConfirmedFeedback(true);
  };

  const handleClose = () => {
    setSelectedGraduate(null);
    setSelectedMemberIds([]);
    setErrorMsg('');
    setIsConfirmedFeedback(false);
    onClose();
  };

  // Step 2: Non-persistent confirmation preview state
  if (isConfirmedFeedback && selectedGraduate) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <div className="flex flex-col items-center text-center p-2 font-sans">
          <div className="w-14 h-14 rounded-full bg-status-warning/20 text-status-warning flex items-center justify-center mb-4">
            <Icon name="info" size={28} />
          </div>

          <h2 className="text-lg font-bold font-display text-silver-50">
            Vista previa local registrada
          </h2>
          <p className="text-xs text-status-warning font-medium mt-1">
            No guardado • Integración con backend pendiente
          </p>

          {/* Details */}
          <div className="w-full bg-obsidian-900 rounded-2xl p-4 my-4 border border-silver-800 text-xs space-y-2 text-left text-silver-300">
            <div className="flex justify-between">
              <span className="text-silver-400">Mesa:</span>
              <span className="font-bold text-silver-100">Mesa {table.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver-400">Membresía / Graduado:</span>
              <span className="font-bold text-silver-100">{selectedGraduate.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver-400">Personas asignadas:</span>
              <span className="font-bold text-silver-100 font-sans">{placesToAssign} personas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver-400">Tipo de cambio:</span>
              <span className="font-semibold text-status-warning">Vista previa en interfaz</span>
            </div>
          </div>

          <p className="text-[11px] text-silver-400 mb-4 leading-relaxed">
            Esta asignación por persona se muestra temporalmente en el croquis. La disponibilidad y persistencia definitiva serán revalidadas por el backend.
          </p>

          <Button variant="primary" fullWidth onClick={handleClose}>
            Entendido
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Asignar personas a Mesa ${table.number}`}
      description={`Capacidad disponible: ${stats.available} de ${table.capacity} lugares.`}
      size="md"
    >
      <div className="space-y-4 text-xs font-sans">
        {errorMsg && (
          <div className="p-3 bg-status-error/10 text-status-error rounded-xl flex items-center gap-2 border border-status-error/30">
            <Icon name="alert" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Search graduate/membership */}
        {!selectedGraduate ? (
          <div className="space-y-3">
            <Input
              label="Buscar graduado o membresía"
              placeholder="Nombre, correo o carrera..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredGraduates.length > 0 ? (
                filteredGraduates.map((grad) => (
                  <button
                    key={grad.id}
                    type="button"
                    onClick={() => handleSelectGraduate(grad)}
                    className="w-full p-3 rounded-xl border border-silver-800 bg-obsidian-900 hover:border-gold-500 hover:bg-obsidian-800 text-left flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-silver-100 block">{grad.fullName}</span>
                      <span className="text-[11px] text-silver-400">{grad.career}</span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {grad.ticketCount} lugares contratados
                    </Badge>
                  </button>
                ))
              ) : (
                <div className="p-4 bg-obsidian-900 text-center text-silver-400 rounded-xl">
                  No se encontraron graduados para este evento.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Step 2: Select individual members from chosen graduate */
          <div className="space-y-4">
            <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800 flex items-center justify-between">
              <div>
                <span className="text-silver-400 block text-[11px]">Membresía seleccionada:</span>
                <span className="font-bold text-silver-100">{selectedGraduate.fullName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedGraduate(null);
                  setSelectedMemberIds([]);
                }}
              >
                Cambiar
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-silver-300">
                  Seleccionar integrantes a ubicar en Mesa {table.number}:
                </label>
                <span className="text-[11px] text-silver-400 font-sans">
                  {selectedMemberIds.length} seleccionados
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {membersOfSelectedGraduate.map((member) => {
                  const isChecked = selectedMemberIds.includes(member.id);
                  return (
                    <label
                      key={member.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-obsidian-800 border-gold-500 text-silver-100'
                          : 'bg-obsidian-900 border-silver-800 text-silver-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleMember(member.id)}
                          className="rounded border-silver-700 bg-obsidian-800 text-gold-500 focus:ring-gold-500 h-4 w-4"
                        />
                        <span className="font-medium text-xs text-silver-200">{member.name}</span>
                      </div>
                      <Badge variant={member.isPrimary ? 'gold' : 'neutral'} size="sm">
                        {member.isPrimary ? 'Graduado titular' : 'Acompañante'}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Capacity check indicator */}
            <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800 flex items-center justify-between text-xs">
              <span className="text-silver-400">Personas seleccionadas: <strong className="text-silver-100">{placesToAssign}</strong></span>
              <span className="text-silver-400">Disponible en mesa: <strong className="text-silver-100">{stats.available}</strong></span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedGraduate || placesToAssign === 0 || placesToAssign > stats.available}
            onClick={handleConfirm}
          >
            Confirmar asignación
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const AssignMembersModal = AssignGraduateModal;
