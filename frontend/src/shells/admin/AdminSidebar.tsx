import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../../design-system';


interface SidebarItem {
  label: string;
  to: string;
  icon: IconName;
  badge?: string;
}

export const AdminSidebar: React.FC = () => {
  const globalNav: SidebarItem[] = [
    { label: 'Inicio', to: '/admin', icon: 'home' },
    { label: 'Eventos', to: '/admin/events', icon: 'building', badge: '2' },
    { label: 'Graduados', to: '/admin/graduates', icon: 'users' },
    { label: 'Pagos', to: '/admin/payments', icon: 'payment' },
    { label: 'Reportes', to: '/admin/reports', icon: 'bar-chart' },
    { label: 'Más', to: '/admin/more', icon: 'settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-navy-950 text-surface-bright border-r border-navy-800 select-none shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-navy-800/80">
        <div className="w-9 h-9 rounded-xl bg-navy-800 text-gold-400 font-display font-bold text-base flex items-center justify-center shadow-card-sm border border-navy-700">
          GR
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-surface-bright">Plataforma GR</span>
          <span className="text-[10px] font-semibold text-gold-400 uppercase tracking-wider">Panel Administrador</span>
        </div>
      </div>

      {/* Global Navigation Section */}
      <div className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-navy-300">
          Navegación Global
        </div>
        {globalNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) => `
              flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-navy-800 text-gold-400 font-semibold shadow-card-sm border border-navy-700'
                  : 'text-surface-highest hover:bg-navy-900 hover:text-surface-bright'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-navy-800 text-gold-300 border border-navy-700">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-navy-800/80 text-xs text-navy-300 flex items-center justify-between">
        <span>v1.0 • Baseline M0</span>
        <span className="text-[10px] bg-navy-900 px-2 py-0.5 rounded text-gold-400 font-mono">ADMIN</span>
      </div>
    </aside>
  );
};
