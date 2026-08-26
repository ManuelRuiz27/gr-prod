import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { GraduateHeader } from './GraduateHeader';
import { GraduateBottomNav } from './GraduateBottomNav';

export const GraduateLayout: React.FC = () => {
  const location = useLocation();

  // Secondary sub-routes configuration (with back button)
  const isSubRoute = [
    '/graduate/table',
    '/graduate/meals',
    '/graduate/thermo',
    '/graduate/notifications',
    '/graduate/profile',
    '/graduate/help',
  ].some((path) => location.pathname.startsWith(path));

  const getSubRouteTitle = () => {
    if (location.pathname.startsWith('/graduate/table')) return 'Asignación de Mesa';
    if (location.pathname.startsWith('/graduate/meals')) return 'Selección de Platillos';
    if (location.pathname.startsWith('/graduate/thermo')) return 'Personalización de Termo';
    if (location.pathname.startsWith('/graduate/notifications')) return 'Notificaciones';
    if (location.pathname.startsWith('/graduate/profile')) return 'Mi Perfil';
    if (location.pathname.startsWith('/graduate/help')) return 'Ayuda y Soporte';
    return undefined;
  };

  return (
    <div className="min-h-screen bg-surface-bg text-content-primary flex flex-col justify-between selection:bg-gold-200 selection:text-navy-950">
      <div className="w-full max-w-md mx-auto bg-surface-bg min-h-screen flex flex-col pb-20 shadow-card-md border-x border-surface-high/40">
        <GraduateHeader
          title={getSubRouteTitle()}
          showBack={isSubRoute}
          backTo="/graduate"
        />

        <main className="flex-1 p-4 md:p-5 flex flex-col gap-4 animate-fadeIn">
          <Outlet />
        </main>

        <GraduateBottomNav />
      </div>
    </div>
  );
};
