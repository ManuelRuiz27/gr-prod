import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Icon } from '../../../design-system';
import type { GraduateMealViewModel, CaptureStatus } from './mealViewModel';

interface GraduateMealsTableProps {
  graduates: GraduateMealViewModel[];
  onViewDetail: (graduateId: string) => void;
}

type FilterValue = 'all' | 'Con información' | 'Sin información';

const captureStatusBadgeVariant = (
  status: CaptureStatus
): 'success' | 'neutral' => {
  switch (status) {
    case 'Con información':
      return 'success';
    case 'Sin información':
    default:
      return 'neutral';
  }
};

/**
 * GraduateMealsTable — List panel for UX-A-MEAL-001.
 * Shows event-scoped graduates with known meal selection info.
 */
export const GraduateMealsTable: React.FC<GraduateMealsTableProps> = ({
  graduates,
  onViewDetail,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');

  const filtered = useMemo(() => {
    return graduates
      .filter((g) => {
        const matchSearch =
          search.trim() === '' ||
          g.fullName.toLowerCase().includes(search.trim().toLowerCase());
        const matchFilter =
          filter === 'all' || g.captureStatus === filter;
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

  const filterOptions: { value: FilterValue; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'Con información', label: 'Con información' },
    { value: 'Sin información', label: 'Sin información' },
  ];

  return (
    <Card>
      {/* Toolbar */}
      <div className="p-4 border-b border-surface-low bg-surface-lowest rounded-t-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-navy-900">Graduados</h3>
          <Badge variant="neutral" size="sm">{graduates.length} registros</Badge>
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
              <th className="px-4 py-3 hidden sm:table-cell">Carrera</th>
              <th className="px-4 py-3">Integrantes conocidos</th>
              <th className="px-4 py-3 hidden md:table-cell">Estado de captura</th>
              <th className="px-4 py-3 text-right">Acciones</th>
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
            {filtered.map((grad) => (
              <tr
                key={grad.graduateId}
                className="hover:bg-surface-lowest/60 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitials(grad.fullName)}
                    </div>
                    <span className="font-semibold text-navy-900 text-sm">
                      {grad.fullName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-sm text-content-secondary">
                  {grad.career ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-navy-900">
                      {grad.knownGuests.length}
                    </span>
                    <span className="text-xs text-content-muted">
                      {grad.knownGuests.length === 1
                        ? 'integrante conocido'
                        : 'integrantes conocidos'}
                    </span>
                  </div>
                  {/* Mini meal dots */}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {grad.knownGuests.slice(0, 8).map((guest) => (
                      <span
                        key={guest.id}
                        title={`${guest.name}: ${guest.mealName}`}
                        className="w-5 h-5 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center text-[9px] font-bold"
                      >
                        {guest.mealName ? guest.mealName[0] : '?'}
                      </span>
                    ))}
                    {grad.knownGuests.length > 8 && (
                      <span className="text-[11px] text-content-muted self-center">
                        +{grad.knownGuests.length - 8}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge
                    variant={captureStatusBadgeVariant(grad.captureStatus)}
                    size="sm"
                  >
                    {grad.captureStatus}
                  </Badge>
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
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
