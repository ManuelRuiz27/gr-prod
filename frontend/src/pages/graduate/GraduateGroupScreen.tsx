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
import {
  currentGraduateMock,
  type GuestMock,
  type MealType,
  mockMealOptions,
} from '../../fixtures';

export const GraduateGroupScreen: React.FC = () => {
  const [guests, setGuests] = useState<GuestMock[]>(currentGraduateMock.guests);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestMeal, setNewGuestMeal] = useState<MealType>('Tradicional');

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const newGuest: GuestMock = {
      id: `gst-${Date.now()}`,
      name: newGuestName.trim(),
      meal: newGuestMeal,
    };

    setGuests([...guests, newGuest]);
    setNewGuestName('');
    setIsAddModalOpen(false);
  };

  const maxCapacity = currentGraduateMock.ticketCount; // 8
  const availableSlots = maxCapacity - guests.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header Info */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-900">Mi Grupo de Invitados</h2>
          <Badge variant="primary">
            {guests.length} / {maxCapacity} Lugares
          </Badge>
        </div>
        <p className="text-xs text-content-secondary leading-relaxed">
          Asigna los nombres y preferencias de platillo para los {maxCapacity} lugares de tu grupo en la Mesa {currentGraduateMock.tableNumber}.
        </p>

        {availableSlots > 0 && (
          <Button
            variant="gold"
            size="sm"
            iconStart="plus"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-1"
          >
            Registrar Invitado ({availableSlots} restante{availableSlots > 1 ? 's' : ''})
          </Button>
        )}
      </Card>

      {/* Guest List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Integrantes del Grupo ({guests.length})
        </h3>

        {guests.map((guest, idx) => (
          <Card key={guest.id} className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-surface-low border border-surface-high flex items-center justify-center text-xs font-bold text-navy-900">
                  {idx + 1}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-navy-900">{guest.name}</span>
                  <span className="text-[11px] text-content-muted">Lugar #{idx + 1}</span>
                </div>
              </div>
              <Badge variant={idx === 0 ? 'gold' : 'neutral'} size="sm">
                {idx === 0 ? 'Graduado' : 'Acompañante'}
              </Badge>
            </div>

            <div className="flex items-center gap-2 pt-2 mt-1 border-t border-surface-low text-xs text-content-secondary">
              <Icon name="meal" size={14} className="text-gold-600 shrink-0" />
              <span>Platillo: <strong className="text-navy-900 font-semibold">{guest.meal}</strong></span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Guest Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Registrar Invitado"
        description={`Asignar lugar a tu grupo (${availableSlots} restante)`}
      >
        <form onSubmit={handleAddGuest} className="flex flex-col gap-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej. Nombre del invitado"
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Platillo"
            value={newGuestMeal}
            onChange={(e) => setNewGuestMeal(e.target.value as MealType)}
            options={mockMealOptions.map((m) => ({
              value: m.name,
              label: m.name,
            }))}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-low">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Invitado
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
