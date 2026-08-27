import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Icon, type IconName } from '../../design-system';
import { activeEventMock, currentGraduateMock } from '../../fixtures';

interface HubLink {
  label: string;
  to: string;
  icon: IconName;
  description: string;
  badge?: string;
}

export const GraduateMoreScreen: React.FC = () => {
  const links: HubLink[] = [
    {
      label: 'Mesa y Croquis',
      to: '/graduate/table',
      icon: 'table',
      description: `Mesa ${currentGraduateMock.tableNumber} (${currentGraduateMock.ticketCount} lugares)`,
    },
    {
      label: 'Selección de Platillos',
      to: '/graduate/meals',
      icon: 'meal',
      description: 'Menú Tradicional, Vegetariano y Vegano',
    },
    {
      label: 'Gestión de Termo',
      to: '/graduate/thermo',
      icon: 'cup',
      description: `Estado: ${currentGraduateMock.thermoStatus}`,
    },
    {
      label: 'Notificaciones',
      to: '/graduate/notifications',
      icon: 'bell',
      description: 'Avisos de pagos y fechas límite',
      badge: '1 nuevo',
    },
    {
      label: 'Mi Perfil',
      to: '/graduate/profile',
      icon: 'user',
      description: currentGraduateMock.fullName,
    },
    {
      label: 'Ayuda y Soporte',
      to: '/graduate/help',
      icon: 'info',
      description: 'Preguntas frecuentes y reglamento',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Profile Summary Card */}
      <Card className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-navy-900 text-gold-400 font-bold font-display text-lg flex items-center justify-center shrink-0">
          AM
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-base font-bold text-navy-900 truncate">
            {currentGraduateMock.fullName}
          </span>
          <span className="text-xs text-content-secondary truncate">
            {currentGraduateMock.career} • Generación {currentGraduateMock.generation}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5">
            {currentGraduateMock.email}
          </span>
        </div>
      </Card>

      {/* Hub Navigation Links */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted px-1">
          Servicios y Módulos
        </h3>

        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card variant="interactive" className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-low text-navy-900 flex items-center justify-center shrink-0">
                  <Icon name={link.icon} size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-navy-900">{link.label}</span>
                    {link.badge && (
                      <Badge variant="warning" size="sm">
                        {link.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-content-secondary truncate">{link.description}</span>
                </div>
              </div>
              <Icon name="chevron-right" size={18} className="text-content-muted shrink-0" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Event Context Info */}
      <div className="p-4 rounded-2xl bg-surface-low border border-surface-high text-xs text-content-secondary flex flex-col gap-1">
        <span className="font-bold text-navy-900">{activeEventMock.name}</span>
        <span>{activeEventMock.venue} • Fecha: {activeEventMock.date}</span>
      </div>
    </div>
  );
};
