import React, { useState } from 'react';
import {
  Card,
  Badge,
  Button,
  Input,
  Select,
  Modal,
  Icon,
} from '../../design-system';
import { currentGraduateMock, type GuestMock, mockMealOptions } from '../../fixtures';


export const GraduateGroupScreen: React.FC = () => {
  const [guests, setGuests] = useState<GuestMock[]>(currentGraduateMock.guests);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestMeal, setNewGuestMeal] = useState('meal-res');
  const [newGuestIsAdult, setNewGuestIsAdult] = useState(true);

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const newGuest: GuestMock = {
      id: `gst-${Date.now()}`,
      name: newGuestName.trim(),
      isAdult: newGuestIsAdult,
      mealId: newGuestMeal,
      tableSeat: guests.length + 1,
    };

    setGuests([...guests, newGuest]);
    setNewGuestName('');
    setIsAddModalOpen(false);
  };

  const maxCapacity = currentGraduateMock.ticketCount;
  const availableSlots = maxCapacity - guests.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header Info */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-900">Mi Grupo de Invitados</h2>
          <Badge variant="primary">
            {guests.length} / {maxCapacity} Boletos Asignados
          </Badge>
        </div>
        <p className="text-xs text-content-secondary leading-relaxed">
          Asigna el nombre de cada invitado que asistirá contigo a la Mesa {currentGraduateMock.tableNumber}.
        </p>

        {availableSlots > 0 && (
          <Button
            variant="gold"
            size="sm"
            iconStart="plus"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-1"
          >
            Registrar Acompañante ({availableSlots} disponible{availableSlots > 1 ? 's' : ''})
          </Button>
        )}
      </Card>

      {/* Guest List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Acompañantes Registrados
        </h3>

        {guests.map((guest, idx) => {
          const selectedMeal = mockMealOptions.find((m) => m.id === guest.mealId);

          return (
            <Card key={guest.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-surface-low border border-surface-high flex items-center justify-center text-xs font-bold text-navy-900">
                    {idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-navy-900">{guest.name}</span>
                    <span className="text-[11px] text-content-muted">
                      {guest.isAdult ? 'Adulto' : 'Menor'} • Asiento #{guest.tableSeat || idx + 1}
                    </span>
                  </div>
                </div>
                <Badge variant={idx === 0 ? 'gold' : 'neutral'} size="sm">
                  {idx === 0 ? 'Titular' : 'Invitado'}
                </Badge>
              </div>

              {selectedMeal && (
                <div className="flex items-center gap-2 pt-2 mt-1 border-t border-surface-low text-xs text-content-secondary">
                  <Icon name="meal" size={14} className="text-gold-600 shrink-0" />
                  <span className="truncate">{selectedMeal.name}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Guest Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Registrar Nuevo Acompañante"
        description={`Asignar boleto de tu paquete (${availableSlots} restante)`}
      >
        <form onSubmit={handleAddGuest} className="flex flex-col gap-4">
          <Input
            label="Nombre Completo del Invitado"
            placeholder="Ej. Juan Pérez"
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Tipo de Asistente"
            value={newGuestIsAdult ? 'adult' : 'kid'}
            onChange={(e) => setNewGuestIsAdult(e.target.value === 'adult')}
            options={[
              { value: 'adult', label: 'Adulto (Menú General)' },
              { value: 'kid', label: 'Menor (Menú Infantil)' },
            ]}
          />

          <Select
            label="Selección de Menú"
            value={newGuestMeal}
            onChange={(e) => setNewGuestMeal(e.target.value)}
            options={mockMealOptions.map((m) => ({
              value: m.id,
              label: m.name,
            }))}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-low">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Acompañante
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
