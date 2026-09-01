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
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    const widthClass = fullWidth ? 'w-full' : '';
    const errorBorder = error
      ? 'border-status-error focus:border-status-error focus:ring-status-error/20'
      : 'border-silver-800 focus:border-gold-500 focus:ring-gold-500/20';

    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className={`flex flex-col gap-1.5 ${widthClass}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-silver-200">
            {label} {required && <span className="text-status-error" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {iconStart && (
            <span className="absolute left-3.5 text-silver-500 pointer-events-none">
              <Icon name={iconStart} size={18} />
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className={`
              h-11 rounded-input bg-obsidian-900 text-silver-50 text-sm px-3.5 border transition-all duration-200
              placeholder:text-silver-500 focus:outline-none focus:ring-2 disabled:bg-obsidian-950 disabled:text-silver-600 disabled:border-silver-900 disabled:cursor-not-allowed
              ${iconStart ? 'pl-10' : ''}
              ${iconEnd ? 'pr-10' : ''}
              ${errorBorder}
              ${widthClass}
              ${className}
            `}
            {...props}
          />
          {iconEnd && (
            <span className="absolute right-3.5 text-silver-500 pointer-events-none">
              <Icon name={iconEnd} size={18} />
            </span>
          )}
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-status-error flex items-center gap-1 mt-0.5" role="alert">
            <Icon name="error" size={12} />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-silver-500 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
