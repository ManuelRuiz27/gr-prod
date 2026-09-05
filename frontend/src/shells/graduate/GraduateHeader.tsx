import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../design-system';

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
}) => (
  <header className="sticky top-0 z-30 bg-obsidian-900/95 backdrop-blur-md border-b border-silver-800/70 px-4 sm:px-5 py-3 font-sans shrink-0">
    <a
      href="#graduate-main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-gold-500 text-obsidian-950 font-bold text-xs rounded-lg shadow-floating border border-gold-400 focus:outline-none"
    >
      Saltar al contenido principal
    </a>
    <div className="flex items-center gap-2.5 w-full">
      {showBack ? (
        <Link
          to={backTo}
          className="p-1.5 -ml-1.5 rounded-xl hover:bg-obsidian-800 text-silver-300 hover:text-silver-50 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
          aria-label="Volver a la vista principal"
        >
          <Icon name="chevron-left" size={22} />
        </Link>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-obsidian-800 text-gold-400 font-display font-bold text-sm flex items-center justify-center shrink-0">GR</div>
      )}
      {title && <h1 className="text-sm font-semibold text-silver-50 truncate tracking-tight">{title}</h1>}
      {subtitle && <span className="text-[11px] text-silver-400 truncate">{subtitle}</span>}
    </div>
  </header>
);
