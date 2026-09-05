import React from 'react';
import { Icon, IconButton } from '../../design-system';
import { useAuth } from '../../context/AuthContext';

export interface AdminHeaderProps { onOpenMobileNav?: () => void; }

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobileNav }) => {
  const { user } = useAuth();
  const firstName = (user?.full_name || 'Administración').split(' ')[0];

  return (
    <header className="h-16 bg-obsidian-900 border-b border-silver-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-gold-500 text-obsidian-950 font-bold text-xs rounded-lg shadow-floating border border-gold-400 focus:outline-none">
        Saltar al contenido principal
      </a>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onOpenMobileNav && <div className="lg:hidden shrink-0"><IconButton icon="menu" aria-label="Abrir menú de navegación" variant="ghost" size="sm" onClick={onOpenMobileNav} /></div>}
        <label className="relative flex-1 max-w-xl">
          <span className="sr-only">Buscar graduado por folio o nombre</span>
          <Icon name="search" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-500" />
          <input type="search" placeholder="Buscar folio o nombre..." className="w-full h-9 rounded-lg bg-obsidian-800/70 border border-silver-800 px-9 text-sm text-silver-100 placeholder:text-silver-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/50" />
        </label>
      </div>
      <span className="shrink-0 text-sm font-medium text-silver-200 truncate max-w-28 sm:max-w-none">{firstName}</span>
    </header>
  );
};
