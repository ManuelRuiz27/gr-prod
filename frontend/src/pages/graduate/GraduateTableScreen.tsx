import React, { useState } from 'react';
import { Card, Badge, Icon } from '../../design-system';

import { currentGraduateMock, mockTables, type TableMock } from '../../fixtures';

export const GraduateTableScreen: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<TableMock>(
    mockTables.find((t) => t.number === currentGraduateMock.tableNumber) || mockTables[3]
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Table Header Card */}
      <Card variant="gold-accent" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-content-muted">Tu Mesa Asignada</span>
          <Badge variant="primary" size="sm">
            Forma: {selectedTable.shape === 'SQUARE' ? 'Cuadrada' : 'Circular'}
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-navy-900 font-display">
            Mesa {selectedTable.number}
          </span>
          <span className="text-xs text-content-secondary">
            Capacidad total: {selectedTable.capacity} lugares
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-status-success font-semibold">
          <Icon name="check" size={14} />
          <span>{currentGraduateMock.ticketCount} lugares asignados a tu grupo</span>
        </div>
      </Card>

      {/* Capacity Breakdown */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <Card className="p-3">
          <span className="text-[11px] text-content-muted block">Tu Grupo</span>
          <span className="text-base font-bold text-navy-900">{currentGraduateMock.ticketCount}</span>
        </Card>
        <Card className="p-3">
          <span className="text-[11px] text-content-muted block">Ocupación Mesa</span>
          <span className="text-base font-bold text-navy-900">{selectedTable.occupied} / {selectedTable.capacity}</span>
        </Card>
        <Card className="p-3">
          <span className="text-[11px] text-content-muted block">Disponibles</span>
          <span className="text-base font-bold text-gold-600">{selectedTable.available}</span>
        </Card>
      </div>

      {/* Visual Table Shape Representation (No seats, no individual chairs, no PII) */}
      <Card className="flex flex-col items-center justify-center p-8 gap-5 bg-surface-lowest">
        <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
          Representación de Mesa ({selectedTable.shape})
        </span>

        <div
          className={`flex flex-col items-center justify-center text-center border-4 border-navy-900 bg-surface-low transition-all ${
            selectedTable.shape === 'ROUND' ? 'w-44 h-44 rounded-full' : 'w-44 h-44 rounded-2xl'
          }`}
        >
          <span className="text-xl font-bold text-navy-900 font-display">Mesa {selectedTable.number}</span>
          <span className="text-xs text-content-secondary mt-1 font-medium">
            {selectedTable.occupied} de {selectedTable.capacity} ocupados
          </span>
          <Badge variant={selectedTable.available > 0 ? 'success' : 'neutral'} size="sm" className="mt-2">
            {selectedTable.available > 0 ? `${selectedTable.available} libres` : 'Completa'}
          </Badge>
        </div>

        <p className="text-xs text-content-muted text-center max-w-xs leading-relaxed">
          La asignación se realiza a nivel mesa según la capacidad requerida por tu grupo ({currentGraduateMock.ticketCount} lugares).
        </p>
      </Card>

      {/* Simplified Layout / Other Tables in Event */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Mesas en el Salón
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {mockTables.map((table) => {
            const isCurrent = table.number === currentGraduateMock.tableNumber;
            const hasCapacity = table.available >= currentGraduateMock.ticketCount || isCurrent;

            return (
              <Card
                key={table.id}
                variant={isCurrent ? 'gold-accent' : 'interactive'}
                onClick={() => setSelectedTable(table)}
                className="p-3 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900">Mesa {table.number}</span>
                  <Badge variant={isCurrent ? 'primary' : hasCapacity ? 'success' : 'neutral'} size="sm">
                    {isCurrent ? 'Tu Mesa' : table.shape === 'ROUND' ? 'Circular' : 'Cuadrada'}
                  </Badge>
                </div>
                <div className="text-[11px] text-content-secondary flex justify-between">
                  <span>Capacidad: {table.capacity}</span>
                  <span>{table.available} disp.</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
