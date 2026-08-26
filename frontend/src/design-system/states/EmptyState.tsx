import React from 'react';
import { Icon, type IconName } from '../icons/Icon';

import { Button } from '../components/Button';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'info',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl border border-dashed border-surface-highest bg-surface-lowest/50 gap-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-low border border-surface-high flex items-center justify-center text-content-muted">
        <Icon name={icon} size={28} />
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h4 className="text-base font-bold text-content-primary">{title}</h4>
        {description && <p className="text-xs text-content-secondary leading-relaxed">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
