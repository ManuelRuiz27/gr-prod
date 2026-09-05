import React, { useState, useMemo } from 'react';
import {
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
  VISUAL_QA_GRADUATE_RECORDS,
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

      const visualRecord = VISUAL_QA_GRADUATE_RECORDS[g.id];
      const folio = visualRecord?.folio || '—';

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
        folio,
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
        item.email.toLowerCase().includes(query) ||
        item.folio.toLowerCase().includes(query);

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
    <div className="flex flex-col gap-6 animate-fadeIn font-sans">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-silver-50 tracking-tight">
          Cartera de Graduados
        </h2>
        <p className="text-xs text-silver-400 mt-0.5">
          Seguimiento de planes de pago y cuotas del evento.
        </p>
      </div>

      {/* Filter Toolbar & Summary — Flat */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-silver-800 pb-4">
        {/* Filter Pills + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={statusFilter === 'ALL' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('ALL')}
            >
              Todos ({portfolioItems.length})
            </Button>
            <Button
              variant={statusFilter === 'CURRENT' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('CURRENT')}
            >
              Al día
            </Button>
            <Button
              variant={statusFilter === 'UPCOMING' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('UPCOMING')}
            >
              Próximos
            </Button>
            <Button
              variant={statusFilter === 'OVERDUE' ? 'danger' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('OVERDUE')}
            >
              Vencidos
            </Button>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64">
            <Input
              placeholder="Buscar por graduado o folio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconStart="search"
              aria-label="Buscar graduados en cartera"
            />
          </div>
        </div>

        {/* Mini Stat */}
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="text-xs text-silver-400">Total pendiente en vista:</span>
          <span className="text-lg font-extrabold text-silver-50 font-sans">
            {totalPendingInView > 0
              ? `$${totalPendingInView.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
              : '$0.00 MXN'}
          </span>
        </div>
      </div>

      {/* Portfolio Table */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon="search"
          title="No se encontraron graduados en la cartera"
          description="No hay graduados que coincidan con la búsqueda o el filtro seleccionado en este evento."
          actionLabel="Ver todos los graduados"
          onAction={() => {
            setSearch('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="whitespace-nowrap">Folio</TableHeader>
                <TableHeader className="whitespace-nowrap">Graduado</TableHeader>
                <TableHeader className="whitespace-nowrap">Próximo Pago</TableHeader>
                <TableHeader className="whitespace-nowrap">Fecha Límite</TableHeader>
                <TableHeader className="whitespace-nowrap text-right">Pendiente Total</TableHeader>
                <TableHeader className="whitespace-nowrap text-center">Estado</TableHeader>
                <TableHeader className="whitespace-nowrap text-right">Acciones</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredList.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-obsidian-800/60 cursor-pointer transition-colors"
                  onClick={() => onSelectGraduatePlan(item.graduateId)}
                >
                  {/* Folio */}
                  <TableCell className="font-mono text-xs text-silver-300">
                    {item.folio}
                  </TableCell>

                  {/* Graduate Info */}
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
                        <span className="text-[11px] text-silver-400 truncate">
                          {item.ticketCount} lugares
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Next Payment Amount & Concept */}
                  <TableCell>
                    {item.nextInstallmentAmount !== null ? (
                      <div className="flex flex-col">
                        <span className="font-bold font-sans text-silver-100">
                          ${item.nextInstallmentAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                        <span className="text-[11px] text-silver-400">
                          {item.nextInstallmentLabel}
                        </span>
                      </div>
                    ) : item.hasPlan ? (
                      <span className="text-xs text-status-success font-semibold">Al corriente</span>
                    ) : (
                      <span className="text-xs text-silver-400">—</span>
                    )}
                  </TableCell>

                  {/* Due Date */}
                  <TableCell>
                    {item.nextInstallmentDueDate ? (
                      <div className="flex items-center gap-1.5 text-xs text-silver-300">
                        <Icon
                          name={item.nextInstallmentIsOverdue ? 'alert' : 'calendar'}
                          size={14}
                          className={item.nextInstallmentIsOverdue ? 'text-status-error' : 'text-gold-400'}
                        />
                        <span className={item.nextInstallmentIsOverdue ? 'text-status-error font-semibold' : 'text-silver-300'}>
                          {item.nextInstallmentDueDate}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-silver-400">—</span>
                    )}
                  </TableCell>

                  {/* Total Pending */}
                  <TableCell className="text-right">
                    {item.hasPlan ? (
                      <span className="font-bold font-sans text-silver-100 text-xs">
                        ${item.pendingTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    ) : (
                      <span className="text-xs text-silver-400">—</span>
                    )}
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="text-center">
                    {getStatusBadge(item.status)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
        </div>
      )}
    </div>
  );
};
