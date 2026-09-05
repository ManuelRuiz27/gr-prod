import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
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
  mockPaymentPlansMap,
  VISUAL_QA_SUBMISSIONS_QUEUE,
  type EventStatus,
  type PaymentPlanMock,
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

  // 1. Scoped graduates for this event
  const eventGraduates = useMemo(
    () => (event ? mockGraduatesList.filter((g) => g.eventId === event.id) : []),
    [event]
  );

  // 2. Derived metrics from existing fixtures
  const {
    graduateCount,
    contractedPlaces,
    tableCapacity,
    occupiedPlaces,
    occupancyPercent,
  } = useMemo(
    () =>
      event
        ? getEventOverviewMetrics(event.id, mockGraduatesList, mockTables)
        : {
            graduateCount: 0,
            contractedPlaces: 0,
            tableCapacity: 0,
            occupiedPlaces: 0,
            occupancyPercent: 0,
          },
    [event]
  );

  // 3. Financial metrics derived strictly from event payment plans (0 hardcoded fallbacks)
  const financialMetrics = useMemo(() => {
    if (!event) {
      return {
        hasData: false,
        totalContracted: 0,
        totalCollected: 0,
        totalPending: 0,
        totalOverdue: 0,
        percentCollected: 0,
        overdueCount: 0,
      };
    }
    const plans = eventGraduates
      .map((g) => mockPaymentPlansMap[g.id])
      .filter((p): p is PaymentPlanMock => Boolean(p) && p.eventId === event.id);

    const totalContracted = plans.reduce((acc, p) => acc + p.totalAmount, 0);
    const totalCollected = plans.reduce((acc, p) => acc + p.paidAmount, 0);
    const totalPending = plans.reduce((acc, p) => acc + p.pendingAmount, 0);
    const totalOverdue = plans.reduce((acc, p) => acc + (p.overdueAmount || 0), 0);
    const percentCollected = totalContracted > 0 ? Math.round((totalCollected / totalContracted) * 100) : 0;
    const overdueCount = plans.filter((p) => (p.overdueAmount || 0) > 0).length;

    return {
      hasData: plans.length > 0,
      totalContracted,
      totalCollected,
      totalPending,
      totalOverdue,
      percentCollected,
      overdueCount,
    };
  }, [eventGraduates, event]);

  // 4. Operational preparation metrics derived strictly from event fixtures (0 hardcoded fallbacks)
  const operationalMetrics = useMemo(() => {
    if (!event) {
      return {
        totalGuests: 0,
        mealsSelectedCount: 0,
        pendingMealsCount: 0,
        thermosDeliveredOrCustomized: 0,
        graduatesWithoutTable: 0,
        pendingSubmissionsCount: 0,
      };
    }
    const totalGuests = eventGraduates.reduce((sum, g) => sum + (g.guests?.length || 0), 0);
    const mealsSelectedCount = eventGraduates.reduce(
      (sum, g) => sum + (g.guests ? g.guests.filter((gst) => Boolean(gst.meal)).length : 0),
      0
    );
    const pendingMealsCount = totalGuests - mealsSelectedCount;

    const thermosDeliveredOrCustomized = eventGraduates.filter((g) =>
      ['REQUESTED', 'IN_PRODUCTION', 'DELIVERED'].includes(g.thermoStatus)
    ).length;

    const graduatesWithoutTable = eventGraduates.filter((g) => g.tableNumber === null).length;

    const pendingSubmissionsCount = VISUAL_QA_SUBMISSIONS_QUEUE.filter(
      (s) => s.eventId === event.id && s.status === 'PENDING_REVIEW'
    ).length;

    return {
      totalGuests,
      mealsSelectedCount,
      pendingMealsCount,
      thermosDeliveredOrCustomized,
      graduatesWithoutTable,
      pendingSubmissionsCount,
    };
  }, [eventGraduates, event]);

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
    <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto font-sans animate-fadeIn pb-16">
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

      {/* 1. Header: Event Identity & Single Status Badge (0 card, 0 duplicate buttons) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-silver-800/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-silver-50 tracking-tight font-display">
            {event.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-silver-400 mt-1">
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

        <Badge variant={getStatusBadgeVariant(event.status)} dot size="sm">
          {getEventStatusLabel(event.status)}
        </Badge>
      </header>

      {/* 2. Pagos: Pure Domain Composition (0 boxes / cards) */}
      <section aria-labelledby="payments-heading" className="space-y-3">
        <h2 id="payments-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
          Pagos
        </h2>

        {financialMetrics.hasData ? (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-silver-50 font-sans tracking-tight">
                ${financialMetrics.totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
              </span>
              <span className="text-xs sm:text-sm text-silver-400 font-sans">
                cobrado de ${financialMetrics.totalContracted.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-obsidian-900 rounded-full h-2 overflow-hidden border border-silver-800">
              <div
                style={{ width: `${financialMetrics.percentCollected}%` }}
                className="bg-gold-500 h-full rounded-full transition-all duration-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-silver-400 font-sans">
              <span>${financialMetrics.totalPending.toLocaleString('es-MX', { minimumFractionDigits: 0 })} pendientes</span>
              {financialMetrics.totalOverdue > 0 ? (
                <Link to={`/admin/events/${event.id}/payments`} className="text-status-warning hover:underline">
                  ${financialMetrics.totalOverdue.toLocaleString('es-MX', { minimumFractionDigits: 0 })} vencido ({financialMetrics.overdueCount} con atraso) →
                </Link>
              ) : (
                <span className="text-silver-400">{financialMetrics.percentCollected}% cubierto</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-silver-400 italic py-2">
            Sin planes de pago registrados para este evento.
          </p>
        )}
      </section>

      {/* Hairline Divider */}
      <hr className="border-silver-800/60 my-1" />

      {/* 3. Preparación: Flat rows with hairline dividers */}
      <section aria-labelledby="prep-heading" className="space-y-1">
        <h2 id="prep-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400 px-1">
          Preparación
        </h2>

        <div className="divide-y divide-silver-800/60">
          {/* Graduados */}
          <Link
            to={`/admin/events/${event.id}/graduates`}
            className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
          >
            <span className="text-sm text-silver-200 group-hover:text-silver-100 font-medium">
              Graduados
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-silver-400 font-sans">
                {graduateCount} / {contractedPlaces} lugares contratados
              </span>
              <Icon name="chevron-right" size={14} className="text-silver-500 group-hover:text-silver-300" />
            </div>
          </Link>

          {/* Mesas */}
          <Link
            to={`/admin/events/${event.id}/tables`}
            className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
          >
            <span className="text-sm text-silver-200 group-hover:text-silver-100 font-medium">
              Mesas
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-silver-400 font-sans">
                {occupiedPlaces} / {tableCapacity} lugares asignados ({occupancyPercent}%)
              </span>
              <Icon name="chevron-right" size={14} className="text-silver-500 group-hover:text-silver-300" />
            </div>
          </Link>

          {/* Platillos */}
          <Link
            to={`/admin/events/${event.id}/meals`}
            className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
          >
            <span className="text-sm text-silver-200 group-hover:text-silver-100 font-medium">
              Platillos
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-silver-400 font-sans">
                {operationalMetrics.mealsSelectedCount} / {operationalMetrics.totalGuests} seleccionados
              </span>
              <Icon name="chevron-right" size={14} className="text-silver-500 group-hover:text-silver-300" />
            </div>
          </Link>

          {/* Termos */}
          <Link
            to={`/admin/events/${event.id}/thermos`}
            className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
          >
            <span className="text-sm text-silver-200 group-hover:text-silver-100 font-medium">
              Termos
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-silver-400 font-sans">
                {operationalMetrics.thermosDeliveredOrCustomized} / {graduateCount} entregados o personalizados
              </span>
              <Icon name="chevron-right" size={14} className="text-silver-500 group-hover:text-silver-300" />
            </div>
          </Link>
        </div>
      </section>

      {/* Hairline Divider */}
      <hr className="border-silver-800/60 my-1" />

      {/* 4. Pendientes: Items requiring operational review */}
      <section aria-labelledby="pending-heading" className="space-y-1">
        <h2 id="pending-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400 px-1">
          Pendientes
        </h2>

        <div className="divide-y divide-silver-800/60">
          {operationalMetrics.pendingSubmissionsCount > 0 && (
            <Link
              to={`/admin/events/${event.id}/payments`}
              className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
            >
              <span className="text-sm text-silver-200 group-hover:text-silver-100">
                {operationalMetrics.pendingSubmissionsCount} comprobante{operationalMetrics.pendingSubmissionsCount > 1 ? 's' : ''} por validar
              </span>
              <span className="text-xs text-gold-400 flex items-center gap-1 group-hover:underline">
                Revisar
                <Icon name="chevron-right" size={12} />
              </span>
            </Link>
          )}

          {operationalMetrics.pendingMealsCount > 0 && (
            <Link
              to={`/admin/events/${event.id}/meals`}
              className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
            >
              <span className="text-sm text-silver-200 group-hover:text-silver-100">
                {operationalMetrics.pendingMealsCount} personas sin platillo
              </span>
              <span className="text-xs text-gold-400 flex items-center gap-1 group-hover:underline">
                Revisar
                <Icon name="chevron-right" size={12} />
              </span>
            </Link>
          )}

          {tableCapacity > occupiedPlaces && (
            <Link
              to={`/admin/events/${event.id}/tables`}
              className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
            >
              <span className="text-sm text-silver-200 group-hover:text-silver-100">
                {tableCapacity - occupiedPlaces} lugares por asignar en mesas
              </span>
              <span className="text-xs text-gold-400 flex items-center gap-1 group-hover:underline">
                Revisar
                <Icon name="chevron-right" size={12} />
              </span>
            </Link>
          )}

          {operationalMetrics.pendingSubmissionsCount === 0 &&
            operationalMetrics.pendingMealsCount === 0 &&
            tableCapacity <= occupiedPlaces && (
              <p className="text-xs text-silver-500 italic py-2 px-1">
                No hay pendientes operativos para este evento.
              </p>
            )}
        </div>
      </section>

      {/* Hairline Divider */}
      <hr className="border-silver-800/60 my-1" />

      {/* 5. Ciclo de vida / Estado del evento — Clean action buttons */}
      <section aria-labelledby="lifecycle-heading" className="space-y-3">
        <div className="space-y-1">
          <h2 id="lifecycle-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
            Ciclo de vida del evento
          </h2>
        </div>

        {availableActions.length === 0 ? (
          <div className="p-4 bg-obsidian-900/60 border border-silver-800/60 rounded-xl text-xs text-silver-400">
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
                size="sm"
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

