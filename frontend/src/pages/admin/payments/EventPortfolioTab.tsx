import React, { useState, useMemo } from 'react';
import {
  Card,
  Input,
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
  type PortfolioFilterStatus,
} from '../../../fixtures';

export interface EventPortfolioTabProps {
  eventId: string;
  onSelectGraduatePlan: (graduateId: string) => void;
  onOpenManualPayment: (graduateId: string) => void;
}

export const EventPortfolioTab: React.FC<EventPortfolioTabProps> = ({
  eventId,
  onSelectGraduatePlan,
  onOpenManualPayment,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PortfolioFilterStatus>('ALL');

  // Strictly filter graduates by eventId
  const portfolioItems = useMemo(() => {
    const graduates = mockGraduatesList.filter((g) => g.eventId === eventId);

    return graduates.map((g) => {
      const plan =
        mockPaymentPlansMap[g.id]?.eventId === eventId
          ? mockPaymentPlansMap[g.id]
          : null;

      const nextInst = plan?.installments.find((i) => i.status !== 'PAID');
      const isOverdue = plan?.overdueAmount && plan.overdueAmount > 0;
      const isCurrent = plan && plan.pendingAmount === 0;

      const status: 'CURRENT' | 'UPCOMING' | 'OVERDUE' | 'NO_PLAN' = isOverdue
        ? 'OVERDUE'
        : isCurrent
        ? 'CURRENT'
        : plan
        ? 'UPCOMING'
        : 'NO_PLAN';

      return {
        id: `port-${g.id}`,
        graduateId: g.id,
        graduateName: g.fullName,
        email: g.email,
        career: g.career,
        ticketCount: g.ticketCount,
        hasPlan: !!plan,
        totalAmount: plan?.totalAmount ?? null,
        paidTotal: plan?.paidAmount ?? null,
        pendingTotal: plan?.pendingAmount ?? 0,
        overdueTotal: plan?.overdueAmount ?? 0,
        status,
        nextInstallmentLabel: nextInst ? `Mensualidad ${nextInst.label}` : null,
        nextInstallmentAmount: nextInst?.amount ?? null,
        nextInstallmentDueDate: nextInst?.dueDate ?? null,
        nextInstallmentIsOverdue: nextInst?.status === 'OVERDUE',
      };
    });
  }, [eventId]);

  const filteredList = useMemo(() => {
    const query = search.trim().toLowerCase();
    return portfolioItems.filter((item) => {
      // Search
      const matchSearch =
        !query ||
        item.graduateName.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query);

      if (!matchSearch) return false;

      // Status filter
      if (statusFilter === 'CURRENT') return item.status === 'CURRENT';
      if (statusFilter === 'UPCOMING') return item.status === 'UPCOMING';
      if (statusFilter === 'OVERDUE') return item.status === 'OVERDUE';

      return true;
    });
  }, [portfolioItems, search, statusFilter]);

  const totalPendingInView = useMemo(() => {
    return filteredList.reduce((acc, curr) => acc + curr.pendingTotal, 0);
  }, [filteredList]);

  const getStatusBadge = (status: 'CURRENT' | 'UPCOMING' | 'OVERDUE' | 'NO_PLAN') => {
    switch (status) {
      case 'CURRENT':
        return <Badge variant="success" size="sm">Al día</Badge>;
      case 'UPCOMING':
        return <Badge variant="warning" size="sm">Próximo</Badge>;
      case 'OVERDUE':
        return <Badge variant="error" size="sm">Vencido</Badge>;
      case 'NO_PLAN':
        return <Badge variant="neutral" size="sm">Sin plan</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
          Cartera de Graduados
        </h2>
        <p className="text-xs text-content-secondary mt-0.5">
          Seguimiento de planes de pago y cuotas del evento.
        </p>
      </div>

      {/* Filter Toolbar & Summary Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filter Pills + Search */}
        <Card className="p-3 lg:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`
                px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                ${
                  statusFilter === 'ALL'
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'text-content-secondary hover:bg-surface-low'
                }
              `}
            >
              Todos ({portfolioItems.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('CURRENT')}
              className={`
                px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                ${
                  statusFilter === 'CURRENT'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-content-secondary hover:bg-surface-low'
                }
              `}
            >
              Al día
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('UPCOMING')}
              className={`
                px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                ${
                  statusFilter === 'UPCOMING'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-content-secondary hover:bg-surface-low'
                }
              `}
            >
              Próximos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('OVERDUE')}
              className={`
                px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                ${
                  statusFilter === 'OVERDUE'
                    ? 'bg-rose-700 text-white shadow-sm'
                    : 'text-content-secondary hover:bg-surface-low'
                }
              `}
            >
              Vencidos
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64">
            <Input
              placeholder="Buscar por graduado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconStart="search"
              aria-label="Buscar graduados en cartera"
            />
          </div>
        </Card>

        {/* Mini Stat Card */}
        <Card className="p-4 flex flex-col justify-center bg-surface-low border border-surface-high">
          <span className="text-[11px] font-bold text-content-secondary uppercase tracking-wider">
            Total Pendiente en Vista
          </span>
          <span className="text-xl font-extrabold text-navy-900 font-display mt-0.5">
            {totalPendingInView > 0
              ? `$${totalPendingInView.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
              : '$0.00 MXN'}
          </span>
        </Card>
      </div>

      {/* Portfolio Table */}
      {filteredList.length === 0 ? (
        <EmptyState
          title="No se encontraron graduados en la cartera"
          description="No hay graduados que coincidan con la búsqueda o el filtro seleccionado en este evento."
          actionLabel="Ver todos los graduados"
          onAction={() => {
            setSearch('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Graduado</TableHeader>
              <TableHeader>Próximo Pago</TableHeader>
              <TableHeader>Fecha Límite</TableHeader>
              <TableHeader className="text-right">Pendiente Total</TableHeader>
              <TableHeader className="text-center">Estado</TableHeader>
              <TableHeader className="text-right">Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredList.map((item) => (
              <TableRow key={item.id}>
                {/* Graduate Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {item.graduateName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-navy-900">{item.graduateName}</span>
                      <span className="text-[11px] text-content-muted">
                        {item.ticketCount} lugares
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Next Payment Amount & Concept */}
                <TableCell>
                  {item.nextInstallmentAmount !== null ? (
                    <div className="flex flex-col">
                      <span className="font-bold text-navy-900">
                        ${item.nextInstallmentAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                      <span className="text-[11px] text-content-secondary">
                        {item.nextInstallmentLabel}
                      </span>
                    </div>
                  ) : item.hasPlan ? (
                    <span className="text-xs text-status-success font-semibold">Al corriente</span>
                  ) : (
                    <span className="text-xs text-content-muted">—</span>
                  )}
                </TableCell>

                {/* Due Date */}
                <TableCell>
                  {item.nextInstallmentDueDate ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Icon
                        name={item.nextInstallmentIsOverdue ? 'alert' : 'calendar'}
                        size={14}
                        className={item.nextInstallmentIsOverdue ? 'text-rose-600' : 'text-content-muted'}
                      />
                      <span className={item.nextInstallmentIsOverdue ? 'text-rose-700 font-semibold' : 'text-content-primary'}>
                        {item.nextInstallmentDueDate}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-content-muted">—</span>
                  )}
                </TableCell>

                {/* Total Pending */}
                <TableCell className="text-right">
                  {item.hasPlan ? (
                    <span className="font-bold text-navy-900 text-xs">
                      ${item.pendingTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  ) : (
                    <span className="text-xs text-content-muted">—</span>
                  )}
                </TableCell>

                {/* Status Badge */}
                <TableCell className="text-center">
                  {getStatusBadge(item.status)}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectGraduatePlan(item.graduateId)}
                    >
                      Ver plan
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      iconStart="plus"
                      onClick={() => onOpenManualPayment(item.graduateId)}
                    >
                      Abonar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
