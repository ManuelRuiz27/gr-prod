import React, { useState, useMemo } from 'react';
import {
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
  mockGraduatesList,
  mockPaymentPlansMap,
  type ReconciliationStatus,
  type GatewayProviderFilter,
} from '../../../fixtures';

export interface EventReconciliationTabProps {
  eventId: string;
  onViewGraduatePlan?: (graduateId: string) => void;
}

export const EventReconciliationTab: React.FC<EventReconciliationTabProps> = ({
  eventId,
  onViewGraduatePlan,
}) => {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<GatewayProviderFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | 'ALL'>('ALL');

  // Derive reconciliation items strictly from event's plans & transactions
  const reconciliationItems = useMemo(() => {
    const graduates = mockGraduatesList.filter((g) => g.eventId === eventId);
    const items: Array<{
      id: string;
      graduateId: string;
      graduateName: string;
      concept: string;
      expectedAmount: number;
      registeredAmount: number;
      gatewayConfirmedAmount: number;
      difference: number;
      gatewayProvider: 'MERCADO_PAGO' | 'OPENPAY' | 'MANUAL';
      status: ReconciliationStatus;
    }> = [];

    graduates.forEach((g) => {
      const plan =
        mockPaymentPlansMap[g.id]?.eventId === eventId
          ? mockPaymentPlansMap[g.id]
          : null;

      if (plan?.transactions) {
        plan.transactions.forEach((tx) => {
          const inst = plan.installments.find((i) => i.id === tx.installmentId);
          const expected = inst ? inst.amount : tx.amount;
          const diff = tx.amount - expected;
          const provider: 'MERCADO_PAGO' | 'OPENPAY' | 'MANUAL' =
            tx.method === 'MERCADO_PAGO'
              ? 'MERCADO_PAGO'
              : tx.method === 'OPENPAY'
              ? 'OPENPAY'
              : 'MANUAL';

          const status: ReconciliationStatus =
            diff === 0
              ? 'MATCHED'
              : tx.status === 'PENDING'
              ? 'PENDING_CONFIRMATION'
              : 'REQUIRES_REVIEW';

          items.push({
            id: `rec-${tx.id}`,
            graduateId: g.id,
            graduateName: g.fullName,
            concept: tx.installmentLabel || 'Cuota',
            expectedAmount: expected,
            registeredAmount: tx.amount,
            gatewayConfirmedAmount: tx.status === 'CONFIRMED' ? tx.amount : 0,
            difference: diff,
            gatewayProvider: provider,
            status,
          });
        });
      }
    });

    return items;
  }, [eventId]);

  // Dynamically derive summary metrics strictly from the resolved items
  const summary = useMemo(() => {
    const expectedPlan = reconciliationItems.reduce((acc, i) => acc + i.expectedAmount, 0);
    const confirmedGateway = reconciliationItems.reduce((acc, i) => acc + i.gatewayConfirmedAmount, 0);
    const difference = reconciliationItems.reduce((acc, i) => acc + i.difference, 0);
    const pendingReviewsCount = reconciliationItems.filter((i) => i.status !== 'MATCHED').length;

    return {
      expectedPlan,
      confirmedGateway,
      difference,
      pendingReviewsCount,
    };
  }, [reconciliationItems]);

  const filteredList = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reconciliationItems.filter((item) => {
      // Search
      const matchSearch =
        !query ||
        item.graduateName.toLowerCase().includes(query) ||
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
  }, [reconciliationItems, search, providerFilter, statusFilter]);

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

  const getProviderName = (provider: 'MERCADO_PAGO' | 'OPENPAY' | 'MANUAL') => {
    switch (provider) {
      case 'MERCADO_PAGO':
        return 'Mercado Pago';
      case 'OPENPAY':
        return 'OpenPay';
      case 'MANUAL':
        return 'Transferencia / Efectivo';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-sans">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-silver-50 tracking-tight">
          Conciliación de pagos
        </h2>
        <p className="text-xs text-silver-400 mt-0.5 max-w-2xl">
          Detecta y gestiona diferencias entre las obligaciones contratadas, pagos manuales y confirmaciones de pasarelas.
        </p>
      </div>

      {/* Flat Summary: Reconciliation Totals */}
      <div className="py-4 border-y border-silver-800/60">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {/* Stat 1: Esperado (Plan) */}
          <div>
            <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
              Esperado (Plan)
            </span>
            <div className="text-2xl font-extrabold text-silver-50 font-sans mt-1">
              ${summary.expectedPlan.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </div>
            <p className="text-[11px] text-silver-400 mt-0.5">Obligaciones de pagos registrados</p>
          </div>

          {/* Stat 2: Confirmado (Gateway / Pasarelas) */}
          <div>
            <span className="text-xs font-semibold text-status-success uppercase tracking-wider">
              Confirmado (Pasarela)
            </span>
            <div className="text-2xl font-extrabold text-silver-50 font-sans mt-1">
              ${summary.confirmedGateway.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </div>
            <p className="text-[11px] text-silver-400 mt-0.5">Fondos confirmados recibidos</p>
          </div>

          {/* Stat 3: Diferencia Detectada */}
          <div>
            <span className="text-xs font-semibold text-status-warning uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="alert" size={14} />
              Diferencia detectada
            </span>
            <div className="text-2xl font-extrabold text-status-warning font-sans mt-1">
              {summary.difference < 0
                ? `-$${Math.abs(summary.difference).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                : `$${summary.difference.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}{' '}
              MXN
            </div>
            <p className="text-[11px] text-status-warning/80 mt-0.5">
              {summary.pendingReviewsCount > 0
                ? `Requiere revisión (${summary.pendingReviewsCount} casos)`
                : 'Sin diferencias pendientes'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls Toolbar — Flat */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-silver-800 pb-4">
        {/* Search */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar por graduado o concepto..."
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
              options={[
                { value: 'ALL', label: 'Todos los estados' },
                { value: 'MATCHED', label: 'Sin diferencias' },
                { value: 'REQUIRES_REVIEW', label: 'Revisión necesaria' },
                { value: 'PENDING_CONFIRMATION', label: 'Pendiente de confirmación' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReconciliationStatus | 'ALL')}
              aria-label="Filtrar por estado de conciliación"
            />
          </div>

          <div className="w-44 shrink-0">
            <Select
              options={[
                { value: 'ALL', label: 'Todos los proveedores' },
                { value: 'MERCADO_PAGO', label: 'Mercado Pago' },
                { value: 'OPENPAY', label: 'OpenPay' },
                { value: 'MANUAL', label: 'Manual' },
              ]}
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as GatewayProviderFilter)}
              aria-label="Filtrar por proveedor pasarela"
            />
          </div>
        </div>
      </div>

      {/* Reconciliation Table */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon="search"
          title="No se encontraron registros de conciliación"
          description="No hay transacciones registradas para este evento o filtro seleccionado."
          actionLabel="Restablecer filtros"
          onAction={() => {
            setSearch('');
            setProviderFilter('ALL');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="whitespace-nowrap">Graduado</TableHeader>
                <TableHeader className="whitespace-nowrap text-right">Plan (Esperado)</TableHeader>
                <TableHeader className="whitespace-nowrap text-right">Registrado</TableHeader>
                <TableHeader className="whitespace-nowrap">Confirmado (Canal)</TableHeader>
                <TableHeader className="whitespace-nowrap text-right">Diferencia</TableHeader>
                <TableHeader className="whitespace-nowrap text-center">Estado</TableHeader>
                <TableHeader className="whitespace-nowrap text-right">Acción</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredList.map((item) => (
                <TableRow key={item.id} className="hover:bg-obsidian-800/60 transition-colors">
                  {/* Graduate */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-obsidian-800 text-gold-400 font-bold text-xs flex items-center justify-center shrink-0 border border-silver-700/60">
                        {item.graduateName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-silver-100 truncate">{item.graduateName}</span>
                        <span className="text-[11px] text-silver-400 truncate">{item.concept}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Plan Esperado */}
                  <TableCell className="text-right font-bold font-sans text-silver-100">
                    ${item.expectedAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>

                  {/* Registrado */}
                  <TableCell className="text-right font-sans text-silver-200">
                    ${item.registeredAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>

                  {/* Confirmado Pasarela */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold font-sans text-silver-100">
                        ${item.gatewayConfirmedAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-silver-400">
                        {getProviderName(item.gatewayProvider)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Diferencia */}
                  <TableCell className="text-right font-sans">
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
        </div>
      )}
    </div>
  );
};
