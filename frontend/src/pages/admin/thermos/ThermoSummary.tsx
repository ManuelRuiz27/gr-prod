import React from 'react';
import { Icon } from '../../../design-system';
import type { ThermoStatusCount } from './thermoViewModel';

interface ThermoSummaryProps {
  counts: ThermoStatusCount;
}

export const ThermoSummary: React.FC<ThermoSummaryProps> = ({ counts }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-sans">
      {/* 1. Bloqueados */}
      <div className="p-4 bg-obsidian-900/60 border border-silver-800 rounded-xl flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider">
            Bloqueados
          </span>
          <div className="w-7 h-7 rounded-full bg-obsidian-800 text-silver-400 flex items-center justify-center">
            <Icon name="lock" size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-silver-50 font-sans">
            {counts.locked}
          </h3>
          <p className="text-[11px] text-silver-400 mt-0.5">Avance insuficiente</p>
        </div>
      </div>

      {/* 2. Disponibles */}
      <div className="p-4 bg-obsidian-900/60 border border-silver-800 rounded-xl flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider">
            Disponibles
          </span>
          <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center">
            <Icon name="check" size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-gold-400 font-sans">
            {counts.available}
          </h3>
          <p className="text-[11px] text-silver-400 mt-0.5">Listos para solicitar</p>
        </div>
      </div>

      {/* 3. Solicitados */}
      <div className="p-4 bg-obsidian-900/60 border border-silver-800 rounded-xl flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-semibold text-silver-300 uppercase tracking-wider">
            Solicitados
          </span>
          <div className="w-7 h-7 rounded-full bg-obsidian-800 text-silver-300 flex items-center justify-center">
            <Icon name="mail" size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-silver-50 font-sans">
            {counts.requested}
          </h3>
          <p className="text-[11px] text-silver-400 mt-0.5">Por procesar</p>
        </div>
      </div>

      {/* 4. En producción */}
      <div className="p-4 bg-obsidian-900/60 border border-silver-800 rounded-xl flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-semibold text-status-warning uppercase tracking-wider">
            En producción
          </span>
          <div className="w-7 h-7 rounded-full bg-status-warning/20 text-status-warning flex items-center justify-center">
            <Icon name="clock" size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-status-warning font-sans">
            {counts.inProduction}
          </h3>
          <p className="text-[11px] text-silver-400 mt-0.5">En proceso</p>
        </div>
      </div>

      {/* 5. Entregados */}
      <div className="p-4 bg-obsidian-900/60 border border-silver-800 rounded-xl flex flex-col justify-between col-span-2 sm:col-span-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[11px] font-semibold text-status-success uppercase tracking-wider">
            Entregados
          </span>
          <div className="w-7 h-7 rounded-full bg-status-success/20 text-status-success flex items-center justify-center">
            <Icon name="cup" size={14} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-status-success font-sans">
            {counts.delivered}
          </h3>
          <p className="text-[11px] text-silver-400 mt-0.5">Completados</p>
        </div>
      </div>
    </div>
  );
};
