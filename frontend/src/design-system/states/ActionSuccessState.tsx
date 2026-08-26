import React from 'react';
import { Icon } from '../icons/Icon';
import { Button } from '../components/Button';

export interface ActionSuccessStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  variant?: 'banner' | 'card';
  className?: string;
}

export const ActionSuccessState: React.FC<ActionSuccessStateProps> = ({
  title = 'Operación exitosa',
  message,
  actionLabel,
  onAction,
  onDismiss,
  variant = 'banner',
  className = '',
}) => {
  if (variant === 'banner') {
    return (
      <div
        className={`flex items-center justify-between p-3.5 bg-status-success-bg border-y sm:border sm:rounded-xl border-status-success/30 text-status-success gap-3 animate-fadeIn ${className}`}
        role="status"
      >
        <div className="flex items-center gap-2.5">
          <Icon name="check" size={18} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            {title && <span className="text-xs font-bold">{title}:</span>}
            <span className="text-xs font-medium">{message}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAction}
              className="text-status-success hover:bg-status-success/10"
            >
              {actionLabel}
            </Button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-black/5 text-status-success transition-colors"
              aria-label="Cerrar"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-status-success/30 bg-status-success-bg/40 gap-4 animate-fadeInUp ${className}`}
      role="status"
    >
      <div className="w-14 h-14 rounded-2xl bg-status-success-bg border border-status-success/30 flex items-center justify-center text-status-success">
        <Icon name="check" size={28} />
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h4 className="text-base font-bold text-status-success">{title}</h4>
        <p className="text-xs text-content-secondary leading-relaxed">{message}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
