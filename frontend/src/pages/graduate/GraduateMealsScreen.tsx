import React, { useState } from 'react';
import { Card, Badge, Button, Select, Alert } from '../../design-system';

import { currentGraduateMock, mockMealOptions } from '../../fixtures';

export const GraduateMealsScreen: React.FC = () => {
  const [guestSelections, setGuestSelections] = useState(
    currentGraduateMock.guests.map((g) => ({
      guestId: g.id,
      guestName: g.name,
      mealId: g.mealId || 'meal-res',
    }))
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleMealChange = (guestId: string, newMealId: string) => {
    setGuestSelections((prev) =>
      prev.map((item) => (item.guestId === guestId ? { ...item, mealId: newMealId } : item))
    );
    setSavedSuccess(false);
  };

  const handleSave = () => {
    setSavedSuccess(true);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header info */}
      <Card className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-navy-900">Menú y Platillos del Evento</h2>
        <p className="text-xs text-content-secondary leading-relaxed">
          Elige el tiempo principal para cada uno de los asistentes registrados en tu grupo.
        </p>
      </Card>

      {savedSuccess && (
        <Alert variant="success" onDismiss={() => setSavedSuccess(false)}>
          Selección de platillos guardada exitosamente.
        </Alert>
      )}

      {/* Guest Meal Pickers */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Elección por Asistente
        </h3>

        {guestSelections.map((item, idx) => (
          <Card key={item.guestId} className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-navy-900">{item.guestName}</span>
              <Badge variant={idx === 0 ? 'gold' : 'neutral'} size="sm">
                Boleto #{idx + 1}
              </Badge>
            </div>

            <Select
              label="Platillo Principal"
              value={item.mealId}
              onChange={(e) => handleMealChange(item.guestId, e.target.value)}
              options={mockMealOptions.map((m) => ({
                value: m.id,
                label: `${m.name} (${m.type === 'ADULT' ? 'General' : m.type === 'KID' ? 'Infantil' : 'Vegano'})`,
              }))}
            />
          </Card>
        ))}
      </div>

      {/* Available Dishes Showcase */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Opciones Disponibles
        </h3>

        {mockMealOptions.map((dish) => (
          <Card key={dish.id} className="p-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-navy-900">{dish.name}</span>
              <Badge variant="outline" size="sm">
                {dish.type}
              </Badge>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">{dish.description}</p>
          </Card>
        ))}
      </div>

      <Button variant="primary" size="lg" fullWidth iconStart="check" onClick={handleSave}>
        Confirmar Selección de Platillos
      </Button>
    </div>
  );
};
