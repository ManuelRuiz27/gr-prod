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
    const widthClass = fullWidth ? 'w-full' : '';
    const errorBorder = error
      ? 'border-status-error focus:border-status-error focus:ring-status-error/20'
      : 'border-surface-highest focus:border-navy-600 focus:ring-navy-600/15';

    return (
      <div className={`flex flex-col gap-1.5 ${widthClass}`}>
        {label && (
          <label htmlFor={areaId} className="text-xs font-semibold text-content-primary">
            {label} {required && <span className="text-status-error">*</span>}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          required={required}
          className={`
            rounded-xl bg-surface-lowest text-content-primary text-sm p-3.5 border transition-all duration-200 resize-y
            placeholder:text-content-subtle focus:outline-none focus:ring-4 disabled:bg-surface-low disabled:text-content-muted disabled:cursor-not-allowed
            ${errorBorder}
            ${widthClass}
            ${className}
          `}
          {...props}
        />
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

TextArea.displayName = 'TextArea';
