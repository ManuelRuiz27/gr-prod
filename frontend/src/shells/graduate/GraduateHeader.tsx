import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, Badge } from '../../design-system';
import { activeEventMock, currentGraduateMock } from '../../fixtures';
import { useAuth } from '../../context/AuthContext';
import { DemoControls } from '../../demo/DemoControls';

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
  const { user } = useAuth();
  const displayName = user?.full_name || currentGraduateMock.fullName;
  const firstName = displayName.split(' ')[0];

  return (
    <header className="sticky top-0 z-30 bg-obsidian-900/95 backdrop-blur-md border-b border-silver-800 px-4 py-3 font-sans shrink-0">
      {/* Skip to main content accessible link */}
      <a
        href="#graduate-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-gold-500 text-obsidian-950 font-bold text-xs rounded-lg shadow-floating border border-gold-400 focus:outline-none"
      >
        Saltar al contenido principal
      </a>

      <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
        {/* Left: Back Link or Brand Mark */}
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack ? (
            <Link
              to={backTo}
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-obsidian-800 text-silver-300 hover:text-silver-50 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
              aria-label="Volver a la vista principal"
            >
              <Icon name="chevron-left" size={22} />
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-obsidian-800 text-gold-400 font-display font-bold text-sm flex items-center justify-center shrink-0 shadow-card-sm border border-gold-500/30">
              GR
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-bold text-silver-50 truncate tracking-tight">
              {title || activeEventMock.name}
            </h1>
            <span className="text-[11px] text-silver-400 truncate">
              {subtitle || `${displayName} • Mesa ${currentGraduateMock.tableNumber || 'S/A'}`}
            </span>
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:block"><DemoControls /></div>
          <Link
            to="/graduate/notifications"
            className="relative p-2 rounded-xl text-silver-400 hover:text-silver-100 hover:bg-obsidian-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
            aria-label="Notificaciones del evento"
          >
            <Icon name="bell" size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-400 ring-2 ring-obsidian-900" />
          </Link>

          <Link
            to="/graduate/profile"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 rounded-lg"
            aria-label={`Ver perfil de ${displayName}`}
          >
            <Badge variant="primary" size="sm" className="bg-obsidian-800 text-gold-400 border-gold-500/30 font-semibold">
              {firstName}
            </Badge>
          </Link>
        </div>
      </div>
    </header>
  );
};
