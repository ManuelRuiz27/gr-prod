import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  Badge,
  Search,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  Button,
  Card,
  Drawer,
  Select,
} from '../../../design-system';
import {
  mockEvents,
  mockGraduatesList,
  VISUAL_QA_GRADUATE_RECORDS,
  type GraduateMock,
} from '../../../fixtures';

interface FilterState {
  financial: 'ALL' | 'AL_CORRIENTE' | 'PROXIMO' | 'VENCIDO' | 'LIQUIDADO' | 'SIN_DATOS';
  table: 'ALL' | 'WITH_TABLE' | 'WITHOUT_TABLE';
  meals: 'ALL' | 'COMPLETE' | 'PENDING';
  thermo: 'ALL' | 'LOCKED' | 'AVAILABLE' | 'REQUESTED' | 'IN_PRODUCTION' | 'DELIVERED';
  membership: 'ALL' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  pendingProof: 'ALL' | 'PENDING_REVIEW' | 'NONE';
}

const INITIAL_FILTERS: FilterState = {
  financial: 'ALL',
  table: 'ALL',
  meals: 'ALL',
  thermo: 'ALL',
  membership: 'ALL',
  pendingProof: 'ALL',
};

interface AdminEventGraduatesListScreenProps {
  isLoading?: boolean;
  graduatesOverride?: GraduateMock[];
}

