import React from 'react';
import { IconButton } from '../../design-system';
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
      </div>
      <span className="shrink-0 text-sm font-medium text-silver-200 truncate max-w-28 sm:max-w-none">{firstName}</span>
    </header>
  );
};
