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
    <div className="flex flex-col gap-4 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {counts.map(({ option, count }) => (
          <Card key={option.id} className="p-4 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider">
                {option.name}
              </span>
              <div className="w-7 h-7 rounded-full bg-obsidian-800 text-silver-300 flex items-center justify-center">
                <Icon name="meal" size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-silver-50 font-sans">
                {count}{' '}
                <span className="text-xs font-normal text-silver-400">
                  {count === 1 ? 'selección conocida' : 'selecciones conocidas'}
                </span>
              </h3>
              <p className="text-[11px] text-silver-400 mt-0.5">
                Opción configurada
              </p>
            </div>
          </Card>
        ))}

        {/* Pendientes card */}
        <Card className="p-4 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider">
              Pendientes
            </span>
            <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center">
              <Icon name="clock" size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gold-400 font-sans">—</h3>
            <p className="text-[11px] text-silver-400 mt-0.5">Sin dato consolidado</p>
          </div>
        </Card>
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
