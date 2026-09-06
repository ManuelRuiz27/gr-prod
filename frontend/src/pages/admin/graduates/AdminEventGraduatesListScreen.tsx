import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
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

      // 1. Search (Folio, Name, Phone, Email internal)
      const folio = visualRecord?.folio?.toLowerCase() || '';
      const phone = visualRecord?.phone?.toLowerCase() || '';
      const matchSearch =
        !query ||
        graduate.fullName.toLowerCase().includes(query) ||
        folio.includes(query) ||
        phone.includes(query) ||
        graduate.email.toLowerCase().includes(query);

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

  // Alerta condensada única
  const getAlertBadge = (graduate: GraduateMock) => {
    const record = VISUAL_QA_GRADUATE_RECORDS[graduate.id];
    if (record?.hasPendingProof) {
      return (
        <Badge variant="warning" size="sm" dot>
          Comprobante por revisar
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
    if (graduate.tableNumber === null) {
      return (
        <Badge variant="neutral" size="sm">
          Sin mesa
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

  // Desglose de personas con datos existentes
  const getPersonasSummary = (graduate: GraduateMock) => {
    const visualGuests = VISUAL_QA_GRADUATE_RECORDS[graduate.id]?.guests;
    if (visualGuests && visualGuests.length > 0) {
      const children = visualGuests.filter(
        (g) =>
          g.productType?.toLowerCase().includes('infantil') ||
          g.productType?.toLowerCase().includes('niño')
      ).length;
      const adults = visualGuests.length - children;
      const parts: string[] = [];
      if (adults > 0) parts.push(`${adults} adulto${adults > 1 ? 's' : ''}`);
      if (children > 0) parts.push(`${children} niño${children > 1 ? 's' : ''}`);
      return {
        count: graduate.ticketCount,
        breakdown: parts.length > 0 ? parts.join(' · ') : null,
      };
    }
    return { count: graduate.ticketCount, breakdown: null };
  };

  const isQuickAll =
    filters.financial === 'ALL' &&
    filters.table === 'ALL' &&
    filters.pendingProof === 'ALL';

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto font-sans animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-silver-800/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-silver-50 tracking-tight font-display">
            Graduados
          </h1>
          <p className="text-xs text-silver-400 mt-1">
            {event.name} · {eventGraduates.length} expedientes registrados
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
        <div className="space-y-4">
          {/* Controls Bar: Search + 4 Quick Filters */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between border-b border-silver-800/60 pb-4">
            <div className="w-full md:max-w-md">
              <Search
                placeholder="Buscar por folio, nombre o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                aria-label="Buscar graduados"
              />
            </div>

            {/* 4 Filtros Rápidos Operativos (Primera Capa) */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={isQuickAll ? 'primary' : 'secondary'}
                size="sm"
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    financial: 'ALL',
                    table: 'ALL',
                    pendingProof: 'ALL',
                  }))
                }
              >
                Todos
              </Button>
              <Button
                variant={filters.financial === 'VENCIDO' ? 'primary' : 'secondary'}
                size="sm"
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    financial: prev.financial === 'VENCIDO' ? 'ALL' : 'VENCIDO',
                  }))
                }
              >
                Saldo vencido
              </Button>
              <Button
                variant={filters.pendingProof === 'PENDING_REVIEW' ? 'primary' : 'secondary'}
                size="sm"
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    pendingProof:
                      prev.pendingProof === 'PENDING_REVIEW' ? 'ALL' : 'PENDING_REVIEW',
                  }))
                }
              >
                Comprobante por revisar
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

              {/* Filtro secundario discreto */}
              <Button
                variant={activeFilterCount > 0 && !isQuickAll ? 'outline' : 'ghost'}
                size="sm"
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                iconStart="filter"
                className="text-xs text-silver-400"
              >
                Más filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </div>
          </div>

          {/* Results check */}
          {filteredGraduates.length === 0 ? (
            <EmptyState
              icon="search"
              title="No se encontraron graduados"
              description="Ajusta la búsqueda o los filtros para visualizar resultados."
              actionLabel="Limpiar filtros"
              onAction={resetFilters}
            />
          ) : (
            <>
              {/* Desktop Table (Visible >= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader className="whitespace-nowrap">Folio</TableHeader>
                      <TableHeader className="whitespace-nowrap">Nombre</TableHeader>
                      <TableHeader className="whitespace-nowrap">Personas</TableHeader>
                      <TableHeader className="whitespace-nowrap text-right">Total</TableHeader>
                      <TableHeader className="whitespace-nowrap text-right">Abonado</TableHeader>
                      <TableHeader className="whitespace-nowrap text-right">Saldo</TableHeader>
                      <TableHeader className="whitespace-nowrap">Mesa</TableHeader>
                      <TableHeader className="whitespace-nowrap">Alerta</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredGraduates.map((graduate) => {
                      const record = VISUAL_QA_GRADUATE_RECORDS[graduate.id];
                      const folio = record?.folio || '—';
                      const total = record?.totalAmount || '—';
                      const paid = record?.paidAmount || '—';
                      const balance = record?.balanceAmount || '—';
                      const personas = getPersonasSummary(graduate);

                      return (
                        <TableRow
                          key={graduate.id}
                          tabIndex={0}
                          onClick={() =>
                            navigate(`/admin/events/${event.id}/graduates/${graduate.id}`)
                          }
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
                          <TableCell className="font-semibold text-silver-100">
                            {graduate.fullName}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs text-silver-200 font-medium">
                                {personas.count}
                              </span>
                              {personas.breakdown && (
                                <span className="text-[11px] text-silver-400">
                                  {personas.breakdown}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-sans text-right text-silver-300">
                            {total}
                          </TableCell>
                          <TableCell className="text-xs font-sans text-right text-silver-300">
                            {paid}
                          </TableCell>
                          <TableCell className="text-xs font-sans text-right font-bold text-silver-100">
                            {balance}
                          </TableCell>
                          <TableCell className="text-xs text-silver-300">
                            {graduate.tableNumber !== null
                              ? `Mesa ${graduate.tableNumber}`
                              : 'Sin mesa'}
                          </TableCell>
                          <TableCell>
                            {getAlertBadge(graduate)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Dense List (< 768px) */}
              <div className="md:hidden divide-y divide-silver-800/60 bg-obsidian-900/60 rounded-xl border border-silver-800/80">
                {filteredGraduates.map((graduate) => {
                  const record = VISUAL_QA_GRADUATE_RECORDS[graduate.id];
                  const folio = record?.folio || '—';
                  const balance = record?.balanceAmount || '—';

                  return (
                    <div
                      key={graduate.id}
                      onClick={() =>
                        navigate(`/admin/events/${event.id}/graduates/${graduate.id}`)
                      }
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-obsidian-800/50 transition-colors"
                    >
                      <div className="flex flex-col min-w-0 space-y-0.5">
                        <span className="font-mono text-xs text-gold-400 font-semibold">
                          {folio}
                        </span>
                        <span className="font-bold text-silver-100 truncate text-sm">
                          {graduate.fullName}
                        </span>
                        <div className="text-xs text-silver-400">
                          {graduate.ticketCount} personas · Saldo {balance}
                        </div>
                        <span className="text-xs text-silver-300">
                          {graduate.tableNumber !== null
                            ? `Mesa ${graduate.tableNumber}`
                            : 'Sin mesa'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {getAlertBadge(graduate)}
                        <span className="text-gold-400 text-sm font-semibold">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Drawer de Filtros Secundarios */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filtros avanzados"
        description="Dimensiones operativas complementarias."
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
          {/* Platillos */}
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

          {/* Termo */}
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
              { label: 'Bloqueado', value: 'LOCKED' },
              { label: 'Disponible', value: 'AVAILABLE' },
              { label: 'Solicitado', value: 'REQUESTED' },
              { label: 'En producción', value: 'IN_PRODUCTION' },
              { label: 'Entregado', value: 'DELIVERED' },
            ]}
          />

          {/* Membresía */}
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
        </div>
      </Drawer>
    </div>
  );
};

