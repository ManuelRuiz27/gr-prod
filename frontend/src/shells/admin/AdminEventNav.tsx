import React, { useRef, useEffect } from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { Icon, Badge, type IconName } from '../../design-system';
import { mockEvents } from '../../fixtures';

interface EventTab { label: string; subpath: string; icon: IconName; }

const EventStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return <Badge variant="success" size="sm" dot className="hidden sm:inline-flex">Abierto</Badge>;
    case 'CLOSED':
      return <Badge variant="neutral" size="sm" dot className="hidden sm:inline-flex">Cerrado</Badge>;
    case 'CANCELLED':
      return <Badge variant="error" size="sm" dot className="hidden sm:inline-flex">Cancelado</Badge>;
    default:
      return null;
  }
};

export const AdminEventNav: React.FC = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const currentEvent = eventId ? mockEvents.find((event) => event.id === eventId) : undefined;

  const eventTabs: EventTab[] = [
    { label: 'Resumen', subpath: '', icon: 'home' },
    { label: 'Graduados', subpath: 'graduates', icon: 'users' },
    { label: 'Pagos', subpath: 'payments', icon: 'payment' },
    { label: 'Mesas', subpath: 'tables', icon: 'table' },
    { label: 'Platillos', subpath: 'meals', icon: 'meal' },
    { label: 'Termos', subpath: 'thermos', icon: 'cup' },
  ];
  const moreTabs: EventTab[] = [
    { label: 'Reportes', subpath: 'reports', icon: 'bar-chart' },
    { label: 'Configuración', subpath: 'settings', icon: 'settings' },
    { label: 'Historial', subpath: 'audit', icon: 'clock' },
  ];

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (detailsRef.current?.open && !detailsRef.current.contains(e.target as Node)) {
        detailsRef.current.open = false;
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && detailsRef.current?.open) {
        detailsRef.current.open = false;
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  }, [location.pathname]);

  if (!currentEvent || !eventId) return null;

  const isMoreActive = moreTabs.some((tab) =>
    location.pathname.startsWith(`/admin/events/${eventId}/${tab.subpath}`)
  );

  return (
    <div className="relative z-30 bg-obsidian-900 border-b border-silver-800 shrink-0 font-sans">
      <div className="px-4 sm:px-6 py-3 flex items-center gap-3 bg-obsidian-950/40">
        <div className="w-9 h-9 rounded-lg bg-obsidian-800 flex items-center justify-center text-silver-300 shrink-0">
          <Icon name="building" size={18} />
        </div>
        <div className="min-w-0 flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-silver-50 truncate tracking-tight">{currentEvent.name}</h2>
          <EventStatusBadge status={currentEvent.status} />
        </div>
      </div>

      <nav aria-label="Navegación contextual del evento" className="relative px-2 sm:px-6">
        <div className="flex sm:grid sm:grid-cols-7 items-center gap-1 sm:gap-0.5 sm:overflow-visible">
          <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto no-scrollbar sm:contents">
            {eventTabs.map((tab) => {
              const fullPath = tab.subpath ? `/admin/events/${eventId}/${tab.subpath}` : `/admin/events/${eventId}`;
              return (
                <NavLink
                  key={tab.label}
                  to={fullPath}
                  end={tab.subpath === ''}
                  className={({ isActive }) => `shrink-0 sm:shrink min-w-[72px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2.5 text-[11px] sm:text-xs font-semibold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/30 rounded-t-md ${isActive ? 'border-gold-500 text-gold-400 bg-obsidian-850/70' : 'border-transparent text-silver-400 hover:text-silver-100 hover:bg-obsidian-850/40'}`}
                >
                  <Icon name={tab.icon} size={15} />
                  <span className="truncate">{tab.label}</span>
                </NavLink>
              );
            })}
          </div>

          <details ref={detailsRef} className="relative shrink-0 sm:shrink min-w-[56px] sm:min-w-0">
            <summary
              className={`list-none cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2.5 text-[11px] sm:text-xs font-semibold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/30 rounded-t-md [&::-webkit-details-marker]:hidden ${
                isMoreActive
                  ? 'border-gold-500 text-gold-400 bg-obsidian-850/70'
                  : 'border-transparent text-silver-400 hover:text-silver-100 hover:bg-obsidian-850/40'
              }`}
            >
              <Icon name="more" size={15} />
              <span>Más</span>
            </summary>
            <div className="absolute right-0 top-full z-50 mt-1 min-w-44 rounded-lg bg-obsidian-800 border border-silver-700 shadow-floating p-1.5 animate-fadeIn">
              {moreTabs.map((tab) => (
                <NavLink
                  key={tab.label}
                  to={`/admin/events/${eventId}/${tab.subpath}`}
                  onClick={() => {
                    if (detailsRef.current) detailsRef.current.open = false;
                  }}
                  className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium ${isActive ? 'bg-obsidian-700 text-gold-400' : 'text-silver-300 hover:bg-obsidian-750 hover:text-silver-50'}`}
                >
                  <Icon name={tab.icon} size={15} />
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </details>
        </div>
      </nav>
    </div>
  );
};
