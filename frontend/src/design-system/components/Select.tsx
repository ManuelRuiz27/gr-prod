import React from 'react';
import { Icon } from '../icons/Icon';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      fullWidth = true,
      disabled,
      required,
      id,
      className = '',
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = selectId ? `${selectId}-error` : undefined;
    const helperId = selectId ? `${selectId}-helper` : undefined;

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
          <label htmlFor={selectId} className="text-xs font-semibold text-silver-200">
            {label} {required && <span className="text-status-error" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className={`
              h-11 rounded-input bg-obsidian-900 text-silver-50 text-sm pl-3.5 pr-10 border transition-all duration-200 appearance-none
              focus:outline-none focus:ring-2 disabled:bg-obsidian-950 disabled:text-silver-600 disabled:border-silver-900 disabled:cursor-not-allowed
              ${errorBorder}
              ${widthClass}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-obsidian-900 text-silver-50"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3.5 text-silver-500 pointer-events-none">
            <Icon name="chevron-down" size={16} />
          </span>
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

Select.displayName = 'Select';
