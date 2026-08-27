import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon, Badge } from '../../design-system';
import { mockEvents } from '../../fixtures';

export const AdminHeader: React.FC = () => {
  const { eventId } = useParams();
  const currentEvent = mockEvents.find((e) => e.id === eventId) || mockEvents[0];

  return (
    <header className="h-16 bg-surface-lowest border-b border-surface-high px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Hierarchy Context: Platform -> Event -> Graduate */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/admin"
          className="text-xs font-semibold text-content-muted hover:text-navy-900 transition-colors shrink-0"
        >
          Plataforma GR
        </Link>
        <span className="text-content-subtle">/</span>

        {/* Event Switcher Context */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-navy-900 truncate">
            {currentEvent.name}
          </span>
          <Badge variant="gold" size="sm">
            {currentEvent.career?.split(' ')[0] || currentEvent.generation}
          </Badge>

        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          to="/showcase"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-low hover:bg-surface-default text-navy-900 border border-surface-high transition-colors"
        >
          <Icon name="settings" size={14} />
          <span>Design Showcase</span>
        </Link>

        <button
          type="button"
          className="p-2 rounded-xl text-content-secondary hover:text-navy-900 hover:bg-surface-low transition-colors"
          aria-label="Notificaciones"
        >
          <Icon name="bell" size={18} />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-surface-high">
          <div className="w-8 h-8 rounded-xl bg-navy-900 text-surface-bright text-xs font-bold flex items-center justify-center shadow-sm">
            AD
          </div>
          <span className="hidden md:inline text-xs font-semibold text-content-primary">
            Admin Principal
          </span>
        </div>
      </div>
    </header>
  );
};
