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
        paidTotal: plan?.paidAmount ?? 0,
        pendingTotal: plan?.pendingAmount ?? 0,
        overdueTotal: plan?.overdueAmount ?? 0,
        status,
        nextInstallmentLabel: nextInst ? `Mensualidad ${nextInst.label}` : null,
        nextInstallmentAmount: nextInst?.amount ?? null,
        nextInstallmentDueDate: nextInst?.dueDate ?? '—',
      };
    });
  }, [eventId]);

  const filteredList = useMemo(() => {
    const query = search.trim().toLowerCase();
    return portfolioItems.filter((item) => {
      const matchSearch =
        !query ||
        item.graduateName.toLowerCase().includes(query) ||
        item.folio.toLowerCase().includes(query);

      if (!matchSearch) return false;

      if (statusFilter === 'CURRENT') return item.status === 'CURRENT';
      if (statusFilter === 'UPCOMING') return item.status === 'UPCOMING';
      if (statusFilter === 'OVERDUE') return item.status === 'OVERDUE';

      return true;
    });
  }, [portfolioItems, search, statusFilter]);

  const getStatusBadge = (status: 'CURRENT' | 'UPCOMING' | 'OVERDUE' | 'NO_PLAN') => {
    switch (status) {
      case 'CURRENT':
        return <Badge variant="success" size="sm">Al día</Badge>;
      case 'UPCOMING':
        return <Badge variant="warning" size="sm">Próximo</Badge>;
      case 'OVERDUE':
        return <Badge variant="error" size="sm" dot>Vencido</Badge>;
      case 'NO_PLAN':
        return <Badge variant="neutral" size="sm">Sin plan</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fadeIn font-sans">
      {/* Filter Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-silver-800/60 pb-4">
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
            variant={statusFilter === 'OVERDUE' ? 'primary' : 'secondary'}
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

      {/* Portfolio Content */}
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
        <>
          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader className="whitespace-nowrap">Folio</TableHeader>
                  <TableHeader className="whitespace-nowrap">Graduado</TableHeader>
                  <TableHeader className="whitespace-nowrap text-right">Abonado</TableHeader>
                  <TableHeader className="whitespace-nowrap text-right">Saldo</TableHeader>
                  <TableHeader className="whitespace-nowrap text-right">Próximo mínimo</TableHeader>
                  <TableHeader className="whitespace-nowrap">Fecha</TableHeader>
                  <TableHeader className="whitespace-nowrap text-center">Estado</TableHeader>
                  <TableHeader className="whitespace-nowrap text-right">Acción</TableHeader>
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

                    {/* Graduado */}
                    <TableCell className="font-semibold text-silver-100">
                      {item.graduateName}
                    </TableCell>

                    {/* Abonado */}
                    <TableCell className="font-sans text-xs text-right text-silver-300">
                      ${item.paidTotal.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                    </TableCell>

                    {/* Saldo */}
                    <TableCell className="font-sans text-xs text-right font-bold text-silver-50">
                      ${item.pendingTotal.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                    </TableCell>

                    {/* Próximo mínimo */}
                    <TableCell className="font-sans text-xs text-right text-silver-200">
                      {item.nextInstallmentAmount !== null
                        ? `$${item.nextInstallmentAmount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`
                        : '—'}
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="text-xs text-silver-400 whitespace-nowrap">
                      {item.nextInstallmentDueDate}
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="text-center">
                      {getStatusBadge(item.status)}
                    </TableCell>

                    {/* Acción secundaria Abonar */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenManualPayment(item.graduateId)}
                      >
                        Abonar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Dense List (< 768px) */}
          <div className="md:hidden divide-y divide-silver-800/60 bg-obsidian-900/60 rounded-xl border border-silver-800/80">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectGraduatePlan(item.graduateId)}
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-obsidian-800/50 transition-colors"
              >
                <div className="flex flex-col min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gold-400 font-semibold">{item.folio}</span>
                    <span className="font-bold text-silver-100 truncate text-sm">{item.graduateName}</span>
                  </div>
                  <div className="text-xs text-silver-400">
                    Abonado ${item.paidTotal.toLocaleString('es-MX', { minimumFractionDigits: 0 })} · Saldo ${item.pendingTotal.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                  </div>
                  {item.nextInstallmentAmount !== null && (
                    <div className="text-[11px] text-silver-400">
                      Mín: ${item.nextInstallmentAmount.toLocaleString('es-MX', { minimumFractionDigits: 0 })} ({item.nextInstallmentDueDate})
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {getStatusBadge(item.status)}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => onOpenManualPayment(item.graduateId)}
                  >
                    Abonar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
