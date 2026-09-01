import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  Button,
  Badge,
  Search,
  EmptyState,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  SkeletonTable,
  type BadgeVariant,
} from '../../design-system';
import { mockEvents, mockGraduatesList, type EventStatus, type EventMock } from '../../fixtures';
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

export interface AdminEventsScreenProps {
  isLoading?: boolean;
  eventsOverride?: EventMock[];
}

export const AdminEventsScreen: React.FC<AdminEventsScreenProps> = ({
  isLoading = false,
  eventsOverride,
}) => {
  const events = eventsOverride !== undefined ? eventsOverride : mockEvents;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('ALL');

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesStatus =
        statusFilter === 'ALL' || event.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        event.name.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        (event.institution && event.institution.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [events, search, statusFilter]);

  const getStatusBadgeVariant = (status: EventStatus): BadgeVariant => {
    switch (status) {
      case 'DRAFT':
        return 'neutral';
      case 'OPEN':
        return 'success';
      case 'CLOSED':
        return 'warning';
      case 'FINALIZED':
        return 'primary';
      case 'CANCELLED':
        return 'error';
    }
  };

  const getEventGraduateCount = (eventId: string) => {
    return mockGraduatesList.filter((g) => g.eventId === eventId).length;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 font-sans animate-fadeIn">
        <PageHeader
          title="Eventos"
          subtitle="Gestiona y supervisa todos los eventos de la plataforma."
          actions={
            <Link to="/admin/events/new">
              <Button variant="primary" iconStart="plus">
                Crear evento
              </Button>
            </Link>
          }
        />
        <SkeletonTable rows={5} cols={8} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans animate-fadeIn">
      {/* Header with Title & Primary CTA */}
      <PageHeader
        title="Eventos"
        subtitle="Gestiona y supervisa todos los eventos de la plataforma."
        actions={
          <Link to="/admin/events/new">
            <Button variant="primary" iconStart="plus">
              Crear evento
            </Button>
          </Link>
        }
      />

      {/* Filters and Search Bar */}
      <div className="bg-obsidian-850 rounded-card p-4 border border-silver-800/80 shadow-card-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtro por estado de evento">
          {EVENT_STATUS_FILTERS.map((filter) => {
            const isSelected = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`
                  px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40
                  ${
                    isSelected
                      ? 'bg-gold-500 text-obsidian-950 font-bold shadow-sm'
                      : 'bg-obsidian-900 text-silver-400 hover:text-silver-100 hover:bg-obsidian-800 border border-silver-800'
                  }
                `}
              >
                {STATUS_FILTER_LABELS[filter]}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="w-full lg:w-80">
          <Search
            aria-label="Buscar eventos"
            placeholder="Buscar por nombre, institución o lugar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {events.length === 0 ? (
        <EmptyState
          icon="building"
          title="No existen eventos registrados"
          description="Aún no tienes ningún evento en gestión. Comienza creando el primero."
          actionLabel="Crear evento"
          onAction={() => {
            window.location.href = '/admin/events/new';
          }}
        />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon="search"
          title="No se encontraron eventos"
          description="Ajusta la búsqueda o los filtros para ver otros resultados."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Evento</TableHeader>
              <TableHeader className="hidden md:table-cell">Escuela</TableHeader>
              <TableHeader>Fecha</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader className="hidden sm:table-cell text-center">Graduados</TableHeader>
              <TableHeader className="hidden lg:table-cell text-right">Cobrado</TableHeader>
              <TableHeader className="hidden lg:table-cell text-right">Pendiente</TableHeader>
              <TableHeader className="text-right">Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((event) => {
              const gradsCount = getEventGraduateCount(event.id);
              return (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex flex-col min-w-[160px]">
                      <span className="font-semibold text-silver-100">{event.name}</span>
                      <span className="text-[11px] text-silver-400">{event.venue}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-silver-300">
                      {event.institution || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-silver-300 whitespace-nowrap">
                      {event.date}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(event.status)} size="sm" dot>
                      {getEventStatusLabel(event.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <span className="text-xs font-semibold text-silver-100 font-sans">
                      {gradsCount}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right text-xs text-silver-400 font-sans">
                    —
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right text-xs text-silver-400 font-sans">
                    —
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/admin/events/${event.id}`}>
                      <Button variant="secondary" size="sm" iconEnd="chevron-right">
                        Entrar
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
