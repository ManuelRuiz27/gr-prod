import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, Badge } from '../../design-system';
import { activeEventMock, currentGraduateMock } from '../../fixtures';

export interface GraduateHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
}

export const GraduateHeader: React.FC<GraduateHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  backTo = '/graduate',
}) => {
  return (
    <header className="sticky top-0 z-30 bg-surface-lowest/95 backdrop-blur-md border-b border-surface-high px-4 py-3">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack ? (
            <Link
              to={backTo}
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-surface-low text-content-primary transition-colors shrink-0"
              aria-label="Volver"
            >
              <Icon name="chevron-left" size={22} />
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-navy-900 text-gold-400 font-display font-bold text-sm flex items-center justify-center shrink-0 shadow-card-sm">
              GR
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-content-primary truncate">
              {title || activeEventMock.name}
            </span>
            <span className="text-[11px] text-content-muted truncate">
              {subtitle || `${currentGraduateMock.fullName} • Mesa ${currentGraduateMock.tableNumber || 'S/A'}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/graduate/notifications"
            className="relative p-2 rounded-xl text-content-secondary hover:text-navy-900 hover:bg-surface-low transition-colors"
            aria-label="Notificaciones"
          >
            <Icon name="bell" size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-400 ring-2 ring-white" />
          </Link>

          <Link to="/graduate/profile" className="flex items-center">
            <Badge variant="primary" size="sm">
              {currentGraduateMock.fullName.split(' ')[0]}
            </Badge>
          </Link>
        </div>
      </div>
    </header>
  );
};
