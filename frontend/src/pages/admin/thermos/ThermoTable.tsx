import React, { useState, useMemo } from 'react';
import { Badge, Button, Search } from '../../../design-system';
import type {
  GraduateThermoViewModel,
  ThermoOperationalFilter,
} from './thermoViewModel';
import {
  getThermoStatusLabel,
  getThermoBadgeVariant,
  buildThermoFilterCounts,
} from './thermoViewModel';

export interface ThermoTableProps {
  graduates: GraduateThermoViewModel[];
  onViewDetail: (graduateId: string) => void;
  onOpenDeliveryList: () => void;
}

export const ThermoTable: React.FC<ThermoTableProps> = ({
  graduates,
  onViewDetail,
  onOpenDeliveryList,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ThermoOperationalFilter>('ALL');

  const counts = useMemo(() => buildThermoFilterCounts(graduates), [graduates]);

  const filterChips: { key: ThermoOperationalFilter; label: string; count: number }[] = [
    { key: 'ALL', label: 'Todos', count: counts.total },
    { key: 'AVAILABLE', label: 'Disponibles', count: counts.disponibles },
    { key: 'REQUESTED', label: 'Solicitados', count: counts.solicitados },
    { key: 'IN_PRODUCTION', label: 'En producción', count: counts.enProduccion },
    { key: 'DELIVERED', label: 'Entregados', count: counts.entregados },
    { key: 'LOCKED', label: 'Bloqueados', count: counts.bloqueados },
  ];

  const filtered = useMemo(() => {
    return graduates.filter((g) => {
      const term = search.trim().toLowerCase();
      const matchSearch =
        term === '' ||
        g.fullName.toLowerCase().includes(term) ||
        (Boolean(g.contractFolio) && g.contractFolio.toLowerCase().includes(term));

      const matchFilter =
        selectedFilter === 'ALL' || g.thermoStatus === selectedFilter;

      return matchSearch && matchFilter;
    });
  }, [graduates, search, selectedFilter]);

  return (
    <div className="font-sans space-y-4">
      {/* First Layer Toolbar: Search, Delivery List CTA, Operational Filter Chips */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-md">
            <Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar folio o nombre"
              aria-label="Buscar folio o nombre"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={onOpenDeliveryList}
            >
              Lista de entrega
            </Button>
          </div>
        </div>

        {/* Operational Filter Chips */}
        <div
          role="group"
          aria-label="Filtros operativos de termos"
          className="flex items-center gap-2 flex-wrap"
        >
          {filterChips.map((chip) => {
            const isActive = selectedFilter === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                aria-label={`${chip.label} (${chip.count})`}
                onClick={() => setSelectedFilter(chip.key)}
                className={`h-9 px-3.5 rounded-full text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gold-500 text-obsidian-950 border-gold-500 shadow-sm'
                    : 'bg-obsidian-900 text-silver-400 border-silver-800 hover:border-silver-700 hover:text-silver-200'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-obsidian-950/20 text-obsidian-950'
                      : 'bg-obsidian-800 text-silver-400'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="p-8 text-center rounded-xl border border-silver-800/80 bg-obsidian-900/40 text-silver-400 text-sm">
          No se encontraron termos con los filtros aplicados.
        </div>
      )}

      {/* Desktop Dense Table (hidden on mobile) */}
      {filtered.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-xl border border-silver-800/80 bg-obsidian-900/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-obsidian-900 text-[11px] font-semibold text-silver-400 uppercase tracking-wider border-b border-silver-800">
                <th className="px-4 py-3 w-32">Folio</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 w-32">Mesa</th>
                <th className="px-4 py-3">Personalización</th>
                <th className="px-4 py-3 w-36">Estado</th>
                <th className="px-4 py-3 text-right w-28">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silver-800/60 text-silver-200">
              {filtered.map((grad) => {
                const statusLabel = getThermoStatusLabel(grad.thermoStatus);
                const badgeVariant = getThermoBadgeVariant(grad.thermoStatus);

                return (
                  <tr
                    key={grad.graduateId}
                    className="hover:bg-obsidian-800/40 transition-colors"
                    data-testid={`thermo-row-${grad.graduateId}`}
                  >
                    {/* 1. Folio */}
                    <td className="px-4 py-3 font-mono font-bold text-gold-400 whitespace-nowrap">
                      {grad.contractFolio || '—'}
                    </td>

                    {/* 2. Nombre */}
                    <td className="px-4 py-3 font-bold text-silver-100">
                      {grad.fullName}
                    </td>

                    {/* 3. Mesa */}
                    <td className="px-4 py-3 font-medium text-silver-300 whitespace-nowrap">
                      {grad.tableSummary}
                    </td>

                    {/* 4. Personalización */}
                    <td className="px-4 py-3">
                      {grad.customName ? (
                        <span className="font-semibold text-silver-100 bg-obsidian-900 px-2 py-1 rounded border border-silver-800 inline-block">
                          "{grad.customName}"
                        </span>
                      ) : (
                        <span className="text-silver-500 italic">—</span>
                      )}
                    </td>

                    {/* 5. Estado */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={badgeVariant} size="sm">
                        {statusLabel}
                      </Badge>
                    </td>

                    {/* 6. Acción */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewDetail(grad.graduateId)}
                        iconEnd="chevron-right"
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Vertical Dense List (no horizontal scroll) */}
      {filtered.length > 0 && (
        <div className="md:hidden flex flex-col gap-2.5" data-testid="thermo-mobile-list">
          {filtered.map((grad) => {
            const statusLabel = getThermoStatusLabel(grad.thermoStatus);
            const badgeVariant = getThermoBadgeVariant(grad.thermoStatus);

            return (
              <div
                key={grad.graduateId}
                className="p-3.5 rounded-xl border border-silver-800/80 bg-obsidian-900/80 flex flex-col gap-2"
                data-testid={`thermo-mobile-item-${grad.graduateId}`}
              >
                {/* Top Row: Folio + Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-gold-400">
                    {grad.contractFolio || '—'}
                  </span>
                  <Badge variant={badgeVariant} size="sm">
                    {statusLabel}
                  </Badge>
                </div>

                {/* Middle Row: Name + Table */}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-silver-100">
                    {grad.fullName}
                  </span>
                  <span className="text-xs text-silver-400 font-medium">
                    {grad.tableSummary}
                  </span>
                </div>

                {/* Personalization (if present) */}
                {grad.customName && (
                  <div className="text-xs text-gold-300 font-medium bg-obsidian-950 px-2 py-1 rounded border border-silver-850">
                    "{grad.customName}"
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-1 border-t border-silver-850">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => onViewDetail(grad.graduateId)}
                  >
                    Ver detalle
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
