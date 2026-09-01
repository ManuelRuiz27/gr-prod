import React, { useState, useRef } from 'react';
import { Icon } from '../icons/Icon';

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      onSearch,
      onClear,
      isLoading = false,
      size = 'md',
      fullWidth = true,
      placeholder = 'Buscar...',
      disabled,
      className = '',
      ...props
    },
    forwardedRef
  ) => {
    const internalInputRef = useRef<HTMLInputElement | null>(null);
    const [internalValue, setInternalValue] = useState<string>(
      (controlledValue as string) || (defaultValue as string) || ''
    );

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? (controlledValue as string) : internalValue;

    const setRef = (node: HTMLInputElement | null) => {
      internalInputRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(currentValue);
      }
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
      }
      onClear?.();
      if (internalInputRef.current) {
        internalInputRef.current.value = '';
        internalInputRef.current.focus();
      }
    };

    const sizeStyles = {
      sm: 'h-8 text-xs pl-8 pr-7 rounded-lg',
      md: 'h-10 text-sm pl-9 pr-8 rounded-input',
      lg: 'h-12 text-base pl-10 pr-9 rounded-input min-h-[44px]',
    }[size];

    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`relative flex items-center ${widthClass}`}>
        <span className="absolute left-3 text-silver-500 pointer-events-none flex items-center justify-center">
          {isLoading ? (
            <svg
              className="animate-spin h-4 w-4 text-gold-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <Icon name="search" size={iconSize} />
          )}
        </span>

        <input
          ref={setRef}
          type="search"
          role="searchbox"
          aria-label={props['aria-label'] || 'Buscar'}
          value={isControlled ? controlledValue : undefined}
          defaultValue={!isControlled ? defaultValue : undefined}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            ${sizeStyles} ${widthClass}
            bg-obsidian-900 text-silver-50 border border-silver-800
            placeholder:text-silver-500 transition-all duration-200
            focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20
            disabled:bg-obsidian-950 disabled:text-silver-600 disabled:border-silver-900 disabled:cursor-not-allowed
            [&::-webkit-search-cancel-button]:hidden
            ${className}
          `}
          {...props}
        />

        {currentValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-md text-silver-500 hover:text-silver-100 hover:bg-obsidian-750 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
    );
  }
);

Search.displayName = 'Search';
