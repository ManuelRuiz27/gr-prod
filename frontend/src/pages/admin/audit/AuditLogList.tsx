import React, { useState } from 'react';
import { Card, Badge, Icon, Button } from '../../../design-system';
import {
  type AuditLogItem,
  getAuditActionBadgeVariant,
  formatHumanDiff,
} from './auditViewModel';
import { AuditDetailDrawer } from './AuditDetailDrawer';

interface AuditLogListProps {
  logs: AuditLogItem[];
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  return (
    <div className="flex flex-col gap-3 font-sans">
      {logs.map((log) => {
        const diffRows = formatHumanDiff(log.beforeData, log.afterData, log.diff);

        return (
          <Card
            key={log.id}
            className="p-4 bg-obsidian-850 border border-silver-800/80 flex flex-col gap-3 hover:border-silver-700/80 transition-colors"
            data-testid={`audit-log-item-${log.id}`}
          >
            {/* Header: Action & Timestamp */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={getAuditActionBadgeVariant(log.action)} size="sm">
                  {log.actionLabel}
                </Badge>
                <Badge variant="neutral" size="sm">
                  {log.entityLabel}: {log.entityId}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-silver-400">
                <Icon name="calendar" size={12} />
                <span className="font-mono">{log.timestamp}</span>
                <span>•</span>
                <span className="font-semibold text-silver-200">{log.actor}</span>
                {log.actorOrigin && (
                  <Badge variant="neutral" size="sm">
                    {log.actorOrigin}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-silver-100 leading-relaxed font-medium">
              {log.description}
            </p>

            {/* Structured Before / After Diff (No JSON stringify) */}
            {diffRows.length > 0 && (
              <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800 text-xs space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-silver-400 uppercase block">
                      Valor Anterior
                    </span>
                    <div className="space-y-0.5 mt-0.5">
                      {diffRows.map((r, i) => (
                        <div key={i} className="text-silver-300 font-mono text-[11px]">
                          <span className="text-silver-400">{r.field}:</span>{' '}
                          <span className="text-status-error">{r.before}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-silver-400 uppercase block">
                      Nuevo Valor
                    </span>
                    <div className="space-y-0.5 mt-0.5">
                      {diffRows.map((r, i) => (
                        <div key={i} className="text-silver-200 font-mono text-[11px]">
                          <span className="text-silver-400">{r.field}:</span>{' '}
                          <span className="text-status-success">{r.after}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reason */}
            {log.reason && (
              <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800/80 text-xs">
                <span className="text-[10px] font-bold text-gold-400 uppercase block">
                  Motivo Administrativo
                </span>
                <span className="text-silver-200 mt-0.5 block">{log.reason}</span>
              </div>
            )}

            {/* Footer with Detail Drawer trigger */}
            <div className="flex justify-end pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedLog(log)}
                iconEnd="chevron-right"
              >
                Ver detalle
              </Button>
            </div>
          </Card>
        );
      })}

      {/* Detail Drawer */}
      <AuditDetailDrawer
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
};
