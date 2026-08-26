import React from 'react';
import { Icon, type IconName } from '../icons/Icon';


export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  iconStart?: IconName;
  iconEnd?: IconName;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      iconStart,
      iconEnd,
      fullWidth = true,
      disabled,
      required,
      id,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const widthClass = fullWidth ? 'w-full' : '';
    const errorBorder = error
      ? 'border-status-error focus:border-status-error focus:ring-status-error/20'
      : 'border-surface-highest focus:border-navy-600 focus:ring-navy-600/15';

    return (
      <div className={`flex flex-col gap-1.5 ${widthClass}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-content-primary">
            {label} {required && <span className="text-status-error">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {iconStart && (
            <span className="absolute left-3 text-content-muted pointer-events-none">
              <Icon name={iconStart} size={18} />
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            required={required}
            className={`
              h-11 rounded-xl bg-surface-lowest text-content-primary text-sm px-3.5 border transition-all duration-200
              placeholder:text-content-subtle focus:outline-none focus:ring-4 disabled:bg-surface-low disabled:text-content-muted disabled:cursor-not-allowed
              ${iconStart ? 'pl-10' : ''}
              ${iconEnd ? 'pr-10' : ''}
              ${errorBorder}
              ${widthClass}
              ${className}
            `}
            {...props}
          />
          {iconEnd && (
            <span className="absolute right-3 text-content-muted pointer-events-none">
              <Icon name={iconEnd} size={18} />
            </span>
          )}
        </div>
        {error ? (
          <p className="text-xs text-status-error flex items-center gap-1 mt-0.5" role="alert">
            <Icon name="error" size={12} />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-content-muted mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
