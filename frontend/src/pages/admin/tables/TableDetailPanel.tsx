import React, { useState } from 'react';
import {
  Button,
  Badge,
  Icon,
} from '../../../design-system';
import { type SeatingTableViewModel, calculateTableOccupancy } from './seatingCoordinates';

export interface TableDetailPanelProps {
  table: SeatingTableViewModel;
  onClose: () => void;
  onOpenEdit: () => void;
  onOpenAssign: () => void;
  onToggleBlock: () => void;
  onDuplicate: () => void;
  onDelete?: () => void;
  className?: string;
}

export const TableDetailPanel: React.FC<TableDetailPanelProps> = ({
  table,
  onClose,
  onOpenEdit,
  onOpenAssign,
  onToggleBlock,
  onDuplicate,
  onDelete,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const stats = calculateTableOccupancy(table);
  const isBlocked = table.status === 'BLOCKED';

  const getStatusBadge = () => {
    if (isBlocked) {
      return <Badge variant="error" size="sm">Bloqueada</Badge>;
    }
    if (stats.isFull) {
      return <Badge variant="neutral" size="sm">Completa</Badge>;
    }
    if (stats.occupied > 0) {
      return <Badge variant="warning" size="sm">Parcial ({stats.percentage}%)</Badge>;
    }
    return <Badge variant="success" size="sm">Disponible</Badge>;
  };

  // Modo minimizado: Barra flotante compacta de una sola línea (no obstruye el croquis)
  if (isCollapsed) {
    return (
      <aside
        className={`w-full max-w-xs sm:w-80 bg-obsidian-900/90 backdrop-blur-xl border border-silver-800/80 rounded-xl px-3 py-2 shadow-2xl flex items-center justify-between gap-2 font-sans text-xs animate-fadeIn ${className}`}
        aria-label={`Detalle de Mesa ${table.number}`}
      >
        <div
          className="flex items-center gap-2 cursor-pointer min-w-0"
          onClick={() => setIsCollapsed(false)}
          title="Clic para expandir detalles"
        >
          <span className="font-bold text-silver-50 shrink-0">Mesa {table.number}</span>
          <span className="text-[11px] text-silver-400 truncate hidden sm:inline">
            {table.shape === 'SQUARE' ? 'Mesa Cuadrada' : 'Mesa Circular'}
          </span>
          {getStatusBadge()}
          <span className="text-silver-300 font-sans text-[11px] shrink-0">
            {stats.occupied}/{table.capacity} <span className="text-silver-400">({stats.available} libres)</span>
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="px-2 py-0.5 rounded text-[11px] font-medium text-silver-300 hover:bg-obsidian-800 hover:text-silver-100 transition-colors"
            title="Expandir panel"
          >
            Expandir
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-silver-400 hover:bg-obsidian-800 hover:text-silver-100 transition-colors"
            aria-label="Cerrar detalle"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </aside>
    );
  }

  // Modo expandido: Panel limpio y tipográfico sin cards anidadas
  return (
    <aside
      className={`w-full max-w-sm sm:w-80 bg-obsidian-900/90 backdrop-blur-xl border border-silver-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn font-sans ${className}`}
      aria-label={`Detalle de Mesa ${table.number}`}
    >
      {/* Header sobrio y directo */}
      <div className="p-3.5 border-b border-silver-800/60 flex items-start justify-between gap-3 bg-obsidian-950/40">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {getStatusBadge()}
            <span className="text-[11px] font-medium text-silver-400">
              {table.shape === 'SQUARE' ? 'Mesa Cuadrada' : 'Mesa Circular'}
            </span>
          </div>
          <h3 className="text-xl font-bold font-display text-silver-50 tracking-tight">
            Mesa {table.number}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-lg text-silver-400 hover:bg-obsidian-800 hover:text-silver-200 transition-colors"
            title="Minimizar panel a barra compacta"
            aria-label="Minimizar panel"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-silver-400 hover:bg-obsidian-800 hover:text-silver-100 transition-colors"
            aria-label="Cerrar detalle"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>

      {/* Métricas tipográficas continuas (Sin cards / sin bento boxes) */}
      <div className="p-3.5 border-b border-silver-800/50 space-y-2.5">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-silver-400 block font-medium">Capacidad Total</span>
            <span className="text-lg font-bold text-silver-50 font-sans mt-0.5 block">
              {table.capacity} <span className="text-xs font-normal text-silver-400">lugares</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-silver-400 block font-medium">Capacidad Libre</span>
            <span
              className={`text-lg font-bold font-sans mt-0.5 block ${
                stats.available > 0 ? 'text-status-success' : 'text-silver-400'
              }`}
            >
              {stats.available} <span className="text-xs font-normal text-silver-400">libres</span>
            </span>
          </div>
        </div>

        {/* Barra de progreso de ocupación sutil */}
        <div className="pt-0.5">
          <div className="flex justify-between text-[11px] text-silver-400 mb-1">
            <span className="font-medium">Ocupación</span>
            <span className="font-sans font-semibold text-silver-200">
              {isBlocked
                ? `${stats.occupied} de ${table.capacity} (Bloqueada)`
                : `${stats.occupied} de ${table.capacity} (${stats.percentage}%)`}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-obsidian-950 overflow-hidden border border-silver-800/70">
            <div
              className={`h-full transition-all duration-300 ${
                isBlocked
                  ? 'bg-status-error'
                  : stats.isFull
                  ? 'bg-silver-400'
                  : stats.occupied > 0
                  ? 'bg-gold-500'
                  : 'bg-transparent'
              }`}
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        {/* Aviso de bloqueo inline */}
        {isBlocked && (
          <div className="text-xs text-status-error flex items-start gap-1.5 pt-1">
            <Icon name="alert" size={14} className="text-status-error shrink-0 mt-0.5" />
            <p className="text-[11px] text-silver-300 leading-snug">
              No disponible para nuevas asignaciones ({stats.available} lugares físicos libres).
            </p>
          </div>
        )}
      </div>

      {/* Lista de Asignaciones limpia y continua (Sin cards) */}
      <div className="flex-1 p-3.5 overflow-y-auto max-h-48 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-silver-400 uppercase tracking-wider">
            Asignaciones ({stats.occupied}/{table.capacity})
          </h4>
          <Button
            variant="ghost"
            size="sm"
            iconStart="plus"
            onClick={onOpenAssign}
            disabled={isBlocked || stats.available === 0}
            title={
              isBlocked
                ? 'La mesa está bloqueada para asignaciones'
                : stats.available === 0
                ? 'La mesa está completa'
                : 'Asignar personas'
            }
            className="h-6 text-xs px-2 text-gold-400 hover:text-gold-300"
          >
            Asignar
          </Button>
        </div>

        {table.assignments && table.assignments.length > 0 ? (
          <div className="divide-y divide-silver-800/40 text-xs">
            {table.assignments.map((asgn) => (
              <div
                key={asgn.id}
                className="py-1.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-silver-100 truncate">
                    {asgn.memberName || asgn.graduateName}
                  </p>
                  {asgn.isLocalPreview ? (
                    <span className="text-[10px] text-status-warning font-semibold block">
                      Vista previa local • No guardado
                    </span>
                  ) : (
                    <p className="text-[11px] text-silver-400 truncate">
                      {asgn.memberName && asgn.graduateName !== asgn.memberName
                        ? `Grupo de ${asgn.graduateName}`
                        : 'Graduado titular'}
                    </p>
                  )}
                </div>

                <Badge variant={asgn.isLocalPreview ? 'warning' : 'neutral'} size="sm">
                  {asgn.placesAssigned === 1 ? '1 persona' : `${asgn.placesAssigned} lugares`}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-2 text-center text-xs text-silver-400 italic">
            {stats.occupied > 0
              ? 'No hay detalle de asignaciones individual disponible'
              : 'No hay detalle de asignaciones disponible'}
          </p>
        )}

        {/* Indicador sutil de lugares libres */}
        {!isBlocked && stats.available > 0 && (
          <p className="text-[11px] text-silver-400 text-center py-1">
            {stats.available} lugares disponibles para asignación
          </p>
        )}
      </div>

      {/* Botones de acción directos y compactos */}
      <div className="p-3 border-t border-silver-800/60 bg-obsidian-950/30 flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            iconStart="edit"
            onClick={onOpenEdit}
            className="h-8 text-xs"
          >
            Editar mesa
          </Button>

          <Button
            variant="secondary"
            size="sm"
            iconStart={isBlocked ? 'check' : 'alert'}
            onClick={onToggleBlock}
            className="h-8 text-xs"
          >
            {isBlocked ? 'Desbloquear' : 'Bloquear'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-7 text-xs text-silver-400 hover:text-silver-100"
          >
            Duplicar mesa
          </Button>

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconStart="trash"
              onClick={onDelete}
              disabled={stats.occupied > 0}
              title={
                stats.occupied > 0
                  ? 'No se puede eliminar una mesa con asignaciones activas'
                  : 'Eliminar mesa'
              }
              className="h-7 text-xs text-status-error hover:bg-status-error/10 disabled:text-silver-600 disabled:hover:bg-transparent"
            >
              Eliminar
            </Button>
          )}
        </div>

        {stats.occupied > 0 && (
          <p className="text-[10px] text-silver-500 text-center">
            No se puede eliminar una mesa con asignaciones activas
          </p>
        )}
      </div>
    </aside>
  );
};
