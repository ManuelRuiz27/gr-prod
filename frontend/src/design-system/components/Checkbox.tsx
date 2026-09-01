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
          <div className="w-5 h-5 rounded-lg border-2 border-silver-700 bg-obsidian-900 transition-all duration-200 peer-checked:bg-gold-500 peer-checked:border-gold-500 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-500/30 peer-disabled:bg-obsidian-950 peer-disabled:border-silver-900 peer-disabled:cursor-not-allowed flex items-center justify-center text-obsidian-950">
            <Icon name="check" size={12} className="opacity-0 peer-checked:opacity-100 font-bold transition-opacity text-obsidian-950" />
          </div>
        </div>
        <div className="flex flex-col">
          <label
            htmlFor={inputId}
            className={`text-sm font-medium select-none cursor-pointer ${
              disabled ? 'text-silver-600 cursor-not-allowed' : 'text-silver-100'
            }`}
          >
            {label}
          </label>
          {helperText && <p className="text-xs text-silver-500 mt-0.5">{helperText}</p>}
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
                disabled ? 'text-silver-600 cursor-not-allowed' : 'text-silver-100'
              }`}
            >
              {label}
            </label>
            {helperText && <p className="text-xs text-silver-500">{helperText}</p>}
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
          <div className="w-11 h-6 bg-silver-800 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-gold-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-obsidian-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-silver-100 after:border-silver-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500 peer-checked:after:bg-obsidian-950 peer-disabled:opacity-40 peer-disabled:cursor-not-allowed" />
        </label>
      </div>
    );
  }
);

Switch.displayName = 'Switch';
