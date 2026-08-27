import React from 'react';
import { Card, Badge, Icon } from '../../design-system';
import { mockNotifications } from '../../fixtures';

export const GraduateNotificationsScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-1.5">
        <h2 className="text-base font-bold text-navy-900">Bandeja de Avisos y Notificaciones</h2>
        <p className="text-xs text-content-secondary">
          Información relevante sobre pagos, fechas límite y asignaciones de tu evento.
        </p>
      </Card>

      <div className="flex flex-col gap-3">
        {mockNotifications.map((notif) => {
          const isUnread = !notif.read;

          return (
            <Card
              key={notif.id}
              className={`p-4 flex items-start gap-3.5 ${
                isUnread ? 'bg-surface-lowest border-l-4 border-l-gold-400' : 'bg-surface-low/60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.type === 'WARNING'
                    ? 'bg-status-warning-bg text-status-warning'
                    : notif.type === 'SUCCESS'
                    ? 'bg-status-success-bg text-status-success'
                    : 'bg-status-info-bg text-status-info'
                }`}
              >
                <Icon
                  name={notif.type === 'WARNING' ? 'alert' : notif.type === 'SUCCESS' ? 'check' : 'info'}
                  size={18}
                />
              </div>

              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-navy-900 truncate">{notif.title}</span>
                  {isUnread && (
                    <Badge variant="gold" size="sm">
                      Nuevo
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-content-secondary leading-relaxed">{notif.message}</p>
                <span className="text-[10px] text-content-muted mt-1">
                  {notif.date}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
