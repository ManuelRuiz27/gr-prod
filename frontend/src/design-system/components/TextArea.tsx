import React from 'react';
import { Icon } from '../icons/Icon';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = true,
      disabled,
      required,
      id,
      rows = 3,
      className = '',
      ...props
    },
    ref
  ) => {
    const areaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = areaId ? `${areaId}-error` : undefined;
    const helperId = areaId ? `${areaId}-helper` : undefined;

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
          <label htmlFor={areaId} className="text-xs font-semibold text-silver-200">
            {label} {required && <span className="text-status-error" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`
            rounded-input bg-obsidian-900 text-silver-50 text-sm p-3.5 border transition-all duration-200 resize-y
            placeholder:text-silver-500 focus:outline-none focus:ring-2 disabled:bg-obsidian-950 disabled:text-silver-600 disabled:border-silver-900 disabled:cursor-not-allowed
            ${errorBorder}
            ${widthClass}
            ${className}
          `}
          {...props}
        />
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

TextArea.displayName = 'TextArea';
