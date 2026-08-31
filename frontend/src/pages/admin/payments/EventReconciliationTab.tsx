import React, { useState, useMemo } from 'react';
import {
  Card,
  Input,
  Select,
  Badge,
  Button,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  Icon,
} from '../../../design-system';
import {
  mockReconciliationList,
  type ReconciliationItemMock,
  type ReconciliationStatus,
  type GatewayProviderFilter,
} from '../../../fixtures';

export interface EventReconciliationTabProps {
  onViewGraduatePlan?: (graduateId: string) => void;
}

export const EventReconciliationTab: React.FC<EventReconciliationTabProps> = ({
  onViewGraduatePlan,
}) => {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<GatewayProviderFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | 'ALL'>('ALL');

  // Dynamically derive reconciliation summary directly from normative list
  const summary = useMemo(() => {
    const list = mockReconciliationList;
    const expectedPlan = list.reduce((acc, i) => acc + i.expectedAmount, 0);
    const confirmedGateway = list.reduce((acc, i) => acc + i.gatewayConfirmedAmount, 0);
    const difference = list.reduce((acc, i) => acc + i.difference, 0);
    const pendingReviewsCount = list.filter((i) => i.status !== 'MATCHED').length;

    return {
      expectedPlan,
      confirmedGateway,
      difference,
      pendingReviewsCount,
    };
  }, []);

  const filteredList = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mockReconciliationList.filter((item) => {
      // Search
      const matchSearch =
        !query ||
        item.graduateName.toLowerCase().includes(query) ||
        item.folio.toLowerCase().includes(query) ||
        item.concept.toLowerCase().includes(query);

      if (!matchSearch) return false;

      // Provider filter
      if (providerFilter === 'MERCADO_PAGO' && item.gatewayProvider !== 'MERCADO_PAGO') return false;
      if (providerFilter === 'OPENPAY' && item.gatewayProvider !== 'OPENPAY') return false;
      if (providerFilter === 'MANUAL' && item.gatewayProvider !== 'MANUAL') return false;

      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      return true;
    });
  }, [search, providerFilter, statusFilter]);

  const getStatusBadge = (status: ReconciliationStatus) => {
    switch (status) {
      case 'MATCHED':
        return <Badge variant="success" size="sm">Sin diferencias</Badge>;
      case 'REQUIRES_REVIEW':
        return <Badge variant="warning" size="sm">Revisión necesaria</Badge>;
      case 'PENDING_CONFIRMATION':
        return <Badge variant="neutral" size="sm">Pendiente de confirmación</Badge>;
    }
  };

  const getProviderName = (provider: ReconciliationItemMock['gatewayProvider']) => {
    switch (provider) {
      case 'MERCADO_PAGO':
        return 'Mercado Pago';
      case 'OPENPAY':
        return 'OpenPay';
      case 'MANUAL':
        return 'Transferencia / Efectivo';
    }
  };

  const providerOptions = [
    { value: 'ALL', label: 'Todos los canales' },
    { value: 'MERCADO_PAGO', label: 'Mercado Pago' },
    { value: 'OPENPAY', label: 'OpenPay' },
    { value: 'MANUAL', label: 'Transferencia / Efectivo' },
  ];

  const statusOptions = [
    { value: 'ALL', label: 'Cualquier estado' },
    { value: 'MATCHED', label: 'Sin diferencias' },
    { value: 'REQUIRES_REVIEW', label: 'Revisión necesaria' },
    { value: 'PENDING_CONFIRMATION', label: 'Pendiente de confirmación' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
          Conciliación de pagos
        </h2>
        <p className="text-xs text-content-secondary mt-0.5 max-w-2xl">
          Detecta y gestiona diferencias entre las obligaciones contratadas, pagos manuales y confirmaciones de pasarelas.
        </p>
      </div>

      {/* Bento Grid: Reconciliation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Card 1: Esperado (Plan) */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-content-secondary uppercase tracking-wider">
              Esperado (Plan)
            </span>
            <div className="w-8 h-8 rounded-full bg-navy-50 text-navy-900 flex items-center justify-center">
              <Icon name="calendar" size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-navy-900 font-display">
              ${summary.expectedPlan.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </h3>
            <p className="text-[11px] text-content-muted mt-1">Obligaciones totales a la fecha</p>
          </div>
        </Card>

        {/* Stat Card 2: Confirmado (Gateway / Pasarelas) */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Confirmado (Pasarela)
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Icon name="check" size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-navy-900 font-display">
              ${summary.confirmedGateway.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </h3>
            <p className="text-[11px] text-content-muted mt-1">Fondos asegurados y recibidos</p>
          </div>
        </Card>

        {/* Stat Card 3: Diferencia Detectada */}
        <Card className="p-5 flex flex-col justify-between bg-amber-50/40 border-amber-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="alert" size={14} />
              Diferencia Detectada
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              {summary.pendingReviewsCount}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-amber-800 font-display">
              ${summary.difference < 0 ? `-$${Math.abs(summary.difference).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : `$${summary.difference.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} MXN
            </h3>
            <p className="text-[11px] text-amber-700 mt-1">
              Requiere revisión ({summary.pendingReviewsCount} casos identificados)
            </p>
          </div>
        </Card>
      </div>

      {/* Filter Controls Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar por graduado, concepto o folio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconStart="search"
            aria-label="Buscar en conciliación"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="w-48 shrink-0">
            <Select
              options={providerOptions}
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as GatewayProviderFilter)}
              aria-label="Filtrar por pasarela"
            />
          </div>

          <div className="w-52 shrink-0">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReconciliationStatus | 'ALL')}
              aria-label="Filtrar por estado de conciliación"
            />
          </div>
        </div>
      </Card>

      {/* Reconciliation Table */}
      {filteredList.length === 0 ? (
        <EmptyState
          title="No se encontraron registros de conciliación"
          description="No hay transacciones que coincidan con los filtros y criterios seleccionados."
          actionLabel="Restablecer filtros"
          onAction={() => {
            setSearch('');
            setProviderFilter('ALL');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Graduado</TableHeader>
              <TableHeader className="text-right">Plan (Esperado)</TableHeader>
              <TableHeader className="text-right">Registrado</TableHeader>
              <TableHeader>Confirmado (Canal)</TableHeader>
              <TableHeader className="text-right">Diferencia</TableHeader>
              <TableHeader className="text-center">Estado</TableHeader>
              <TableHeader className="text-right">Acción</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList.map((item) => (
              <TableRow key={item.id}>
                {/* Graduate & Folio */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {item.graduateName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-navy-900">{item.graduateName}</span>
                      <span className="text-[11px] text-content-muted">
                        {item.folio} • {item.concept}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Plan Esperado */}
                <TableCell className="text-right font-bold text-navy-900">
                  ${item.expectedAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </TableCell>

                {/* Registrado */}
                <TableCell className="text-right text-content-primary">
                  ${item.registeredAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </TableCell>

                {/* Confirmado Pasarela */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-navy-900">
                      ${item.gatewayConfirmedAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-content-secondary">
                      {getProviderName(item.gatewayProvider)}
                    </span>
                  </div>
                </TableCell>

                {/* Diferencia */}
                <TableCell className="text-right">
                  <span
                    className={`font-bold text-xs ${
                      item.difference < 0
                        ? 'text-status-warning'
                        : 'text-status-success'
                    }`}
                  >
                    {item.difference === 0
                      ? '$0.00'
                      : `-$${Math.abs(item.difference).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                  </span>
                </TableCell>

                {/* Estado */}
                <TableCell className="text-center">
                  {getStatusBadge(item.status)}
                </TableCell>

                {/* Action */}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (onViewGraduatePlan) {
                        onViewGraduatePlan(item.graduateId);
                      }
                    }}
                  >
                    Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
