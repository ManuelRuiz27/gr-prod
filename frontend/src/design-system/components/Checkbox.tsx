import React from 'react';
import { Icon } from '../icons/Icon';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string | React.ReactNode;
  helperText?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, error, disabled, id, className = '', checked, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`flex items-start gap-2.5 ${className}`}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div className="w-5 h-5 rounded-lg border-2 border-surface-highest bg-surface-lowest transition-all duration-200 peer-checked:bg-navy-900 peer-checked:border-navy-900 peer-focus:ring-2 peer-focus:ring-navy-600/20 peer-disabled:bg-surface-low peer-disabled:border-surface-high peer-disabled:cursor-not-allowed flex items-center justify-center text-white">
            <Icon name="check" size={12} className="opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex flex-col">
          <label
            htmlFor={inputId}
            className={`text-sm font-medium select-none cursor-pointer ${
              disabled ? 'text-content-muted cursor-not-allowed' : 'text-content-primary'
            }`}
          >
            {label}
          </label>
          {helperText && <p className="text-xs text-content-muted mt-0.5">{helperText}</p>}
          {error && <p className="text-xs text-status-error mt-0.5">{error}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode;
  helperText?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, helperText, disabled, id, checked, className = '', ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`flex items-center justify-between gap-4 ${className}`}>
        {label && (
          <div className="flex flex-col">
            <label
              htmlFor={inputId}
              className={`text-sm font-medium cursor-pointer ${
                disabled ? 'text-content-muted cursor-not-allowed' : 'text-content-primary'
              }`}
            >
              {label}
            </label>
            {helperText && <p className="text-xs text-content-muted">{helperText}</p>}
          </div>
        )}
        <label htmlFor={inputId} className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className="w-11 h-6 bg-surface-highest peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-navy-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-high after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-900 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed" />
        </label>
      </div>
    );
  }
);

Switch.displayName = 'Switch';
