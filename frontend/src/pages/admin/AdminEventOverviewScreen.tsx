import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
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

      {/* 1. Identidad y Estado del Evento — Flat Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-silver-800 pb-6">
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
      </header>

      {/* 2. KPIs Operativos — Flat Metrics Grid */}
      <section aria-label="Métricas del evento" className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-b border-silver-800 pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
            Graduados
          </span>
          <span className="text-3xl font-extrabold text-silver-50 font-sans">
            {graduateCount}
          </span>
          <span className="text-[11px] text-silver-400">
            Registrados en el evento
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
            Lugares contratados
          </span>
          <span className="text-3xl font-extrabold text-silver-50 font-sans">
            {contractedPlaces}
          </span>
          <span className="text-[11px] text-silver-400">
            Lugares contratados por graduados
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
            Ocupación de mesas
          </span>
          <span className="text-3xl font-extrabold text-silver-50 font-sans">
            {occupancyPercent}%
          </span>
          <span className="text-[11px] text-silver-400">
            {occupiedPlaces} de {tableCapacity} lugares del croquis demo
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
            Estado
          </span>
          <span className="text-2xl font-bold text-silver-50 font-sans">
            {getEventStatusLabel(event.status)}
          </span>
          <Badge
            variant={getStatusBadgeVariant(event.status)}
            size="sm"
            className="self-start mt-0.5"
          >
            {getEventStatusLabel(event.status)}
          </Badge>
        </div>
      </section>

      {/* 3. Resumen Financiero — Flat Section */}
      <section aria-labelledby="financial-heading" className="space-y-3 border-b border-silver-800 pb-6">
        <h2 id="financial-heading" className="text-base font-bold text-silver-50">Resumen financiero</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
              Recaudado
            </span>
            <div className="text-2xl font-bold text-silver-50 font-sans">—</div>
            <p className="text-[11px] text-silver-400">
              Disponible al integrar el resumen financiero del evento.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
              Pendiente
            </span>
            <div className="text-2xl font-bold text-silver-50 font-sans">—</div>
            <p className="text-[11px] text-silver-400">
              Disponible al integrar el resumen financiero del evento.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
              Vencido
            </span>
            <div className="text-2xl font-bold text-silver-50 font-sans">—</div>
            <p className="text-[11px] text-silver-400">
              Disponible al integrar el resumen financiero del evento.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Módulos Operativos — Flat Grid */}
      <section aria-label="Módulos de operación" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-silver-800 pb-6">
        {/* Cartera */}
        <div className="p-4 rounded-xl bg-obsidian-900/60 border border-silver-800 flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Cartera"
                className="mb-0"
              />
              <Icon name="payment" size={16} className="text-gold-400" />
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
        </div>

        {/* Mesas y croquis */}
        <div className="p-4 rounded-xl bg-obsidian-900/60 border border-silver-800 flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Mesas y croquis"
                className="mb-0"
              />
              <Icon name="building" size={16} className="text-gold-400" />
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
        </div>

        {/* Platillos */}
        <div className="p-4 rounded-xl bg-obsidian-900/60 border border-silver-800 flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Platillos"
                className="mb-0"
              />
              <Icon name="meal" size={16} className="text-gold-400" />
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
        </div>

        {/* Termos */}
        <div className="p-4 rounded-xl bg-obsidian-900/60 border border-silver-800 flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Termos"
                className="mb-0"
              />
              <Icon name="cup" size={16} className="text-gold-400" />
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
        </div>

        {/* Comprobantes pendientes */}
        <div className="p-4 rounded-xl bg-obsidian-900/60 border border-silver-800 flex flex-col justify-between gap-4 md:col-span-2 lg:col-span-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Comprobantes pendientes"
                className="mb-0"
              />
              <Icon name="payment" size={16} className="text-gold-400" />
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
        </div>
      </section>

      {/* 5. Ciclo de vida / Estado del evento — Flat Section */}
      <section aria-labelledby="lifecycle-heading" className="space-y-3">
        <div className="space-y-1">
          <h2 id="lifecycle-heading" className="text-base font-bold text-silver-50">Estado del evento</h2>
          <p className="text-xs text-silver-400">
            Control de transiciones del ciclo de vida operativo del evento.
          </p>
        </div>

        {availableActions.length === 0 ? (
          <div className="p-4 bg-obsidian-900 border border-silver-800 rounded-lg text-xs text-silver-300">
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
      </section>

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
