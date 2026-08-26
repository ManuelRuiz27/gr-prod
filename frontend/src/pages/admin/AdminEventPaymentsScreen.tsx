import React from 'react';
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
} from '../../design-system';

import { mockGraduatesList } from '../../fixtures';

export const AdminEventPaymentsScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900">Conciliación de Pagos</h2>
          <p className="text-xs text-content-secondary">
            Registro de transacciones, parcialidades y validación de comprobantes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="gold" size="sm" iconStart="download" onClick={() => alert('Exportando layout financiero')}>
            Exportar Conciliación
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Total Esperado</span>
          <p className="text-xl font-bold text-navy-900 mt-1">$157,250.00 MXN</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Total Cobrado</span>
          <p className="text-xl font-bold text-status-success mt-1">$125,800.00 MXN</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Saldo Pendiente</span>
          <p className="text-xl font-bold text-status-warning mt-1">$31,450.00 MXN</p>
        </Card>
      </div>

      {/* Reconciliation Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Graduado</TableHeader>
            <TableHeader>Total Paquete</TableHeader>
            <TableHeader>Pagado</TableHeader>
            <TableHeader>Saldo</TableHeader>
            <TableHeader>Estatus</TableHeader>
            <TableHeader className="text-right">Acción</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockGraduatesList.map((grad) => {
            const balance = grad.totalAmount - grad.paidAmount;

            return (
              <TableRow key={grad.id}>
                <TableCell className="font-semibold text-navy-900">{grad.fullName}</TableCell>
                <TableCell>${grad.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-status-success font-semibold">
                  ${grad.paidAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className={balance > 0 ? 'text-status-warning font-semibold' : 'text-content-muted'}>
                  ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      grad.status === 'FULLY_PAID'
                        ? 'success'
                        : grad.status === 'PARTIAL_PAYMENT'
                        ? 'warning'
                        : 'error'
                    }
                    dot
                    size="sm"
                  >
                    {grad.status === 'FULLY_PAID' ? 'Completado' : grad.status === 'PARTIAL_PAYMENT' ? 'Parcial' : 'Sin Pago'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Ver Cuotas
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
