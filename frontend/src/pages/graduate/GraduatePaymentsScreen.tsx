import React from 'react';
import { Card, Badge, Button, Icon } from '../../design-system';
import { currentGraduateMock, mockPaymentPlan } from '../../fixtures';

export const GraduatePaymentsScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      {/* Financial Status Banner */}
      <Card variant="gold-accent" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-content-muted">Total de tu Paquete</span>
          <Badge variant="success" dot size="sm">
            Liquidado
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-navy-900">
            ${currentGraduateMock.paidAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-content-muted">MXN</span>
        </div>
        <div className="w-full bg-surface-low rounded-full h-2 overflow-hidden">
          <div className="bg-status-success h-full rounded-full w-full transition-all" />
        </div>
        <div className="flex items-center justify-between text-xs text-content-secondary">
          <span>{currentGraduateMock.ticketCount} Boletos Confirmados</span>
          <span className="font-semibold text-status-success">Saldo Pendiente: $0.00 MXN</span>
        </div>
      </Card>

      {/* Installments History */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Desglose de Cuotas y Parcialidades
        </h3>

        {mockPaymentPlan.installments.map((inst) => {
          const isPaid = inst.status === 'PAID';

          return (
            <Card key={inst.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isPaid ? 'bg-status-success-bg text-status-success' : 'bg-surface-low text-content-muted'
                    }`}
                  >
                    #{inst.number}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-navy-900">
                      Cuota #{inst.number} — ${inst.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-content-muted">
                      {isPaid && inst.paidAt
                        ? `Pagado el ${new Date(inst.paidAt).toLocaleDateString('es-MX')}`
                        : `Fecha límite: ${new Date(inst.dueDate).toLocaleDateString('es-MX')}`}
                    </span>
                  </div>
                </div>
                <Badge variant={isPaid ? 'success' : 'warning'} size="sm">
                  {isPaid ? 'Pagado' : 'Pendiente'}
                </Badge>
              </div>

              {inst.receiptNumber && (
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-surface-low text-xs">
                  <span className="text-content-muted font-mono">{inst.receiptNumber}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Descargando comprobante ${inst.receiptNumber}`)}
                    className="text-navy-900 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Icon name="download" size={12} />
                    <span>Recibo</span>
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Payment Proofs CTA */}
      <Card className="bg-surface-lowest border border-dashed border-surface-highest p-5 flex flex-col items-center text-center gap-3">
        <Icon name="payment" size={24} className="text-navy-900" />
        <div className="flex flex-col gap-0.5">
          <h4 className="text-sm font-bold text-navy-900">¿Deseas pagar una cuota adicional?</h4>
          <p className="text-xs text-content-secondary max-w-xs">
            Puedes solicitar boletos extra para tus familiares si el aforo del salón lo permite.
          </p>
        </div>
        <Button variant="secondary" size="sm">
          Solicitar Boletos Extra
        </Button>
      </Card>
    </div>
  );
};
