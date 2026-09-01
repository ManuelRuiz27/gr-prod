import React from 'react';
import { Icon, type IconName } from '../icons/Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconStart?: IconName;
  iconEnd?: IconName;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      iconStart,
      iconEnd,
      fullWidth = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base interactive styles
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none select-none active:scale-[0.98] font-sans';

    // Size variants
    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8 rounded-lg',
      md: 'text-sm px-4 py-2 gap-2 h-10 rounded-input',
      lg: 'text-base px-6 py-3 gap-2.5 h-12 rounded-input min-h-[44px]',
    }[size];

    // Visual variants aligned with Baseline Visual 1.2
    const variantStyles = {
      primary:
        'bg-gold-500 text-obsidian-950 font-semibold hover:bg-gold-400 active:bg-gold-600 focus-visible:ring-gold-400 shadow-sm border border-transparent',
      secondary:
        'bg-obsidian-850 text-silver-50 hover:bg-obsidian-750 active:bg-obsidian-700 focus-visible:ring-gold-500/40 border border-silver-800 hover:border-silver-700 shadow-card-sm',
      outline:
        'bg-transparent text-silver-100 border border-silver-700 hover:bg-obsidian-850 hover:border-silver-500 active:bg-obsidian-800 focus-visible:ring-gold-500/40',
      ghost:
        'bg-transparent text-silver-300 hover:text-silver-50 hover:bg-obsidian-850 active:bg-obsidian-800 focus-visible:ring-gold-500/40 border border-transparent',
      danger:
        'bg-status-error text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-sm border border-transparent',
      gold:
        'bg-gold-500 text-obsidian-950 font-semibold hover:bg-gold-400 active:bg-gold-600 focus-visible:ring-gold-400 shadow-sm border border-transparent',
    }[variant];

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? 'true' : undefined}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-1 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cargando...</span>
          </span>
        ) : (
          <>
            {iconStart && <Icon name={iconStart} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
            <span>{children}</span>
            {iconEnd && <Icon name={iconEnd} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
