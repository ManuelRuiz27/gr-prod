import React, { useState } from 'react';
import { Card, Badge, Button, Table, TableHead, TableHeader, TableBody, TableRow, TableCell, Modal } from '../../design-system';

import { mockGraduatesList, type ThermoStatus } from '../../fixtures';

export const AdminEventThermosScreen: React.FC = () => {
  const [thermoData, setThermoData] = useState(
    mockGraduatesList.map((g) => ({
      graduateId: g.id,
      graduateName: g.fullName,
      customName: g.thermoCustomName || g.fullName,
      status: g.thermoStatus,
    }))
  );
  const [selectedGrad, setSelectedGrad] = useState<{ graduateId: string; graduateName: string; customName: string; status: ThermoStatus } | null>(null);

  const handleStatusChange = (newStatus: ThermoStatus) => {
    if (!selectedGrad) return;
    setThermoData((prev) =>
      prev.map((item) => (item.graduateId === selectedGrad.graduateId ? { ...item, status: newStatus } : item))
    );
    setSelectedGrad(null);
  };

  const countLocked = thermoData.filter((t) => t.status === 'LOCKED').length;
  const countAvailable = thermoData.filter((t) => t.status === 'AVAILABLE').length;
  const countRequested = thermoData.filter((t) => t.status === 'REQUESTED').length;
  const countInProduction = thermoData.filter((t) => t.status === 'IN_PRODUCTION').length;
  const countDelivered = thermoData.filter((t) => t.status === 'DELIVERED').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900">Control de Termos Conmemorativos</h2>
          <p className="text-xs text-content-secondary">
            Administración de elegibilidad (umbral 70%), solicitudes, producción y entrega.
          </p>
        </div>
      </div>

      {/* Summary Cards by Valid Statuses */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-3 text-center">
          <span className="text-[11px] text-content-muted block">LOCKED</span>
          <span className="text-lg font-bold text-navy-900">{countLocked}</span>
          <span className="text-[10px] text-content-muted block">&lt; 70% pago</span>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-[11px] text-content-muted block">AVAILABLE</span>
          <span className="text-lg font-bold text-gold-600">{countAvailable}</span>
          <span className="text-[10px] text-content-muted block">&ge; 70% pago</span>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-[11px] text-content-muted block">REQUESTED</span>
          <span className="text-lg font-bold text-navy-900">{countRequested}</span>
          <span className="text-[10px] text-content-muted block">Por enviar</span>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-[11px] text-content-muted block">IN_PRODUCTION</span>
          <span className="text-lg font-bold text-status-warning">{countInProduction}</span>
          <span className="text-[10px] text-content-muted block">En taller</span>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-[11px] text-content-muted block">DELIVERED</span>
          <span className="text-lg font-bold text-status-success">{countDelivered}</span>
          <span className="text-[10px] text-content-muted block">Entregados</span>
        </Card>
      </div>

      {/* Table of Thermos */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Graduado</TableHeader>
            <TableHeader>Nombre en Termo</TableHeader>
            <TableHeader>Estado Normativo</TableHeader>
            <TableHeader className="text-right">Acción</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {thermoData.map((item) => (
            <TableRow key={item.graduateId}>
              <TableCell className="font-semibold text-navy-900">{item.graduateName}</TableCell>
              <TableCell className="text-xs">{item.customName}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.status === 'DELIVERED'
                      ? 'success'
                      : item.status === 'IN_PRODUCTION'
                      ? 'warning'
                      : item.status === 'REQUESTED'
                      ? 'primary'
                      : item.status === 'AVAILABLE'
                      ? 'gold'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => setSelectedGrad(item)}>
                  Cambiar Estado
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Status Transition Modal */}
      {selectedGrad && (
        <Modal
          isOpen={Boolean(selectedGrad)}
          onClose={() => setSelectedGrad(null)}
          title={`Gestionar Termo — ${selectedGrad.graduateName}`}
          description="Transición de estado operativo del termo"
        >
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-surface-low rounded-xl text-xs flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-content-muted">Graduado:</span>
                <span className="font-bold text-navy-900">{selectedGrad.graduateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Nombre en Termo:</span>
                <span className="font-bold text-navy-900">{selectedGrad.customName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Estado Actual:</span>
                <Badge variant="primary" size="sm">{selectedGrad.status}</Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-navy-900">Seleccionar Nuevo Estado</span>
              <div className="grid grid-cols-2 gap-2">
                {(['LOCKED', 'AVAILABLE', 'REQUESTED', 'IN_PRODUCTION', 'DELIVERED'] as ThermoStatus[]).map((st) => (
                  <Button
                    key={st}
                    variant={selectedGrad.status === st ? 'gold' : 'secondary'}
                    size="sm"
                    onClick={() => handleStatusChange(st)}
                  >
                    {st}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-surface-low">
              <Button variant="secondary" size="sm" onClick={() => setSelectedGrad(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
