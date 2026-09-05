import React from 'react';
import { Badge, Icon } from '../../design-system';
import { mockNotifications } from '../../fixtures';

export const GraduateNotificationsScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-silver-50 font-display">Bandeja de Avisos y Notificaciones</h2>
        <p className="text-xs text-silver-400">
          Información relevante sobre pagos, fechas límite y asignaciones de tu evento.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {mockNotifications.map((notif) => {
          const isUnread = !notif.read;

          return (
            <div
              key={notif.id}
              className={`p-4 rounded-xl flex items-start gap-3.5 border transition-colors ${
                isUnread
                  ? 'bg-obsidian-850 border-silver-800/80 border-l-4 border-l-gold-400'
                  : 'bg-obsidian-900/60 border-silver-800/60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.type === 'WARNING'
                    ? 'bg-status-warning/20 text-status-warning'
                    : notif.type === 'SUCCESS'
                    ? 'bg-status-success/20 text-status-success'
                    : 'bg-gold-500/20 text-gold-400'
                }`}
              >
                <Icon
                  name={notif.type === 'WARNING' ? 'alert' : notif.type === 'SUCCESS' ? 'check' : 'info'}
                  size={18}
                />
              </div>

              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-silver-100 truncate">{notif.title}</span>
                  {isUnread && (
                    <Badge variant="gold" size="sm">
                      Nuevo
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-silver-300 leading-relaxed">{notif.message}</p>
                <span className="text-[10px] text-silver-500 mt-1">
                  {notif.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
