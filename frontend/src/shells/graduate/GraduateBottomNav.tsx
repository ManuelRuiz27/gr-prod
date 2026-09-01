import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../../design-system';

interface NavItem {
  label: string;
  to: string;
  icon: IconName;
  badgeCount?: number;
}

export const GraduateBottomNav: React.FC = () => {
  const navItems: NavItem[] = [
    { label: 'Inicio', to: '/graduate', icon: 'home' },
    { label: 'Mi grupo', to: '/graduate/group', icon: 'group' },
    { label: 'Pagos', to: '/graduate/payments', icon: 'payment' },
    { label: 'Más', to: '/graduate/more', icon: 'more' },
  ];

  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed bottom-0 left-0 right-0 z-40 bg-obsidian-900/95 backdrop-blur-md border-t border-silver-800 shadow-floating font-sans"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/graduate'}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 select-none
              ${
                isActive
                  ? 'text-gold-400 font-semibold'
                  : 'text-silver-400 hover:text-silver-100'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`relative p-1 rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 scale-105'
                      : 'text-silver-400'
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  {item.badgeCount && item.badgeCount > 0 ? (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-status-error text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-obsidian-900">
                      {item.badgeCount}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-0.5 shadow-sm" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
