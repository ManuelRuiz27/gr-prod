import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Badge, Button, Breadcrumb } from '../../design-system';
import { mockEvents } from '../../fixtures';

export const AdminEventOverviewScreen: React.FC = () => {
  const { eventId } = useParams();
  const event = mockEvents.find((e) => e.id === eventId) || mockEvents[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb Hierarchy */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, current: true },
        ]}
      />

      {/* Event Header Banner */}
      <Card variant="gold-accent" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm">
                Generación {event.generation}
              </Badge>
              <Badge variant="success" dot size="sm">
                {event.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold font-display text-navy-900">{event.name}</h1>
            <p className="text-xs text-content-secondary font-medium">
              {event.institution} • {event.career} • {event.venue} • {event.date}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/admin/events/${event.id}/settings`}>
              <Button variant="secondary" size="sm" iconStart="settings">
                Configuración
              </Button>
            </Link>
            <Link to={`/admin/events/${event.id}/reports`}>
              <Button variant="gold" size="sm" iconStart="download">
                Descargar Reportes
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-content-muted">Estado del Evento</span>
          <span className="text-2xl font-bold text-navy-900 my-2">
            {event.status}
          </span>
          <Badge variant="success" size="sm" className="self-start">
            Operativo
          </Badge>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-content-muted">Recaudación del Evento</span>
          <span className="text-2xl font-bold text-navy-900 my-2">
            $630,000.00
          </span>
          <Badge variant="success" size="sm" className="self-start">
            60% Cubierto
          </Badge>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-content-muted">Mesas Asignadas</span>
          <span className="text-2xl font-bold text-navy-900 my-2">
            18 / 26 Mesas
          </span>
          <Badge variant="gold" size="sm" className="self-start">
            8 Disponibles
          </Badge>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-content-muted">Termos en Producción</span>
          <span className="text-2xl font-bold text-navy-900 my-2">
            14 Solicitados
          </span>
          <Badge variant="neutral" size="sm" className="self-start">
            Umbral 70%
          </Badge>
        </Card>
      </div>

      {/* Deadlines Section */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold text-navy-900">Fechas Límite Operativas del Evento</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-surface-low rounded-xl flex flex-col gap-1">
              <span className="text-content-muted font-semibold">Límite de Registro de Lugares</span>
              <span className="font-bold text-navy-900">01 May 2027</span>
              <Badge variant="success" size="sm" className="self-start mt-1">Concluido</Badge>
            </div>
            <div className="p-3 bg-surface-low rounded-xl flex flex-col gap-1">
              <span className="text-content-muted font-semibold">Límite de Selección de Mesas</span>
              <span className="font-bold text-navy-900">15 May 2027</span>
              <Badge variant="warning" size="sm" className="self-start mt-1">Abierto</Badge>
            </div>
            <div className="p-3 bg-surface-low rounded-xl flex flex-col gap-1">
              <span className="text-content-muted font-semibold">Límite de Selección de Platillos</span>
              <span className="font-bold text-navy-900">20 May 2027</span>
              <Badge variant="warning" size="sm" className="self-start mt-1">Abierto</Badge>
            </div>
          </div>
        </CardBody>
      </Card>

    </div>
  );
};
