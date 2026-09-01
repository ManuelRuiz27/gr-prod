import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  rounded = 'md',
  animated = true,
  className = '',
  style,
  ...props
}) => {
  const roundedStyles = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-input',
    xl: 'rounded-2xl',
    '2xl': 'rounded-card',
    full: 'rounded-full',
  }[rounded];

  const animationClass = animated ? 'animate-pulse' : '';

  const inlineStyles: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return (
    <div
      aria-hidden="true"
      className={`bg-obsidian-800/80 ${roundedStyles} ${animationClass} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
};

export interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  gap?: string;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lastLineWidth = '70%',
  gap = 'gap-2',
  className = '',
}) => {
  return (
    <div aria-hidden="true" className={`flex flex-col ${gap} ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => {
        const isLast = idx === lines - 1;
        return (
          <Skeleton
            key={idx}
            height={14}
            width={isLast ? lastLineWidth : '100%'}
            rounded="sm"
          />
        );
      })}
    </div>
  );
};

export const SkeletonKpi: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`rounded-card p-5 md:p-6 bg-obsidian-850 border border-silver-800/80 shadow-card flex flex-col justify-between gap-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton height={12} width={100} rounded="sm" />
        <Skeleton height={32} width={32} rounded="lg" />
      </div>
      <Skeleton height={32} width={140} rounded="md" />
      <div className="pt-2 border-t border-silver-800/40 flex items-center justify-between">
        <Skeleton height={12} width={120} rounded="sm" />
        <Skeleton height={18} width={60} rounded="full" />
      </div>
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`rounded-card p-6 bg-obsidian-850 border border-silver-800/80 shadow-card flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-silver-800/60">
        <Skeleton height={18} width={160} rounded="md" />
        <Skeleton height={20} width={70} rounded="full" />
      </div>
      <SkeletonText lines={3} />
      <div className="pt-2 flex justify-end gap-2">
        <Skeleton height={36} width={90} rounded="lg" />
        <Skeleton height={36} width={110} rounded="lg" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`w-full rounded-card border border-silver-800/80 bg-obsidian-850 overflow-hidden shadow-card ${className}`}
    >
      {/* Header */}
      <div className="bg-obsidian-900 border-b border-silver-800 px-4 py-3.5 flex items-center gap-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <Skeleton key={idx} height={12} width={`${100 / cols}%`} rounded="sm" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-silver-800/50 p-2 flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-2 py-3 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton key={cIdx} height={16} width={`${100 / cols}%`} rounded="sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
