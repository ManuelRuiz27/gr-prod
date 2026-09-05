import React from 'react';
import type { ThermoStatusCount } from './thermoViewModel';

interface ThermoSummaryProps {
  counts: ThermoStatusCount;
}

export const ThermoSummary: React.FC<ThermoSummaryProps> = ({ counts }) => {
  return (
    <div className="flex flex-wrap items-baseline gap-6 sm:gap-10 font-sans py-2 border-b border-silver-800/60 pb-4">
      {/* 1. Bloqueados */}
      <div>
        <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
          Bloqueados
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-silver-50 font-sans mt-1">
          {counts.locked}
        </div>
        <p className="text-[11px] text-silver-400 mt-0.5">Avance insuficiente</p>
      </div>

      {/* 2. Disponibles */}
      <div>
        <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
          Disponibles
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-gold-400 font-sans mt-1">
          {counts.available}
        </div>
        <p className="text-[11px] text-silver-400 mt-0.5">Listos para solicitar</p>
      </div>

      {/* 3. Solicitados */}
      <div>
        <span className="text-xs font-semibold text-silver-300 uppercase tracking-wider">
          Solicitados
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-silver-50 font-sans mt-1">
          {counts.requested}
        </div>
        <p className="text-[11px] text-silver-400 mt-0.5">Por procesar</p>
      </div>

      {/* 4. En producción */}
      <div>
        <span className="text-xs font-semibold text-status-warning uppercase tracking-wider">
          En producción
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-status-warning font-sans mt-1">
          {counts.inProduction}
        </div>
        <p className="text-[11px] text-silver-400 mt-0.5">En proceso</p>
      </div>

      {/* 5. Entregados */}
      <div>
        <span className="text-xs font-semibold text-status-success uppercase tracking-wider">
          Entregados
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-status-success font-sans mt-1">
          {counts.delivered}
        </div>
        <p className="text-[11px] text-silver-400 mt-0.5">Completados</p>
      </div>
    </div>
  );
};
