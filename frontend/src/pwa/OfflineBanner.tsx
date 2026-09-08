import React from 'react';
import { usePwa } from './PwaContext';
import { Icon } from '../design-system';

export const OfflineBanner: React.FC = () => {
  const { isOffline, justReconnected } = usePwa();

  if (!isOffline && !justReconnected) {
    return null;
  }

  return (
    <aside
      aria-label="Estado de conexión"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-floating text-xs font-medium flex items-center gap-2 max-w-[92vw] sm:max-w-md transition-all duration-300 animate-fadeInUp"
    >
      {isOffline ? (
        <div className="flex items-center gap-2 bg-obsidian-900/95 text-status-warning border border-status-warning/40 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-status-warning animate-pulse" />
          <Icon name="wifi-off" size={14} />
          <span className="text-silver-100 truncate">
            Modo sin conexión • Mostrando datos en caché
          </span>
        </div>
      ) : justReconnected ? (
        <div className="flex items-center gap-2 bg-obsidian-900/95 text-status-success border border-status-success/40 px-3 py-1 rounded-full animate-fadeIn">
          <Icon name="check" size={14} />
          <span className="text-silver-100 truncate">Conexión restablecida</span>
        </div>
      ) : null}
    </aside>
  );
};
