import React from 'react';
import { Icon, type IconName } from '../icons/Icon';


export type BadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'primary'
  | 'gold'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconName;
  dot?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  icon,
  dot = false,
  className = '',
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] font-semibold px-2 py-0.5 gap-1 rounded-md',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5 rounded-lg',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2 rounded-xl',
  }[size];

  const variantStyles = {
    neutral: 'bg-surface-high text-content-secondary border border-surface-highest',
    success: 'bg-status-success-bg text-status-success border border-status-success/20',
    warning: 'bg-status-warning-bg text-status-warning border border-status-warning/20',
    error: 'bg-status-error-bg text-status-error border border-status-error/20',
    info: 'bg-status-info-bg text-status-info border border-status-info/20',
    primary: 'bg-navy-900 text-surface-bright border border-navy-800',
    gold: 'bg-gold-100 text-gold-900 border border-gold-300 font-bold',
    outline: 'bg-transparent text-content-primary border border-surface-highest',
  }[variant];

  const dotColor = {
    neutral: 'bg-content-muted',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
    info: 'bg-status-info',
    primary: 'bg-gold-400',
    gold: 'bg-gold-600',
    outline: 'bg-content-primary',
  }[variant];

  return (
    <span
      className={`inline-flex items-center justify-center select-none ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />}
      {icon && <Icon name={icon} size={size === 'sm' ? 10 : size === 'lg' ? 16 : 12} />}
      <span>{children}</span>
    </span>
  );
};
