import React from 'react';
import { Button } from '../../../design-system';
import type { GraduateThermoViewModel } from './thermoViewModel';
import { sortGraduatesForDelivery } from './thermoViewModel';

export interface ThermoDeliveryListProps {
  eventName: string;
  eventVenue?: string;
  eventDate?: string;
  graduates: GraduateThermoViewModel[];
  onClose: () => void;
}

export const ThermoDeliveryList: React.FC<ThermoDeliveryListProps> = ({
  eventName,
  eventVenue,
  eventDate,
  graduates,
  onClose,
}) => {
  const sortedGraduates = sortGraduatesForDelivery(graduates);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-sans pb-16" data-testid="thermo-delivery-list">
      {/* Screen-only Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <button
            onClick={onClose}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-silver-400 hover:text-silver-100 transition-colors mb-2 cursor-pointer"
            aria-label="Volver a termos"
          >
            ← Volver a termos
          </button>
          <h2 className="text-xl font-bold font-display text-silver-50">
            Lista de entrega de termos
          </h2>
          <p className="text-xs text-silver-400 mt-0.5">
            {eventName} {eventVenue ? `• ${eventVenue}` : ''} {eventDate ? `• ${eventDate}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar vista
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint}>
            Imprimir lista
          </Button>
        </div>
      </div>

      {/* Print-visible Title Header */}
      <div className="hidden print:block mb-4 text-black border-b border-black pb-3">
        <h1 className="text-xl font-bold uppercase tracking-tight">Lista de entrega — Termos Conmemorativos</h1>
        <p className="text-xs mt-1">
          Evento: <strong>{eventName}</strong> {eventVenue ? `| Lugar: ${eventVenue}` : ''} {eventDate ? `| Fecha: ${eventDate}` : ''}
        </p>
        <p className="text-[11px] text-gray-600 mt-0.5">
          Total de registros: {sortedGraduates.length} • Ordenado por mesa y nombre de graduado
        </p>
      </div>

      {/* Printable Delivery Table */}
      <div className="overflow-x-auto rounded-lg border border-silver-800/80 bg-obsidian-900/70 print:bg-white print:border-black print:text-black">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-obsidian-900 text-[11px] font-semibold text-silver-400 uppercase tracking-wider border-b border-silver-800 print:bg-gray-100 print:text-black print:border-black">
              <th className="px-4 py-3 w-24">Mesa</th>
              <th className="px-4 py-3 w-28">Folio</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Información disponible</th>
              <th className="px-4 py-3">Personalización</th>
              <th className="px-4 py-3 w-64">Firma de recibido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-silver-800/60 text-silver-200 print:divide-black print:text-black">
            {sortedGraduates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-silver-400 print:text-black">
                  No hay graduados registrados para este evento.
                </td>
              </tr>
            ) : (
              sortedGraduates.map((grad) => (
                <tr
                  key={grad.graduateId}
                  className="hover:bg-obsidian-800/40 print:hover:bg-transparent transition-colors"
                  data-testid={`delivery-row-${grad.graduateId}`}
                >
                  {/* 1. Mesa */}
                  <td className="px-4 py-3 font-semibold text-silver-100 print:text-black whitespace-nowrap">
                    {grad.tableSummary}
                  </td>

                  {/* 2. Folio */}
                  <td className="px-4 py-3 font-mono font-bold text-gold-400 print:text-black whitespace-nowrap">
                    {grad.contractFolio || '—'}
                  </td>

                  {/* 3. Nombre */}
                  <td className="px-4 py-3 font-bold text-silver-100 print:text-black whitespace-nowrap">
                    {grad.fullName}
                  </td>

                  {/* 4. Información de registro disponible */}
                  <td className="px-4 py-3 text-silver-300 print:text-black text-xs">
                    {grad.registrationInfo}
                  </td>

                  {/* 5. Personalización */}
                  <td className="px-4 py-3">
                    {grad.customName ? (
                      <span className="font-semibold text-silver-100 print:text-black">
                        "{grad.customName}"
                      </span>
                    ) : (
                      <span className="text-silver-500 print:text-gray-400 italic">—</span>
                    )}
                  </td>

                  {/* 6. Firma de recibido */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-silver-400 print:text-black text-xs">
                      Firma de recibido: __________________
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="hidden print:block mt-8 text-[11px] text-gray-500 text-center">
        Plataforma GR • Control operativo de entrega en evento físico
      </div>
    </div>
  );
};
