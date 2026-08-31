import React from 'react';
import { Card, Icon } from '../../../design-system';
import type { ThermoStatusCount } from './thermoViewModel';

interface ThermoSummaryProps {
  counts: ThermoStatusCount;
}

/**
 * ThermoSummary — UX-A-TH-001 KPI Cards Panel.
 * Displays counts derived dynamically from event-scoped graduates.
 * No hardcoded totals or percentages.
 */
export const ThermoSummary: React.FC<ThermoSummaryProps> = ({ counts }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Bloqueados */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
            Bloqueados
          </span>
          <div className="w-7 h-7 rounded-full bg-surface-high text-content-secondary flex items-center justify-center">
            <Icon name="lock" size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-navy-900 font-display">
            {counts.locked}
          </h3>
          <p className="text-[11px] text-content-muted mt-0.5">
            Elegibilidad pendiente
          </p>
        </div>
      </Card>

      {/* 2. Disponibles */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-semibold text-gold-700 uppercase tracking-wider">
            Disponibles
          </span>
          <div className="w-7 h-7 rounded-full bg-gold-50 text-gold-700 flex items-center justify-center">
            <Icon name="check" size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-gold-700 font-display">
            {counts.available}
          </h3>
          <p className="text-[11px] text-gold-600 mt-0.5">
            Listos para solicitar
          </p>
        </div>
      </Card>

      {/* 3. Solicitados */}
      <Card className="p-4 flex flex-col justify-between bg-navy-50/40 border-navy-200">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-semibold text-navy-800 uppercase tracking-wider">
            Solicitados
          </span>
          <div className="w-7 h-7 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center">
            <Icon name="cup" size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-navy-900 font-display">
            {counts.requested}
          </h3>
          <p className="text-[11px] text-navy-700 mt-0.5">
            Pendiente de iniciar producción
          </p>
        </div>
      </Card>

      {/* 4. En Producción */}
      <Card className="p-4 flex flex-col justify-between bg-amber-50/40 border-amber-200">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-semibold text-status-warning uppercase tracking-wider">
            En producción
          </span>
          <div className="w-7 h-7 rounded-full bg-status-warning-bg text-status-warning flex items-center justify-center">
            <Icon name="refresh" size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-navy-900 font-display">
            {counts.inProduction}
          </h3>
          <p className="text-[11px] text-status-warning mt-0.5">
            En proceso de producción
          </p>
        </div>
      </Card>

      {/* 5. Entregados */}
      <Card className="p-4 flex flex-col justify-between bg-emerald-50/40 border-emerald-200">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-semibold text-status-success uppercase tracking-wider">
            Entregados
          </span>
          <div className="w-7 h-7 rounded-full bg-status-success-bg text-status-success flex items-center justify-center">
            <Icon name="check" size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-navy-900 font-display">
            {counts.delivered}
          </h3>
          <p className="text-[11px] text-status-success mt-0.5">
            Entrega completada
          </p>
        </div>
      </Card>
    </div>
  );
};
