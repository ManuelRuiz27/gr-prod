import React from 'react';
import { Icon } from '../icons/Icon';
import { Button } from '../components/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocurrió un problema inesperado',
  message = 'No se pudo cargar la información requerida. Por favor, intenta nuevamente.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-card border border-status-error/30 bg-status-error/10 gap-4 font-sans ${className}`}
      role="alert"
    >
      <div className="w-14 h-14 rounded-2xl bg-status-error/15 border border-status-error/30 flex items-center justify-center text-status-error">
        <Icon name="error" size={28} />
      </div>
      <div className="flex flex-col gap-1 max-w-md">
        <h4 className="text-base font-bold text-status-error">{title}</h4>
        <p className="text-xs text-silver-300 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" iconStart="refresh" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
};
