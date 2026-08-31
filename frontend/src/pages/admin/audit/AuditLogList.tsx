/**
 * AuditLogList.tsx
 *
 * Renders immutable audit log records in natural language.
 * Displays actor, fecha/hora, acción, entidad, antes/después, and motivo.
 */

import React from 'react';
import { Card, Badge, Icon } from '../../../design-system';
import {
  type AuditLogItem,
  getAuditActionBadgeVariant,
} from './auditViewModel';

interface AuditLogListProps {
  logs: AuditLogItem[];
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ logs }) => {
  return (
    <div className="flex flex-col gap-3">
      {logs.map((log) => (
        <Card key={log.id} className="p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={getAuditActionBadgeVariant(log.action)} size="sm">
                {log.actionLabel}
              </Badge>
              <Badge variant="outline" size="sm">
                {log.entityLabel}: {log.entityId}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-content-muted">
              <Icon name="calendar" size={12} />
              <span>{log.timestamp}</span>
              <span>•</span>
              <span className="font-semibold text-navy-900">{log.actor}</span>
            </div>
          </div>

          <p className="text-xs text-content-primary leading-relaxed font-medium">
            {log.description}
          </p>

          {/* Before / After Data Diff */}
          {(log.beforeData || log.afterData) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-surface-low rounded-xl text-xs">
              {log.beforeData && (
                <div>
                  <span className="text-[10px] font-bold text-content-muted uppercase block">
                    Valor Anterior
                  </span>
                  <span className="text-content-secondary font-mono text-[11px]">
                    {JSON.stringify(log.beforeData)}
                  </span>
                </div>
              )}
              {log.afterData && (
                <div>
                  <span className="text-[10px] font-bold text-content-muted uppercase block">
                    Nuevo Valor
                  </span>
                  <span className="text-content-primary font-mono text-[11px]">
                    {JSON.stringify(log.afterData)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          {log.reason && (
            <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 text-xs">
              <span className="text-[10px] font-bold text-amber-900 uppercase block">
                Motivo Administrativo
              </span>
              <span className="text-amber-950 mt-0.5 block">{log.reason}</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
