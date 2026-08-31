import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Icon } from '../../../design-system';
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
        g.fullName.toLowerCase().includes(search.trim().toLowerCase());
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
    <Card>
      {/* Toolbar */}
      <div className="p-4 border-b border-surface-low bg-surface-lowest rounded-t-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-navy-900">Graduados</h3>
          <Badge variant="neutral" size="sm">
            {graduates.length} {graduates.length === 1 ? 'registro' : 'registros'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none">
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre…"
              className="h-9 w-full rounded-xl border border-surface-highest bg-surface-lowest text-sm pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 text-content-primary placeholder:text-content-muted"
              aria-label="Buscar por nombre"
            />
          </div>
          {/* Filters */}
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`h-9 px-3 rounded-full text-xs font-semibold border transition-colors ${
                filter === opt.value
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-surface-lowest text-content-secondary border-surface-highest hover:border-navy-600 hover:text-navy-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-low text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
              <th className="px-4 py-3">Graduado</th>
              <th className="px-4 py-3">Personalización conocida</th>
              <th className="px-4 py-3 hidden sm:table-cell">Avance financiero</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-low">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-content-secondary">
                  No hay graduados que coincidan con los filtros aplicados.
                </td>
              </tr>
            )}
            {filtered.map((grad) => {
              const statusLabel = getThermoStatusLabel(grad.thermoStatus);
              const badgeVariant = getThermoBadgeVariant(grad.thermoStatus);

              return (
                <tr
                  key={grad.graduateId}
                  className="hover:bg-surface-lowest/60 transition-colors"
                  data-testid={`thermo-row-${grad.graduateId}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {getInitials(grad.fullName)}
                      </div>
                      <div>
                        <span className="font-semibold text-navy-900 text-sm block">
                          {grad.fullName}
                        </span>
                        {grad.career && (
                          <span className="text-xs text-content-muted block">
                            {grad.career}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {grad.customName ? (
                      <span className="text-xs font-semibold text-navy-900 bg-surface-low px-2 py-1 rounded-md border border-surface-high">
                        {grad.customName}
                      </span>
                    ) : (
                      <span className="text-xs text-content-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {grad.progressPercentage !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-navy-900">
                          {grad.progressPercentage}%
                        </span>
                        <span className="text-xs text-content-muted">pagado</span>
                      </div>
                    ) : (
                      <span className="text-xs text-content-muted" title="Sin dato financiero disponible">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={badgeVariant} size="sm">
                        {statusLabel}
                      </Badge>
                      {grad.hasLocalPreview && (
                        <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          vista previa
                        </span>
                      )}
                    </div>
                  </td>
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
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
