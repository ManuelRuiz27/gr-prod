import React from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { Badge, type BadgeVariant } from './Badge';

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  supportingText?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    positive?: boolean;
  };
  status?: BadgeVariant;
  statusLabel?: string;
  icon?: IconName;
  variant?: 'default' | 'raised' | 'interactive';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  supportingText,
  trend,
  status,
  statusLabel,
  icon,
  variant = 'default',
  onClick,
  className = '',
  ...props
}) => {
  const isInteractive = variant === 'interactive' || !!onClick;

  const variantStyles = {
    default: 'bg-obsidian-850 border border-silver-800/80 shadow-card',
    raised: 'bg-obsidian-800 border border-silver-700/60 shadow-card-md',
    interactive:
      'bg-obsidian-850 border border-silver-800 hover:border-gold-500/40 hover:bg-obsidian-800 shadow-card hover:shadow-card-md transition-all duration-200 cursor-pointer active:scale-[0.99]',
  }[variant];

  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`rounded-card p-5 md:p-6 flex flex-col justify-between gap-3 text-silver-100 ${variantStyles} ${className}`}
      {...props}
    >
      {/* Header: Label & Optional Icon / Status */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-silver-400 font-sans">
          {label}
        </span>
        {icon && (
          <span className="p-2 rounded-xl bg-obsidian-750 text-silver-300 shrink-0">
            <Icon name={icon} size={18} />
          </span>
        )}
      </div>

      {/* Main Value in Inter font */}
      <div className="flex items-baseline gap-3 my-0.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-silver-50 font-sans">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold flex items-center gap-0.5 ${
              trend.positive !== false
                ? 'text-status-success'
                : 'text-status-error'
            }`}
          >
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            {trend.value}
          </span>
        )}
      </div>

      {/* Footer: Supporting Text or Badge */}
      {(supportingText || status) && (
        <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-silver-800/40">
          {supportingText && (
            <span className="text-silver-400 truncate">{supportingText}</span>
          )}
          {status && statusLabel && (
            <Badge variant={status} size="sm" dot>
              {statusLabel}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
