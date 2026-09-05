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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-silver-800/60 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-silver-50 tracking-tight">
              Configuración y Parámetros del Evento
            </h1>
            <Badge variant={getStatusBadgeVariant(vm.effectiveStatus)} size="sm">
              {getEventStatusLabel(vm.effectiveStatus)}
            </Badge>
            {vm.hasLocalPreview && (
              <Badge variant="warning" size="sm">
                Vista previa local (No guardado)
              </Badge>
            )}
          </div>
          <p className="text-xs text-silver-400">
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
        <div className="p-5 flex flex-col justify-between gap-4 bg-obsidian-900/40 border border-silver-800/60 rounded-xl" data-testid="section-info">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon name="info" size={16} className="text-silver-400" />
              <h3 className="text-sm font-bold text-silver-100">1. Información del Evento</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg">
                <span className="text-[10px] font-semibold text-silver-400 block uppercase">Nombre</span>
                <span className="font-bold text-silver-100 block mt-0.5">{vm.name}</span>
              </div>
              <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg">
                <span className="text-[10px] font-semibold text-silver-400 block uppercase">Institución</span>
                <span className="font-bold text-silver-100 block mt-0.5">{vm.institution}</span>
              </div>
              <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg">
                <span className="text-[10px] font-semibold text-silver-400 block uppercase">Carrera / Generación</span>
                <span className="font-bold text-silver-100 block mt-0.5">{vm.career} ({vm.generation})</span>
              </div>
              <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg">
                <span className="text-[10px] font-semibold text-silver-400 block uppercase">Fecha y Sede</span>
                <span className="font-bold text-silver-100 block mt-0.5">{event.date} • {event.venue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Plan Financiero */}
        <div className="p-5 flex flex-col justify-between gap-4 bg-obsidian-900/40 border border-silver-800/60 rounded-xl" data-testid="section-financial">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon name="payment" size={16} className="text-silver-400" />
              <h3 className="text-sm font-bold text-silver-100">2. Plan Financiero</h3>
            </div>

            <div className="flex flex-col gap-2 text-xs pt-1">
              <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg flex justify-between items-center">
                <span className="text-silver-400">Planes congelados bajo este evento:</span>
                <span className="font-bold text-silver-100">{vm.frozenPlansCount}</span>
              </div>
              <p className="text-[11px] text-silver-500 italic">
                Parámetros financieros por defecto administrados a nivel evento.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Fechas Límite (Deadlines) */}
        <div className="p-5 flex flex-col justify-between gap-4 bg-obsidian-900/40 border border-silver-800/60 rounded-xl" data-testid="section-deadlines">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon name="calendar" size={16} className="text-silver-400" />
              <h3 className="text-sm font-bold text-silver-100">3. Fechas Límite</h3>
            </div>

            <div className="flex flex-col gap-2 text-xs pt-1">
              <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg flex justify-between items-center">
                <span className="text-silver-400">Fecha límite de lugares:</span>
                <span className="font-medium text-silver-400">
                  {vm.placesDeadline ?? 'Configuración no disponible'}
                </span>
              </div>
              <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg flex justify-between items-center">
                <span className="text-silver-400">Fecha límite de cambio de mesa:</span>
                <span className="font-medium text-silver-400">
                  {vm.tableChangeDeadline ?? 'Configuración no disponible'}
                </span>
              </div>
              <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg flex justify-between items-center">
                <span className="text-silver-400">Fecha límite de platillos:</span>
                <span className="font-medium text-silver-400">
                  {vm.mealsDeadline ?? 'Configuración no disponible'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Termo Conmemorativo */}
        <div className="p-5 flex flex-col justify-between gap-4 bg-obsidian-850 border border-silver-800/80 rounded-lg" data-testid="section-thermo">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                <Icon name="cup" size={16} />
              </div>
              <h3 className="text-sm font-bold text-silver-100">4. Termo Conmemorativo</h3>
            </div>

            <div className="flex flex-col gap-2 text-xs pt-1">
              <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg flex justify-between items-center">
                <span className="text-silver-400">Umbral de pago para solicitud:</span>
                <span className="font-bold text-silver-100">
                  {vm.thermoThreshold !== null ? `${vm.thermoThreshold}%` : 'Configuración no disponible'}
                </span>
              </div>
              <p className="text-[11px] text-silver-500">
                Porcentaje mínimo pagado del plan para desbloquear la solicitud del termo.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Menú de Platillos */}
        <div className="p-5 flex flex-col justify-between gap-4 bg-obsidian-900/40 border border-silver-800/60 rounded-xl" data-testid="section-meals">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon name="meal" size={16} className="text-silver-400" />
              <h3 className="text-sm font-bold text-silver-100">5. Catálogo de Platillos</h3>
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
                <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg text-silver-400">
                  Configuración no disponible
                </div>
              )}
              <p className="text-[11px] text-silver-500">
                Opciones gastronómicas configuradas para selección de comensales.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Política de Cancelaciones */}
        <div className="p-5 flex flex-col justify-between gap-4 bg-obsidian-900/40 border border-silver-800/60 rounded-xl" data-testid="section-cancellations">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="alert" size={16} className="text-silver-400" />
                <h3 className="text-sm font-bold text-silver-100">6. Política de Cancelaciones</h3>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs pt-1">
              <div className="p-2.5 bg-obsidian-900/60 border border-silver-800/60 rounded-lg text-silver-400">
                {vm.cancellationPolicy ?? 'Configuración administrada por versiones.'}
              </div>
              <p className="text-[11px] text-silver-500">
                Reglas de penalización versionadas aplicables a bajas o cancelaciones individuales.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-silver-800/60 flex justify-end">
            <Link to={`/admin/events/${event.id}/settings/cancellation-policy`}>
              <Button variant="secondary" size="sm" iconEnd="chevron-right">
                Administrar política de cancelación
              </Button>
            </Link>
          </div>
        </div>

        {/* 7. Estado del Evento / Lifecycle Transitions */}
        <div className="p-5 flex flex-col justify-between gap-4 md:col-span-2 bg-obsidian-900/40 border border-silver-800/60 rounded-xl" data-testid="section-lifecycle">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon name="refresh" size={16} className="text-silver-400" />
                <div>
                  <h3 className="text-sm font-bold text-silver-100">7. Estado del Evento y Ciclo de Vida</h3>
                  <p className="text-xs text-silver-400">
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
              <div className="p-4 bg-obsidian-900/80 rounded-xl border border-gold-500/40 text-xs text-gold-400 flex items-center justify-between gap-3">
                <span>
                  Existe una transición local en vista previa (<strong>{getEventStatusLabel(vm.effectiveStatus)}</strong>). No es posible encadenar transiciones hasta persistir en servidor.
                </span>
                <Badge variant="warning" size="sm">
                  Cambio pendiente de backend
                </Badge>
              </div>
            ) : availableActions.length === 0 ? (
              <div className="p-3 bg-obsidian-900/60 border border-silver-800/60 rounded-xl text-xs text-silver-400 text-center">
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
        </div>
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
