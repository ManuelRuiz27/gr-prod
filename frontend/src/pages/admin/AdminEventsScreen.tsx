import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Badge,
  Input,
  Modal,
  EmptyState,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  type BadgeVariant,
} from '../../design-system';
import { mockEvents, type EventStatus } from '../../fixtures';
import { getEventStatusLabel } from '../../lib/eventStatusLabel';

type EventStatusFilter = 'ALL' | EventStatus;

const EVENT_STATUS_FILTERS: EventStatusFilter[] = [
  'ALL',
  'DRAFT',
  'OPEN',
  'CLOSED',
  'FINALIZED',
  'CANCELLED',
];

const STATUS_FILTER_LABELS: Record<EventStatusFilter, string> = {
  ALL: 'Todos',
  DRAFT: 'En preparación',
  OPEN: 'Abierto',
  CLOSED: 'Cerrado',
  FINALIZED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

export const AdminEventsScreen: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('ALL');

  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      const matchesStatus =
        statusFilter === 'ALL' || event.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        event.name.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter]);

  const getStatusBadgeVariant = (status: EventStatus): BadgeVariant => {
    switch (status) {
      case 'DRAFT':
        return 'neutral';
      case 'OPEN':
        return 'success';
      case 'CLOSED':
        return 'neutral';
      case 'FINALIZED':
        return 'primary';
      case 'CANCELLED':
        return 'error';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', current: true },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-navy-900 tracking-tight">
              Eventos
            </h1>
            <p className="text-xs text-content-secondary">
              Gestiona y supervisa todos los eventos de la plataforma.
            </p>
          </div>
          <Button
            variant="primary"
            iconStart="plus"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Crear evento
          </Button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-surface-lowest rounded-2xl p-4 border border-surface-high shadow-card-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {EVENT_STATUS_FILTERS.map((filter) => {
            const isSelected = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`
                  px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none
                  ${
                    isSelected
                      ? 'bg-navy-900 text-surface-bright shadow-sm'
                      : 'bg-surface-low text-content-secondary hover:bg-surface-high border border-surface-high/60'
                  }
                `}
              >
                {STATUS_FILTER_LABELS[filter]}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="w-full lg:w-72">
          <Input
            aria-label="Buscar eventos"
            placeholder="Buscar por nombre o lugar..."
            iconStart="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No se encontraron eventos"
          description="Ajusta la búsqueda o los filtros para ver otros resultados."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Evento</TableHeader>
              <TableHeader>Fecha y lugar</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader className="text-right">Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-semibold text-navy-900">
                  {event.name}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-content-primary">
                      {event.date}
                    </span>
                    <span className="text-[11px] text-content-secondary">
                      {event.venue}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(event.status)} size="sm">
                    {getEventStatusLabel(event.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`/admin/events/${event.id}`}>
                    <Button variant="primary" size="sm" iconEnd="chevron-right">
                      Entrar
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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
