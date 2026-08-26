import React from 'react';
import { Card, Badge, Button } from '../../design-system';

import { mockTables } from '../../fixtures';

export const AdminEventTablesScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900">Croquis y Distribución de Mesas</h2>
          <p className="text-xs text-content-secondary">
            Supervisión de aforo por mesa, zonas asignadas y capacidad remanente.
          </p>
        </div>
        <Button variant="primary" size="sm" iconStart="table" onClick={() => alert('Crear nueva mesa (M4)')}>
          Agregar Mesa
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockTables.map((table) => {
          const isFull = table.occupiedSeats >= table.capacity;
          const isEmpty = table.occupiedSeats === 0;

          return (
            <Card key={table.number} className="p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-navy-900">Mesa #{table.number}</span>
                <Badge variant={isFull ? 'success' : isEmpty ? 'outline' : 'warning'} size="sm">
                  {table.zone}
                </Badge>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-content-muted">Ocupación</span>
                  <span className="text-xs font-bold text-navy-900">
                    {table.occupiedSeats} / {table.capacity}
                  </span>
                </div>
                <div className="w-full bg-surface-low rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${(table.occupiedSeats / table.capacity) * 100}%` }}
                    className={`h-full rounded-full transition-all ${
                      isFull ? 'bg-status-success' : 'bg-gold-400'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-surface-low text-[11px] text-content-secondary">
                {table.assignedGraduateNames.length > 0 ? (
                  <span className="truncate block font-medium">
                    {table.assignedGraduateNames.join(', ')}
                  </span>
                ) : (
                  <span className="text-content-muted italic">Mesa libre sin asignar</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
