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
          Parámetros operativos, límites de boletos y fechas límite de cierre.
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

        {/* Limits & Pricing */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-bold text-navy-900">Precios y Límites</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Precio por Boleto (MXN)"
                type="number"
                defaultValue={activeEventMock.ticketPrice}
                required
              />
              <Input
                label="Máximo de Boletos por Graduado"
                type="number"
                defaultValue={activeEventMock.limits.maxTicketsPerGraduate}
                required
              />
              <Input
                label="Aforo Máximo de Graduados"
                type="number"
                defaultValue={activeEventMock.totalGraduates}
                required
              />
            </div>
          </CardBody>
        </Card>

        {/* Deadlines */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-bold text-navy-900">Fechas Límite (Deadlines)</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Límite de Selección de Mesas"
                type="date"
                defaultValue="2026-10-15"
                required
              />
              <Input
                label="Límite de Selección de Platillos"
                type="date"
                defaultValue="2026-10-25"
                required
              />
              <Input
                label="Límite de Personalización de Termo"
                type="date"
                defaultValue="2026-10-10"
                required
              />
              <Input
                label="Límite de Pago de Liquidación"
                type="date"
                defaultValue="2026-11-05"
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
