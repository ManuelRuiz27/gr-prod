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
          <div className="w-12 h-12 rounded-full border-4 border-silver-800 border-t-gold-500 animate-spin" />
          <div className="absolute w-6 h-6 rounded-full bg-gold-500/20 animate-pulse" />
        </div>
        <p className="text-sm font-medium text-silver-300 tracking-wide font-sans">{message}</p>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={`flex flex-col gap-3 w-full animate-pulse ${className}`} aria-busy="true">
        <div className="h-6 bg-obsidian-800 rounded-xl w-1/3" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-obsidian-850 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 gap-3 text-silver-400 font-sans ${className}`}>
      <div className="w-5 h-5 rounded-full border-2 border-silver-800 border-t-gold-500 animate-spin shrink-0" />
      <span className="text-sm font-medium text-silver-300">{message}</span>
    </div>
  );
};
