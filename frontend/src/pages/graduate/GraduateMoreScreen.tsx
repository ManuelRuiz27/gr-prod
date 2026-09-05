import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Icon } from '../../design-system';
import { activeEventMock, currentGraduateMock } from '../../fixtures';

interface HubLink {
  label: string;
  to: string;
  badge?: string;
  hint?: string;
}

export const GraduateMoreScreen: React.FC = () => {
  const links: HubLink[] = [
    {
      label: 'Mi Contrato',
      to: '/graduate/contract',
    },
    {
      label: 'Mesa y Croquis',
      to: '/graduate/table',
      hint: `Mesa ${currentGraduateMock.tableNumber}`,
    },
    {
      label: 'Selección de Platillos',
      to: '/graduate/meals',
    },
    {
      label: 'Gestión de Termo',
      to: '/graduate/thermo',
    },
    {
      label: 'Notificaciones',
      to: '/graduate/notifications',
      badge: '1 nuevo',
    },
    {
      label: 'Mis datos',
      to: '/graduate/profile',
    },
    {
      label: 'Ayuda y soporte',
      to: '/graduate/help',
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto font-sans animate-fadeIn pb-20">
      {/* Profile Header (Flat on page) */}
      <header className="border-b border-silver-800/60 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-silver-50 tracking-tight font-display">
          {currentGraduateMock.fullName}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-silver-400 mt-1">
          <span>{currentGraduateMock.career}</span>
          <span>·</span>
          <span>Gen {currentGraduateMock.generation}</span>
          <span>·</span>
          <span className="text-silver-500">{currentGraduateMock.email}</span>
        </div>
      </header>

      {/* Flat Navigation Rows */}
      <nav aria-label="Servicios adicionales" className="divide-y divide-silver-800/60">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="py-3.5 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-silver-200 group-hover:text-silver-100 font-medium">
                {link.label}
              </span>
              {link.badge && (
                <Badge variant="warning" size="sm">
                  {link.badge}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {link.hint && (
                <span className="text-xs text-silver-400 font-sans">
                  {link.hint}
                </span>
              )}
              <Icon name="chevron-right" size={14} className="text-silver-500 group-hover:text-silver-300" />
            </div>
          </Link>
        ))}
      </nav>

      <hr className="border-silver-800/60 my-1" />

      {/* Event Context & Logout */}
      <div className="flex flex-col gap-4 text-xs text-silver-400 px-1">
        <div className="space-y-0.5">
          <span className="font-semibold text-silver-300 block">{activeEventMock.name}</span>
          <span>{activeEventMock.venue} • {activeEventMock.date}</span>
        </div>

        <div className="pt-2">
          <Link
            to="/login"
            className="text-xs text-silver-400 hover:text-silver-200 transition-colors"
          >
            Cerrar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
