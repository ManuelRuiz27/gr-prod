import React from 'react';
import { Card, Badge, Alert, Icon } from '../../design-system';
import { currentGraduateMock, mockTables } from '../../fixtures';

export const GraduateTableScreen: React.FC = () => {
  const currentTable = mockTables.find((t) => t.number === currentGraduateMock.tableNumber) || mockTables[4];

  return (
    <div className="flex flex-col gap-5">
      {/* Table Header Card */}
      <Card variant="gold-accent" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-content-muted">Tu Mesa Asignada</span>
          <Badge variant="gold" size="sm">
            {currentTable.zone}
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-navy-900 font-display">
            Mesa #{currentTable.number}
          </span>
          <span className="text-xs text-content-secondary">
            Capacidad: {currentTable.capacity} personas
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-status-success font-semibold">
          <Icon name="check" size={14} />
          <span>Mesa confirmada y bloqueada para tu grupo</span>
        </div>
      </Card>

      {/* Seating Guidelines */}
      <Alert variant="info" title="Reglamento de Asignación">
        Los asientos dentro de la mesa pueden ocuparse libremente por ti y tus acompañantes al ingresar
        al salón.
      </Alert>

      {/* Visual Seat Representation */}
      <Card className="flex flex-col items-center justify-center p-6 gap-6">
        <div className="relative w-48 h-48 rounded-full border-4 border-dashed border-navy-300 bg-surface-low flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-navy-900">Mesa {currentTable.number}</span>
          <span className="text-[11px] text-content-muted">10 Lugares</span>

          {/* Orbiting Seat Dots */}
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * 360) / 10;
            const isYours = i < currentGraduateMock.ticketCount;
            return (
              <div
                key={i}
                style={{
                  transform: `rotate(${angle}deg) translate(95px) rotate(-${angle}deg)`,
                }}
                className={`absolute w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center border ${
                  isYours
                    ? 'bg-gold-400 text-navy-950 border-gold-600 shadow-sm'
                    : 'bg-surface-lowest text-content-muted border-surface-highest'
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gold-400 border border-gold-600" />
            <span className="font-medium">Tus 4 Lugares</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-surface-lowest border border-surface-highest" />
            <span className="text-content-muted">Otros Graduados</span>
          </div>
        </div>
      </Card>

      {/* Table Mates List */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Graduados en esta Mesa
        </h3>
        {currentTable.assignedGraduateNames.map((name, idx) => (
          <Card key={idx} className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon name="user" size={16} className="text-navy-900" />
              <span className="text-xs font-semibold text-content-primary">{name}</span>
            </div>
            <Badge variant={idx === 0 ? 'primary' : 'neutral'} size="sm">
              {idx === 0 ? 'Tú' : 'Compañero'}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
};
