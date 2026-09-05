import React, { useState } from 'react';
import {
  Badge,
  Button,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Icon,
} from '../../../design-system';
import {
  type PaymentPlanMock,
  type InstallmentMock,
  type EventMock,
  type GraduateMock,
} from '../../../fixtures';

export interface GraduatePaymentPlanViewProps {
  event: EventMock;
  graduate: GraduateMock;
  plan: PaymentPlanMock;
  onBackToPortfolio: () => void;
  onOpenManualPayment: (installmentId?: string) => void;
  onOpenAdjustmentRefund: () => void;
}

export const GraduatePaymentPlanView: React.FC<GraduatePaymentPlanViewProps> = ({
  event,
  graduate,
  plan,
  onBackToPortfolio,
  onOpenManualPayment,
  onOpenAdjustmentRefund,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const getInstallmentBadge = (status: InstallmentMock['status']) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success" size="sm">Pagado</Badge>;
      case 'UPCOMING':
        return <Badge variant="warning" size="sm">Próximo</Badge>;
      case 'DUE':
        return <Badge variant="warning" size="sm">Por vencer</Badge>;
      case 'OVERDUE':
        return <Badge variant="error" size="sm">Vencido</Badge>;
      case 'FUTURE':
        return <Badge variant="neutral" size="sm">Futuro</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral" size="sm">Cancelado</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
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

  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-sans">
      {/* Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onBackToPortfolio}
            className="flex items-center gap-1.5 text-xs font-semibold text-silver-400 hover:text-silver-100 transition-colors self-start mb-1"
          >
            <Icon name="chevron-left" size={16} />
            <span>Volver a Cartera</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
              Pagos de {graduate.fullName}
            </h1>
            {plan.isFrozen && (
              <Badge variant="neutral" size="sm">
                Plan congelado
              </Badge>
            )}
          </div>
          <p className="text-xs text-silver-400">
            {event.name} • {graduate.career} • {graduate.ticketCount} lugares contratados
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            iconStart="edit"
            onClick={onOpenAdjustmentRefund}
          >
            Ajuste / Reembolso
          </Button>
          <Button
            variant="primary"
            size="sm"
            iconStart="plus"
            onClick={() => onOpenManualPayment()}
          >
            Registrar pago manual
          </Button>
        </div>
      </div>

      {/* Hero Financial Summary — Flat Domain Layout */}
      <div className="py-4 border-y border-silver-800/60">
        <div className="flex flex-wrap items-baseline justify-between gap-6 sm:gap-8">
          <div>
            <span className="text-xs font-semibold text-silver-400">Total contratado</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-silver-50 font-sans mt-1">
              ${plan.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-silver-400">Pagado</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-status-success font-sans mt-1">
              ${plan.paidAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-silver-400">Saldo Pendiente</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-status-warning font-sans mt-1">
              ${plan.pendingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </p>
          </div>
          {plan.overdueAmount && plan.overdueAmount > 0 ? (
            <div>
              <span className="text-xs font-semibold text-status-error">Saldo Vencido</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-status-error font-sans mt-1">
                ${plan.overdueAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </p>
            </div>
          ) : null}
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-silver-800/40">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <span className="text-silver-400">Avance de pago: <strong className="text-silver-200 font-sans">{plan.progressPercentage}%</strong></span>
            <span className="text-silver-400">Saldo pendiente: <strong className="text-silver-200 font-sans">${plan.pendingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong></span>
          </div>
          <div className="w-full bg-obsidian-900 h-2 rounded-full overflow-hidden border border-silver-800">
            <div
              className="bg-gold-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${plan.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Installments Table (Calendario de Obligaciones) — Flat */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-silver-50">Calendario de Obligaciones</h3>
            <p className="text-xs text-silver-400">
              Cuotas programadas conforme al plan de pagos del graduado.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconStart="calendar"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Ocultar historial' : 'Ver historial'}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Concepto</TableHeader>
                <TableHeader className="text-right">Monto</TableHeader>
                <TableHeader>Vencimiento / Pago</TableHeader>
                <TableHeader className="text-center">Estado</TableHeader>
                <TableHeader className="text-right">Acción</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {plan.installments.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="font-semibold text-silver-100">
                    Mensualidad {inst.label}
                  </TableCell>
                  <TableCell className="text-right font-bold font-sans text-silver-100">
                    ${inst.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-silver-400">
                      {inst.status === 'PAID'
                        ? `Pagada el ${inst.paidAt || '—'}`
                        : `Vence el ${inst.dueDate}`}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {getInstallmentBadge(inst.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    {inst.status === 'PAID' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onOpenAdjustmentRefund}
                      >
                        Ajuste
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        iconStart="plus"
                        onClick={() => onOpenManualPayment(inst.id)}
                      >
                        Abonar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Transaction & Audit History Section — Flat */}
      {showHistory && (
        <div className="space-y-4 pt-4 border-t border-silver-800/60 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-silver-50">Historial de Transacciones y Movimientos</h3>
              <p className="text-xs text-silver-400">
                Registro cronológico inmutable de abonos confirmados, aplicaciones y ajustes auditados.
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              Auditoría financiera
            </Badge>
          </div>

          {(!plan.transactions || plan.transactions.length === 0) &&
          (!plan.adjustments || plan.adjustments.length === 0) &&
          (!plan.refunds || plan.refunds.length === 0) ? (
            <p className="text-xs text-silver-400 py-4 text-center">
              No hay movimientos registrados en el historial de este plan.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Transactions List */}
              {plan.transactions?.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 bg-obsidian-900 rounded-xl flex items-center justify-between text-xs border border-silver-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-status-success/20 text-status-success flex items-center justify-center font-bold">
                      <Icon name="check" size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-silver-100">
                        Pago Confirmado — {tx.installmentLabel || 'Cuota'}
                      </span>
                      <span className="text-[11px] text-silver-400">
                        Canal: {getPaymentMethodLabel(tx.method)} • {tx.paidAt}
                        {tx.reference ? ` • Ref: ${tx.reference}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-status-success text-sm font-sans">
                      +${tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                    <Badge variant="success" size="sm">
                      Confirmado
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Adjustments */}
              {plan.adjustments?.map((adj) => (
                <div
                  key={adj.id}
                  className="p-3.5 bg-obsidian-900 rounded-xl flex items-center justify-between text-xs border border-silver-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-status-warning/20 text-status-warning flex items-center justify-center font-bold">
                      <Icon name="edit" size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-silver-100">
                        Ajuste ({adj.type === 'CREDIT' ? 'Crédito a favor' : 'Cargo / Débito'})
                      </span>
                      <span className="text-[11px] text-silver-400">
                        Motivo: {adj.reason} • {adj.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-silver-100 text-sm font-sans">
                      {adj.type === 'CREDIT' ? '-' : '+'}${adj.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                    <Badge variant="warning" size="sm">
                      Ajuste
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Refunds */}
              {plan.refunds?.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3.5 bg-obsidian-900 rounded-xl flex items-center justify-between text-xs border border-silver-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-status-error/20 text-status-error flex items-center justify-center font-bold">
                      <Icon name="refresh" size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-status-error">
                        Reembolso ({ref.mode === 'PROVIDER' ? 'Pasarela' : 'Manual'})
                      </span>
                      <span className="text-[11px] text-silver-400">
                        Motivo: {ref.reason} • {ref.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-status-error text-sm font-sans">
                      -${ref.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                    <Badge variant="error" size="sm">
                      {ref.status === 'CONFIRMED' ? 'Confirmado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
