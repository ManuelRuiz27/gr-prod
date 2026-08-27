import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Badge,
  Input,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  Button,
  Card,
} from '../../../design-system';
import { mockEvents, mockGraduatesList } from '../../../fixtures';
import { getThermoStatusPresentation } from '../../../lib/thermoStatusPresentation';

export const AdminEventGraduatesListScreen: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'NO_TABLE' | 'THERMO_AVAILABLE'>('ALL');

  const event = mockEvents.find((item) => item.id === eventId);

  const eventGraduates = useMemo(
    () => (event ? mockGraduatesList.filter((g) => g.eventId === event.id) : []),
    [event]
  );

  const filteredGraduates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return eventGraduates.filter((graduate) => {
      // Search
      const matchSearch =
        !query ||
        graduate.fullName.toLowerCase().includes(query) ||
        graduate.email.toLowerCase().includes(query);

      if (!matchSearch) return false;

      // Filter
      if (filter === 'NO_TABLE') {
        return !graduate.tableNumber;
      }
      if (filter === 'THERMO_AVAILABLE') {
        return graduate.thermoStatus === 'AVAILABLE';
      }
      return true;
    });
  }, [eventGraduates, search, filter]);

  if (!event) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Evento no encontrado', current: true },
          ]}
        />
        <EmptyState
          title="Evento no encontrado"
          description="No encontramos el evento solicitado."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, href: `/admin/events/${event.id}` },
          { label: 'Graduados', current: true },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
          Graduados
        </h1>
        <p className="text-xs text-content-secondary">
          {event.name}
        </p>
      </div>

      {eventGraduates.length === 0 ? (
        <EmptyState
          title="Aún no hay graduados"
          description="Este evento todavía no tiene graduados registrados."
        />
      ) : (
        <Card className="p-6 space-y-5">
          {/* Controls: Search + Filter Chips */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="w-full sm:max-w-xs">
              <Input
                aria-label="Buscar graduados"
                placeholder="Buscar por nombre o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                iconStart="search"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'ALL' ? 'primary' : 'secondary'}
                size="sm"
                type="button"
                onClick={() => setFilter('ALL')}
              >
                Todos
              </Button>
              <Button
                variant={filter === 'NO_TABLE' ? 'primary' : 'secondary'}
                size="sm"
                type="button"
                onClick={() => setFilter('NO_TABLE')}
              >
                Sin mesa
              </Button>
              <Button
                variant={filter === 'THERMO_AVAILABLE' ? 'primary' : 'secondary'}
                size="sm"
                type="button"
                onClick={() => setFilter('THERMO_AVAILABLE')}
              >
                Termo disponible
              </Button>
            </div>
          </div>

          {/* Table */}
          {filteredGraduates.length === 0 ? (
            <EmptyState
              title="No se encontraron graduados"
              description="Ajusta la búsqueda o los filtros."
            />
          ) : (
            <div className="space-y-3">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Graduado</TableHeader>
                    <TableHeader>Lugares</TableHeader>
                    <TableHeader>Mesa</TableHeader>
                    <TableHeader>Pagado</TableHeader>
                    <TableHeader>Pendiente</TableHeader>
                    <TableHeader>Vencido</TableHeader>
                    <TableHeader>Termo</TableHeader>
                    <TableHeader className="text-right">Acción</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGraduates.map((graduate) => {
                    const thermo = getThermoStatusPresentation(graduate.thermoStatus);
                    return (
                      <TableRow key={graduate.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-content-primary">
                              {graduate.fullName}
                            </span>
                            <span className="text-[11px] text-content-muted">
                              {graduate.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-content-primary">
                            {graduate.ticketCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-content-secondary">
                            {graduate.tableNumber ? `Mesa ${graduate.tableNumber}` : 'Sin mesa'}
                          </span>
                        </TableCell>
                        <TableCell className="text-content-muted">—</TableCell>
                        <TableCell className="text-content-muted">—</TableCell>
                        <TableCell className="text-content-muted">—</TableCell>
                        <TableCell>
                          <Badge variant={thermo.tone} size="sm">
                            {thermo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/admin/events/${event.id}/graduates/${graduate.id}`}>
                            <Button variant="ghost" size="sm">
                              Ver graduado
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <p className="text-xs text-content-muted pt-2 border-t border-surface-high">
                Los importes financieros estarán disponibles al integrar la cartera del evento.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