export const AdminEventGraduatesListScreen: React.FC<AdminEventGraduatesListScreenProps> = ({
  isLoading = false,
  graduatesOverride,
}) => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const event = mockEvents.find((item) => item.id === eventId);

  const eventGraduates = useMemo(() => {
    if (graduatesOverride) return graduatesOverride;
    return event ? mockGraduatesList.filter((g) => g.eventId === event.id) : [];
  }, [event, graduatesOverride]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.financial !== 'ALL') count++;
    if (filters.table !== 'ALL') count++;
    if (filters.meals !== 'ALL') count++;
    if (filters.thermo !== 'ALL') count++;
    if (filters.membership !== 'ALL') count++;
    if (filters.pendingProof !== 'ALL') count++;
    return count;
  }, [filters]);

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearch('');
  };

  const filteredGraduates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return eventGraduates.filter((graduate) => {
      const visualRecord = VISUAL_QA_GRADUATE_RECORDS[graduate.id];

      // 1. Search (Name, Email, Folio, Phone)
      const folio = visualRecord?.folio?.toLowerCase() || '';
      const phone = visualRecord?.phone?.toLowerCase() || '';
      const matchSearch =
        !query ||
        graduate.fullName.toLowerCase().includes(query) ||
        graduate.email.toLowerCase().includes(query) ||
        folio.includes(query) ||
        phone.includes(query);

      if (!matchSearch) return false;

      // 2. Financial Filter
      if (filters.financial !== 'ALL') {
        const status = visualRecord?.financialStatus || 'SIN_DATOS';
        if (filters.financial !== status) return false;
      }

      // 3. Table Filter
      if (filters.table === 'WITH_TABLE' && graduate.tableNumber === null) return false;
      if (filters.table === 'WITHOUT_TABLE' && graduate.tableNumber !== null) return false;

      // 4. Meals Filter
      if (filters.meals !== 'ALL') {
        const hasAllMeals = graduate.guests.length > 0 && graduate.guests.every((g) => Boolean(g.meal));
        if (filters.meals === 'COMPLETE' && !hasAllMeals) return false;
        if (filters.meals === 'PENDING' && hasAllMeals) return false;
      }

      // 5. Thermo Filter
      if (filters.thermo !== 'ALL' && graduate.thermoStatus !== filters.thermo) {
        return false;
      }

      // 6. Membership Filter
      if (filters.membership !== 'ALL') {
        const memStatus = visualRecord?.membershipStatus || 'ACTIVE';
        if (memStatus !== filters.membership) return false;
      }

      // 7. Pending Proof Filter
      if (filters.pendingProof === 'PENDING_REVIEW') {
        const hasPending = visualRecord?.hasPendingProof ?? false;
        if (!hasPending) return false;
      } else if (filters.pendingProof === 'NONE') {
        const hasPending = visualRecord?.hasPendingProof ?? false;
        if (hasPending) return false;
      }

      return true;
    });
  }, [eventGraduates, search, filters]);

  if (!event) {
    return (
      <div className="flex flex-col gap-6 font-sans animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Evento no encontrado', current: true },
          ]}
        />
        <EmptyState
          icon="search"
          title="Evento no encontrado"
          description="No encontramos el evento solicitado."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  const getFinancialBadge = (graduate: GraduateMock) => {
    const record = VISUAL_QA_GRADUATE_RECORDS[graduate.id];
    if (record?.hasPendingProof) {
      return (
        <Badge variant="warning" size="sm" dot>
          Comprobante por revisar
        </Badge>
      );
    }
    if (record?.membershipStatus === 'CANCELLED') {
      return (
        <Badge variant="error" size="sm">
          Cancelada
        </Badge>
      );
    }
    if (record?.financialStatus === 'LIQUIDADO') {
      return (
        <Badge variant="success" size="sm">
          Liquidado
        </Badge>
      );
    }
    if (record?.financialStatus === 'VENCIDO') {
      return (
        <Badge variant="error" size="sm" dot>
          Saldo vencido
        </Badge>
      );
    }
    if (record?.financialStatus === 'PROXIMO') {
      return (
        <Badge variant="warning" size="sm">
          Próximo a vencer
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="sm">
        Al corriente
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto font-sans animate-fadeIn pb-12">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, href: `/admin/events/${event.id}` },
          { label: 'Graduados', current: true },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-silver-50 tracking-tight font-display">
            Graduados
          </h1>
          <p className="text-xs text-silver-400 mt-1">
            {event.name} • {eventGraduates.length} expedientes registrados
          </p>
        </div>
      </div>

      {eventGraduates.length === 0 && !isLoading ? (
        <EmptyState
          icon="users"
          title="Aún no hay graduados"
          description="Este evento todavía no tiene graduados registrados."
        />
      ) : (
        <Card className="p-6 space-y-5 bg-obsidian-850 border border-silver-800/80">
          {/* Controls Bar: Search + Filter Trigger & Quick Pills */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="w-full md:max-w-md">
              <Search
                placeholder="Buscar por nombre, folio, teléfono o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                aria-label="Buscar graduados"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={filters.table === 'ALL' && activeFilterCount === 0 ? 'primary' : 'secondary'}
                size="sm"
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, table: 'ALL' }))}
              >
                Todos
              </Button>
              <Button
                variant={filters.table === 'WITHOUT_TABLE' ? 'primary' : 'secondary'}
                size="sm"
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    table: prev.table === 'WITHOUT_TABLE' ? 'ALL' : 'WITHOUT_TABLE',
                  }))
                }
              >
                Sin mesa
              </Button>
              <Button
                variant={filters.thermo === 'AVAILABLE' ? 'primary' : 'secondary'}
                size="sm"
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    thermo: prev.thermo === 'AVAILABLE' ? 'ALL' : 'AVAILABLE',
                  }))
                }
              >
                Termo disponible
              </Button>
              <Button
                variant={activeFilterCount > 0 ? 'primary' : 'outline'}
                size="sm"
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                iconStart="filter"
              >
                Filtros avanzados {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2 border-b border-silver-800/60">
              <span className="text-xs text-silver-400 font-medium">Filtros aplicados:</span>
              {filters.financial !== 'ALL' && (
                <Badge variant="gold" size="sm">
                  Finanzas: {filters.financial}
                </Badge>
              )}
              {filters.table !== 'ALL' && (
                <Badge variant="gold" size="sm">
                  Mesa: {filters.table === 'WITH_TABLE' ? 'Con mesa' : 'Sin mesa'}
                </Badge>
              )}
              {filters.meals !== 'ALL' && (
                <Badge variant="gold" size="sm">
                  Platillos: {filters.meals === 'COMPLETE' ? 'Completos' : 'Pendientes'}
                </Badge>
              )}
              {filters.thermo !== 'ALL' && (
                <Badge variant="gold" size="sm">
                  Termo: {filters.thermo}
                </Badge>
              )}
              {filters.membership !== 'ALL' && (
                <Badge variant="gold" size="sm">
                  Membresía: {filters.membership}
                </Badge>
              )}
              {filters.pendingProof !== 'ALL' && (
                <Badge variant="gold" size="sm">
                  Comprobante: {filters.pendingProof}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={resetFilters}
                className="text-xs text-silver-400 hover:text-silver-100 h-6 px-2"
              >
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Table */}
          {filteredGraduates.length === 0 ? (
            <EmptyState
              icon="search"
              title="No se encontraron graduados"
              description="Ajusta la búsqueda o los filtros para visualizar resultados."
              actionLabel="Limpiar filtros"
              onAction={resetFilters}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader className="whitespace-nowrap">Folio</TableHeader>
                    <TableHeader className="whitespace-nowrap">Nombre</TableHeader>
                    <TableHeader className="whitespace-nowrap hidden md:table-cell">Teléfono</TableHeader>
                    <TableHeader className="whitespace-nowrap">Mesa / resumen</TableHeader>
                    <TableHeader className="whitespace-nowrap hidden lg:table-cell text-right">Total</TableHeader>
                    <TableHeader className="whitespace-nowrap hidden lg:table-cell text-right">Abonado</TableHeader>
                    <TableHeader className="whitespace-nowrap hidden lg:table-cell text-right">Saldo</TableHeader>
                    <TableHeader className="whitespace-nowrap">Estado</TableHeader>
                    <TableHeader className="whitespace-nowrap text-right">Acción</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGraduates.map((graduate) => {
                    const record = VISUAL_QA_GRADUATE_RECORDS[graduate.id];
                    const folio = record?.folio || '—';
                    const phone = record?.phone || '—';
                    const total = record?.totalAmount || '—';
                    const paid = record?.paidAmount || '—';
                    const balance = record?.balanceAmount || '—';

                    return (
                      <TableRow
                        key={graduate.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/admin/events/${event.id}/graduates/${graduate.id}`);
                          }
                        }}
                        className="cursor-pointer hover:bg-obsidian-800/60 focus:bg-obsidian-800/80 transition-colors"
                      >
                        <TableCell className="font-mono text-xs text-silver-300">
                          {folio}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-silver-100 truncate">
                              {graduate.fullName}
                            </span>
                            <span className="text-[11px] text-silver-400 truncate">
                              {graduate.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-silver-300 hidden md:table-cell">
                          {phone}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-silver-200">
                              {graduate.tableNumber !== null
                                ? `Mesa ${graduate.tableNumber}`
                                : 'Sin mesa'}
                            </span>
                            <span className="text-[11px] text-silver-400">
                              {graduate.ticketCount} lugares
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-sans text-right text-silver-200 hidden lg:table-cell">
                          {total}
                        </TableCell>
                        <TableCell className="text-xs font-sans text-right text-silver-200 hidden lg:table-cell">
                          {paid}
                        </TableCell>
                        <TableCell className="text-xs font-sans text-right text-silver-200 hidden lg:table-cell">
                          {balance}
                        </TableCell>
                        <TableCell>
                          {getFinancialBadge(graduate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            iconEnd="chevron-right"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/events/${event.id}/graduates/${graduate.id}`);
                            }}
                          >
                            Ver graduado
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      )}

      {/* Advanced Filter Drawer (6 Dimensions) */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filtros avanzados"
        description="Filtra los expedientes de graduados según las dimensiones normativas."
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={resetFilters}
            >
              Restablecer
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={() => setIsFilterDrawerOpen(false)}
            >
              Aplicar filtros
            </Button>
          </div>
        }
      >
        <div className="space-y-5 text-sm">
          {/* 1. Estado Financiero */}
          <Select
            id="filter-financial"
            label="Estado financiero"
            value={filters.financial}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                financial: e.target.value as FilterState['financial'],
              }))
            }
            options={[
              { label: 'Todos los estados financieros', value: 'ALL' },
              { label: 'Al corriente', value: 'AL_CORRIENTE' },
              { label: 'Próximo a vencer', value: 'PROXIMO' },
              { label: 'Con saldo vencido', value: 'VENCIDO' },
              { label: 'Liquidado', value: 'LIQUIDADO' },
              { label: 'Sin datos registrados', value: 'SIN_DATOS' },
            ]}
          />

          {/* 2. Mesa */}
          <Select
            id="filter-table"
            label="Mesa"
            value={filters.table}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                table: e.target.value as FilterState['table'],
              }))
            }
            options={[
              { label: 'Todas las asignaciones', value: 'ALL' },
              { label: 'Con mesa asignada', value: 'WITH_TABLE' },
              { label: 'Sin mesa asignada', value: 'WITHOUT_TABLE' },
            ]}
          />

          {/* 3. Platillos */}
          <Select
            id="filter-meals"
            label="Platillos"
            value={filters.meals}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                meals: e.target.value as FilterState['meals'],
              }))
            }
            options={[
              { label: 'Todos los estados de platillos', value: 'ALL' },
              { label: 'Selección completa', value: 'COMPLETE' },
              { label: 'Selección pendiente', value: 'PENDING' },
            ]}
          />

          {/* 4. Termo */}
          <Select
            id="filter-thermo"
            label="Termo conmemorativo"
            value={filters.thermo}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                thermo: e.target.value as FilterState['thermo'],
              }))
            }
            options={[
              { label: 'Todos los estados de termo', value: 'ALL' },
              { label: 'Bloqueado (por debajo del umbral)', value: 'LOCKED' },
              { label: 'Disponible para solicitar', value: 'AVAILABLE' },
              { label: 'Solicitado por graduado', value: 'REQUESTED' },
              { label: 'En producción', value: 'IN_PRODUCTION' },
              { label: 'Entregado', value: 'DELIVERED' },
            ]}
          />

          {/* 5. Membresía */}
          <Select
            id="filter-membership"
            label="Estado de membresía"
            value={filters.membership}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                membership: e.target.value as FilterState['membership'],
              }))
            }
            options={[
              { label: 'Todas las membresías', value: 'ALL' },
              { label: 'Activa', value: 'ACTIVE' },
              { label: 'Cancelada', value: 'CANCELLED' },
              { label: 'Completada', value: 'COMPLETED' },
            ]}
          />

          {/* 6. Comprobante Pendiente */}
          <Select
            id="filter-pending-proof"
            label="Comprobantes de pago"
            value={filters.pendingProof}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                pendingProof: e.target.value as FilterState['pendingProof'],
              }))
            }
            options={[
              { label: 'Todos los comprobantes', value: 'ALL' },
              { label: 'Con comprobante por revisar (PENDING_REVIEW)', value: 'PENDING_REVIEW' },
              { label: 'Sin comprobante pendiente', value: 'NONE' },
            ]}
          />
        </div>
      </Drawer>
    </div>
  );
};
