import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EventSpreadsheetRow, SpreadsheetTotals } from './eventSpreadsheetViewModel';
import { formatCurrencyMXN } from './eventSpreadsheetViewModel';
import { EventReportAbonosModal } from './EventReportAbonosModal';
import { Button } from '../../../design-system';

interface EventSpreadsheetTableProps {
  eventId: string;
  rows: EventSpreadsheetRow[];
  totals: SpreadsheetTotals;
}

export const EventSpreadsheetTable: React.FC<EventSpreadsheetTableProps> = ({
  eventId,
  rows,
  totals,
}) => {
  const navigate = useNavigate();
  const [selectedAbonosRow, setSelectedAbonosRow] = useState<EventSpreadsheetRow | null>(null);
  const [mobileDetailRow, setMobileDetailRow] = useState<EventSpreadsheetRow | null>(null);
  const [isPinned, setIsPinned] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const handleRowNavigate = (graduateId: string) => {
    navigate(`/admin/events/${eventId}/graduates/${graduateId}`);
  };

  if (rows.length === 0) {
    return (
      <div className="w-full border border-silver-800 rounded-lg p-12 bg-obsidian-950 text-center font-sans">
        <div className="mx-auto w-12 h-12 rounded-full bg-obsidian-900 border border-silver-850 flex items-center justify-center text-silver-500 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-silver-200">No se encontraron registros</h3>
        <p className="text-xs text-silver-400 mt-1 max-w-sm mx-auto">
          No hay contratos o graduados que coincidan con los filtros aplicados. Prueba modificando los criterios de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2 font-sans">
      {/* Table Control Bar: Pinning toggle & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1 text-xs">
        {/* Left: Pin Toggle & Responsive Helper */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors border ${
              isPinned
                ? 'bg-gold-500/10 text-gold-400 border-gold-500/30 hover:bg-gold-500/20'
                : 'bg-obsidian-900 text-silver-400 border-silver-800 hover:text-silver-200'
            }`}
            title={isPinned ? 'Desactivar fijación de columnas' : 'Fijar columnas principales en pantallas grandes'}
            aria-label={`Columnas fijas ${isPinned ? 'activadas' : 'desactivadas'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Columnas fijas: <strong className="font-semibold">{isPinned ? 'Sí' : 'No'}</strong></span>
          </button>

          <span className="text-[11px] text-silver-400 hidden sm:inline-block">
            {isPinned ? 'Columnas fijas adaptativas para pantallas medianas/grandes.' : 'Columnas desplazables libremente.'}
          </span>
        </div>

        {/* Right: View Mode Toggle (Table vs Cards) */}
        <div className="inline-flex rounded-lg border border-silver-800 bg-obsidian-900 p-0.5 ml-auto">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-obsidian-800 text-gold-400 shadow-xs'
                : 'text-silver-400 hover:text-silver-200'
            }`}
            title="Ver en formato tabla / hoja de cálculo"
            aria-label="Ver como tabla"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Tabla</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              viewMode === 'cards'
                ? 'bg-obsidian-800 text-gold-400 shadow-xs'
                : 'text-silver-400 hover:text-silver-200'
            }`}
            title="Ver en formato tarjetas (optimizado para móviles)"
            aria-label="Ver como tarjetas"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Tarjetas</span>
          </button>
        </div>
      </div>

      {/* Cards View Mode (Optimal for Mobile & Quick Card Browsing) */}
      {viewMode === 'cards' && (
        <div className="flex flex-col gap-3 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {rows.map((row) => (
              <div
                key={row.graduateId}
                className="bg-obsidian-900 border border-silver-800 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-silver-700 transition-colors shadow-sm"
              >
                {/* Card Top: Badges & Name */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-obsidian-950 border border-silver-750 text-silver-200">
                        {row.tableLabel}
                      </span>
                      {row.contractFolio ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/25">
                          {row.contractFolio}
                        </span>
                      ) : (
                        <span className="text-silver-500 italic text-[11px] font-mono">Sin contrato</span>
                      )}
                    </div>

                    {row.isLiquidated ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Liquidado
                      </span>
                    ) : row.financialStatus === 'ATRASADO' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                        Atrasado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-silver-800 text-silver-300">
                        {row.financialStatus || 'Al corriente'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRowNavigate(row.graduateId)}
                    className="text-left font-bold text-silver-100 hover:text-gold-400 transition-colors text-sm pt-0.5"
                  >
                    {row.graduateName}
                  </button>
                </div>

                {/* Card Middle: Guest Counts & Diets */}
                <div className="grid grid-cols-3 gap-2 bg-obsidian-950/70 p-2.5 rounded-lg border border-silver-800/60 text-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-silver-500 block">Adultos</span>
                    <span className="font-mono font-bold text-silver-100 text-xs">{row.adultsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-silver-500 block">Niños</span>
                    <span className="font-mono font-bold text-silver-100 text-xs">{row.childrenCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-silver-500 block">Sin cena</span>
                    <span className={`font-mono font-bold text-xs ${row.noDinnerCount > 0 ? 'text-amber-400' : 'text-silver-100'}`}>
                      {row.noDinnerCount}
                    </span>
                  </div>
                </div>

                {/* Dietary tags if any */}
                {(row.vegetarianCount > 0 || row.veganCount > 0) && (
                  <div className="flex items-center gap-2 text-[11px] text-silver-300 px-1">
                    <span className="text-silver-500 text-[10px] uppercase tracking-wider">Menú:</span>
                    {row.vegetarianCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-medium">
                        {row.vegetarianCount} veg
                      </span>
                    )}
                    {row.veganCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 text-[10px] font-medium">
                        {row.veganCount} vegano
                      </span>
                    )}
                  </div>
                )}

                {/* Card Financial Details */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-silver-800/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-silver-400">Total a pagar:</span>
                    <span className="font-mono text-silver-100 font-medium">{formatCurrencyMXN(row.totalToPay)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-silver-400">Total abonado:</span>
                    <span className="font-mono font-semibold text-emerald-400">{formatCurrencyMXN(row.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-silver-400">Saldo pendiente:</span>
                    <span className="font-mono font-semibold">
                      {row.isLiquidated ? (
                        <span className="text-emerald-400">$0.00</span>
                      ) : (
                        <span className={row.financialStatus === 'ATRASADO' ? 'text-red-400' : 'text-silver-200'}>
                          {formatCurrencyMXN(row.pendingBalance)}
                        </span>
                      )}
                    </span>
                  </div>
                  {row.overdueInstallmentsCount > 0 && (
                    <div className="text-right text-[10px] text-red-400 font-sans">
                      {row.overdueInstallmentsCount} mensualidad(es) vencida(s)
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-silver-800/60 mt-1">
                  {row.abonosList.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setSelectedAbonosRow(row)}
                      className="text-gold-400 hover:text-gold-300 text-xs font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Ver abonos ({row.abonosList.length})</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <span className="text-silver-500 italic text-[11px]">Sin abonos</span>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRowNavigate(row.graduateId)}
                    className="text-silver-300 hover:text-gold-400 text-xs"
                  >
                    Expediente →
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Cards Totals Summary Bar */}
          <div className="p-3.5 bg-obsidian-900 border border-silver-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gold-400 uppercase tracking-wider">TOTALES:</span>
              <span className="font-mono text-silver-300">{totals.contractsCount} contratos</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs ml-auto">
              <span>Total: <strong className="text-silver-100">{formatCurrencyMXN(totals.totalToPay)}</strong></span>
              <span>Abonado: <strong className="text-emerald-400">{formatCurrencyMXN(totals.totalPaid)}</strong></span>
              <span>Pendiente: <strong className="text-amber-400">{formatCurrencyMXN(totals.totalPending)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Spreadsheet Table Mode (Desktop & Swipeable Responsive Spreadsheet) */}
      {viewMode === 'table' && (
        <div className="w-full flex flex-col font-sans">
          {/* Mobile swipe helper bar */}
          <div className="md:hidden flex items-center justify-between px-3 py-1.5 bg-obsidian-900/90 border-x border-t border-silver-800 rounded-t-lg text-[11px] text-silver-400 font-sans">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gold-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Desliza para ver columnas</span>
            </span>
            <span className="text-silver-400">Toca una fila para ver detalle</span>
          </div>

          {/* Scrollable Spreadsheet Container */}
          <div
            className="w-full overflow-x-auto border border-silver-800 md:rounded-lg rounded-b-lg md:rounded-t-lg bg-obsidian-950 shadow-inner max-h-[72vh] overflow-y-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 [-webkit-overflow-scrolling:touch]"
            tabIndex={0}
            role="region"
            aria-label="Contenedor de hoja de cálculo"
          >
            <table
              className="w-full text-left border-separate border-spacing-0 text-xs select-text min-w-[1250px] table-fixed bg-[#08090A]"
              aria-label="Tabla de reporte operativo del evento"
            >
              {/* Strict Column Widths Specification */}
              <colgroup>
                <col className="w-[88px]" />
                <col className="w-[132px]" />
                <col className="w-[210px]" />
                <col className="w-[70px]" />
                <col className="w-[85px]" />
                <col className="w-[75px]" />
                <col className="w-[155px]" />
                <col className="w-[115px]" />
                <col className="w-[115px]" />
                <col className="w-[120px]" />
                <col className="w-[95px]" />
                <col className="w-[85px]" />
                <col className="w-[105px]" />
              </colgroup>

              {/* Table Header */}
              <thead className="text-silver-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  {/* Frozen Column 1: Mesa */}
                  <th
                    scope="col"
                    className={`relative px-3 py-2.5 w-[88px] min-w-[88px] max-w-[88px] border-b border-silver-800 border-r border-silver-800/80 ${
                      isPinned
                        ? 'sticky left-0 max-md:static z-30 max-md:z-auto bg-[#0E1013] before:content-[\'\'] before:absolute before:inset-0 before:bg-[#0E1013] before:-z-10'
                        : 'static bg-[#0E1013]'
                    }`}
                  >
                    Mesa
                  </th>

                  {/* Frozen Column 2: Nº contrato */}
                  <th
                    scope="col"
                    className={`relative px-3 py-2.5 w-[132px] min-w-[132px] max-w-[132px] border-b border-silver-800 border-r border-silver-800/80 ${
                      isPinned
                        ? 'sticky max-md:static md:left-[88px] z-30 max-md:z-auto bg-[#0E1013] before:content-[\'\'] before:absolute before:inset-0 before:bg-[#0E1013] before:-z-10'
                        : 'static bg-[#0E1013]'
                    }`}
                  >
                    Nº contrato
                  </th>

                  {/* Frozen Column 3: Nombre */}
                  <th
                    scope="col"
                    className={`relative px-3.5 py-2.5 w-[210px] min-w-[210px] max-w-[210px] border-b border-silver-800 border-r-2 border-silver-700 ${
                      isPinned
                        ? 'sticky max-md:static md:left-[220px] z-30 max-md:z-auto bg-[#0E1013] before:content-[\'\'] before:absolute before:inset-0 before:bg-[#0E1013] before:-z-10 shadow-[6px_0_12px_-2px_rgba(0,0,0,0.85)]'
                        : 'static bg-[#0E1013]'
                    }`}
                  >
                    Nombre
                  </th>

                  {/* Scrolling Columns */}
                  <th scope="col" className="px-3 py-2.5 text-center border-b border-r border-silver-800 bg-[#0E1013]">
                    Adultos
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-center border-b border-r border-silver-800 bg-[#0E1013]">
                    Niños 4–11
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-center border-b border-r border-silver-800 bg-[#0E1013]">
                    Sin cena
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-left border-b border-r border-silver-800 bg-[#0E1013]">
                    Abonos
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right border-b border-r border-silver-800 bg-[#0E1013]">
                    Total a pagar
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right border-b border-r border-silver-800 bg-[#0E1013]">
                    Total abonado
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right border-b border-r border-silver-800 bg-[#0E1013]">
                    Saldo pendiente
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-center border-b border-r border-silver-800 bg-[#0E1013]">
                    Vegetarianos
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-center border-b border-r border-silver-800 bg-[#0E1013]">
                    Veganos
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-center border-b border-silver-800 bg-[#0E1013]">
                    Acciones
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="font-sans">
                {rows.map((row) => {
                  return (
                    <tr
                      key={row.graduateId}
                      onClick={() => setMobileDetailRow(row)}
                      className="group hover:bg-[#121418] transition-colors h-11 cursor-pointer md:cursor-default"
                    >
                      {/* Frozen Column 1: Mesa */}
                      <td
                        className={`relative px-3 py-2 w-[88px] min-w-[88px] max-w-[88px] whitespace-nowrap font-medium text-silver-300 border-b border-silver-800/60 border-r border-silver-800/80 ${
                          isPinned
                            ? 'sticky left-0 max-md:static z-20 max-md:z-auto bg-[#08090A] group-hover:bg-[#121418] before:content-[\'\'] before:absolute before:inset-0 before:bg-[#08090A] before:-z-10'
                            : 'static bg-[#08090A] group-hover:bg-[#121418]'
                        }`}
                      >
                        {row.tableNumber !== null ? (
                          <span className="font-mono text-silver-200">{row.tableLabel}</span>
                        ) : (
                          <span className="text-silver-500 italic text-[11px]">Sin mesa</span>
                        )}
                      </td>

                      {/* Frozen Column 2: Nº contrato */}
                      <td
                        className={`relative px-3 py-2 w-[132px] min-w-[132px] max-w-[132px] whitespace-nowrap font-mono text-silver-300 border-b border-silver-800/60 border-r border-silver-800/80 ${
                          isPinned
                            ? 'sticky max-md:static md:left-[88px] z-20 max-md:z-auto bg-[#08090A] group-hover:bg-[#121418] before:content-[\'\'] before:absolute before:inset-0 before:bg-[#08090A] before:-z-10'
                            : 'static bg-[#08090A] group-hover:bg-[#121418]'
                        }`}
                      >
                        <span className={row.contractFolio ? 'text-gold-400 font-medium' : 'text-silver-500 font-mono'}>
                          {row.contractFolio || '—'}
                        </span>
                      </td>

                      {/* Frozen Column 3: Nombre */}
                      <td
                        className={`relative px-3.5 py-2 w-[210px] min-w-[210px] max-w-[210px] font-medium text-silver-100 border-b border-silver-800/60 border-r-2 border-silver-700 whitespace-nowrap overflow-hidden text-ellipsis ${
                          isPinned
                            ? 'sticky max-md:static md:left-[220px] z-20 max-md:z-auto bg-[#08090A] group-hover:bg-[#121418] before:content-[\'\'] before:absolute before:inset-0 before:bg-[#08090A] before:-z-10 shadow-[6px_0_12px_-2px_rgba(0,0,0,0.85)]'
                            : 'static bg-[#08090A] group-hover:bg-[#121418]'
                        }`}
                        title={row.graduateName}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowNavigate(row.graduateId);
                          }}
                          className="text-left hover:text-gold-400 hover:underline transition-colors focus:outline-none focus:text-gold-400 truncate max-w-full block"
                        >
                          {row.graduateName}
                        </button>
                      </td>

                      {/* Adultos */}
                      <td className="px-3 py-2 text-center font-mono text-silver-200 border-b border-r border-silver-800/60 bg-[#08090A] group-hover:bg-[#121418] transition-colors">
                        {row.adultsCount}
                      </td>

                      {/* Niños 4-11 */}
                      <td className="px-3 py-2 text-center font-mono text-silver-200 border-b border-r border-silver-800/60 bg-[#08090A] group-hover:bg-[#121418] transition-colors">
                        {row.childrenCount > 0 ? (
                          row.childrenCount
                        ) : (
                          <span className="text-silver-600 font-mono">0</span>
                        )}
                      </td>

                      {/* Sin cena */}
                      <td className="px-3 py-2 text-center font-mono text-silver-200 border-b border-r border-silver-800/60 bg-[#08090A] group-hover:bg-[#121418] transition-colors">
                        {row.noDinnerCount > 0 ? (
                          <span className="text-amber-400 font-semibold">{row.noDinnerCount}</span>
                        ) : (
                          <span className="text-silver-600 font-mono">0</span>
                        )}
                      </td>

                      {/* Abonos */}
                      <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px] border-b border-r border-silver-800/60 bg-[#08090A] group-hover:bg-[#121418] transition-colors">
                        {row.abonosList.length > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAbonosRow(row);
                            }}
                            className="text-gold-400/90 hover:text-gold-300 hover:underline cursor-pointer flex items-center gap-1 group/abono focus:outline-none"
                            title="Ver desglose individual de abonos"
                          >
                            <span>{row.abonosSummaryText}</span>
                            <svg
                              className="w-3 h-3 text-gold-500/70 group-hover/abono:translate-x-0.5 transition-transform"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-silver-500 italic text-[11px]">Sin abonos</span>
                        )}
                      </td>

                      {/* Total a pagar */}
                      <td className="px-3 py-2 text-right font-mono text-silver-100 whitespace-nowrap border-b border-r border-silver-800/60 bg-[#08090A] group-hover:bg-[#121418] transition-colors">
                        {formatCurrencyMXN(row.totalToPay)}
                      </td>

                      {/* Total abonado */}
                      <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap border-b border-r border-silver-800/60 bg-[#08090A] group-hover:bg-[#121418] transition-colors">
                        {formatCurrencyMXN(row.totalPaid)}
                      </td>

                      {/* Saldo pendiente */}
                      <td className="px-3 py-2 text-right font-mono whitespace-nowrap border-b border-r border-silver-800/60 bg-[#08090A] group-hover:bg-[#121418] transition-colors">
                        {row.isLiquidated ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Liquidado
                          </span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span
                              className={
                                row.financialStatus === 'ATRASADO'
                                  ? 'text-red-400 font-bold'
                                  : 'text-silver-200'
                              }
                            >
                              {formatCurrencyMXN(row.pendingBalance)}
                            </span>
                            {row.overdueInstallmentsCount > 0 && (
                              <span className="text-[10px] text-red-400 font-sans">
                                {row.overdueInstallmentsCount} vcs. vencidas
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Vegetarianos */}
                      <td className="px-3 py-2 text-center font-mono text-silver-200 border-b border-r border-silver-800/60 bg-[#08090A] group-hover:bg-[#121418] transition-colors">
                        {row.vegetarianCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                            {row.vegetarianCount}
                          </span>
                        ) : (
                          <span className="text-silver-600 font-mono">0</span>
                        )}
                      </td>

                      {/* Veganos */}
                      <td className="px-3 py-2 text-center font-mono text-silver-200 border-b border-r border-silver-800/60 bg-[#08090A] group-hover:bg-[#121418] transition-colors">
                        {row.veganCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 font-bold">
                            {row.veganCount}
                          </span>
                        ) : (
                          <span className="text-silver-600 font-mono">0</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-3 py-2 text-center whitespace-nowrap border-b border-silver-800/60 bg-[#08090A] group-hover:bg-[#121418] transition-colors">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Mobile detail button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden text-silver-400 hover:text-gold-400 px-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMobileDetailRow(row);
                            }}
                            title="Ver fila completa en modal"
                          >
                            Detalle
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-silver-400 hover:text-gold-400 hover:bg-obsidian-800 px-2 py-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowNavigate(row.graduateId);
                            }}
                            title="Ir a expediente del graduado"
                          >
                            Ver graduado
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Sticky Totales Row at the bottom */}
              <tfoot className="sticky bottom-0 z-30 font-semibold text-xs shadow-[0_-4px_10px_rgba(0,0,0,0.7)]">
                <tr className="h-10">
                  {/* Frozen Column 1: Mesa Label */}
                  <td
                    className={`relative px-3 py-2 w-[88px] min-w-[88px] max-w-[88px] uppercase font-bold tracking-wider text-gold-400 border-t-2 border-silver-700 border-r border-silver-800/80 ${
                      isPinned
                        ? 'sticky left-0 max-md:static z-30 max-md:z-auto bg-[#08090A] before:content-[\'\'] before:absolute before:inset-0 before:bg-[#08090A] before:-z-10'
                        : 'static bg-[#08090A]'
                    }`}
                  >
                    TOTALES
                  </td>

                  {/* Frozen Column 2: Contracts Count */}
                  <td
                    className={`relative px-3 py-2 w-[132px] min-w-[132px] max-w-[132px] font-mono text-xs text-silver-200 whitespace-nowrap border-t-2 border-silver-700 border-r border-silver-800/80 ${
                      isPinned
                        ? 'sticky max-md:static md:left-[88px] z-30 max-md:z-auto bg-[#08090A] before:content-[\'\'] before:absolute before:inset-0 before:bg-[#08090A] before:-z-10'
                        : 'static bg-[#08090A]'
                    }`}
                  >
                    {totals.contractsCount} contratos
                  </td>

                  {/* Frozen Column 3: Spacer */}
                  <td
                    className={`relative px-3.5 py-2 w-[210px] min-w-[210px] max-w-[210px] text-silver-500 border-t-2 border-silver-700 border-r-2 border-silver-700 ${
                      isPinned
                        ? 'sticky max-md:static md:left-[220px] z-30 max-md:z-auto bg-[#08090A] before:content-[\'\'] before:absolute before:inset-0 before:bg-[#08090A] before:-z-10 shadow-[6px_0_12px_-2px_rgba(0,0,0,0.85)]'
                        : 'static bg-[#08090A]'
                    }`}
                  >
                    —
                  </td>

                  {/* Adultos Total */}
                  <td className="px-3 py-2 text-center font-mono font-bold text-silver-100 border-t-2 border-r border-silver-700 bg-[#08090A]">
                    {totals.adultsTotal}
                  </td>

                  {/* Niños Total */}
                  <td className="px-3 py-2 text-center font-mono font-bold text-silver-100 border-t-2 border-r border-silver-700 bg-[#08090A]">
                    {totals.childrenTotal}
                  </td>

                  {/* Sin cena Total */}
                  <td className="px-3 py-2 text-center font-mono font-bold text-silver-100 border-t-2 border-r border-silver-700 bg-[#08090A]">
                    {totals.noDinnerTotal}
                  </td>

                  {/* Abonos Spacer */}
                  <td className="px-3 py-2 text-silver-500 font-mono text-[11px] border-t-2 border-r border-silver-700 bg-[#08090A]">
                    —
                  </td>

                  {/* Total a pagar sum */}
                  <td className="px-3 py-2 text-right font-mono font-bold text-silver-100 whitespace-nowrap border-t-2 border-r border-silver-700 bg-[#08090A]">
                    {formatCurrencyMXN(totals.totalToPay)}
                  </td>

                  {/* Total abonado sum */}
                  <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400 whitespace-nowrap border-t-2 border-r border-silver-700 bg-[#08090A]">
                    {formatCurrencyMXN(totals.totalPaid)}
                  </td>

                  {/* Saldo pendiente sum */}
                  <td className="px-3 py-2 text-right font-mono font-bold text-silver-100 whitespace-nowrap border-t-2 border-r border-silver-700 bg-[#08090A]">
                    {formatCurrencyMXN(totals.totalPending)}
                  </td>

                  {/* Vegetarianos Total */}
                  <td className="px-3 py-2 text-center font-mono font-bold text-silver-100 border-t-2 border-r border-silver-700 bg-[#08090A]">
                    {totals.vegetarianTotal}
                  </td>

                  {/* Veganos Total */}
                  <td className="px-3 py-2 text-center font-mono font-bold text-silver-100 border-t-2 border-r border-silver-700 bg-[#08090A]">
                    {totals.veganTotal}
                  </td>

                  {/* Acciones Spacer */}
                  <td className="px-3 py-2 text-center text-silver-500 border-t-2 border-silver-700 bg-[#08090A]">
                    —
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Ledger Detail Modal */}
      {selectedAbonosRow && (
        <EventReportAbonosModal
          row={selectedAbonosRow}
          onClose={() => setSelectedAbonosRow(null)}
        />
      )}

      {/* Mobile Detail Dialog (for narrow screens) */}
      {mobileDetailRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-xs font-sans animate-fadeIn md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-row-detail-title"
        >
          <div className="bg-obsidian-900 border border-silver-800 rounded-xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-silver-800 pb-2">
              <h3 id="mobile-row-detail-title" className="text-sm font-bold text-silver-100 font-display">
                Fila completa del contrato
              </h3>
              <button
                onClick={() => setMobileDetailRow(null)}
                className="text-silver-400 hover:text-silver-200"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-2 text-xs divide-y divide-silver-800/60">
              <div className="flex justify-between pt-1">
                <span className="text-silver-400">Graduado:</span>
                <span className="font-semibold text-silver-100">{mobileDetailRow.graduateName}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-silver-400">Nº contrato:</span>
                <span className="font-mono text-gold-400">{mobileDetailRow.contractFolio || '—'}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-silver-400">Mesa:</span>
                <span className="font-mono text-silver-200">{mobileDetailRow.tableLabel}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-silver-400">Adultos / Niños / Sin cena:</span>
                <span className="font-mono text-silver-200">
                  {mobileDetailRow.adultsCount} / {mobileDetailRow.childrenCount} / {mobileDetailRow.noDinnerCount}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-silver-400">Total a pagar:</span>
                <span className="font-mono text-silver-100">{formatCurrencyMXN(mobileDetailRow.totalToPay)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-silver-400">Total abonado:</span>
                <span className="font-mono text-emerald-400">{formatCurrencyMXN(mobileDetailRow.totalPaid)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-silver-400">Saldo pendiente:</span>
                <span className="font-mono font-semibold">
                  {mobileDetailRow.isLiquidated ? 'Liquidado' : formatCurrencyMXN(mobileDetailRow.pendingBalance)}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-silver-400">Dietas especiales:</span>
                <span className="text-silver-200">
                  {mobileDetailRow.vegetarianCount} Veg / {mobileDetailRow.veganCount} Vegano
                </span>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-silver-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedAbonosRow(mobileDetailRow);
                  setMobileDetailRow(null);
                }}
              >
                Ver abonos
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleRowNavigate(mobileDetailRow.graduateId);
                  setMobileDetailRow(null);
                }}
              >
                Ir a graduado
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
