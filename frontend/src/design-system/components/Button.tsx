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
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    // Size variants
    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-3 gap-2.5 h-12',
    }[size];

    // Visual variants
    const variantStyles = {
      primary:
        'bg-navy-900 text-surface-bright hover:bg-navy-800 active:bg-navy-950 focus:ring-navy-600 shadow-sm border border-transparent',
      secondary:
        'bg-surface-low text-content-primary hover:bg-surface-default active:bg-surface-high focus:ring-navy-500 border border-surface-high',
      outline:
        'bg-transparent text-navy-900 border border-navy-300 hover:bg-navy-50 active:bg-navy-100 focus:ring-navy-500',
      ghost:
        'bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-low active:bg-surface-default focus:ring-navy-500 border border-transparent',
      danger:
        'bg-status-error text-white hover:bg-red-800 active:bg-red-900 focus:ring-red-500 shadow-sm border border-transparent',
      gold:
        'bg-gold-400 text-navy-950 font-semibold hover:bg-gold-300 active:bg-gold-500 focus:ring-gold-500 shadow-sm border border-transparent',
    }[variant];

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
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
