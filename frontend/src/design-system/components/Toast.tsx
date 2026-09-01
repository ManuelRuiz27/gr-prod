import React, { useEffect } from 'react';
import { Icon, type IconName } from '../icons/Icon';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id?: string;
  variant?: ToastVariant;
  title: string;
  message?: string;
  duration?: number; // ms, 0 for sticky
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  variant = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  action,
  className = '',
}) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config: Record<ToastVariant, { icon: IconName; iconColor: string; borderColor: string }> = {
    success: {
      icon: 'check',
      iconColor: 'text-status-success',
      borderColor: 'border-status-success/30',
    },
    error: {
      icon: 'error',
      iconColor: 'text-status-error',
      borderColor: 'border-status-error/30',
    },
    warning: {
      icon: 'alert',
      iconColor: 'text-status-warning',
      borderColor: 'border-status-warning/30',
    },
    info: {
      icon: 'info',
      iconColor: 'text-status-info',
      borderColor: 'border-status-info/30',
    },
  };

  const { icon, iconColor, borderColor } = config[variant];
  const isAlert = variant === 'error';

  return (
    <div
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
      className={`
        flex items-start gap-3 p-4 rounded-2xl bg-obsidian-850 text-silver-50
        border ${borderColor} shadow-floating max-w-md w-full animate-fadeInUp
        ${className}
      `}
    >
      <span className={`mt-0.5 ${iconColor} shrink-0`}>
        <Icon name={icon} size={20} />
      </span>

      <div className="flex-1 flex flex-col gap-0.5">
        <h5 className="text-sm font-bold text-silver-50">{title}</h5>
        {message && <p className="text-xs text-silver-300 leading-relaxed">{message}</p>}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 underline mt-1.5 self-start"
          >
            {action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-silver-400 hover:text-silver-50 hover:bg-obsidian-750 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 transition-colors shrink-0"
          aria-label="Cerrar notificación"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
};
