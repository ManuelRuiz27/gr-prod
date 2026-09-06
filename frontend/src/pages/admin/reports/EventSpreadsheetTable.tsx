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
    <div className="w-full flex flex-col font-sans">
      {/* Scrollable Spreadsheet Container */}
      <div
        className="w-full overflow-x-auto border border-silver-800 rounded-lg bg-obsidian-950 shadow-inner max-h-[72vh] overflow-y-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
        tabIndex={0}
        role="region"
        aria-label="Contenedor de hoja de cálculo"
      >
        <table
          className="w-full text-left border-collapse text-xs select-text"
          aria-label="Tabla de reporte operativo del evento"
        >
          {/* Table Header */}
          <thead className="bg-obsidian-900/95 backdrop-blur-xs text-silver-400 uppercase font-semibold text-[11px] tracking-wider border-b border-silver-800">
            <tr>
              {/* Frozen Column 1: Mesa */}
              <th
                scope="col"
                className="sticky left-0 z-30 bg-obsidian-900 px-3 py-2.5 min-w-[80px] w-24 border-r border-silver-800/80 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.3)]"
              >
                Mesa
              </th>

              {/* Frozen Column 2: Nº contrato */}
              <th
                scope="col"
                className="sticky left-[96px] z-30 bg-obsidian-900 px-3 py-2.5 min-w-[120px] w-36 border-r border-silver-800/80 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.3)]"
              >
                Nº contrato
              </th>

              {/* Frozen Column 3: Nombre */}
              <th
                scope="col"
                className="sticky left-[240px] z-30 bg-obsidian-900 px-3.5 py-2.5 min-w-[180px] w-52 border-r border-silver-700 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.6)]"
              >
                Nombre
              </th>

              {/* Scrolling Columns */}
              <th scope="col" className="px-3 py-2.5 text-center min-w-[65px]">
                Adultos
              </th>
              <th scope="col" className="px-3 py-2.5 text-center min-w-[80px]">
                Niños 4–11
              </th>
              <th scope="col" className="px-3 py-2.5 text-center min-w-[70px]">
                Sin cena
              </th>
              <th scope="col" className="px-3 py-2.5 text-left min-w-[150px]">
                Abonos
              </th>
              <th scope="col" className="px-3 py-2.5 text-right min-w-[110px]">
                Total a pagar
              </th>
              <th scope="col" className="px-3 py-2.5 text-right min-w-[110px]">
                Total abonado
              </th>
              <th scope="col" className="px-3 py-2.5 text-right min-w-[110px]">
                Saldo pendiente
              </th>
              <th scope="col" className="px-3 py-2.5 text-center min-w-[90px]">
                Vegetarianos
              </th>
              <th scope="col" className="px-3 py-2.5 text-center min-w-[80px]">
                Veganos
              </th>
              <th scope="col" className="px-3 py-2.5 text-center min-w-[100px]">
                Acciones
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-silver-800/60 font-sans">
            {rows.map((row) => {
              return (
                <tr
                  key={row.graduateId}
                  className="hover:bg-obsidian-850/60 transition-colors group h-11"
                >
                  {/* Frozen Column 1: Mesa */}
                  <td
                    className="sticky left-0 z-20 bg-obsidian-950 group-hover:bg-obsidian-900/90 px-3 py-2 whitespace-nowrap font-medium text-silver-300 border-r border-silver-800/80 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.3)]"
                  >
                    {row.tableNumber !== null ? (
                      <span className="font-mono text-silver-200">{row.tableLabel}</span>
                    ) : (
                      <span className="text-silver-500 italic text-[11px]">Sin mesa</span>
                    )}
                  </td>

                  {/* Frozen Column 2: Nº contrato */}
                  <td
                    className="sticky left-[96px] z-20 bg-obsidian-950 group-hover:bg-obsidian-900/90 px-3 py-2 whitespace-nowrap font-mono text-silver-300 border-r border-silver-800/80 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.3)]"
                  >
                    <span className="text-gold-400 font-medium">{row.contractFolio}</span>
                  </td>

                  {/* Frozen Column 3: Nombre */}
                  <td
                    className="sticky left-[240px] z-20 bg-obsidian-950 group-hover:bg-obsidian-900/90 px-3.5 py-2 font-medium text-silver-100 border-r border-silver-700 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.6)] whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]"
                    title={row.graduateName}
                  >
                    <button
                      onClick={() => handleRowNavigate(row.graduateId)}
                      className="text-left hover:text-gold-400 hover:underline transition-colors focus:outline-none focus:text-gold-400"
                    >
                      {row.graduateName}
                    </button>
                  </td>

                  {/* Adultos */}
                  <td className="px-3 py-2 text-center font-mono text-silver-200">
                    {row.adultsCount}
                  </td>

                  {/* Niños 4-11 */}
                  <td className="px-3 py-2 text-center font-mono text-silver-200">
                    {row.childrenCount > 0 ? (
                      row.childrenCount
                    ) : (
                      <span className="text-silver-600 font-mono">0</span>
                    )}
                  </td>

                  {/* Sin cena */}
                  <td className="px-3 py-2 text-center font-mono text-silver-200">
                    {row.noDinnerCount > 0 ? (
                      <span className="text-amber-400 font-semibold">{row.noDinnerCount}</span>
                    ) : (
                      <span className="text-silver-600 font-mono">0</span>
                    )}
                  </td>

                  {/* Abonos */}
                  <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px]">
                    {row.abonosList.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedAbonosRow(row)}
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
                  <td className="px-3 py-2 text-right font-mono text-silver-100 whitespace-nowrap">
                    {formatCurrencyMXN(row.totalToPay)}
                  </td>

                  {/* Total abonado */}
                  <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                    {formatCurrencyMXN(row.totalPaid)}
                  </td>

                  {/* Saldo pendiente */}
                  <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
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
                  <td className="px-3 py-2 text-center font-mono text-silver-200">
                    {row.vegetarianCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                        {row.vegetarianCount}
                      </span>
                    ) : (
                      <span className="text-silver-600 font-mono">0</span>
                    )}
                  </td>

                  {/* Veganos */}
                  <td className="px-3 py-2 text-center font-mono text-silver-200">
                    {row.veganCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 font-bold">
                        {row.veganCount}
                      </span>
                    ) : (
                      <span className="text-silver-600 font-mono">0</span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Mobile detail button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden text-silver-400 hover:text-gold-400 px-1.5"
                        onClick={() => setMobileDetailRow(row)}
                        title="Ver fila completa en modal"
                      >
                        Detalle
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-silver-400 hover:text-gold-400 hover:bg-obsidian-800 px-2 py-1 text-xs"
                        onClick={() => handleRowNavigate(row.graduateId)}
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
          <tfoot className="sticky bottom-0 z-30 bg-obsidian-950 font-semibold border-t-2 border-silver-700 text-xs shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
            <tr className="h-10">
              {/* Frozen Column 1: Mesa Label */}
              <td
                className="sticky left-0 z-30 bg-obsidian-950 px-3 py-2 uppercase font-bold tracking-wider text-gold-400 border-r border-silver-800/80 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.3)]"
              >
                TOTALES
              </td>

              {/* Frozen Column 2: Contracts Count */}
              <td
                className="sticky left-[96px] z-30 bg-obsidian-950 px-3 py-2 font-mono text-xs text-silver-200 whitespace-nowrap border-r border-silver-800/80 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.3)]"
              >
                {totals.contractsCount} contratos
              </td>

              {/* Frozen Column 3: Spacer */}
              <td
                className="sticky left-[240px] z-30 bg-obsidian-950 px-3.5 py-2 text-silver-500 border-r border-silver-700 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.6)]"
              >
                —
              </td>

              {/* Adultos Total */}
              <td className="px-3 py-2 text-center font-mono font-bold text-silver-100">
                {totals.adultsTotal}
              </td>

              {/* Niños Total */}
              <td className="px-3 py-2 text-center font-mono font-bold text-silver-100">
                {totals.childrenTotal}
              </td>

              {/* Sin cena Total */}
              <td className="px-3 py-2 text-center font-mono font-bold text-silver-100">
                {totals.noDinnerTotal}
              </td>

              {/* Abonos Spacer */}
              <td className="px-3 py-2 text-silver-500 font-mono text-[11px]">
                —
              </td>

              {/* Total a pagar sum */}
              <td className="px-3 py-2 text-right font-mono font-bold text-silver-100 whitespace-nowrap">
                {formatCurrencyMXN(totals.totalToPay)}
              </td>

              {/* Total abonado sum */}
              <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                {formatCurrencyMXN(totals.totalPaid)}
              </td>

              {/* Saldo pendiente sum */}
              <td className="px-3 py-2 text-right font-mono font-bold text-silver-100 whitespace-nowrap">
                {formatCurrencyMXN(totals.totalPending)}
              </td>

              {/* Vegetarianos Total */}
              <td className="px-3 py-2 text-center font-mono font-bold text-silver-100">
                {totals.vegetarianTotal}
              </td>

              {/* Veganos Total */}
              <td className="px-3 py-2 text-center font-mono font-bold text-silver-100">
                {totals.veganTotal}
              </td>

              {/* Acciones Spacer */}
              <td className="px-3 py-2 text-center text-silver-500">
                —
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

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
                <span className="font-mono text-gold-400">{mobileDetailRow.contractFolio}</span>
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
