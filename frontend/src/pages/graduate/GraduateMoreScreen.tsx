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

const formatThermoStatus = (status: string): string => {
  switch (status) {
    case 'LOCKED':
      return 'Bloqueado por avance financiero';
    case 'AVAILABLE':
      return 'Disponible para personalizar';
    case 'CUSTOMIZED':
      return 'Personalización confirmada';
    case 'IN_PRODUCTION':
      return 'En producción';
    case 'DELIVERED':
      return 'Entregado';
    default:
      return status;
  }
};

export const GraduateMoreScreen: React.FC = () => {
  const links: HubLink[] = [
    {
      label: 'Mi Contrato',
      to: '/graduate/contract',
      icon: 'ticket',
      description: 'Consulta los términos y condiciones de tu membresía',
    },
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
      description: 'Consulta o actualiza tus selecciones',
    },
    {
      label: 'Gestión de Termo',
      to: '/graduate/thermo',
      icon: 'cup',
      description: `Estado: ${formatThermoStatus(currentGraduateMock.thermoStatus)}`,
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans animate-fadeIn pb-20">
      {/* Profile Summary Card */}
      <Card className="p-5 bg-obsidian-850 border border-silver-800/80 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-obsidian-900 border border-gold-500/40 text-gold-400 font-bold font-display text-lg flex items-center justify-center shrink-0">
          AM
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-base font-bold text-silver-50 truncate">
            {currentGraduateMock.fullName}
          </span>
          <span className="text-xs text-silver-400 truncate">
            {currentGraduateMock.career} • Generación {currentGraduateMock.generation}
          </span>
          <span className="text-[11px] text-silver-500 mt-0.5">
            {currentGraduateMock.email}
          </span>
        </div>
      </Card>

      {/* Hub Navigation Links */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-silver-400 px-1">
          Servicios y Módulos
        </h3>

        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card variant="interactive" className="p-4 bg-obsidian-850 border border-silver-800/80 hover:border-silver-700 flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-obsidian-900 border border-silver-800 text-silver-200 flex items-center justify-center shrink-0">
                  <Icon name={link.icon} size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-silver-100">{link.label}</span>
                    {link.badge && (
                      <Badge variant="warning" size="sm">
                        {link.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-silver-400 truncate">{link.description}</span>
                </div>
              </div>
              <Icon name="chevron-right" size={18} className="text-silver-500 shrink-0" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Event Context Info */}
      <div className="p-4 rounded-2xl bg-obsidian-900 border border-silver-800/80 text-xs text-silver-400 flex flex-col gap-1">
        <span className="font-bold text-silver-200">{activeEventMock.name}</span>
        <span>{activeEventMock.venue} • Fecha: {activeEventMock.date}</span>
      </div>
    </div>
  );
};
