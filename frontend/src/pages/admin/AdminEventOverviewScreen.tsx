import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Badge,
  EmptyState,
  Alert,
  Icon,
  type BadgeVariant,
} from '../../design-system';
import {
  mockEvents,
  mockGraduatesList,
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

export const AdminEventOverviewScreen: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [selectedAction, setSelectedAction] = useState<EventLifecycleAction | null>(null);
  const [transitionFeedback, setTransitionFeedback] = useState('');
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const event = mockEvents.find((item) => item.id === eventId);

  // Close lifecycle dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scoped graduates for this event
  const eventGraduates = useMemo(
    () => (event ? mockGraduatesList.filter((g) => g.eventId === event.id) : []),
    [event]
  );

  // Financial metrics derived from real payment plans
  const financialMetrics = useMemo(() => {
    if (!event) {
      return {
        totalCollected: 0,
        totalPending: 0,
        totalOverdue: 0,
        overdueCount: 0,
      };
    }
    const plans = eventGraduates
      .map((g) => mockPaymentPlansMap[g.id])
      .filter((p): p is PaymentPlanMock => Boolean(p) && p.eventId === event.id);

    const totalCollected = plans.reduce((acc, p) => acc + p.paidAmount, 0);
    const totalPending = plans.reduce((acc, p) => acc + p.pendingAmount, 0);
    const totalOverdue = plans.reduce((acc, p) => acc + (p.overdueAmount || 0), 0);
    const overdueCount = plans.filter((p) => (p.overdueAmount || 0) > 0).length;

    return {
      totalCollected,
      totalPending,
      totalOverdue,
      overdueCount,
    };
  }, [eventGraduates, event]);

  // Operational items that require attention
  const attentionItems = useMemo(() => {
    if (!event) return [];

    const items: Array<{
      id: string;
      label: string;
      href: string;
    }> = [];

    // 1. Overdue payments
    if (financialMetrics.overdueCount > 0) {
      items.push({
        id: 'overdue-payments',
        label: `${financialMetrics.overdueCount} pagos vencidos`,
        href: `/admin/events/${event.id}/payments?tab=cartera`,
      });
    }

    // 2. Pending payment submissions
    const pendingProofs = VISUAL_QA_SUBMISSIONS_QUEUE.filter(
      (s) => s.eventId === event.id && s.status === 'PENDING_REVIEW'
    );
    if (pendingProofs.length > 0) {
      items.push({
        id: 'pending-proofs',
        label: `${pendingProofs.length} comprobantes pendientes`,
        href: `/admin/events/${event.id}/payments?tab=comprobantes`,
      });
    }

    // 3. Meals pending selection
    const totalGuests = eventGraduates.reduce((sum, g) => sum + (g.guests?.length || 0), 0);
    const mealsSelected = eventGraduates.reduce(
      (sum, g) => sum + (g.guests ? g.guests.filter((gst) => Boolean(gst.meal)).length : 0),
      0
    );
    const pendingMeals = totalGuests - mealsSelected;
    if (pendingMeals > 0) {
      items.push({
        id: 'pending-meals',
        label: `${pendingMeals} platillos pendientes`,
        href: `/admin/events/${event.id}/meals`,
      });
    }

    // 4. Graduates without table
    const graduatesWithoutTable = eventGraduates.filter((g) => g.tableNumber === null).length;
    if (graduatesWithoutTable > 0) {
      items.push({
        id: 'unassigned-tables',
        label: `${graduatesWithoutTable} graduados sin mesa`,
        href: `/admin/events/${event.id}/tables`,
      });
    }

    return items;
  }, [event, financialMetrics, eventGraduates]);

  if (!event) {
    return (
      <div className="flex flex-col gap-6 font-sans animate-fadeIn">
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

  const availableActions = getAvailableEventActions(event.status);

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans animate-fadeIn pb-16">
      {transitionFeedback && (
        <Alert variant="info" onDismiss={() => setTransitionFeedback('')}>
          {transitionFeedback}
        </Alert>
      )}

      {/* Header: Event Identity + Compact Lifecycle Menu */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-silver-800/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-silver-50 tracking-tight font-display">
            {event.name}
          </h1>
          <div className="flex items-center gap-2 text-xs text-silver-400 mt-1">
            <span>{event.date}</span>
            <span>·</span>
            <span>{event.venue}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={getStatusBadgeVariant(event.status)} dot size="sm">
            {getEventStatusLabel(event.status)}
          </Badge>

          {/* Secondary Lifecycle Menu (···) */}
          {availableActions.length > 0 && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-silver-400 hover:text-silver-100 hover:bg-obsidian-800 border border-silver-800 transition-colors"
                aria-label="Acciones de ciclo de vida del evento"
                aria-expanded={isActionsMenuOpen}
              >
                <Icon name="more" size={16} />
              </button>

              {isActionsMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-obsidian-900 border border-silver-800 rounded-xl shadow-xl z-50 py-1 divide-y divide-silver-800/60">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-silver-500 tracking-wider">
                    Ciclo de vida
                  </div>
                  <div className="py-1">
                    {availableActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        className="w-full text-left px-3 py-2 text-xs text-silver-200 hover:text-silver-50 hover:bg-obsidian-800 transition-colors"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          setSelectedAction(action);
                        }}
                      >
                        {getEventActionLabel(action)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Cobranza: Inline Compact Strip */}
      <section aria-labelledby="cobranza-heading" className="space-y-2">
        <h2 id="cobranza-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
          Cobranza
        </h2>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm font-sans">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-silver-50">
              ${financialMetrics.totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-silver-400 text-xs">cobrados</span>
          </div>
          <span className="text-silver-700 hidden sm:inline">·</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-silver-100">
              ${financialMetrics.totalPending.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-silver-400 text-xs">pendientes</span>
          </div>
          <span className="text-silver-700 hidden sm:inline">·</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-status-warning">
              ${financialMetrics.totalOverdue.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-silver-400 text-xs">vencidos</span>
          </div>
        </div>
      </section>

      {/* Necesita atención: Lista de tareas accionables */}
      <section aria-labelledby="atencion-heading" className="space-y-3">
        <h2 id="atencion-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
          Necesita atención
        </h2>

        <div className="bg-obsidian-900/60 rounded-xl border border-silver-800/80 divide-y divide-silver-800/60">
          {attentionItems.length === 0 ? (
            <p className="p-4 text-xs text-silver-400 italic">
              No hay pendientes operativos para este evento.
            </p>
          ) : (
            attentionItems.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-obsidian-800/40 transition-colors"
              >
                <span className="text-sm text-silver-100 font-medium">
                  {item.label}
                </span>
                <Link
                  to={item.href}
                  className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 shrink-0"
                >
                  Revisar →
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Lifecycle Transition Dialog */}
      <EventLifecycleDialog
        eventName={event.name}
        action={selectedAction}
        onClose={() => setSelectedAction(null)}
        onConfirm={() => {
          setSelectedAction(null);
          setTransitionFeedback('El cambio no está disponible en esta demostración.');
        }}
      />
    </div>
  );
};


