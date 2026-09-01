import React from 'react';
import { Icon } from '../icons/Icon';
import { Button } from '../components/Button';

export interface OfflineStateProps {
  message?: string;
  onRetry?: () => void;
  variant?: 'banner' | 'card';
  className?: string;
}

export const OfflineState: React.FC<OfflineStateProps> = ({
  message = 'Sin conexión a internet. Los cambios se sincronizarán cuando se restablezca la red.',
  onRetry,
  variant = 'banner',
  className = '',
}) => {
  if (variant === 'banner') {
    return (
      <div
        className={`flex items-center justify-between p-3.5 bg-status-warning/10 border-y sm:border sm:rounded-xl border-status-warning/30 text-status-warning gap-3 ${className}`}
        role="status"
      >
        <div className="flex items-center gap-2.5">
          <Icon name="wifi-off" size={18} />
          <span className="text-xs font-semibold">{message}</span>
        </div>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="text-status-warning hover:bg-status-warning/10">
            Reconectar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-card border border-status-warning/30 bg-status-warning/10 gap-4 font-sans ${className}`}
      role="status"
    >
      <div className="w-14 h-14 rounded-2xl bg-status-warning/15 border border-status-warning/30 flex items-center justify-center text-status-warning">
        <Icon name="wifi-off" size={28} />
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h4 className="text-base font-bold text-status-warning">Modo fuera de línea</h4>
        <p className="text-xs text-silver-300 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" iconStart="refresh" onClick={onRetry}>
          Reintentar conexión
        </Button>
      )}
    </div>
  );
};
