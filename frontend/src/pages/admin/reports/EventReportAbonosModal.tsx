import React, { useEffect, useRef } from 'react';
import type { EventSpreadsheetRow } from './eventSpreadsheetViewModel';
import { formatCurrencyMXN } from './eventSpreadsheetViewModel';
import { Button } from '../../../design-system';

interface EventReportAbonosModalProps {
  row: EventSpreadsheetRow | null;
  onClose: () => void;
}

export const EventReportAbonosModal: React.FC<EventReportAbonosModalProps> = ({ row, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!row) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="abonos-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-obsidian-900 border border-silver-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-scaleIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-silver-800 bg-obsidian-900">
          <div>
            <h3 id="abonos-modal-title" className="text-base font-bold text-silver-100 font-display">
              Detalle de abonos
            </h3>
            <p className="text-xs text-silver-400 mt-0.5">
              {row.graduateName} · Contrato: <span className="font-mono text-silver-300">{row.contractFolio}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-silver-400 hover:text-silver-200 p-1.5 rounded-lg hover:bg-obsidian-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Table */}
        <div className="p-5 overflow-y-auto flex-1 font-sans">
          {row.abonosList.length === 0 ? (
            <div className="text-center py-8 text-silver-400 text-sm">
              No hay abonos registrados para este graduado.
            </div>
          ) : (
            <div className="border border-silver-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-obsidian-950 text-silver-400 uppercase font-semibold text-[10px] tracking-wider border-b border-silver-800">
                  <tr>
                    <th className="px-3.5 py-2.5">Fecha</th>
                    <th className="px-3.5 py-2.5 text-right">Importe</th>
                    <th className="px-3.5 py-2.5">Método</th>
                    <th className="px-3.5 py-2.5">Folio / Ref</th>
                    <th className="px-3.5 py-2.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-silver-800/60 font-mono">
                  {row.abonosList.map((abono) => (
                    <tr key={abono.id} className="hover:bg-obsidian-850/50">
                      <td className="px-3.5 py-2.5 text-silver-300 whitespace-nowrap">{abono.date}</td>
                      <td className="px-3.5 py-2.5 text-right text-emerald-400 font-semibold whitespace-nowrap">
                        {formatCurrencyMXN(abono.amount)}
                      </td>
                      <td className="px-3.5 py-2.5 text-silver-300 capitalize">{abono.method.toLowerCase()}</td>
                      <td className="px-3.5 py-2.5 text-silver-400 text-[11px] truncate max-w-[120px]" title={abono.reference}>
                        {abono.reference}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <span className="px-2 py-0.5 text-[10px] rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {abono.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Financial Summary card inside modal */}
          <div className="mt-4 grid grid-cols-3 gap-2.5 p-3 bg-obsidian-950/60 rounded-lg border border-silver-800 text-xs">
            <div>
              <span className="text-silver-400 text-[11px] block">Total a pagar:</span>
              <span className="font-mono font-semibold text-silver-200">{formatCurrencyMXN(row.totalToPay)}</span>
            </div>
            <div>
              <span className="text-silver-400 text-[11px] block">Total abonado:</span>
              <span className="font-mono font-semibold text-emerald-400">{formatCurrencyMXN(row.totalPaid)}</span>
            </div>
            <div>
              <span className="text-silver-400 text-[11px] block">Saldo pendiente:</span>
              <span className="font-mono font-semibold text-silver-100">
                {row.isLiquidated ? 'Liquidado' : formatCurrencyMXN(row.pendingBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-silver-800 bg-obsidian-900/60 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
