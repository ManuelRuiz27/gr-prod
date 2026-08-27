import React, { useState } from 'react';
import { Card, Badge, Button, Icon, Alert } from '../../design-system';

export const AdminEventReportsScreen: React.FC = () => {
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  const reports = [
    {
      title: 'Padrón Oficial de Graduados y Grupos',
      description: 'Listado completo de graduados, lugares contratados e integrantes del grupo.',
      format: 'PDF / XLSX',
      icon: 'users' as const,
    },
    {
      title: 'Reporte Financiero y Conciliación de Pagos',
      description: 'Desglose de planes, mensualidades cubiertas, pagos pendientes y saldos por cobrar.',
      format: 'XLSX / CSV',
      icon: 'payment' as const,
    },
    {
      title: 'Distribución y Ocupación de Mesas',
      description: 'Reporte de capacidad y disponibilidad por mesa (formas ROUND y SQUARE).',
      format: 'PDF',
      icon: 'table' as const,
    },
    {
      title: 'Comanda Consolidada de Platillos',
      description: 'Totales oficiales requeridos de menú Tradicional, Vegetariano y Vegano.',
      format: 'PDF / XLSX',
      icon: 'meal' as const,
    },
    {
      title: 'Listado de Termos Conmemorativos',
      description: 'Expediente de graduados elegibles (>= 70% pago), solicitados, en producción y entregados.',
      format: 'PDF / XLSX',
      icon: 'cup' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold font-display text-navy-900">Hub de Reportes y Exportaciones</h2>
        <p className="text-xs text-content-secondary">
          Descarga los expedientes consolidados para el comité organizador y proveedores.
        </p>
      </div>

      {downloadMessage && (
        <Alert variant="success" onDismiss={() => setDownloadMessage(null)}>
          {downloadMessage}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep, idx) => (
          <Card key={idx} className="p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center shrink-0">
                <Icon name={rep.icon} size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-navy-900">{rep.title}</h3>
                  <Badge variant="outline" size="sm">{rep.format}</Badge>
                </div>
                <p className="text-xs text-content-secondary leading-relaxed">{rep.description}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-surface-low">
              <Button
                variant="secondary"
                size="sm"
                iconStart="download"
                onClick={() => setDownloadMessage(`Reporte descargado: ${rep.title}`)}
              >
                Descargar Documento
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
