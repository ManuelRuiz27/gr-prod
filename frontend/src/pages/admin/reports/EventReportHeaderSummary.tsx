import React from 'react';
import type { EventMock } from '../../../fixtures/eventFixtures';
import {
  formatCurrencyMXN,
  calculateEventReservationSummary,
  type SpreadsheetTotals,
  type EventPrices,
} from './eventSpreadsheetViewModel';

export interface EventReportHeaderSummaryProps {
  event: EventMock;
  totals: SpreadsheetTotals;
  prices: EventPrices;
  penalties?: number | string | null;
  courtesies?: number | string | null;
}

export const EventReportHeaderSummary: React.FC<EventReportHeaderSummaryProps> = ({
  event,
  totals,
  prices,
  penalties = null,
  courtesies = null,
}) => {
  const summary = calculateEventReservationSummary(totals, penalties, courtesies);

  const totalToPay = totals.totalToPay;
  const totalPaid = totals.totalPaid;
  const totalPending = totals.totalPending;

  let paidPercent = 0;
  if (totalToPay > 0) {
    paidPercent = Math.min(100, Math.max(0, (totalPaid / totalToPay) * 100));
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (paidPercent / 100) * circumference;

  return (
    <section
      aria-label="Resumen operativo del evento"
      className="bg-obsidian-900/90 border border-silver-800 rounded-lg p-3.5 text-xs flex flex-col xl:flex-row items-stretch gap-4 divide-y xl:divide-y-0 xl:divide-x divide-silver-800/80 shadow-sm"
    >
      {/* 1. Datos generales */}
      <div
        data-testid="report-header-summary-general"
        className="flex-1 flex flex-col justify-between gap-2.5 min-w-0"
      >
        <div className="flex items-center justify-between border-b border-silver-800/60 pb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
            Datos generales
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Institución
            </span>
            <span
              className="font-medium text-silver-100 truncate block"
              title={event.institution || '—'}
            >
              {event.institution || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Carrera
            </span>
            <span
              className="font-medium text-silver-100 truncate block"
              title={event.career || '—'}
            >
              {event.career || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Salón / Venue
            </span>
            <span
              className="font-medium text-silver-100 truncate block"
              title={event.venue || '—'}
            >
              {event.venue || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Fecha
            </span>
            <span className="font-medium text-silver-100 block">
              {event.date || '—'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-silver-800/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs bg-obsidian-950/40 px-2 py-1.5 rounded">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-silver-400">
            Precios:
          </span>
          <span className="text-silver-300">
            Adulto:{' '}
            <strong className="font-mono text-silver-100">
              {prices.adultPrice !== null ? formatCurrencyMXN(prices.adultPrice) : '—'}
            </strong>
          </span>
          <span className="text-silver-300">
            Niño 4–11:{' '}
            <strong className="font-mono text-silver-100">
              {prices.childPrice !== null ? formatCurrencyMXN(prices.childPrice) : '—'}
            </strong>
          </span>
          <span className="text-silver-300">
            Sin cena:{' '}
            <strong className="font-mono text-silver-100">
              {prices.noDinnerPrice !== null ? formatCurrencyMXN(prices.noDinnerPrice) : '—'}
            </strong>
          </span>
        </div>
      </div>

      {/* 2. Abonado vs Restante */}
      <div
        data-testid="report-header-summary-donut"
        className="flex flex-col justify-between gap-2 min-w-0 xl:pl-4 pt-3 xl:pt-0 shrink-0"
      >
        <div className="border-b border-silver-800/60 pb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
            Abonado vs Restante
          </span>
        </div>

        <div className="flex items-center gap-3.5 my-auto">
          <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 shrink-0">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
              role="img"
              aria-label={`Gráfico de dona: ${Math.round(paidPercent)}% abonado`}
            >
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-amber-500/25"
                stroke="currentColor"
                strokeWidth="11"
                fill="transparent"
              />
              {paidPercent > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-emerald-500 transition-all duration-300"
                  stroke="currentColor"
                  strokeWidth="11"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span
                className="text-xs sm:text-sm font-bold font-mono text-silver-100 leading-tight"
                data-testid="donut-percent"
              >
                {Math.round(paidPercent)}%
              </span>
              <span className="text-[8px] text-silver-400 uppercase tracking-tighter">
                {paidPercent >= 100 ? 'Liquidado' : 'Abonado'}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-1.5 text-xs min-w-[130px]">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-silver-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                Abonado
              </span>
              <span className="font-mono font-semibold text-emerald-400 text-[11px]">
                {formatCurrencyMXN(totalPaid)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-silver-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                Restante
              </span>
              <span className="font-mono font-semibold text-amber-400 text-[11px]">
                {formatCurrencyMXN(totalPending)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-silver-800/80">
              <span className="flex items-center gap-1.5 text-silver-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-silver-500 shrink-0" />
                Total
              </span>
              <span className="font-mono font-semibold text-silver-200 text-[11px]">
                {formatCurrencyMXN(totalToPay)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Reservas del evento */}
      <div
        data-testid="report-header-summary-reservations"
        className="flex-1 flex flex-col justify-between gap-2.5 min-w-0 xl:pl-4 pt-3 xl:pt-0"
      >
        <div className="flex items-center justify-between border-b border-silver-800/60 pb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
            Reservas del evento
          </span>
          <span className="text-[11px] font-mono text-silver-300">
            Apartados:{' '}
            <strong className="text-silver-50 font-bold">
              {summary.apartadosTotal}
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center bg-obsidian-950/70 p-2 rounded border border-silver-800/60">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Adultos
            </span>
            <span className="font-mono font-bold text-silver-100 text-xs">
              {summary.adultsTotal}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Niños
            </span>
            <span className="font-mono font-bold text-silver-100 text-xs">
              {summary.childrenTotal}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Sin cena
            </span>
            <span className="font-mono font-bold text-silver-100 text-xs">
              {summary.noDinnerTotal}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Graduados
            </span>
            <span className="font-mono font-bold text-silver-100 text-xs">
              {summary.graduatesCount}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 text-xs pt-1 border-t border-silver-800/60">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Total
            </span>
            <span className="font-mono font-semibold text-silver-100 truncate block">
              {formatCurrencyMXN(summary.totalAmount)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Abonado
            </span>
            <span className="font-mono font-semibold text-emerald-400 truncate block">
              {formatCurrencyMXN(summary.paidAmount)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Restante
            </span>
            <span className="font-mono font-semibold text-amber-400 truncate block">
              {formatCurrencyMXN(summary.pendingAmount)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Penalizaciones
            </span>
            <span className="font-mono text-silver-400 block">
              {summary.penalties}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-silver-500 block">
              Cortesías
            </span>
            <span className="font-mono text-silver-400 block">
              {summary.courtesies}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
