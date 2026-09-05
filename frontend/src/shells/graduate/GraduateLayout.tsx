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
    <div className="min-h-screen bg-obsidian-950 text-silver-100 selection:bg-gold-500/30 selection:text-silver-50">
      <div className="min-h-screen w-full mx-auto bg-obsidian-950 flex flex-col relative font-sans lg:max-w-6xl">
        <GraduateHeader
          title={getSubRouteTitle()}
          showBack={isSubRoute}
          backTo="/graduate"
        />

        <GraduateBottomNav />

        <main
          id="graduate-main-content"
          tabIndex={-1}
          className="flex-1 w-full p-4 sm:p-5 lg:px-8 lg:py-7 pb-24 sm:pb-28 lg:pb-8 flex flex-col gap-4 animate-fadeIn focus:outline-none"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
