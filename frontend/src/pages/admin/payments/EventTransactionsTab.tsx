import React, { useMemo } from 'react';
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  EmptyState,
} from '../../../design-system';
import {
  mockGraduatesList,
  mockPaymentPlansMap,
  VISUAL_QA_GRADUATE_RECORDS,
  type PaymentMethod,
  type PaymentStatus,
} from '../../../fixtures';

export interface EventTransactionsTabProps {
  eventId: string;
}

interface FlattenedTransaction {
  id: string;
  graduateId: string;
  graduateName: string;
  folio: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  reference?: string;
}

const getMethodLabel = (method: PaymentMethod | string) => {
  switch (method) {
    case 'CASH':
      return 'Efectivo';
    case 'TRANSFER':
      return 'Transferencia';
    case 'MERCADO_PAGO':
      return 'Mercado Pago';
    case 'OPENPAY':
      return 'OpenPay';
    case 'DEPOSIT':
      return 'Depósito';
    default:
      return method;
  }
};

const getStatusBadge = (status: PaymentStatus) => {
  switch (status) {
    case 'CONFIRMED':
      return <Badge variant="success" size="sm">Confirmado</Badge>;
    case 'PENDING':
      return <Badge variant="warning" size="sm">Pendiente</Badge>;
    case 'REJECTED':
      return <Badge variant="error" size="sm">Rechazado</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{status}</Badge>;
  }
};

export const EventTransactionsTab: React.FC<EventTransactionsTabProps> = ({ eventId }) => {
  const eventGraduates = useMemo(
    () => mockGraduatesList.filter((g) => g.eventId === eventId),
    [eventId]
  );

  const transactions = useMemo(() => {
    const list: FlattenedTransaction[] = [];

    eventGraduates.forEach((graduate) => {
      const plan = mockPaymentPlansMap[graduate.id];
      const record = VISUAL_QA_GRADUATE_RECORDS[graduate.id];
      const folio = record?.folio || '—';

      if (plan?.transactions && plan.transactions.length > 0) {
        plan.transactions.forEach((tx) => {
          list.push({
            id: tx.id,
            graduateId: graduate.id,
            graduateName: graduate.fullName,
            folio,
            amount: tx.amount,
            method: tx.method,
            status: tx.status,
            paidAt: tx.paidAt,
            reference: tx.reference,
          });
        });
      }
    });

    // Ordenar cronológicamente descendente (más reciente primero)
    return list.sort((a, b) => {
      return new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime();
    });
  }, [eventGraduates]);

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="payment"
        title="Sin movimientos registrados"
        description="No hay transacciones registradas para los graduados de este evento."
      />
    );
  }

  return (
    <div className="space-y-4 font-sans animate-fadeIn">
      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader className="whitespace-nowrap">Fecha</TableHeader>
              <TableHeader className="whitespace-nowrap">Folio</TableHeader>
              <TableHeader className="whitespace-nowrap">Graduado</TableHeader>
              <TableHeader className="whitespace-nowrap text-right">Monto</TableHeader>
              <TableHeader className="whitespace-nowrap">Método</TableHeader>
              <TableHeader className="whitespace-nowrap">Estado</TableHeader>
              <TableHeader className="whitespace-nowrap">Referencia</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-xs text-silver-300 whitespace-nowrap">
                  {tx.paidAt}
                </TableCell>
                <TableCell className="font-mono text-xs text-silver-200">
                  {tx.folio}
                </TableCell>
                <TableCell className="font-semibold text-silver-100">
                  {tx.graduateName}
                </TableCell>
                <TableCell className="font-sans font-bold text-xs text-right text-status-success">
                  +${tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-xs text-silver-300">
                  {getMethodLabel(tx.method)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(tx.status)}
                </TableCell>
                <TableCell className="font-mono text-xs text-silver-400">
                  {tx.reference || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Dense List (< 768px) */}
      <div className="md:hidden divide-y divide-silver-800/60 bg-obsidian-900/60 rounded-xl border border-silver-800/80">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex flex-col min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-gold-400 font-semibold">{tx.folio}</span>
                <span className="font-semibold text-silver-100 truncate">{tx.graduateName}</span>
              </div>
              <span className="text-[11px] text-silver-400">
                {tx.paidAt} · {getMethodLabel(tx.method)}
                {tx.reference ? ` · Ref: ${tx.reference}` : ''}
              </span>
            </div>

            <div className="flex flex-col items-end shrink-0 gap-1">
              <span className="font-bold text-status-success font-sans">
                +${tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
              </span>
              {getStatusBadge(tx.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
