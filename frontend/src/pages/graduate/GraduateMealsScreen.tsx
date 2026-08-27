import React, { useState } from 'react';
import { Card, Badge, Button, Select, Alert } from '../../design-system';
import {
  currentGraduateMock,
  mockMealOptions,
  type MealType,
} from '../../fixtures';

export const GraduateMealsScreen: React.FC = () => {
  const [guestSelections, setGuestSelections] = useState(
    currentGraduateMock.guests.map((g) => ({
      guestId: g.id,
      guestName: g.name,
      meal: g.meal,
    }))
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleMealChange = (guestId: string, newMeal: MealType) => {
    setGuestSelections((prev) =>
      prev.map((item) => (item.guestId === guestId ? { ...item, meal: newMeal } : item))
    );
    setSavedSuccess(false);
  };

  const handleSave = () => {
    setSavedSuccess(true);
  };

  // Totals breakdown
  const countTradicional = guestSelections.filter((g) => g.meal === 'Tradicional').length;
  const countVegetariano = guestSelections.filter((g) => g.meal === 'Vegetariano').length;
  const countVegano = guestSelections.filter((g) => g.meal === 'Vegano').length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header info */}
      <Card className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-navy-900">Selección de Platillos</h2>
        <p className="text-xs text-content-secondary leading-relaxed">
          Selecciona la opción de menú para cada uno de los {guestSelections.length} integrantes de tu grupo.
        </p>
      </Card>

      {/* Summary of Selection */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <Card className="p-3">
          <span className="text-[11px] text-content-muted block">Tradicional</span>
          <span className="text-base font-bold text-navy-900">{countTradicional}</span>
        </Card>
        <Card className="p-3">
          <span className="text-[11px] text-content-muted block">Vegetariano</span>
          <span className="text-base font-bold text-navy-900">{countVegetariano}</span>
        </Card>
        <Card className="p-3">
          <span className="text-[11px] text-content-muted block">Vegano</span>
          <span className="text-base font-bold text-navy-900">{countVegano}</span>
        </Card>
      </div>

      {savedSuccess && (
        <Alert variant="success" onDismiss={() => setSavedSuccess(false)}>
          Selección de platillos guardada exitosamente.
        </Alert>
      )}

      {/* Guest Meal Pickers */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Asignación por Integrante
        </h3>

        {guestSelections.map((item, idx) => (
          <Card key={item.guestId} className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-navy-900">{item.guestName}</span>
              <Badge variant={idx === 0 ? 'gold' : 'neutral'} size="sm">
                {idx === 0 ? 'Graduado' : `Lugar #${idx + 1}`}
              </Badge>
            </div>

            <Select
              label="Opción de Menú"
              value={item.meal}
              onChange={(e) => handleMealChange(item.guestId, e.target.value as MealType)}
              options={mockMealOptions.map((m) => ({
                value: m.name,
                label: m.name,
              }))}
            />
          </Card>
        ))}
      </div>

      {/* Menu Options Reference */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Opciones Aprobadas del Evento
        </h3>

        {mockMealOptions.map((dish) => (
          <Card key={dish.id} className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-navy-900">{dish.name}</span>
              <Badge variant="outline" size="sm">
                Menú
              </Badge>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">{dish.description}</p>
          </Card>
        ))}
      </div>

      <Button variant="primary" size="lg" fullWidth iconStart="check" onClick={handleSave}>
        Guardar Selección de Platillos
      </Button>
    </div>
  );
};
