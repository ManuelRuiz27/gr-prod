import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { GraduateHeader } from './GraduateHeader';
import { GraduateBottomNav } from './GraduateBottomNav';

export const GraduateLayout: React.FC = () => {
  const location = useLocation();

  // Secondary sub-routes configuration (with back button)
  const isSubRoute = [
    '/graduate/contract',
    '/graduate/table',
    '/graduate/meals',
    '/graduate/thermo',
    '/graduate/notifications',
    '/graduate/profile',
    '/graduate/help',
  ].some((path) => location.pathname.startsWith(path));

  const getSubRouteTitle = () => {
    if (location.pathname.startsWith('/graduate/contract')) return 'Mi contrato';
    if (location.pathname.startsWith('/graduate/table')) return 'Asignación de Mesa';
    if (location.pathname.startsWith('/graduate/meals')) return 'Selección de Platillos';
    if (location.pathname.startsWith('/graduate/thermo')) return 'Personalización de Termo';
    if (location.pathname.startsWith('/graduate/notifications')) return 'Notificaciones';
    if (location.pathname.startsWith('/graduate/profile')) return 'Mi Perfil';
    if (location.pathname.startsWith('/graduate/help')) return 'Ayuda y Soporte';
    return undefined;
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-silver-100 flex flex-col justify-between selection:bg-gold-500/30 selection:text-silver-50">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto bg-obsidian-950 min-h-screen flex flex-col pb-24 sm:pb-28 border-x border-silver-800/40 relative font-sans">
        <GraduateHeader
          title={getSubRouteTitle()}
          showBack={isSubRoute}
          backTo="/graduate"
        />

        <main
          id="graduate-main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-5 flex flex-col gap-4 animate-fadeIn focus:outline-none"
        >
          <Outlet />
        </main>

        <GraduateBottomNav />
      </div>
    </div>
  );
};
