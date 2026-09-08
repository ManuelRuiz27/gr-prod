import React from 'react';
import { IconButton } from '../../design-system';
import { useAuth } from '../../context/AuthContext';

export interface AdminHeaderProps {
  onOpenNav?: () => void;
  onOpenMobileNav?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenNav, onOpenMobileNav }) => {
  const { user } = useAuth();
  const firstName = (user?.full_name || 'Administración').split(' ')[0];
  const handleOpen = onOpenNav || onOpenMobileNav;

  return (
    <header className="min-h-16 pt-[env(safe-area-inset-top,0px)] bg-obsidian-900 border-b border-silver-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 font-sans shadow-card-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-gold-500 text-obsidian-950 font-bold text-xs rounded-lg shadow-floating border border-gold-400 focus:outline-none"
      >
        Saltar al contenido principal
      </a>
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {handleOpen && (
          <div className="shrink-0">
            <IconButton
              icon="menu"
              aria-label="Abrir menú de navegación"
              variant="secondary"
              size="sm"
              onClick={handleOpen}
              className="border-silver-700/80 bg-obsidian-800/90 hover:bg-obsidian-750 text-silver-300 hover:text-gold-400 shadow-card-sm hover:shadow-floating hover:border-gold-500/50 transition-all"
            />
          </div>
        )}
        <div className="flex items-center gap-2.5 min-w-0 select-none">
          <div className="w-8 h-8 rounded-lg bg-obsidian-800 text-gold-400 font-display font-bold text-sm flex items-center justify-center border border-gold-500/30 shadow-card-sm shrink-0">
            GR
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold tracking-tight text-silver-50 font-sans truncate">
              Plataforma GR
            </span>
            <span className="text-[10px] font-semibold text-gold-400 uppercase tracking-wider font-sans hidden sm:inline-block">
              Administración
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-obsidian-800 border border-silver-700/80 flex items-center justify-center text-[11px] font-bold text-gold-400 shrink-0">
          AD
        </div>
        <span className="shrink-0 text-sm font-medium text-silver-200 truncate max-w-28 sm:max-w-none">
          {firstName}
        </span>
      </div>
    </header>
  );
};
