import React from 'react';
import { Card, Icon, Badge } from '../../../design-system';
import type { MealOptionCount } from './mealViewModel';

interface MealSummaryProps {
  counts: MealOptionCount[];
  totalKnown: number;
}

/**
 * MealSummary — UX-A-MEAL-001 summary panel.
 * Displays known selections per option derived from fixture data.
 * No hardcoded totals.
 */
export const MealSummary: React.FC<MealSummaryProps> = ({ counts, totalKnown }) => {
  if (counts.length === 0) {
    return (
      <div className="text-sm text-content-secondary">
        Aún no hay opciones de platillo configuradas para este evento.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {counts.map(({ option, count }) => (
          <Card key={option.id} className="p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
                {option.name}
              </span>
              <div className="w-7 h-7 rounded-full bg-navy-50 text-navy-800 flex items-center justify-center">
                <Icon name="meal" size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-navy-900 font-display">
                {count}{' '}
                <span className="text-xs font-normal text-content-muted">
                  {count === 1 ? 'selección conocida' : 'selecciones conocidas'}
                </span>
              </h3>
              <p className="text-[11px] text-content-muted mt-0.5">
                Opción configurada
              </p>
            </div>
          </Card>
        ))}

        {/* Pendientes card — only shows when we cannot derive the denominator */}
        <Card className="p-4 flex flex-col justify-between bg-amber-50/60 border-amber-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              Pendientes
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Icon name="clock" size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-amber-700">—</h3>
            <p className="text-[11px] text-amber-600 mt-0.5">Sin dato consolidado</p>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="primary" size="sm">
          {totalKnown} {totalKnown === 1 ? 'selección conocida total' : 'selecciones conocidas totales'}
        </Badge>
        <span className="text-xs text-content-muted">
          Información nominal disponible
        </span>
      </div>
    </div>
  );
};
