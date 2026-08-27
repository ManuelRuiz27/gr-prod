import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Alert } from '../../design-system';
import { activeEventMock } from '../../fixtures';

export const AdminEventSettingsScreen: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold font-display text-navy-900">Configuración del Evento</h2>
        <p className="text-xs text-content-secondary">
          Parámetros operativos, fechas límite de corte y umbrales de elegibilidad.
        </p>
      </div>

      {savedSuccess && (
        <Alert variant="success" onDismiss={() => setSavedSuccess(false)}>
          Cambios en la configuración del evento guardados exitosamente.
        </Alert>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-bold text-navy-900">Información General</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nombre del Evento" defaultValue={activeEventMock.name} required />
              <Input label="Institución Educativa" defaultValue={activeEventMock.institution} required />
              <Input label="Carrera / Especialidad" defaultValue={activeEventMock.career} required />
              <Input label="Lugar y Salón" defaultValue={activeEventMock.venue} required />
            </div>
          </CardBody>
        </Card>

        {/* Operational Deadlines and Thresholds defined in EventSettings */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-bold text-navy-900">Parámetros Operativos y Deadlines</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Límite de Registro de Lugares (places deadline)"
                type="date"
                defaultValue="2027-05-01"
                helperText="Fecha límite para confirmación de lugares del grupo"
                required
              />
              <Input
                label="Límite de Selección de Mesa (table change deadline)"
                type="date"
                defaultValue="2027-05-15"
                helperText="Fecha límite para seleccionar o cambiar de mesa"
                required
              />
              <Input
                label="Límite de Selección de Platillos (meals deadline)"
                type="date"
                defaultValue="2027-05-20"
                helperText="Fecha límite para registrar preferencias de menú"
                required
              />
              <Input
                label="Umbral de Desbloqueo de Termo (%)"
                type="number"
                defaultValue="70"
                min="1"
                max="100"
                helperText="Porcentaje del plan pagado requerido para solicitar el termo"
                required
              />
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="primary" type="submit" iconStart="check">
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  );
};
