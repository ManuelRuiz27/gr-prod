import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Badge,
  Button,
  Breadcrumb,
  EmptyState,
  Alert,
  Icon,
  type BadgeVariant,
} from '../../design-system';
import {
  mockEvents,
  mockGraduatesList,
  mockTables,
  type EventStatus,
} from '../../fixtures';
import { getEventStatusLabel } from '../../lib/eventStatusLabel';
import {
  getAvailableEventActions,
  getEventActionLabel,
  type EventLifecycleAction,
} from './event-overview/eventLifecycle';
import { EventLifecycleDialog } from './event-overview/EventLifecycleDialog';
import { getEventOverviewMetrics } from './event-overview/eventOverviewMetrics';

export const AdminEventOverviewScreen: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [selectedAction, setSelectedAction] =
    useState<EventLifecycleAction | null>(null);
  const [transitionFeedback, setTransitionFeedback] = useState('');

  const event = mockEvents.find((item) => item.id === eventId);

  if (!event) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Evento no encontrado', current: true },
          ]}
        />
        <EmptyState
          title="Evento no encontrado"
          description="No encontramos el evento solicitado."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // Derived metrics from existing fixtures
  const {
    graduateCount,
    contractedPlaces,
    tableCapacity,
    occupiedPlaces,
    occupancyPercent,
  } = getEventOverviewMetrics(
    event.id,
    mockGraduatesList,
    mockTables
  );

  const getStatusBadgeVariant = (status: EventStatus): BadgeVariant => {

    switch (status) {
      case 'DRAFT':
        return 'neutral';
      case 'OPEN':
        return 'success';
      case 'CLOSED':
        return 'warning';
      case 'FINALIZED':
        return 'primary';
      case 'CANCELLED':
        return 'error';
    }
  };

  const getActionButtonVariant = (action: EventLifecycleAction) => {
    switch (action) {
      case 'OPEN':
      case 'REOPEN':
      case 'FINALIZE':
        return 'primary' as const;
      case 'CLOSE':
        return 'secondary' as const;
      case 'CANCEL':
        return 'danger' as const;
    }
  };

  const availableActions = getAvailableEventActions(event.status);

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto">
      {/* Breadcrumb Hierarchy */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, current: true },
        ]}
      />

      {transitionFeedback && (
        <Alert
          variant="info"
          onDismiss={() => setTransitionFeedback('')}
        >
          {transitionFeedback}
        </Alert>
      )}

      {/* Event Header Banner */}
      <Card variant="gold-accent" className="p-6 md:p-8 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(event.status)} dot size="sm">
                {getEventStatusLabel(event.status)}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-content-secondary">
              <div className="flex items-center gap-1.5">
                <Icon name="calendar" size={14} className="text-gold-600 shrink-0" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="building" size={14} className="text-gold-600 shrink-0" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to={`/admin/events/${event.id}/graduates`}>
              <Button variant="secondary" size="sm" iconStart="users">
                Graduados
              </Button>
            </Link>
            <Link to={`/admin/events/${event.id}/payments`}>
              <Button variant="secondary" size="sm" iconStart="payment">
                Pagos
              </Button>
            </Link>
            <Link to={`/admin/events/${event.id}/tables`}>
              <Button variant="secondary" size="sm" iconStart="building">
                Mesas
              </Button>
            </Link>
            <Link to={`/admin/events/${event.id}/settings`}>
              <Button variant="secondary" size="sm" iconStart="settings">
                Configuración
              </Button>
            </Link>
            <Link to={`/admin/events/${event.id}/reports`}>
              <Button variant="secondary" size="sm" iconStart="download">
                Reportes
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-content-secondary">
            Graduados
          </span>
          <div>
            <span className="text-3xl font-extrabold text-navy-900">
              {graduateCount}
            </span>
          </div>
          <span className="text-[11px] text-content-muted">
            Registrados en el evento
          </span>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-content-secondary">
            Lugares contratados
          </span>
          <div>
            <span className="text-3xl font-extrabold text-navy-900">
              {contractedPlaces}
            </span>
          </div>
          <span className="text-[11px] text-content-muted">
            Lugares contratados por graduados
          </span>

        </Card>

        <Card className="p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-content-secondary">
            Ocupación de mesas
          </span>
          <div>
            <span className="text-3xl font-extrabold text-navy-900">
              {occupancyPercent}%
            </span>
          </div>
          <span className="text-[11px] text-content-muted">
            {occupiedPlaces} de {tableCapacity} lugares del croquis demo
          </span>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-content-secondary">
            Estado
          </span>
          <div>
            <span className="text-2xl font-bold text-navy-900">
              {getEventStatusLabel(event.status)}
            </span>
          </div>
          <Badge
            variant={getStatusBadgeVariant(event.status)}
            size="sm"
            className="self-start"
          >
            {getEventStatusLabel(event.status)}
          </Badge>
        </Card>
      </div>

      {/* Resumen financiero */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">Resumen financiero</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-2">
            <span className="text-xs font-semibold text-content-secondary">
              Recaudado
            </span>
            <div className="text-2xl font-bold text-navy-900">—</div>
            <p className="text-[11px] text-content-muted">
              Disponible al integrar el resumen financiero del evento.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-xs font-semibold text-content-secondary">
              Pendiente
            </span>
            <div className="text-2xl font-bold text-navy-900">—</div>
            <p className="text-[11px] text-content-muted">
              Disponible al integrar el resumen financiero del evento.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-xs font-semibold text-content-secondary">
              Vencido
            </span>
            <div className="text-2xl font-bold text-navy-900">—</div>
            <p className="text-[11px] text-content-muted">
              Disponible al integrar el resumen financiero del evento.
            </p>
          </Card>
        </div>
      </div>

      {/* Ciclo de vida / Estado del evento */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-navy-900">Estado del evento</h2>
          <p className="text-xs text-content-secondary">
            Control de transiciones del ciclo de vida operativo del evento.
          </p>
        </div>

        {availableActions.length === 0 ? (
          <div className="p-4 bg-surface-low rounded-xl text-xs text-content-secondary">
            {event.status === 'FINALIZED'
              ? 'Este evento está finalizado y permanece disponible para consulta.'
              : 'Este evento está cancelado y permanece disponible para consulta.'}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {availableActions.map((action) => (
              <Button
                key={action}
                variant={getActionButtonVariant(action)}
                size="md"
                type="button"
                onClick={() => setSelectedAction(action)}
              >
                {getEventActionLabel(action)}
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* Lifecycle Transition Dialog */}
      <EventLifecycleDialog
        eventName={event.name}
        action={selectedAction}
        onClose={() => setSelectedAction(null)}
        onConfirm={() => {
          setSelectedAction(null);
          setTransitionFeedback(
            'La transición quedará disponible al integrar el backend.'
          );
        }}
      />
    </div>
  );
};
