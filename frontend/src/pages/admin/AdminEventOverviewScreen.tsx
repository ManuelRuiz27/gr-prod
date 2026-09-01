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
  SectionHeader,
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
      <div className="flex flex-col gap-6 font-sans animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Evento no encontrado', current: true },
          ]}
        />
        <EmptyState
          icon="search"
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
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto font-sans animate-fadeIn">
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

      {/* 1. Identidad y Estado del Evento */}
      <Card className="p-6 md:p-8 space-y-4 bg-obsidian-850 border border-silver-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(event.status)} dot size="sm">
                {getEventStatusLabel(event.status)}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-silver-50 tracking-tight font-display">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-silver-400">
              <div className="flex items-center gap-1.5">
                <Icon name="calendar" size={14} className="text-gold-400 shrink-0" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="building" size={14} className="text-gold-400 shrink-0" />
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

      {/* 2. KPIs Operativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between gap-3 bg-obsidian-850 border border-silver-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
            Graduados
          </span>
          <div>
            <span className="text-3xl font-extrabold text-silver-50 font-sans">
              {graduateCount}
            </span>
          </div>
          <span className="text-[11px] text-silver-400 border-t border-silver-800/40 pt-1.5">
            Registrados en el evento
          </span>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-3 bg-obsidian-850 border border-silver-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
            Lugares contratados
          </span>
          <div>
            <span className="text-3xl font-extrabold text-silver-50 font-sans">
              {contractedPlaces}
            </span>
          </div>
          <span className="text-[11px] text-silver-400 border-t border-silver-800/40 pt-1.5">
            Lugares contratados por graduados
          </span>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-3 bg-obsidian-850 border border-silver-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
            Ocupación de mesas
          </span>
          <div>
            <span className="text-3xl font-extrabold text-silver-50 font-sans">
              {occupancyPercent}%
            </span>
          </div>
          <span className="text-[11px] text-silver-400 border-t border-silver-800/40 pt-1.5">
            {occupiedPlaces} de {tableCapacity} lugares del croquis demo
          </span>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-3 bg-obsidian-850 border border-silver-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
            Estado
          </span>
          <div>
            <span className="text-2xl font-bold text-silver-50 font-sans">
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

      {/* 3. Resumen Financiero */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-silver-50">Resumen financiero</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-2 bg-obsidian-850 border border-silver-800/80">
            <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
              Recaudado
            </span>
            <div className="text-2xl font-bold text-silver-50 font-sans">—</div>
            <p className="text-[11px] text-silver-400">
              Disponible al integrar el resumen financiero del evento.
            </p>
          </Card>

          <Card className="p-5 space-y-2 bg-obsidian-850 border border-silver-800/80">
            <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
              Pendiente
            </span>
            <div className="text-2xl font-bold text-silver-50 font-sans">—</div>
            <p className="text-[11px] text-silver-400">
              Disponible al integrar el resumen financiero del evento.
            </p>
          </Card>

          <Card className="p-5 space-y-2 bg-obsidian-850 border border-silver-800/80">
            <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
              Vencido
            </span>
            <div className="text-2xl font-bold text-silver-50 font-sans">—</div>
            <p className="text-[11px] text-silver-400">
              Disponible al integrar el resumen financiero del evento.
            </p>
          </Card>
        </div>
      </div>

      {/* 4. Módulos Operativos: Cartera, Mesas, Platillos, Termos y Comprobantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Cartera */}
        <Card className="p-5 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Cartera"
                className="mb-0"
              />
              <Icon name="payment" size={18} className="text-gold-400" />
            </div>
            <p className="text-xs text-silver-400 leading-relaxed">
              Sin datos agregados disponibles. Consulta el detalle en la sección de cartera.
            </p>
          </div>
          <Link to={`/admin/events/${event.id}/payments`} className="pt-2 border-t border-silver-800/40">
            <Button variant="ghost" size="sm" iconEnd="chevron-right" className="w-full justify-between">
              Ver cartera
            </Button>
          </Link>
        </Card>

        {/* Mesas y croquis */}
        <Card className="p-5 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Mesas y croquis"
                className="mb-0"
              />
              <Icon name="building" size={18} className="text-gold-400" />
            </div>
            <p className="text-xs text-silver-400 leading-relaxed">
              {occupiedPlaces} de {tableCapacity} lugares ocupados en el croquis.
            </p>
          </div>
          <Link to={`/admin/events/${event.id}/tables`} className="pt-2 border-t border-silver-800/40">
            <Button variant="ghost" size="sm" iconEnd="chevron-right" className="w-full justify-between">
              Ver mesas
            </Button>
          </Link>
        </Card>

        {/* Platillos */}
        <Card className="p-5 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Platillos"
                className="mb-0"
              />
              <Icon name="meal" size={18} className="text-gold-400" />
            </div>
            <p className="text-xs text-silver-400 leading-relaxed">
              Gestión de selecciones de menú y preferencias de invitados.
            </p>
          </div>
          <Link to={`/admin/events/${event.id}/meals`} className="pt-2 border-t border-silver-800/40">
            <Button variant="ghost" size="sm" iconEnd="chevron-right" className="w-full justify-between">
              Ver platillos
            </Button>
          </Link>
        </Card>

        {/* Termos */}
        <Card className="p-5 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Termos"
                className="mb-0"
              />
              <Icon name="cup" size={18} className="text-gold-400" />
            </div>
            <p className="text-xs text-silver-400 leading-relaxed">
              Seguimiento de piezas conmemorativas y avance de umbral.
            </p>
          </div>
          <Link to={`/admin/events/${event.id}/thermos`} className="pt-2 border-t border-silver-800/40">
            <Button variant="ghost" size="sm" iconEnd="chevron-right" className="w-full justify-between">
              Ver termos
            </Button>
          </Link>
        </Card>

        {/* Comprobantes pendientes */}
        <Card className="p-5 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between gap-4 md:col-span-2 lg:col-span-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Comprobantes pendientes"
                className="mb-0"
              />
              <Icon name="payment" size={18} className="text-gold-400" />
            </div>
            <p className="text-xs text-silver-400 leading-relaxed">
              Sin fuente de datos integrada para conciliación de comprobantes en este evento.
            </p>
          </div>
          <Link to={`/admin/events/${event.id}/payments`} className="pt-2 border-t border-silver-800/40">
            <Button variant="ghost" size="sm" iconEnd="chevron-right" className="w-full justify-between">
              Ver comprobantes
            </Button>
          </Link>
        </Card>
      </div>

      {/* 5. Ciclo de vida / Estado del evento */}
      <Card className="p-6 space-y-4 bg-obsidian-850 border border-silver-800/80">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-silver-50">Estado del evento</h2>
          <p className="text-xs text-silver-400">
            Control de transiciones del ciclo de vida operativo del evento.
          </p>
        </div>

        {availableActions.length === 0 ? (
          <div className="p-4 bg-obsidian-900 border border-silver-800/60 rounded-card text-xs text-silver-300">
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
