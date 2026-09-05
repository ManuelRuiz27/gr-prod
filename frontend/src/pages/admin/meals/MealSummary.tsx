import React from 'react';
import { Badge } from '../../../design-system';
import type { MealOptionCount } from './mealViewModel';

interface MealSummaryProps {
  counts: MealOptionCount[];
  totalKnown: number;
}

/**
 * MealSummary — UX-A-MEAL-001 summary panel.
 * Displays known selections per option derived from fixture data.
 * No hardcoded totals or names.
 */
export const MealSummary: React.FC<MealSummaryProps> = ({ counts, totalKnown }) => {
  if (counts.length === 0) {
    return (
      <div className="text-sm text-silver-400">
        Aún no hay opciones de platillo configuradas para este evento.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-sans py-2 border-b border-silver-800/60 pb-4">
      <div className="flex flex-wrap items-baseline gap-8 sm:gap-12">
        {counts.map(({ option, count }) => (
          <div key={option.id}>
            <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
              {option.name}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-silver-50 font-sans mt-1">
              {count}
            </div>
            <p className="text-[11px] text-silver-400 mt-0.5">
              {count === 1 ? 'selección conocida' : 'selecciones conocidas'}
            </p>
            <p className="text-[10px] text-silver-500 mt-0.5">
              Opción configurada
            </p>
          </div>
        ))}

        {/* Pendientes — Flat */}
        <div>
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
            Pendientes
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gold-400 font-sans mt-1">
            —
          </div>
          <p className="text-[11px] text-silver-400 mt-0.5">Sin dato consolidado</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="primary" size="sm">
          {totalKnown} {totalKnown === 1 ? 'selección conocida total' : 'selecciones conocidas totales'}
        </Badge>
        <span className="text-xs text-silver-400">
          Información nominal disponible
        </span>
      </div>
    </div>
  );
};
