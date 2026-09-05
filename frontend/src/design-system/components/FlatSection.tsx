import React from 'react';

/** A structural grouping: hierarchy comes from spacing and dividers, never a box. */
export const FlatSection: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <section className={`border-t border-silver-800/70 pt-5 ${className}`} {...props}>
    {children}
  </section>
);

export interface InlineMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  emphasis?: 'default' | 'positive' | 'warning' | 'danger';
}

export const InlineMetric: React.FC<InlineMetricProps> = ({
  label,
  value,
  emphasis = 'default',
  className = '',
  ...props
}) => {
  const color = {
    default: 'text-silver-50',
    positive: 'text-status-success',
    warning: 'text-status-warning',
    danger: 'text-status-error',
  }[emphasis];

  return (
    <div className={`min-w-0 ${className}`} {...props}>
      <div className={`text-xl sm:text-2xl font-semibold tracking-tight ${color}`}>{value}</div>
      <div className="mt-1 text-xs text-silver-400">{label}</div>
    </div>
  );
};

export const ActionRow: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`flex min-h-12 items-center justify-between gap-4 border-b border-silver-800/70 py-3 ${className}`} {...props}>
    {children}
  </div>
);

