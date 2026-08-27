import React, { useState } from 'react';
import {
  Card,
  Badge,
  Button,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Modal,
} from '../../design-system';
import { mockGraduatesList, mockPaymentPlan } from '../../fixtures';

export const AdminEventPaymentsScreen: React.FC = () => {
  const [selectedPlanModal, setSelectedPlanModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900">Conciliación de Pagos</h2>
          <p className="text-xs text-content-secondary">
            Registro de planes de pago, mensualidades y avances financieros.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="gold"
            size="sm"
            iconStart="download"
            onClick={() => setDownloadSuccess(true)}
          >
            {downloadSuccess ? 'Conciliación Generada' : 'Exportar Conciliación'}
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Total Contratado Cartera</span>
          <p className="text-xl font-bold text-navy-900 mt-1">$1,050,000.00 MXN</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Total Cobrado</span>
          <p className="text-xl font-bold text-status-success mt-1">$630,000.00 MXN</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Saldo Pendiente</span>
          <p className="text-xl font-bold text-status-warning mt-1">$420,000.00 MXN</p>
        </Card>
      </div>

      {/* Reconciliation Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Graduado</TableHeader>
            <TableHeader>Total Plan</TableHeader>
            <TableHeader>Pagado</TableHeader>
            <TableHeader>Saldo Pendiente</TableHeader>
            <TableHeader>Avance</TableHeader>
            <TableHeader className="text-right">Acción</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockGraduatesList.map((grad) => {
            const isAndrea = grad.id === 'grad-andrea-martinez';
            const total = isAndrea ? mockPaymentPlan.totalAmount : 12500;
            const paid = isAndrea ? mockPaymentPlan.paidAmount : 10000;
            const pending = total - paid;
            const progress = Math.round((paid / total) * 100);

            return (
              <TableRow key={grad.id}>
                <TableCell className="font-semibold text-navy-900">
                  <div className="flex flex-col">
                    <span>{grad.fullName}</span>
                    <span className="text-[11px] text-content-muted">{grad.email}</span>
                  </div>
                </TableCell>
                <TableCell>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-status-success font-semibold">
                  ${paid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className={pending > 0 ? 'text-status-warning font-semibold' : 'text-content-muted'}>
                  ${pending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant={progress === 100 ? 'success' : progress >= 50 ? 'warning' : 'neutral'} size="sm">
                    {progress}% ({isAndrea ? 'M1-M3' : 'Al corriente'})
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPlanModal(true)}>
                    Ver Cuotas
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Installments Modal */}
      {selectedPlanModal && (
        <Modal
          isOpen={selectedPlanModal}
          onClose={() => setSelectedPlanModal(false)}
          title="Plan de Pagos — Andrea Martínez"
          description="5 Mensualidades de $2,500.00 MXN"
        >
          <div className="flex flex-col gap-3">
            {mockPaymentPlan.installments.map((inst) => (
              <div
                key={inst.id}
                className="p-3 bg-surface-low rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-navy-900">Mensualidad {inst.label} — ${inst.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  <span className="text-content-muted text-[11px]">
                    {inst.status === 'PAID' ? `Pagada el ${inst.paidAt}` : `Vencimiento: ${inst.dueDate}`}
                  </span>
                </div>
                <Badge variant={inst.status === 'PAID' ? 'success' : 'warning'} size="sm">
                  {inst.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                </Badge>
              </div>
            ))}

            <div className="flex justify-end pt-3 border-t border-surface-low">
              <Button variant="primary" size="sm" onClick={() => setSelectedPlanModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
