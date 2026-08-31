import React from 'react';
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
}

export const TableDetailPanel: React.FC<TableDetailPanelProps> = ({
  table,
  onClose,
  onOpenEdit,
  onOpenAssign,
  onToggleBlock,
  onDuplicate,
}) => {
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

  return (
    <aside
      className="w-full lg:w-96 bg-white border border-surface-high rounded-2xl shadow-card flex flex-col overflow-hidden animate-fadeIn"
      aria-label={`Detalle de Mesa ${table.number}`}
    >
      {/* Header */}
      <div className="p-5 border-b border-surface-high flex items-start justify-between bg-surface-low/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {getStatusBadge()}
            <span className="text-[11px] font-semibold text-content-muted">
              {table.shape === 'SQUARE' ? 'Mesa Cuadrada' : 'Mesa Circular'}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold font-display text-navy-900">
            Mesa {table.number}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-content-secondary hover:bg-surface-high hover:text-navy-900 transition-colors"
          aria-label="Cerrar detalle"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {/* Bento Stats */}
      <div className="p-5 border-b border-surface-high space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-surface-low rounded-xl border border-surface-high/60 flex flex-col">
            <span className="text-[11px] font-semibold text-content-secondary">Capacidad Total</span>
            <span className="text-xl font-extrabold text-navy-900 font-display mt-0.5">
              {table.capacity} <span className="text-xs font-normal text-content-muted">lugares</span>
            </span>
          </div>

          <div className="p-3 bg-surface-low rounded-xl border border-surface-high/60 flex flex-col">
            <span className="text-[11px] font-semibold text-content-secondary">Capacidad Libre</span>
            <span
              className={`text-xl font-extrabold font-display mt-0.5 ${
                stats.available > 0 ? 'text-emerald-700' : 'text-content-muted'
              }`}
            >
              {stats.available} <span className="text-xs font-normal text-content-muted">libres</span>
            </span>
          </div>
        </div>

        {/* Occupancy Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-content-secondary">Ocupación</span>
            <span className="font-bold text-navy-900">
              {isBlocked
                ? `${stats.occupied} de ${table.capacity} (Bloqueada)`
                : `${stats.occupied} de ${table.capacity} (${stats.percentage}%)`}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-surface-high overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isBlocked
                  ? 'bg-rose-600'
                  : stats.isFull
                  ? 'bg-navy-900'
                  : stats.occupied > 0
                  ? 'bg-amber-500'
                  : 'bg-transparent'
              }`}
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        {/* Blocked Status Disclaimer Banner */}
        {isBlocked && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <Icon name="lock" size={16} className="text-rose-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Mesa bloqueada</p>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                No disponible para nuevas asignaciones ({stats.available} lugares físicos libres).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Asignaciones List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
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
                : 'Asignar graduado'
            }
          >
            Asignar
          </Button>
        </div>

        {table.assignments && table.assignments.length > 0 ? (
          <div className="space-y-2">
            {table.assignments.map((asgn) => (
              <div
                key={asgn.id}
                className="p-3 bg-white rounded-xl border border-surface-high flex items-center justify-between hover:border-navy-200 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-900 font-bold text-xs flex items-center justify-center">
                    {asgn.graduateName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-900">{asgn.graduateName}</p>
                    {asgn.isLocalPreview ? (
                      <span className="inline-block text-[10px] text-amber-700 font-semibold">
                        Vista previa local • No guardado
                      </span>
                    ) : (
                      <p className="text-[11px] text-content-secondary">Graduado asignado</p>
                    )}
                  </div>
                </div>

                <Badge variant={asgn.isLocalPreview ? 'warning' : 'neutral'} size="sm">
                  {asgn.placesAssigned} lugares
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-surface-low rounded-xl text-center text-xs text-content-secondary">
            {stats.occupied > 0
              ? 'No hay detalle de asignaciones individual disponible'
              : 'No hay detalle de asignaciones disponible'}
          </div>
        )}

        {/* Free capacity slot indicator */}
        {!isBlocked && stats.available > 0 && (
          <div className="p-3 border border-dashed border-surface-high rounded-xl text-center text-xs text-content-muted bg-surface-low/30">
            {stats.available} lugares disponibles para asignación
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t border-surface-high bg-surface-low/50 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            iconStart="edit"
            onClick={onOpenEdit}
          >
            Editar mesa
          </Button>

          <Button
            variant="secondary"
            size="sm"
            iconStart={isBlocked ? 'check' : 'alert'}
            onClick={onToggleBlock}
          >
            {isBlocked ? 'Desbloquear' : 'Bloquear'}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDuplicate}
          className="text-xs text-content-secondary hover:text-navy-900"
        >
          Duplicar mesa
        </Button>
      </div>
    </aside>
  );
};
