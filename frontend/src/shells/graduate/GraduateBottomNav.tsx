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
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-lowest/95 backdrop-blur-md border-t border-surface-high shadow-floating max-w-md mx-auto"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/graduate'}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-200
              ${
                isActive
                  ? 'text-navy-900 font-bold'
                  : 'text-content-muted hover:text-content-primary'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`relative p-1 rounded-lg transition-transform duration-200 ${
                    isActive ? 'scale-110 bg-navy-50 text-navy-900' : ''
                  }`}
                >
                  <Icon name={item.icon} size={22} />
                  {item.badgeCount && item.badgeCount > 0 ? (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-status-error text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                      {item.badgeCount}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-gold-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
