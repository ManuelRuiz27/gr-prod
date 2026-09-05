import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../../design-system';

interface NavItem { label: string; to: string; icon: IconName; }

export const GraduateBottomNav: React.FC = () => {
  const navItems: NavItem[] = [
    { label: 'Inicio', to: '/graduate', icon: 'home' },
    { label: 'Mi grupo', to: '/graduate/group', icon: 'group' },
    { label: 'Pagos', to: '/graduate/payments', icon: 'payment' },
    { label: 'Más', to: '/graduate/more', icon: 'more' },
  ];

  return (
    <nav aria-label="Navegación principal" className="fixed bottom-0 left-0 right-0 z-40 bg-obsidian-900/95 backdrop-blur-md border-t border-silver-800/70 shadow-floating font-sans lg:static lg:border-t-0 lg:border-b lg:shadow-none">
      <div className="mx-auto flex items-center justify-around h-16 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:h-14 lg:max-w-6xl lg:justify-start lg:gap-1 lg:px-8 lg:pb-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/graduate'}
            className={({ isActive }) => `relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl transition-all duration-150 lg:flex-row lg:gap-2 lg:min-w-0 lg:px-3.5 lg:py-2 lg:text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 select-none ${isActive ? 'text-gold-400 font-semibold' : 'text-silver-400 hover:text-silver-100'}`}
          >
            {({ isActive }) => (
              <>
                <div className={`relative p-1 rounded-lg transition-all duration-150 ${isActive ? 'bg-gold-500/15 text-gold-400 scale-105' : 'text-silver-400'}`}>
                  <Icon name={item.icon} size={20} />
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight lg:mt-0">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
