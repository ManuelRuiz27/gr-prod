import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Icon, type IconName } from '../../design-system';


interface EventTab {
  label: string;
  subpath: string;
  icon: IconName;
}

export const AdminEventNav: React.FC = () => {
  const { eventId = 'evt-ingenieria-2026' } = useParams();

  const eventTabs: EventTab[] = [
    { label: 'Resumen', subpath: '', icon: 'home' },
    { label: 'Graduados', subpath: 'graduates', icon: 'users' },
    { label: 'Pagos', subpath: 'payments', icon: 'payment' },
    { label: 'Mesas', subpath: 'tables', icon: 'table' },
    { label: 'Platillos', subpath: 'meals', icon: 'meal' },
    { label: 'Termos', subpath: 'thermos', icon: 'cup' },
    { label: 'Reportes', subpath: 'reports', icon: 'bar-chart' },
    { label: 'Configuración', subpath: 'settings', icon: 'settings' },
  ];

  return (
    <nav
      aria-label="Navegación contextual del evento"
      className="bg-surface-lowest border-b border-surface-high px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none"
    >
      {eventTabs.map((tab) => {
        const fullPath = tab.subpath
          ? `/admin/events/${eventId}/${tab.subpath}`
          : `/admin/events/${eventId}`;

        return (
          <NavLink
            key={tab.label}
            to={fullPath}
            end={tab.subpath === ''}
            className={({ isActive }) => `
              flex items-center gap-2 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all duration-200
              ${
                isActive
                  ? 'border-navy-900 text-navy-900 bg-navy-50/50'
                  : 'border-transparent text-content-muted hover:text-content-primary hover:border-surface-highest'
              }
            `}
          >
            <Icon name={tab.icon} size={15} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
