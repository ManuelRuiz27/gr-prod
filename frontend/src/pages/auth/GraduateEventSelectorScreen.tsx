import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockEvents } from '../../fixtures';
import { getEventStatusLabel } from '../../lib/eventStatusLabel';
import { Card, Badge, Button, Icon } from '../../design-system';

export const GraduateEventSelectorScreen: React.FC = () => {
  const navigate = useNavigate();

  function handleOpenEvent(): void {
    navigate('/graduate');
  }

  return (
    <div className="min-h-screen bg-surface-low text-content-primary flex flex-col items-center px-5 py-8">
      <main className="w-full max-w-[420px] mx-auto flex flex-col gap-6">
        {/* Top Header */}
        <header className="flex items-center justify-between py-2 border-b border-surface-high">
          <h1 className="text-base font-bold text-navy-900">Mis eventos</h1>
          <div className="w-8 h-8 rounded-full bg-surface-lowest border border-surface-high flex items-center justify-center text-navy-900">
            <Icon name="user" size={16} />
          </div>
        </header>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">
            Selecciona un evento
          </h2>

          <p className="text-xs text-content-secondary">
            Accede a los detalles y pagos de tus eventos activos.
          </p>
        </div>

        {/* Event List */}
        <div className="flex flex-col gap-4">
          {mockEvents.map((event) => (
            <Card key={event.id} className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Badge variant="success" dot size="sm">
                  {getEventStatusLabel(event.status)}
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-navy-900 leading-snug">
                  {event.name}
                </h3>
                <div className="flex flex-col gap-1 text-xs text-content-secondary">
                  <div className="flex items-center gap-2">
                    <Icon name="calendar" size={14} className="text-gold-600 shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="building" size={14} className="text-gold-600 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-surface-low">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleOpenEvent}
                  iconEnd="chevron-right"
                  className="h-11 text-xs font-semibold"
                >
                  Abrir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};
