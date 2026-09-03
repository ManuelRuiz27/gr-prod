import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Icon, Badge, IconButton } from '../../design-system';
import { mockEvents } from '../../fixtures';
import { useAuth } from '../../context/AuthContext';
import { DemoControls } from '../../demo/DemoControls';

export interface AdminHeaderProps {
  onOpenMobileNav?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobileNav }) => {
  const { eventId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const isInsideEvent = !!eventId && location.pathname.startsWith('/admin/events/');
  const currentEvent = isInsideEvent
    ? mockEvents.find((e) => e.id === eventId) || mockEvents[0]
    : null;

  return (
    <header className="h-16 bg-obsidian-900 border-b border-silver-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 font-sans">
      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-gold-500 text-obsidian-950 font-bold text-xs rounded-lg shadow-floating border border-gold-400 focus:outline-none"
      >
        Saltar al contenido principal
      </a>

      {/* Left: Mobile Trigger & Context Hierarchy */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileNav && (
          <div className="lg:hidden shrink-0">
            <IconButton
              icon="menu"
              aria-label="Abrir menú de navegación"
              variant="ghost"
              size="sm"
              onClick={onOpenMobileNav}
            />
          </div>
        )}

        <nav aria-label="Jerarquía de ubicación" className="flex items-center gap-2 text-xs min-w-0">
          <Link
            to="/admin"
            className="text-silver-400 hover:text-gold-400 transition-colors shrink-0 font-medium"
          >
            Plataforma GR
          </Link>

          {isInsideEvent && currentEvent && (
            <>
              <span className="text-silver-600 shrink-0">/</span>
              <Link
                to="/admin/events"
                className="text-silver-400 hover:text-gold-400 transition-colors shrink-0 hidden sm:inline font-medium"
              >
                Eventos
              </Link>
              <span className="text-silver-600 shrink-0 hidden sm:inline">/</span>
              <span className="text-silver-100 font-semibold truncate max-w-[160px] sm:max-w-xs">
                {currentEvent.name}
              </span>
              <Badge variant="gold" size="sm" className="shrink-0 hidden md:inline-flex">
                {currentEvent.career?.split(' ')[0] || currentEvent.generation}
              </Badge>
            </>
          )}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden xl:block"><DemoControls /></div>
        <Link
          to="/showcase"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-obsidian-800 hover:bg-obsidian-750 text-silver-200 border border-silver-800 hover:border-silver-700 transition-colors"
        >
          <Icon name="settings" size={14} />
          <span>Showcase</span>
        </Link>

        <button
          type="button"
          className="p-2 rounded-lg text-silver-400 hover:text-silver-100 hover:bg-obsidian-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
          aria-label="Notificaciones"
        >
          <Icon name="bell" size={18} />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-silver-800">
          <div className="w-8 h-8 rounded-lg bg-obsidian-800 border border-silver-700 text-gold-400 text-xs font-bold flex items-center justify-center shadow-sm">
            AD
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-silver-100 leading-tight">
              {user?.full_name || 'Admin Principal'}
            </span>
            <span className="text-[10px] font-bold text-silver-500">ADMIN</span>
          </div>
        </div>
      </div>
    </header>
  );
};
