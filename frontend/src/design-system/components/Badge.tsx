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
    neutral: 'bg-obsidian-750 text-silver-300 border border-silver-700/60',
    success: 'bg-status-success/15 text-status-success border border-status-success/30',
    warning: 'bg-status-warning/15 text-status-warning border border-status-warning/30',
    error: 'bg-status-error/15 text-status-error border border-status-error/30',
    info: 'bg-status-info/15 text-status-info border border-status-info/30',
    primary: 'bg-obsidian-800 text-gold-400 border border-gold-500/30',
    gold: 'bg-gold-500/15 text-gold-300 border border-gold-500/35 font-semibold',
    outline: 'bg-transparent text-silver-200 border border-silver-700',
  }[variant];

  const dotColor = {
    neutral: 'bg-silver-400',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
    info: 'bg-status-info',
    primary: 'bg-gold-400',
    gold: 'bg-gold-400',
    outline: 'bg-silver-300',
  }[variant];

  return (
    <span
      className={`inline-flex items-center justify-center select-none font-sans ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />}
      {icon && <Icon name={icon} size={size === 'sm' ? 10 : size === 'lg' ? 16 : 12} />}
      <span>{children}</span>
    </span>
  );
};
