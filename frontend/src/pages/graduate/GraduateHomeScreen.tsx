import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button, Icon } from '../../design-system';
import { activeEventMock, currentGraduateMock } from '../../fixtures';

export const GraduateHomeScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      {/* Event Hero Card */}
      <Card variant="gold-accent" className="relative overflow-hidden">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700">
              {activeEventMock.generation}
            </span>
            <Badge variant="success" dot size="sm">
              Inscripción Confirmada
            </Badge>
          </div>

          <h2 className="text-xl font-bold font-display text-navy-900 leading-tight">
            {activeEventMock.name}
          </h2>

          <div className="flex flex-col gap-1 text-xs text-content-secondary mt-1">
            <div className="flex items-center gap-2">
              <Icon name="calendar" size={14} className="text-gold-600" />
              <span>Viernes 20 de Noviembre, 2026 • 20:00 hrs</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="building" size={14} className="text-gold-600" />
              <span>{activeEventMock.venue}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Payment Summary */}
        <Card className="flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted">Estado de Pago</span>
            <Icon name="payment" size={16} className="text-status-success" />
          </div>
          <div className="my-2">
            <span className="text-lg font-bold text-navy-900">
              ${currentGraduateMock.paidAmount.toLocaleString('es-MX')}
            </span>
            <span className="text-xs text-content-muted block">
              de ${currentGraduateMock.totalAmount.toLocaleString('es-MX')} MXN
            </span>
          </div>
          <Badge variant="success" size="sm" className="self-start">
            100% Liquidado
          </Badge>
        </Card>

        {/* Tickets Summary */}
        <Card className="flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-content-muted">Tus Boletos</span>
            <Icon name="ticket" size={16} className="text-navy-900" />
          </div>
          <div className="my-2">
            <span className="text-lg font-bold text-navy-900">
              {currentGraduateMock.ticketCount} Asientos
            </span>
            <span className="text-xs text-content-muted block">
              Mesa {currentGraduateMock.tableNumber} (Zona Central)
            </span>
          </div>
          <Badge variant="primary" size="sm" className="self-start">
            Confirmados
          </Badge>
        </Card>
      </div>

      {/* Action Hub / Module Cards */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Preparativos de Graduación
        </h3>

        {/* Mesa */}
        <Link to="/graduate/table">
          <Card variant="interactive" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center">
                <Icon name="table" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-navy-900">Mesa y Asignación</span>
                <span className="text-xs text-content-secondary">
                  Mesa {currentGraduateMock.tableNumber} • 4 lugares ocupados
                </span>
              </div>
            </div>
            <Icon name="chevron-right" size={18} className="text-content-muted" />
          </Card>
        </Link>

        {/* Platillos */}
        <Link to="/graduate/meals">
          <Card variant="interactive" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
                <Icon name="meal" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-navy-900">Selección de Platillos</span>
                <span className="text-xs text-content-secondary">
                  4 de 4 platillos elegidos
                </span>
              </div>
            </div>
            <Icon name="chevron-right" size={18} className="text-content-muted" />
          </Card>
        </Link>

        {/* Termo */}
        <Link to="/graduate/thermo">
          <Card variant="interactive" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-low text-navy-900 flex items-center justify-center">
                <Icon name="cup" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-navy-900">Personalización de Termo</span>
                <span className="text-xs text-content-secondary">
                  &quot;{currentGraduateMock.thermoCustomization?.text}&quot;
                </span>
              </div>
            </div>
            <Icon name="chevron-right" size={18} className="text-content-muted" />
          </Card>
        </Link>
      </div>

      {/* Need Help CTA */}
      <Card className="bg-gradient-to-r from-navy-900 to-navy-800 text-surface-bright p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Icon name="info" size={16} className="text-gold-400" />
            <h4 className="text-sm font-bold">¿Dudas con tus accesos o pagos?</h4>
          </div>
          <p className="text-xs text-surface-highest leading-relaxed">
            Ponte en contacto con el comité organizador de tu generación.
          </p>
          <Link to="/graduate/help">
            <Button variant="gold" size="sm" fullWidth>
              Centro de Ayuda
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
