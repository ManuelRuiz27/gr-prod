import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button, Icon, Breadcrumb } from '../../design-system';
import { mockEvents } from '../../fixtures';

export const AdminEventsScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-2">
        <Breadcrumb items={[{ label: 'Plataforma GR', href: '/admin' }, { label: 'Eventos', current: true }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-navy-900 tracking-tight">
              Eventos y Generaciones
            </h1>
            <p className="text-xs text-content-secondary">
              Listado general de eventos configurados en la plataforma.
            </p>
          </div>
          <Button variant="primary" iconStart="plus" onClick={() => alert('Crear nuevo evento (M1/M2)')}>
            Crear Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mockEvents.map((event) => (
          <Card key={event.id} className="p-6 flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Badge variant="gold" size="sm">
                  {event.generation}
                </Badge>
                <Badge variant="success" dot size="sm">
                  {event.status}
                </Badge>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-navy-900 leading-snug">{event.name}</h3>
                <p className="text-xs text-content-secondary font-medium">{event.institution} • {event.career}</p>
              </div>

              <div className="p-3 bg-surface-low rounded-xl flex flex-col gap-1.5 text-xs text-content-secondary">
                <div className="flex items-center gap-2">
                  <Icon name="calendar" size={14} className="text-gold-600 shrink-0" />
                  <span>{new Date(event.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="building" size={14} className="text-gold-600 shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="ticket" size={14} className="text-gold-600 shrink-0" />
                  <span>${event.ticketPrice.toLocaleString('es-MX')} MXN por boleto</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-low">
              <div className="flex flex-col">
                <span className="text-[11px] text-content-muted">Confirmación</span>
                <span className="text-xs font-bold text-navy-900">
                  {event.confirmedGraduates} de {event.totalGraduates} ({Math.round((event.confirmedGraduates / event.totalGraduates) * 100)}%)
                </span>
              </div>
              <Link to={`/admin/events/${event.id}`}>
                <Button variant="primary" size="sm" iconEnd="chevron-right">
                  Entrar al Evento
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
