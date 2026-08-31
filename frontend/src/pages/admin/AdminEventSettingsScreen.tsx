/**
 * AdminEventSettingsScreen.tsx
 *
 * Route: /admin/events/:eventId/settings
 * Ticket: FRONTEND-08 — Configuración y Lifecycle ADMIN
 *
 * Implements UX-A-CFG-001..007, BR-EVT-001..011, DATA_MODEL EventSettings
 *
 * Rules enforced:
 * - Scoped strictly to :eventId without fallback.
 * - Missing/invalid event renders EmptyState.
 * - 7 normative sections:
 *     1. Información
 *     2. Plan financiero (con aviso claro: defaults vs. planes congelados)
 *     3. Fechas límite (muestra "Configuración no disponible" si no existe)
 *     4. Termo (umbral porcentual)
 *     5. Platillos (opciones de menú disponibles)
 *     6. Cancelaciones ("Configuración no disponible" si no existe)
 *     7. Estado del evento (Lifecycle transitions: DRAFT, OPEN, CLOSED, FINALIZED, CANCELLED)
 * - Transitions follow normative matrix; CANCEL requires non-empty reason.
 * - Without backend: local preview, "No guardado" badge, blocked chained transitions, no fixture mutation.
 * - No technical identifiers, invented 2027-05-* dates, or false "Guardado exitoso" messages.
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Badge,
  Button,
  Icon,
  Breadcrumb,
  EmptyState,
  Alert,
  Modal,
  TextArea,
  type BadgeVariant,
} from '../../design-system';
import { mockEvents, type EventStatus } from '../../fixtures/eventFixtures';
import { mockGraduatesList } from '../../fixtures/graduateFixtures';
import { mockPaymentPlansMap } from '../../fixtures/paymentFixtures';
import { mockMealOptions } from '../../fixtures/layoutFixtures';
import { getEventStatusLabel } from '../../lib/eventStatusLabel';
import {
  buildEventSettingsViewModel,
  getAvailableLifecycleActions,
  getLifecycleActionLabel,
  type EventLifecycleAction,
} from './settings/settingsViewModel';

interface AdminEventSettingsContentProps {
  paramEventId?: string;
}

const AdminEventSettingsContent: React.FC<AdminEventSettingsContentProps> = ({
  paramEventId,
}) => {
  const navigate = useNavigate();

  // ── 1. Event resolution — strictly from URL param, no fallback ──────────────
  const event = paramEventId
    ? mockEvents.find((e) => e.id === paramEventId)
    : null;

  // ── Local preview state for lifecycle transitions ───────────────────────────
  const [previewStatus, setPreviewStatus] = useState<EventStatus | null>(null);
  const [activeModalAction, setActiveModalAction] = useState<EventLifecycleAction | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  // ── 2. Settings View Model ──────────────────────────────────────────────────
  const vm = useMemo(() => {
    return event
      ? buildEventSettingsViewModel(
          event,
          mockMealOptions,
          mockGraduatesList,
          mockPaymentPlansMap,
          previewStatus
        )
      : null;
  }, [event, previewStatus]);

  // ── Guard: No event ID in URL ────────────────────────────────────────────────
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Configuración', current: true },
          ]}
        />
        <EmptyState
          icon="settings"
          title="Selecciona un evento"
          description="Para consultar y gestionar los parámetros de configuración, selecciona un evento desde el catálogo."
          actionLabel="Ver eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // ── Guard: Event not found ───────────────────────────────────────────────────
  if (!event || !vm) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Evento no encontrado', current: true },
          ]}
        />
        <EmptyState
          icon="alert"
          title="Evento no encontrado"
          description="No encontramos el evento solicitado para consultar su configuración."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // ── Status Helpers ───────────────────────────────────────────────────────────
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

  const availableActions = vm.hasLocalPreview
    ? []
    : getAvailableLifecycleActions(vm.effectiveStatus);

  // ── Transition Handlers ──────────────────────────────────────────────────────
  const handleOpenModal = (action: EventLifecycleAction) => {
    setActiveModalAction(action);
    setCancelReason('');
    setCancelError('');
  };

  const handleConfirmTransition = () => {
    if (!activeModalAction) return;

    if (activeModalAction === 'CANCEL') {
      const trimmed = cancelReason.trim();
      if (!trimmed) {
        setCancelError('Ingresa el motivo obligatorio de cancelación.');
        return;
      }
    }

    let nextStatus: EventStatus = 'OPEN';
    switch (activeModalAction) {
      case 'OPEN':
      case 'REOPEN':
        nextStatus = 'OPEN';
        break;
      case 'CLOSE':
        nextStatus = 'CLOSED';
        break;
      case 'FINALIZE':
        nextStatus = 'FINALIZED';
        break;
      case 'CANCEL':
        nextStatus = 'CANCELLED';
        break;
    }

    setPreviewStatus(nextStatus);
    setActiveModalAction(null);
    setCancelReason('');
    setCancelError('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, href: `/admin/events/${event.id}` },
          { label: 'Configuración', current: true },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
              Configuración y Parámetros del Evento
            </h2>
            <Badge variant={getStatusBadgeVariant(vm.effectiveStatus)} size="sm">
              {getEventStatusLabel(vm.effectiveStatus)}
            </Badge>
            {vm.hasLocalPreview && (
              <Badge variant="warning" size="sm">
                Vista previa local (No guardado)
              </Badge>
            )}
          </div>
          <p className="text-xs text-content-secondary">
            {event.name} • {event.venue} • {event.date}
          </p>
        </div>

        <Link to={`/admin/events/${event.id}/audit`}>
          <Button variant="secondary" size="sm" iconStart="info">
            Ver auditoría del evento
          </Button>
        </Link>
      </div>

      {/* Local Preview Notice Banner */}
      {vm.hasLocalPreview && (
        <Alert
          variant="warning"
          title="Vista previa de ciclo de vida activa — No guardada"
        >
          El estado del evento ha cambiado en modo de vista previa a "{getEventStatusLabel(vm.effectiveStatus)}". La integración con el backend está pendiente y este cambio no ha sido persistido.
        </Alert>
      )}

      {/* Financial Disclaimer Banner */}
      <Alert
        variant="info"
        title="Configuración actual del evento vs. planes financieros congelados"
      >
        Los parámetros del evento definen los valores por defecto para nuevas suscripciones. La edición de defaults no modifica ni reescribe automáticamente las obligaciones de planes de pago ya emitidos y congelados.
      </Alert>

      {/* 7 Normative Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Información General */}
        <Card className="p-5 flex flex-col justify-between gap-4" data-testid="section-info">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                <Icon name="info" size={16} />
              </div>
              <h3 className="text-sm font-bold text-navy-900">1. Información del Evento</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-surface-low rounded-xl">
                <span className="text-[10px] font-semibold text-content-muted block uppercase">Nombre</span>
                <span className="font-bold text-navy-900 block mt-0.5">{vm.name}</span>
              </div>
              <div className="p-2.5 bg-surface-low rounded-xl">
                <span className="text-[10px] font-semibold text-content-muted block uppercase">Institución</span>
                <span className="font-bold text-navy-900 block mt-0.5">{vm.institution}</span>
              </div>
              <div className="p-2.5 bg-surface-low rounded-xl">
                <span className="text-[10px] font-semibold text-content-muted block uppercase">Carrera / Generación</span>
                <span className="font-bold text-navy-900 block mt-0.5">{vm.career} ({vm.generation})</span>
              </div>
              <div className="p-2.5 bg-surface-low rounded-xl">
                <span className="text-[10px] font-semibold text-content-muted block uppercase">Fecha y Sede</span>
                <span className="font-bold text-navy-900 block mt-0.5">{event.date} • {event.venue}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Plan Financiero */}
        <Card className="p-5 flex flex-col justify-between gap-4" data-testid="section-financial">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Icon name="payment" size={16} />
              </div>
              <h3 className="text-sm font-bold text-navy-900">2. Plan Financiero</h3>
            </div>

            <div className="flex flex-col gap-2 text-xs pt-1">
              <div className="p-2.5 bg-surface-low rounded-xl flex justify-between items-center">
                <span className="text-content-secondary">Planes congelados bajo este evento:</span>
                <span className="font-bold text-navy-900">{vm.frozenPlansCount}</span>
              </div>
              <p className="text-[11px] text-content-muted italic">
                Parámetros financieros por defecto administrados a nivel evento.
              </p>
            </div>
          </div>
        </Card>

        {/* 3. Fechas Límite (Deadlines) */}
        <Card className="p-5 flex flex-col justify-between gap-4" data-testid="section-deadlines">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-50 text-gold-800 flex items-center justify-center">
                <Icon name="calendar" size={16} />
              </div>
              <h3 className="text-sm font-bold text-navy-900">3. Fechas Límite</h3>
            </div>

            <div className="flex flex-col gap-2 text-xs pt-1">
              <div className="p-2.5 bg-surface-low rounded-xl flex justify-between items-center">
                <span className="text-content-secondary">Fecha límite de lugares:</span>
                <span className="font-medium text-content-muted">
                  {vm.placesDeadline ?? 'Configuración no disponible'}
                </span>
              </div>
              <div className="p-2.5 bg-surface-low rounded-xl flex justify-between items-center">
                <span className="text-content-secondary">Fecha límite de cambio de mesa:</span>
                <span className="font-medium text-content-muted">
                  {vm.tableChangeDeadline ?? 'Configuración no disponible'}
                </span>
              </div>
              <div className="p-2.5 bg-surface-low rounded-xl flex justify-between items-center">
                <span className="text-content-secondary">Fecha límite de platillos:</span>
                <span className="font-medium text-content-muted">
                  {vm.mealsDeadline ?? 'Configuración no disponible'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 4. Termo Conmemorativo */}
        <Card className="p-5 flex flex-col justify-between gap-4" data-testid="section-thermo">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                <Icon name="cup" size={16} />
              </div>
              <h3 className="text-sm font-bold text-navy-900">4. Termo Conmemorativo</h3>
            </div>

            <div className="flex flex-col gap-2 text-xs pt-1">
              <div className="p-2.5 bg-surface-low rounded-xl flex justify-between items-center">
                <span className="text-content-secondary">Umbral de pago para solicitud:</span>
                <span className="font-bold text-navy-900">
                  {vm.thermoThreshold !== null ? `${vm.thermoThreshold}%` : 'Configuración no disponible'}
                </span>
              </div>
              <p className="text-[11px] text-content-muted">
                Porcentaje mínimo pagado del plan para desbloquear la solicitud del termo.
              </p>
            </div>
          </div>
        </Card>

        {/* 5. Menú de Platillos */}
        <Card className="p-5 flex flex-col justify-between gap-4" data-testid="section-meals">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                <Icon name="meal" size={16} />
              </div>
              <h3 className="text-sm font-bold text-navy-900">5. Catálogo de Platillos</h3>
            </div>

            <div className="flex flex-col gap-2 text-xs pt-1">
              {vm.mealOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {vm.mealOptions.map((opt) => (
                    <Badge key={opt.id} variant="neutral" size="sm">
                      {opt.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 bg-surface-low rounded-xl text-content-muted">
                  Configuración no disponible
                </div>
              )}
              <p className="text-[11px] text-content-muted">
                Opciones gastronómicas configuradas para selección de comensales.
              </p>
            </div>
          </div>
        </Card>

        {/* 6. Política de Cancelaciones */}
        <Card className="p-5 flex flex-col justify-between gap-4" data-testid="section-cancellations">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center">
                <Icon name="alert" size={16} />
              </div>
              <h3 className="text-sm font-bold text-navy-900">6. Política de Cancelaciones</h3>
            </div>

            <div className="flex flex-col gap-2 text-xs pt-1">
              <div className="p-2.5 bg-surface-low rounded-xl text-content-muted">
                {vm.cancellationPolicy ?? 'Configuración no disponible'}
              </div>
              <p className="text-[11px] text-content-muted">
                Reglas de penalización aplicables a bajas o cancelaciones individuales.
              </p>
            </div>
          </div>
        </Card>

        {/* 7. Estado del Evento / Lifecycle Transitions */}
        <Card className="p-5 flex flex-col justify-between gap-4 md:col-span-2" data-testid="section-lifecycle">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                  <Icon name="refresh" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900">7. Estado del Evento y Ciclo de Vida</h3>
                  <p className="text-xs text-content-secondary">
                    Control operativo de apertura, cierre, reapertura, finalización o cancelación del evento.
                  </p>
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(vm.effectiveStatus)} size="sm">
                {getEventStatusLabel(vm.effectiveStatus)}
              </Badge>
            </div>

            {/* Actions Toolbar */}
            {vm.hasLocalPreview ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                <span>
                  Existe una transición local en vista previa (<strong>{getEventStatusLabel(vm.effectiveStatus)}</strong>). No es posible encadenar transiciones hasta persistir en servidor.
                </span>
                <Badge variant="warning" size="sm">
                  Cambio pendiente de backend
                </Badge>
              </div>
            ) : availableActions.length === 0 ? (
              <div className="p-3 bg-surface-low rounded-xl text-xs text-content-muted text-center">
                {vm.effectiveStatus === 'FINALIZED'
                  ? 'Este evento ha sido finalizado y permanece disponible exclusivamente para consulta.'
                  : 'Este evento ha sido cancelado y permanece disponible exclusivamente para consulta.'}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {availableActions.map((action) => (
                  <Button
                    key={action}
                    variant={getActionButtonVariant(action)}
                    size="sm"
                    onClick={() => handleOpenModal(action)}
                  >
                    {getLifecycleActionLabel(action)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Transition Confirmation Modal */}
      {activeModalAction && (
        <Modal
          isOpen={Boolean(activeModalAction)}
          onClose={() => setActiveModalAction(null)}
          title={`Confirmar: ${getLifecycleActionLabel(activeModalAction)}`}
          size="md"
        >
          <div className="flex flex-col gap-4">
            <Alert variant="warning" title="Vista previa local — No guardada">
              Integración con backend pendiente. Este cambio de estado no se persistirá en la base de datos y se revertirá al recargar.
            </Alert>

            <p className="text-sm text-content-primary">
              ¿Confirmas la transición del evento <strong>{event.name}</strong> a estado "
              {activeModalAction === 'OPEN' || activeModalAction === 'REOPEN'
                ? 'Abierto'
                : activeModalAction === 'CLOSE'
                ? 'Cerrado'
                : activeModalAction === 'FINALIZE'
                ? 'Finalizado'
                : 'Cancelado'}
              "?
            </p>

            {activeModalAction === 'CANCEL' && (
              <TextArea
                id="cancelReason"
                label="Motivo obligatorio de cancelación"
                placeholder="Ingresa el motivo administrativo para cancelar el evento..."
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (cancelError) setCancelError('');
                }}
                error={cancelError}
                required
                rows={3}
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setActiveModalAction(null)}
              >
                Cancelar
              </Button>
              <Button
                variant={getActionButtonVariant(activeModalAction)}
                onClick={handleConfirmTransition}
              >
                Confirmar vista previa
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Public Export Wrapper (Keyed to strictly reset on route change) ───────────

export const AdminEventSettingsScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  return (
    <AdminEventSettingsContent
      key={paramEventId ?? 'no-event'}
      paramEventId={paramEventId}
    />
  );
};
