import React from 'react';
import { Icon, Badge } from '../../design-system';
import { activeEventMock } from '../../fixtures';

export interface GraduateEventContextProps {
  eventName?: string;
  institution?: string;
  generation?: string;
  date?: string;
  venue?: string;
  status?: string;
  className?: string;
}

export const GraduateEventContext: React.FC<GraduateEventContextProps> = ({
  eventName = activeEventMock.name,
  institution = activeEventMock.career || activeEventMock.institution,
  generation = activeEventMock.generation,
  date = activeEventMock.date,
  venue = activeEventMock.venue,
  status = activeEventMock.status || 'OPEN',
  className = '',
}) => {
  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'OPEN':
      case 'Abierto':
        return <Badge variant="gold" size="sm" dot>Abierto</Badge>;
      case 'CLOSED':
      case 'Cerrado':
        return <Badge variant="neutral" size="sm" dot>Cerrado</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{st}</Badge>;
    }
  };

  return (
    <div
      aria-label="Contexto del evento"
      className={`rounded-card p-4 sm:p-5 bg-obsidian-850 border border-silver-800/80 shadow-card flex flex-col gap-3 font-sans relative overflow-hidden ${className}`}
    >
      {/* Subtle gold decorative gradient line on top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0 shadow-card-sm">
            <Icon name="ticket" size={20} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider font-sans">
              Evento de Graduación
            </span>
            <h2 className="text-base sm:text-lg font-bold font-display text-silver-50 tracking-tight truncate">
              {eventName}
            </h2>
          </div>
        </div>

        {getStatusBadge(status)}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-silver-400 pt-2 border-t border-silver-800/50">
        {institution && (
          <span className="flex items-center gap-1.5 truncate">
            <Icon name="building" size={14} className="text-silver-500 shrink-0" />
            <span>{institution}</span>
          </span>
        )}
        {generation && (
          <span className="flex items-center gap-1.5">
            <Icon name="users" size={14} className="text-silver-500 shrink-0" />
            <span>Gen. {generation}</span>
          </span>
        )}
        {date && (
          <span className="flex items-center gap-1.5">
            <Icon name="calendar" size={14} className="text-silver-500 shrink-0" />
            <span>{date}</span>
          </span>
        )}
        {venue && (
          <span className="flex items-center gap-1.5 truncate">
            <Icon name="home" size={14} className="text-silver-500 shrink-0" />
            <span>{venue}</span>
          </span>
        )}
      </div>
    </div>
  );
};
