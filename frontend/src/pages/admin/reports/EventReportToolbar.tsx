import React from 'react';
import type { SpreadsheetFilterState } from './eventSpreadsheetViewModel';
import { Button } from '../../../design-system';

interface EventReportToolbarProps {
  filters: SpreadsheetFilterState;
  onFilterChange: (filters: SpreadsheetFilterState) => void;
  availableTables: number[];
  totalRowsCount: number;
  filteredRowsCount: number;
}

export const EventReportToolbar: React.FC<EventReportToolbarProps> = ({
  filters,
  onFilterChange,
  availableTables,
  totalRowsCount,
  filteredRowsCount,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.tableFilter !== 'ALL' ||
    filters.financialStatusFilter !== 'ALL' ||
    filters.balanceFilter !== 'ALL' ||
    filters.dietFilter !== 'ALL';

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: '',
      tableFilter: 'ALL',
      financialStatusFilter: 'ALL',
      balanceFilter: 'ALL',
      dietFilter: 'ALL',
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-obsidian-900 border border-silver-800 rounded-lg font-sans">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-silver-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Buscar por nombre, contrato o mesa…"
          className="w-full pl-9 pr-8 py-1.5 text-xs bg-obsidian-950 border border-silver-750 rounded-md text-silver-100 placeholder-silver-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-colors"
          aria-label="Buscar por nombre, contrato o mesa"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-silver-500 hover:text-silver-300"
            aria-label="Borrar búsqueda"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Filters Container */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Table Filter */}
        <select
          value={filters.tableFilter}
          onChange={(e) => onFilterChange({ ...filters, tableFilter: e.target.value })}
          aria-label="Filtrar por mesa"
          className="bg-obsidian-950 border border-silver-750 rounded-md px-2.5 py-1.5 text-xs text-silver-200 focus:outline-none focus:border-gold-500 transition-colors"
        >
          <option value="ALL">Todas las mesas</option>
          <option value="without_table">Sin mesa asignada</option>
          {availableTables.map((num) => (
            <option key={num} value={String(num)}>
              Mesa {num}
            </option>
          ))}
        </select>

        {/* Financial Status Filter */}
        <select
          value={filters.financialStatusFilter}
          onChange={(e) => onFilterChange({ ...filters, financialStatusFilter: e.target.value })}
          aria-label="Filtrar por estado financiero"
          className="bg-obsidian-950 border border-silver-750 rounded-md px-2.5 py-1.5 text-xs text-silver-200 focus:outline-none focus:border-gold-500 transition-colors"
        >
          <option value="ALL">Todos los estados</option>
          <option value="AL_DIA">Al corriente</option>
          <option value="ATRASADO">Atrasado</option>
          <option value="LIQUIDADO">Liquidado</option>
          <option value="PRORROGA">Prórroga</option>
        </select>

        {/* Balance Filter */}
        <select
          value={filters.balanceFilter}
          onChange={(e) => onFilterChange({ ...filters, balanceFilter: e.target.value })}
          aria-label="Filtrar por saldo pendiente o liquidado"
          className="bg-obsidian-950 border border-silver-750 rounded-md px-2.5 py-1.5 text-xs text-silver-200 focus:outline-none focus:border-gold-500 transition-colors"
        >
          <option value="ALL">Todos los saldos</option>
          <option value="pending">Con saldo pendiente</option>
          <option value="liquidated">Liquidado ($0.00)</option>
        </select>

        {/* Dietary / Special Meals Filter */}
        <select
          value={filters.dietFilter}
          onChange={(e) => onFilterChange({ ...filters, dietFilter: e.target.value })}
          aria-label="Filtrar por requerimiento dietético o platillo especial"
          className="bg-obsidian-950 border border-silver-750 rounded-md px-2.5 py-1.5 text-xs text-silver-200 focus:outline-none focus:border-gold-500 transition-colors"
        >
          <option value="ALL">Todos los platillos</option>
          <option value="any_special">Cualquier platillo especial</option>
          <option value="vegetarian">Vegetarianos (&gt;0)</option>
          <option value="vegan">Veganos (&gt;0)</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-silver-400 hover:text-silver-100 hover:bg-obsidian-800"
            title="Restablecer todos los filtros"
          >
            Limpiar filtros
          </Button>
        )}

        {/* Results Counter */}
        <div className="ml-auto md:ml-2 text-[11px] text-silver-400 whitespace-nowrap font-mono pl-1">
          {filteredRowsCount === totalRowsCount ? (
            <span>{totalRowsCount} registros</span>
          ) : (
            <span>
              <strong className="text-gold-400">{filteredRowsCount}</strong> de {totalRowsCount} registros
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
