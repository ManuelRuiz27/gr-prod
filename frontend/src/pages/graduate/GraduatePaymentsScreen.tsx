import React, { useState } from 'react';
import { Card, Badge, Button, Icon, Modal } from '../../design-system';
import { mockPaymentPlan, type InstallmentMock } from '../../fixtures';

export const GraduatePaymentsScreen: React.FC = () => {
  const [selectedReceipt, setSelectedReceipt] = useState<InstallmentMock | null>(null);

  return (
    <div className="flex flex-col gap-5">
      {/* Financial Status Banner */}
      <Card variant="gold-accent" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-content-muted">Total Contratado</span>
          <Badge variant="warning" dot size="sm">
            {mockPaymentPlan.progressPercentage}% Cubierto
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-navy-900">
            ${mockPaymentPlan.paidAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-content-muted">
            de ${mockPaymentPlan.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </span>
        </div>
        <div className="w-full bg-surface-low rounded-full h-2 overflow-hidden">
          <div
            style={{ width: `${mockPaymentPlan.progressPercentage}%` }}
            className="bg-gold-400 h-full rounded-full transition-all"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-content-secondary">
          <span>Saldo Pendiente: <strong>${mockPaymentPlan.pendingAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong></span>
          <span>Próximo pago: <strong>{mockPaymentPlan.nextPaymentDueDate}</strong></span>
        </div>
      </Card>

      {/* Next Payment Alert */}
      <Card className="bg-surface-low border border-navy-200 p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-content-muted">Próxima Mensualidad</span>
          <span className="text-base font-bold text-navy-900">
            ${mockPaymentPlan.nextPaymentAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </span>
          <span className="text-[11px] text-content-secondary">Vence el {mockPaymentPlan.nextPaymentDueDate}</span>
        </div>
        <Badge variant="primary" size="sm">
          M4 por vencer
        </Badge>
      </Card>

      {/* Installments Breakdown */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Mensualidades del Plan (5 Cuotas de $2,500)
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
                    {inst.label}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-navy-900">
                      Mensualidad {inst.label} — ${inst.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                    <span className="text-[11px] text-content-muted">
                      {isPaid && inst.paidAt
                        ? `Cubierto el ${inst.paidAt}`
                        : `Vencimiento: ${inst.dueDate}`}
                    </span>
                  </div>
                </div>
                <Badge variant={isPaid ? 'success' : 'warning'} size="sm">
                  {isPaid ? 'Pagado' : 'Pendiente'}
                </Badge>
              </div>

              {isPaid && (
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-surface-low text-xs">
                  <span className="text-content-muted font-mono">Comprobante registrado</span>
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(inst)}
                    className="text-navy-900 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Icon name="download" size={12} />
                    <span>Ver detalle</span>
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title={`Detalle de Pago — Mensualidad ${selectedReceipt.label}`}
          description="Comprobante de aplicación financiera"
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-surface-low rounded-xl flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-content-muted">Monto Aplicado:</span>
                <span className="font-bold text-navy-900">${selectedReceipt.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Fecha de Pago:</span>
                <span className="font-medium text-navy-900">{selectedReceipt.paidAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Estado:</span>
                <Badge variant="success" size="sm">Aplicado</Badge>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedReceipt(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
