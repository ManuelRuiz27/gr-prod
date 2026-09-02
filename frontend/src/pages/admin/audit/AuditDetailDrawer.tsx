import React from 'react';
import {
  Drawer,
  Badge,
  Icon,
} from '../../../design-system';
import {
  type AuditLogItem,
  getAuditActionBadgeVariant,
  formatHumanDiff,
} from './auditViewModel';

interface AuditDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLogItem | null;
}

export const AuditDetailDrawer: React.FC<AuditDetailDrawerProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  if (!log) return null;

  const diffRows = formatHumanDiff(log.beforeData, log.afterData, log.diff);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del registro de auditoría"
      size="md"
    >
      <div className="flex flex-col gap-5 text-xs font-sans text-silver-200">
        {/* Header Action & Timestamp */}
        <div className="p-4 bg-obsidian-900 rounded-xl border border-silver-800 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant={getAuditActionBadgeVariant(log.action)} size="sm">
              {log.actionLabel}
            </Badge>
            <span className="font-mono text-silver-400 text-[11px]">{log.timestamp}</span>
          </div>

          <p className="text-sm font-bold text-silver-100 leading-snug">
            {log.description}
          </p>
        </div>

        {/* Actor & Entity Information */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800">
            <span className="text-[10px] uppercase font-bold text-silver-400 block">
              Actor / Origen
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Icon name="user" size={12} className="text-gold-400" />
              <span className="font-semibold text-silver-100">{log.actor}</span>
            </div>
            {log.actorOrigin && (
              <span className="text-[10px] text-silver-500 block mt-0.5">
                Origen: {log.actorOrigin}
              </span>
            )}
          </div>

          <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800">
            <span className="text-[10px] uppercase font-bold text-silver-400 block">
              Entidad / Contexto
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-semibold text-silver-100">{log.entityLabel}</span>
            </div>
            <span className="text-[10px] font-mono text-gold-400 block mt-0.5">
              {log.entityId}
            </span>
          </div>
        </div>

        {/* Reason */}
        {log.reason && (
          <div className="p-3.5 bg-obsidian-900 rounded-xl border border-silver-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-silver-400 block">
              Motivo administrativo registrado
            </span>
            <p className="text-silver-200 text-xs leading-relaxed">{log.reason}</p>
          </div>
        )}

        {/* Structured Diff (No JSON Stringify!) */}
        {diffRows.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-silver-200 uppercase tracking-wider">
              Desglose de modificaciones
            </h4>
            <div className="overflow-hidden rounded-xl border border-silver-800 bg-obsidian-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-obsidian-950 text-[10px] font-semibold text-silver-400 uppercase tracking-wider border-b border-silver-800">
                    <th className="px-3.5 py-2.5">Campo</th>
                    <th className="px-3.5 py-2.5">Valor Anterior</th>
                    <th className="px-3.5 py-2.5">Nuevo Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-silver-800/60">
                  {diffRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-obsidian-850/50">
                      <td className="px-3.5 py-2.5 font-semibold text-silver-300">
                        {row.field}
                      </td>
                      <td className="px-3.5 py-2.5 text-status-error font-mono text-[11px]">
                        {row.before}
                      </td>
                      <td className="px-3.5 py-2.5 text-status-success font-mono text-[11px]">
                        {row.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trazability Notice */}
        <div className="p-3 bg-obsidian-900/60 rounded-xl border border-silver-800/60 text-[11px] text-silver-500">
          Registro inmutable protegido contra alteraciones o eliminaciones. Folio de registro: <span className="font-mono text-silver-400">{log.id}</span>
        </div>
      </div>
    </Drawer>
  );
};
