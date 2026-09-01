import React from 'react';
import { Icon, type IconName } from '../icons/Icon';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onDismiss?: () => void;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  onDismiss,
  className = '',
  children,
  ...props
}) => {
  const config: Record<AlertVariant, { bg: string; border: string; text: string; icon: IconName }> = {
    info: {
      bg: 'bg-status-info/10',
      border: 'border-status-info/30',
      text: 'text-status-info',
      icon: 'info',
    },
    success: {
      bg: 'bg-status-success/10',
      border: 'border-status-success/30',
      text: 'text-status-success',
      icon: 'check',
    },
    warning: {
      bg: 'bg-status-warning/10',
      border: 'border-status-warning/30',
      text: 'text-status-warning',
      icon: 'alert',
    },
    error: {
      bg: 'bg-status-error/10',
      border: 'border-status-error/30',
      text: 'text-status-error',
      icon: 'error',
    },
  };

  const { bg, border, text, icon } = config[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-2xl border ${bg} ${border} ${className}`}
      {...props}
    >
      <span className={`mt-0.5 ${text} shrink-0`}>
        <Icon name={icon} size={18} />
      </span>
      <div className="flex-1 flex flex-col gap-0.5">
        {title && <h5 className={`text-sm font-semibold ${text}`}>{title}</h5>}
        <div className="text-xs text-silver-200 leading-relaxed">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`p-1 rounded-lg hover:bg-silver-50/10 ${text} transition-colors shrink-0`}
          aria-label="Descartar alerta"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
};
