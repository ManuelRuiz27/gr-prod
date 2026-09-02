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
      className="w-full lg:w-96 bg-obsidian-850 border border-silver-800/80 rounded-2xl shadow-card flex flex-col overflow-hidden animate-fadeIn font-sans"
      aria-label={`Detalle de Mesa ${table.number}`}
    >
      {/* Header */}
      <div className="p-5 border-b border-silver-800/60 flex items-start justify-between bg-obsidian-900/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {getStatusBadge()}
            <span className="text-[11px] font-semibold text-silver-400">
              {table.shape === 'SQUARE' ? 'Mesa Cuadrada' : 'Mesa Circular'}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold font-display text-silver-50">
            Mesa {table.number}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-silver-400 hover:bg-obsidian-800 hover:text-silver-100 transition-colors"
          aria-label="Cerrar detalle"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {/* Bento Stats */}
      <div className="p-5 border-b border-silver-800/60 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800/60 flex flex-col">
            <span className="text-[11px] font-semibold text-silver-400">Capacidad Total</span>
            <span className="text-xl font-extrabold text-silver-50 font-sans mt-0.5">
              {table.capacity} <span className="text-xs font-normal text-silver-400">lugares</span>
            </span>
          </div>

          <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800/60 flex flex-col">
            <span className="text-[11px] font-semibold text-silver-400">Capacidad Libre</span>
            <span
              className={`text-xl font-extrabold font-sans mt-0.5 ${
                stats.available > 0 ? 'text-status-success' : 'text-silver-400'
              }`}
            >
              {stats.available} <span className="text-xs font-normal text-silver-400">libres</span>
            </span>
          </div>
        </div>

        {/* Occupancy Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-silver-400">Ocupación</span>
            <span className="font-bold text-silver-100 font-sans">
              {isBlocked
                ? `${stats.occupied} de ${table.capacity} (Bloqueada)`
                : `${stats.occupied} de ${table.capacity} (${stats.percentage}%)`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-obsidian-900 overflow-hidden border border-silver-800">
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

        {/* Blocked Status Disclaimer Banner */}
        {isBlocked && (
          <div className="p-3 bg-status-error/10 border border-status-error/30 rounded-xl text-xs text-status-error flex items-start gap-2">
            <Icon name="alert" size={16} className="text-status-error shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Mesa bloqueada</p>
              <p className="text-[11px] text-silver-300 mt-0.5 leading-relaxed">
                No disponible para nuevas asignaciones ({stats.available} lugares físicos libres).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Asignaciones List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-silver-300 uppercase tracking-wider">
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
          >
            Asignar
          </Button>
        </div>

        {table.assignments && table.assignments.length > 0 ? (
          <div className="space-y-2">
            {table.assignments.map((asgn) => (
              <div
                key={asgn.id}
                className="p-3 bg-obsidian-900 rounded-xl border border-silver-800/80 flex items-center justify-between hover:border-silver-700 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-obsidian-800 border border-silver-700 text-gold-400 font-bold text-xs flex items-center justify-center">
                    {(asgn.memberName || asgn.graduateName)
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-silver-100">
                      {asgn.memberName || asgn.graduateName}
                    </p>
                    {asgn.isLocalPreview ? (
                      <span className="inline-block text-[10px] text-status-warning font-semibold">
                        Vista previa local • No guardado
                      </span>
                    ) : (
                      <p className="text-[11px] text-silver-400">
                        {asgn.memberName && asgn.graduateName !== asgn.memberName
                          ? `Grupo de ${asgn.graduateName}`
                          : 'Graduado titular'}
                      </p>
                    )}
                  </div>
                </div>

                <Badge variant={asgn.isLocalPreview ? 'warning' : 'neutral'} size="sm">
                  {asgn.placesAssigned === 1 ? '1 persona' : `${asgn.placesAssigned} lugares`}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-obsidian-900/60 rounded-xl text-center text-xs text-silver-400">
            {stats.occupied > 0
              ? 'No hay detalle de asignaciones individual disponible'
              : 'No hay detalle de asignaciones disponible'}
          </div>
        )}

        {/* Free capacity slot indicator */}
        {!isBlocked && stats.available > 0 && (
          <div className="p-3 border border-dashed border-silver-800 rounded-xl text-center text-xs text-silver-400 bg-obsidian-900/30">
            {stats.available} lugares disponibles para asignación
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t border-silver-800/60 bg-obsidian-900/60 flex flex-col gap-2">
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
          className="text-xs text-silver-400 hover:text-silver-100"
        >
          Duplicar mesa
        </Button>
      </div>
    </aside>
  );
};
