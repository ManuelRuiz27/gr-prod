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
  mockPortfolioList,
  type PortfolioItemMock,
  type PortfolioFilterStatus,
} from '../../../fixtures';

export interface EventPortfolioTabProps {
  onSelectGraduatePlan: (graduateId: string) => void;
  onOpenManualPayment: (graduateId: string) => void;
}

export const EventPortfolioTab: React.FC<EventPortfolioTabProps> = ({
  onSelectGraduatePlan,
  onOpenManualPayment,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PortfolioFilterStatus>('ALL');

  const filteredList = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mockPortfolioList.filter((item) => {
      // Search
      const matchSearch =
        !query ||
        item.graduateName.toLowerCase().includes(query) ||
        item.folio.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query);

      if (!matchSearch) return false;

      // Status filter
      if (statusFilter === 'CURRENT') return item.status === 'CURRENT';
      if (statusFilter === 'UPCOMING') return item.status === 'UPCOMING';
      if (statusFilter === 'OVERDUE') return item.status === 'OVERDUE';

      return true;
    });
  }, [search, statusFilter]);

  const totalPendingInView = useMemo(() => {
    return filteredList.reduce((acc, curr) => acc + curr.pendingTotal, 0);
  }, [filteredList]);

  const getStatusBadge = (status: PortfolioItemMock['status']) => {
    switch (status) {
      case 'CURRENT':
        return <Badge variant="success" size="sm">Al día</Badge>;
      case 'UPCOMING':
        return <Badge variant="warning" size="sm">Próximo</Badge>;
      case 'OVERDUE':
        return <Badge variant="error" size="sm">Vencido</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
            Cartera de Graduados
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Seguimiento individual de planes de pago, cuotas próximas y saldos vencidos.
          </p>
        </div>
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
              Todos ({mockPortfolioList.length})
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
              placeholder="Buscar por graduado o folio..."
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
            ${totalPendingInView.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </span>
        </Card>
      </div>

      {/* Portfolio Table */}
      {filteredList.length === 0 ? (
        <EmptyState
          title="No se encontraron graduados en la cartera"
          description="No hay graduados que coincidan con la búsqueda o el filtro seleccionado."
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
                        Folio: {item.folio} • {item.ticketCount} lugares
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Next Payment Amount & Concept */}
                <TableCell>
                  {item.nextInstallment.amount > 0 ? (
                    <div className="flex flex-col">
                      <span className="font-bold text-navy-900">
                        ${item.nextInstallment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                      <span className="text-[11px] text-content-secondary">
                        {item.nextInstallment.label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-status-success font-semibold">Al corriente</span>
                  )}
                </TableCell>

                {/* Due Date */}
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Icon
                      name={item.nextInstallment.isOverdue ? 'alert' : 'calendar'}
                      size={14}
                      className={item.nextInstallment.isOverdue ? 'text-rose-600' : 'text-content-muted'}
                    />
                    <span className={item.nextInstallment.isOverdue ? 'text-rose-700 font-semibold' : 'text-content-primary'}>
                      {item.nextInstallment.dueDate}
                    </span>
                  </div>
                </TableCell>

                {/* Total Pending */}
                <TableCell className="text-right">
                  <span className="font-bold text-navy-900 text-xs">
                    ${item.pendingTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
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
