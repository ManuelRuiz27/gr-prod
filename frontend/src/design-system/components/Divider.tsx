import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'gold';
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'default',
  orientation = 'horizontal',
  label,
  className = '',
  ...props
}) => {
  if (orientation === 'vertical') {
    const verticalStyles = {
      default: 'bg-silver-800',
      subtle: 'bg-silver-900',
      gold: 'bg-gradient-to-b from-transparent via-gold-500/30 to-transparent',
    }[variant];

    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`inline-block w-px self-stretch min-h-[1em] ${verticalStyles} ${className}`}
        {...props}
      />
    );
  }

  // Horizontal with optional label
  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={`flex items-center gap-3 my-4 w-full ${className}`}
        {...props}
      >
        <div className="flex-1 h-px bg-silver-800/80" />
        <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider font-sans">
          {label}
        </span>
        <div className="flex-1 h-px bg-silver-800/80" />
      </div>
    );
  }

  const horizontalStyles = {
    default: 'bg-silver-800/80 my-4',
    subtle: 'bg-silver-900 my-3',
    gold: 'bg-gradient-to-r from-transparent via-gold-500/35 to-transparent my-5',
  }[variant];

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`w-full h-px ${horizontalStyles} ${className}`}
      {...props}
    />
  );
};
