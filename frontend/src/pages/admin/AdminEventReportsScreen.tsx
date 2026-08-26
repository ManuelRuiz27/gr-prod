import React from 'react';
import { Card, Badge, Button, Icon } from '../../design-system';


export const AdminEventReportsScreen: React.FC = () => {
  const reports = [
    {
      title: 'Padrón Oficial de Asistencia y Accesos',
      description: 'Listado completo de graduados, boletos asignados e identificación de acompañantes.',
      format: 'PDF / XLSX',
      icon: 'users' as const,
    },
    {
      title: 'Reporte Financiero y Conciliación Contable',
      description: 'Desglose de pagos completados, pagos parciales, adeudos y números de recibo emitidos.',
      format: 'XLSX / CSV',
      icon: 'payment' as const,
    },
    {
      title: 'Plano de Asignación de Mesas y Croquis',
      description: 'Mapa de distribución de salón con ocupación detallada por mesa y zona.',
      format: 'PDF',
      icon: 'table' as const,
    },
    {
      title: 'Comanda Consolidada de Banquetes',
      description: 'Total de tiempos de menú de adultos, niños y requerimientos dietéticos especiales.',
      format: 'PDF / XLSX',
      icon: 'meal' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold font-display text-navy-900">Hub de Reportes y Exportaciones</h2>
        <p className="text-xs text-content-secondary">
          Descarga en tiempo real los expedientes consolidados para el comité organizador y proveedores.
        </p>
      </div>

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
              <Button variant="secondary" size="sm" iconStart="download" onClick={() => alert(`Generando reporte: ${rep.title}`)}>
                Descargar Documento
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
