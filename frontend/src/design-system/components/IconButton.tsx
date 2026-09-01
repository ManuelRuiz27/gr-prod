import React from 'react';
import { Icon, type IconName } from '../icons/Icon';

export type IconButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  'aria-label': string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  rounded?: 'md' | 'lg' | 'full';
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      'aria-label': ariaLabel,
      variant = 'secondary',
      size = 'md',
      rounded = 'lg',
      isLoading = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'w-8 h-8 p-1.5',
      md: 'w-10 h-10 p-2 min-w-[40px]',
      lg: 'w-12 h-12 p-3 min-w-[44px] min-h-[44px]',
    }[size];

    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

    const roundedStyles = {
      md: 'rounded-lg',
      lg: 'rounded-input',
      full: 'rounded-full',
    }[rounded];

    const variantStyles = {
      primary:
        'bg-gold-500 text-obsidian-950 hover:bg-gold-400 active:bg-gold-600 focus-visible:ring-gold-400 shadow-sm border border-transparent',
      secondary:
        'bg-obsidian-850 text-silver-200 hover:text-silver-50 hover:bg-obsidian-750 active:bg-obsidian-700 focus-visible:ring-gold-500/40 border border-silver-800 shadow-card-sm',
      outline:
        'bg-transparent text-silver-300 hover:text-silver-50 border border-silver-700 hover:bg-obsidian-850 hover:border-silver-500 focus-visible:ring-gold-500/40',
      ghost:
        'bg-transparent text-silver-400 hover:text-silver-50 hover:bg-obsidian-850 active:bg-obsidian-800 focus-visible:ring-gold-500/40 border border-transparent',
      danger:
        'bg-status-error text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-sm border border-transparent',
      gold:
        'bg-gold-500/15 text-gold-300 hover:bg-gold-500/25 active:bg-gold-500/30 border border-gold-500/30 focus-visible:ring-gold-400',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? 'true' : undefined}
        className={`
          inline-flex items-center justify-center transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-950
          disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none select-none active:scale-[0.96]
          ${sizeStyles} ${roundedStyles} ${variantStyles} ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <Icon name={icon} size={iconSize} />
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
