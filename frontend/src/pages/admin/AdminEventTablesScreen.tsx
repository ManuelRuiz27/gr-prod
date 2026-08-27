import React, { useState } from 'react';
import { Card, Badge, Button, Modal } from '../../design-system';
import { mockTables, type TableMock } from '../../fixtures';

export const AdminEventTablesScreen: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<TableMock | null>(null);

  const totalCapacity = mockTables.reduce((acc, t) => acc + t.capacity, 0);
  const totalOccupied = mockTables.reduce((acc, t) => acc + t.occupied, 0);
  const totalAvailable = totalCapacity - totalOccupied;

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900">Control de Mesas y Ocupación</h2>
          <p className="text-xs text-content-secondary">
            Administración de capacidad, asignación de grupos y disponibilidad por mesa.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Aforo de Mesas</span>
          <p className="text-xl font-bold text-navy-900 mt-1">{totalCapacity} Lugares Totales</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Lugares Ocupados</span>
          <p className="text-xl font-bold text-status-success mt-1">{totalOccupied} Lugares ({Math.round((totalOccupied / totalCapacity) * 100)}%)</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Lugares Disponibles</span>
          <p className="text-xl font-bold text-gold-600 mt-1">{totalAvailable} Lugares Libres</p>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTables.map((table) => {
          const isFull = table.available === 0;

          return (
            <Card
              key={table.id}
              variant="interactive"
              onClick={() => setSelectedTable(table)}
              className="p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-navy-900 font-display">
                  Mesa {table.number}
                </span>
                <Badge variant={table.shape === 'SQUARE' ? 'primary' : 'neutral'} size="sm">
                  {table.shape === 'SQUARE' ? 'Cuadrada' : 'Circular'}
                </Badge>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-content-secondary">
                  <span>Capacidad:</span>
                  <strong className="text-navy-900">{table.capacity} lugares</strong>
                </div>
                <div className="flex justify-between text-xs text-content-secondary">
                  <span>Ocupados:</span>
                  <strong className="text-navy-900">{table.occupied} lugares</strong>
                </div>
                <div className="flex justify-between text-xs text-content-secondary">
                  <span>Disponibles:</span>
                  <strong className={table.available > 0 ? 'text-status-success' : 'text-content-muted'}>
                    {table.available} lugares
                  </strong>
                </div>

                <div className="w-full bg-surface-low rounded-full h-2 overflow-hidden mt-1">
                  <div
                    style={{ width: `${(table.occupied / table.capacity) * 100}%` }}
                    className={`h-full rounded-full ${isFull ? 'bg-navy-900' : 'bg-gold-400'}`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-surface-low text-xs">
                <Badge variant={isFull ? 'neutral' : 'success'} size="sm">
                  {isFull ? 'Completa' : `${table.available} libres`}
                </Badge>
                <span className="text-navy-900 font-semibold hover:underline">
                  Ver detalle
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Table Detail Modal */}
      {selectedTable && (
        <Modal
          isOpen={Boolean(selectedTable)}
          onClose={() => setSelectedTable(null)}
          title={`Detalle de Mesa ${selectedTable.number}`}
          description={`Forma ${selectedTable.shape === 'SQUARE' ? 'Cuadrada' : 'Circular'} — Capacidad ${selectedTable.capacity} lugares`}
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 bg-surface-low rounded-xl flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-content-muted">Forma oficial:</span>
                <span className="font-bold text-navy-900">{selectedTable.shape}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Capacidad Total:</span>
                <span className="font-bold text-navy-900">{selectedTable.capacity} lugares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Lugares Ocupados:</span>
                <span className="font-bold text-status-success">{selectedTable.occupied} lugares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Lugares Disponibles:</span>
                <span className="font-bold text-gold-600">{selectedTable.available} lugares</span>
              </div>
            </div>

            <p className="text-xs text-content-secondary leading-relaxed">
              La asignación se gestiona a nivel mesa. No existen números de asiento individuales ni zonas comerciales en la sala.
            </p>

            <div className="flex justify-end pt-2 border-t border-surface-low">
              <Button variant="primary" size="sm" onClick={() => setSelectedTable(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
