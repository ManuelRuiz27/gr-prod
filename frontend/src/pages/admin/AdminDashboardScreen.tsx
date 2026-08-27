import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Badge, Button, Icon } from '../../design-system';
import { mockEvents } from '../../fixtures';

export const AdminDashboardScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-display text-navy-900 tracking-tight">
            Panel de Control Global
          </h1>
          <p className="text-xs text-content-secondary">
            Visión general de los eventos y operaciones activas en la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/events">
            <Button variant="primary" iconStart="building">
              Ver Todos los Eventos
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted">Eventos Operativos</span>
            <div className="w-8 h-8 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center">
              <Icon name="building" size={16} />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-navy-900">{mockEvents.length} Evento</span>
            <span className="text-xs text-content-muted block mt-0.5">Generación 2027</span>
          </div>
          <Badge variant="primary" size="sm" className="self-start">
            Estado OPEN
          </Badge>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted">Graduados Registrados</span>
            <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
              <Icon name="users" size={16} />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-navy-900">84 Graduados</span>
            <span className="text-xs text-content-muted block mt-0.5">84% de aforo registrado</span>
          </div>
          <Badge variant="gold" size="sm" className="self-start">
            84 / 100 Registrados
          </Badge>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted">Recaudación Global</span>
            <div className="w-8 h-8 rounded-xl bg-status-success-bg text-status-success flex items-center justify-center">
              <Icon name="payment" size={16} />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-navy-900">$630,000.00</span>
            <span className="text-xs text-content-muted block mt-0.5">MXN recaudados</span>
          </div>
          <Badge variant="success" size="sm" className="self-start">
            En Tiempo
          </Badge>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted">Mesas Ocupadas</span>
            <div className="w-8 h-8 rounded-xl bg-surface-low text-content-secondary flex items-center justify-center">
              <Icon name="table" size={16} />
            </div>
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-navy-900">18 / 26 Mesas</span>
            <span className="text-xs text-content-muted block mt-0.5">ROUND y SQUARE</span>
          </div>
          <Badge variant="neutral" size="sm" className="self-start">
            8 Disponibles
          </Badge>
        </Card>
      </div>

      {/* Active Events List Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-bold text-navy-900">Eventos en Gestión</h3>
            <p className="text-xs text-content-secondary">
              Selecciona un evento para gestionar su cartera, mesas, platillos y reportes.
            </p>
          </div>
          <Link to="/admin/events">
            <Button variant="secondary" size="sm">
              Ver listado
            </Button>
          </Link>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockEvents.map((event) => (
              <Card key={event.id} variant="interactive" className="p-5 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold-700 uppercase tracking-wider">
                      {event.institution}
                    </span>
                    <Badge variant="success" dot size="sm">
                      {event.status}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-navy-900 leading-snug">{event.name}</h4>
                  <div className="flex flex-col gap-1 text-xs text-content-secondary">
                    <div className="flex items-center gap-2">
                      <Icon name="calendar" size={14} className="text-content-muted shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="building" size={14} className="text-content-muted shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-surface-low">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-content-muted">Generación</span>
                    <span className="text-xs font-bold text-navy-900">
                      {event.generation}
                    </span>
                  </div>
                  <Link to={`/admin/events/${event.id}`}>
                    <Button variant="primary" size="sm" iconEnd="chevron-right">
                      Administrar
                    </Button>
                  </Link>
                </div>

              </Card>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
