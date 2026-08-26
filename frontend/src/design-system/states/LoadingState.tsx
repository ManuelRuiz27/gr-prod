import React from 'react';

export interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'full-page';
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando información...',
  variant = 'spinner',
  rows = 3,
  className = '',
}) => {
  if (variant === 'full-page') {
    return (
      <div className={`min-h-[50vh] flex flex-col items-center justify-center p-8 gap-4 animate-fadeIn ${className}`}>
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-navy-100 border-t-navy-900 animate-spin" />
          <div className="absolute w-6 h-6 rounded-full bg-gold-400/20 animate-pulse" />
        </div>
        <p className="text-sm font-medium text-content-secondary tracking-wide">{message}</p>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={`flex flex-col gap-3 w-full animate-pulse ${className}`} aria-busy="true">
        <div className="h-6 bg-surface-high rounded-xl w-1/3" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-surface-low rounded-xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 gap-3 text-content-secondary ${className}`}>
      <div className="w-5 h-5 rounded-full border-2 border-surface-highest border-t-navy-900 animate-spin shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
