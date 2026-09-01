import React from 'react';

export interface PageHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  displayFont?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  displayFont = true,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-3 pb-4 sm:pb-6 border-b border-silver-800/80 ${className}`}>
      {breadcrumbs && <div className="mb-1">{breadcrumbs}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          {typeof title === 'string' ? (
            <h1
              className={`text-2xl sm:text-3xl font-bold tracking-tight text-silver-50 ${
                displayFont ? 'font-display' : 'font-sans'
              }`}
            >
              {title}
            </h1>
          ) : (
            title
          )}
          {subtitle && (
            <p className="text-sm text-silver-400 font-sans leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export interface SectionHeaderProps {
  title: string | React.ReactNode;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex items-start sm:items-center justify-between gap-3 mb-4 ${className}`}>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2.5">
          {typeof title === 'string' ? (
            <h3 className="text-lg font-semibold text-silver-50 font-sans tracking-tight">
              {title}
            </h3>
          ) : (
            title
          )}
          {badge}
        </div>
        {description && <p className="text-xs text-silver-400 font-sans">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
