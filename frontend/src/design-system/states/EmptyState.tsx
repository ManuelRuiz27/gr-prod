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
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-card border border-dashed border-silver-800 bg-obsidian-900/50 gap-4 font-sans ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-obsidian-800 border border-silver-800 flex items-center justify-center text-silver-400">
        <Icon name={icon} size={28} />
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h4 className="text-base font-bold text-silver-50">{title}</h4>
        {description && <p className="text-xs text-silver-400 leading-relaxed">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
