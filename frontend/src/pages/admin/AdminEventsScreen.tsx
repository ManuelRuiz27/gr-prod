import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button, Icon, Breadcrumb, Modal, Input } from '../../design-system';
import { mockEvents } from '../../fixtures';

export const AdminEventsScreen: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
          <Button variant="primary" iconStart="plus" onClick={() => setIsCreateModalOpen(true)}>
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
                  Generación {event.generation}
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
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="building" size={14} className="text-gold-600 shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-low">
              <span className="text-xs text-content-muted">Evento Operativo</span>
              <Link to={`/admin/events/${event.id}`}>
                <Button variant="primary" size="sm" iconEnd="chevron-right">
                  Entrar al Evento
                </Button>
              </Link>
            </div>

          </Card>
        ))}
      </div>

      {/* Demo Modal for Create Event without alert() */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Evento"
        description="Módulo de configuración de eventos"
      >
        <div className="flex flex-col gap-4">
          <Input label="Nombre del Evento" placeholder="Ej. Graduación Medicina 2027" />
          <Input label="Lugar del Evento" placeholder="Ej. Centro de Convenciones" />
          <Input label="Fecha del Evento" placeholder="Ej. 19 Jun 2027" />
          <div className="flex justify-end gap-3 pt-3 border-t border-surface-low">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(false)}>
              Guardar (Demo)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
