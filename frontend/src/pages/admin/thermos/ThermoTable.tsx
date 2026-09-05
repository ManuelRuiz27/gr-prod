import React, { useState, useMemo } from 'react';
import { Badge, Button, Search } from '../../../design-system';
import type {
  GraduateThermoViewModel,
  ThermoStatusFilter,
} from './thermoViewModel';
import {
  getThermoStatusLabel,
  getThermoBadgeVariant,
} from './thermoViewModel';

interface ThermoTableProps {
  graduates: GraduateThermoViewModel[];
  onViewDetail: (graduateId: string) => void;
}

export const ThermoTable: React.FC<ThermoTableProps> = ({
  graduates,
  onViewDetail,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ThermoStatusFilter>('ALL');

  const filtered = useMemo(() => {
    return graduates.filter((g) => {
      const matchSearch =
        search.trim() === '' ||
        g.fullName.toLowerCase().includes(search.trim().toLowerCase()) ||
        g.contractFolio.toLowerCase().includes(search.trim().toLowerCase()) ||
        (g.career && g.career.toLowerCase().includes(search.trim().toLowerCase()));
      const matchFilter = filter === 'ALL' || g.baseStatus === filter;
      return matchSearch && matchFilter;
    });
  }, [graduates, search, filter]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const filterOptions: { value: ThermoStatusFilter; label: string }[] = [
    { value: 'ALL', label: 'Todos' },
    { value: 'LOCKED', label: 'Bloqueados' },
    { value: 'AVAILABLE', label: 'Disponibles' },
    { value: 'REQUESTED', label: 'Solicitados' },
    { value: 'IN_PRODUCTION', label: 'En producción' },
    { value: 'DELIVERED', label: 'Entregados' },
  ];

  return (
    <div className="bg-obsidian-850 border border-silver-800/80 font-sans p-0 overflow-hidden rounded-lg">
      {/* Toolbar */}
      <div className="p-4 border-b border-silver-800/80 bg-obsidian-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-silver-100">Graduados</h3>
          <Badge variant="neutral" size="sm">
            {graduates.length} {graduates.length === 1 ? 'registro' : 'registros'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Search */}
          <div className="min-w-[220px]">
            <Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, carrera o folio…"
            />
          </div>
          {/* Filters */}
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`h-9 px-3 rounded-full text-xs font-semibold border transition-colors ${
                filter === opt.value
                  ? 'bg-gold-500 text-obsidian-950 border-gold-500'
                  : 'bg-obsidian-900 text-silver-400 border-silver-800 hover:border-silver-700 hover:text-silver-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table: 7 Normative Columns */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-obsidian-900 text-[11px] font-semibold text-silver-400 uppercase tracking-wider border-b border-silver-800">
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Graduado</th>
              <th className="px-4 py-3">Mesa</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Personalización</th>
              <th className="px-4 py-3">Entrega</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-silver-800/60 text-silver-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-silver-400">
                  No hay graduados que coincidan con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map((grad) => {
                const statusLabel = getThermoStatusLabel(grad.thermoStatus);
                const badgeVariant = getThermoBadgeVariant(grad.thermoStatus);

                return (
                  <tr
                    key={grad.graduateId}
                    className="hover:bg-obsidian-800/50 transition-colors"
                    data-testid={`thermo-row-${grad.graduateId}`}
                  >
                    {/* 1. Folio */}
                    <td className="px-4 py-3 font-mono font-bold text-gold-400">
                      {grad.contractFolio}
                    </td>

                    {/* 2. Graduado */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-obsidian-800 border border-silver-700 text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(grad.fullName)}
                        </div>
                        <div>
                          <span className="font-bold text-silver-100 block text-sm">
                            {grad.fullName}
                          </span>
                          {grad.career && (
                            <span className="text-[11px] text-silver-400 block">
                              {grad.career}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 3. Mesa */}
                    <td className="px-4 py-3 font-medium text-silver-300">
                      {grad.tableSummary}
                    </td>

                    {/* 4. Estado */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={badgeVariant} size="sm">
                          {statusLabel}
                        </Badge>
                        {grad.hasLocalPreview && (
                          <span className="text-[10px] text-status-warning font-semibold bg-obsidian-900 px-1.5 py-0.5 rounded border border-status-warning/40">
                            vista previa
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Personalización */}
                    <td className="px-4 py-3">
                      {grad.customName ? (
                        <span className="font-semibold text-silver-100 bg-obsidian-900 px-2 py-1 rounded border border-silver-800">
                          {grad.customName}
                        </span>
                      ) : (
                        <span className="text-silver-500 italic">—</span>
                      )}
                    </td>

                    {/* 6. Entrega */}
                    <td className="px-4 py-3">
                      {grad.deliveryStatus === 'Entregado' ? (
                        <Badge variant="success" size="sm">
                          Entregado {grad.deliveredAt ? `(${grad.deliveredAt})` : ''}
                        </Badge>
                      ) : (
                        <span className="text-silver-400 text-xs">Pendiente</span>
                      )}
                    </td>

                    {/* 7. Acción */}
                    <td className="px-4 py-3 text-right">
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
