import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../../design-system';
import { useAuth } from '../../context/AuthContext';

interface SidebarItem {
  label: string;
  to: string;
  icon: IconName;
  badge?: string;
}

export interface AdminSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onNavigate, className = '' }) => {
  const { user, logout } = useAuth();

  const globalNav: SidebarItem[] = [
    { label: 'Inicio', to: '/admin', icon: 'home' },
    { label: 'Eventos', to: '/admin/events', icon: 'building' },
    { label: 'Graduados', to: '/admin/graduates', icon: 'users' },
    { label: 'Pagos', to: '/admin/payments', icon: 'payment' },
    { label: 'Reportes', to: '/admin/reports', icon: 'bar-chart' },
    { label: 'Más', to: '/admin/more', icon: 'settings' },
  ];

  return (
    <aside
      aria-label="Navegación principal"
      className={`flex flex-col w-64 bg-obsidian-900 text-silver-100 border-r border-silver-800 select-none shrink-0 h-full ${className}`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-silver-800/80 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-obsidian-800 text-gold-400 font-display font-bold text-base flex items-center justify-center shadow-card-sm border border-gold-500/30">
          GR
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold tracking-tight text-silver-50 font-sans">
            Plataforma GR
          </span>
          <span className="text-[10px] font-semibold text-gold-400 uppercase tracking-wider font-sans">
            Administración
          </span>
        </div>
      </div>

      {/* Global Navigation Links */}
      <nav aria-label="Menú global" className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-y-auto font-sans">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-silver-500">
          Navegación Global
        </div>
        {globalNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            onClick={onNavigate}
            className={({ isActive }) => `
              flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40
              ${
                isActive
                  ? 'bg-obsidian-800 text-silver-50 font-semibold border border-silver-700/80 shadow-card-sm border-l-4 border-l-gold-500'
                  : 'text-silver-400 hover:text-silver-100 hover:bg-obsidian-850'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-obsidian-800 text-gold-300 border border-silver-700">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Account & Profile Area */}
      <div className="p-4 border-t border-silver-800/80 bg-obsidian-950/60 flex flex-col gap-3 shrink-0 font-sans">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-obsidian-800 border border-silver-700 flex items-center justify-center text-xs font-bold text-gold-400 shrink-0">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-silver-100 truncate">
                {user?.full_name || 'Admin Principal'}
              </span>
              <span className="text-[10px] font-bold text-silver-400">ADMIN</span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="p-1.5 rounded-lg text-silver-400 hover:text-status-error hover:bg-obsidian-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
          >
            <Icon name="log-out" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
