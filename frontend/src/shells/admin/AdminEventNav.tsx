import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Icon, Badge, type IconName } from '../../design-system';
import { mockEvents } from '../../fixtures';

interface EventTab {
  label: string;
  subpath: string;
  icon: IconName;
}

export const AdminEventNav: React.FC = () => {
  const { eventId = 'evt-derecho-2027' } = useParams();
  const currentEvent = mockEvents.find((e) => e.id === eventId) || mockEvents[0];

  const eventTabs: EventTab[] = [
    { label: 'Resumen', subpath: '', icon: 'home' },
    { label: 'Graduados', subpath: 'graduates', icon: 'users' },
    { label: 'Pagos', subpath: 'payments', icon: 'payment' },
    { label: 'Mesas', subpath: 'tables', icon: 'table' },
    { label: 'Platillos', subpath: 'meals', icon: 'meal' },
    { label: 'Termos', subpath: 'thermos', icon: 'cup' },
    { label: 'Reportes', subpath: 'reports', icon: 'bar-chart' },
    { label: 'Configuración', subpath: 'settings', icon: 'settings' },
    { label: 'Auditoría', subpath: 'audit', icon: 'clock' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'Abierto':
        return <Badge variant="success" size="sm" dot>Abierto</Badge>;
      case 'CLOSED':
      case 'Cerrado':
        return <Badge variant="neutral" size="sm" dot>Cerrado</Badge>;
      case 'CANCELLED':
      case 'Cancelado':
        return <Badge variant="error" size="sm" dot>Cancelado</Badge>;
      default:
        return <Badge variant="neutral" size="sm" dot>{status}</Badge>;
    }
  };

  return (
    <div className="bg-obsidian-900 border-b border-silver-800 shrink-0 font-sans">
      {/* Event Compact Context Header */}
      <div className="px-4 sm:px-6 py-3 border-b border-silver-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-obsidian-950/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-obsidian-800 border border-silver-700/80 flex items-center justify-center text-silver-300 shrink-0 shadow-card-sm">
            <Icon name="building" size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-silver-50 truncate tracking-tight">
                {currentEvent.name}
              </h2>
              {getStatusBadge(currentEvent.status || 'OPEN')}
            </div>
            <p className="text-xs text-silver-400 truncate">
              {currentEvent.venue || 'Centro de Convenciones'} • {currentEvent.date || '2027'}
            </p>
          </div>
        </div>
      </div>

      {/* Contextual Tabs Navigation */}
      <nav
        aria-label="Navegación contextual del evento"
        className="px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar"
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
                flex items-center gap-2 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/30 rounded-t-md
                ${
                  isActive
                    ? 'border-gold-500 text-gold-400 bg-obsidian-850/70 shadow-sm'
                    : 'border-transparent text-silver-400 hover:text-silver-100 hover:bg-obsidian-850/40'
                }
              `}
            >
              <Icon name={tab.icon} size={15} />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
