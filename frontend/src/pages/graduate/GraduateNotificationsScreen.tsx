import React from 'react';
import { mockNotifications } from '../../fixtures';

export const GraduateNotificationsScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-silver-50 font-display">Avisos y notificaciones</h2>
        <p className="text-xs text-silver-400">
          Información sobre pagos, fechas límite y asignaciones de tu evento.
        </p>
      </div>

      <div className="divide-y divide-silver-800/60 border-y border-silver-800/60">
        {mockNotifications.map((notif) => {
          const isUnread = !notif.read;

          return (
            <div
              key={notif.id}
              className={`py-4 flex items-start gap-3 transition-colors ${
                isUnread ? 'bg-obsidian-900/30' : ''
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  isUnread ? 'bg-gold-400' : 'bg-transparent'
                }`}
              />

              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${isUnread ? 'text-silver-50 font-bold' : 'text-silver-200 font-medium'}`}>
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-silver-500 shrink-0 font-mono">
                    {notif.date}
                  </span>
                </div>
                <p className="text-xs text-silver-400 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
