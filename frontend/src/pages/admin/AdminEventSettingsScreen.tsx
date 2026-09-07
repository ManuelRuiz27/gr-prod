/**
 * AdminEventSettingsScreen.tsx
 *
 * Route: /admin/events/:eventId/settings
 *
 * Continuous vertical settings page — no grid, no cards, no numbered sections.
 * Values are read-only consultation; no "Guardar" without real persistence.
 * Lifecycle is secondary, shown at bottom.
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Badge,
  Button,
  EmptyState,
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

/* ── Helpers ─────────────────────────────────────────────────────────────────── */

function SettingRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-4 py-2">
      <span className="text-sm text-silver-400 sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-silver-100 font-medium">
        {value || 'No configurado'}
      </span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-silver-50 pt-8 pb-2 border-b border-silver-800/40">
      {children}
    </h2>
  );
}

/* ── Main content ────────────────────────────────────────────────────────────── */

interface AdminEventSettingsContentProps {
  paramEventId?: string;
}

const AdminEventSettingsContent: React.FC<AdminEventSettingsContentProps> = ({
  paramEventId,
}) => {
  const navigate = useNavigate();

  const event = paramEventId
    ? mockEvents.find((e) => e.id === paramEventId)
    : null;

  const [previewStatus, setPreviewStatus] = useState<EventStatus | null>(null);
  const [activeModalAction, setActiveModalAction] = useState<EventLifecycleAction | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  const vm = useMemo(() => {
    return event
      ? buildEventSettingsViewModel(
          event,
          mockMealOptions,
          mockGraduatesList,
          mockPaymentPlansMap,
          previewStatus,
        )
      : null;
  }, [event, previewStatus]);

  // ── Guards ────────────────────────────────────────────────────────────────────
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl w-full mx-auto animate-fadeIn">
        <EmptyState
          icon="settings"
          title="Selecciona un evento"
          description="Para consultar la configuración, selecciona un evento desde el catálogo."
          actionLabel="Ver eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  if (!event || !vm) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl w-full mx-auto animate-fadeIn">
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

  // ── Status helpers ────────────────────────────────────────────────────────────
  const getStatusBadgeVariant = (status: EventStatus): BadgeVariant => {
    switch (status) {
      case 'DRAFT': return 'neutral';
      case 'OPEN': return 'success';
      case 'CLOSED': return 'warning';
      case 'FINALIZED': return 'primary';
      case 'CANCELLED': return 'error';
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
    <div className="flex flex-col max-w-3xl w-full mx-auto animate-fadeIn pb-16">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="pb-6">
        <h1 className="text-xl font-bold font-display text-silver-50 tracking-tight">
          Configuración
        </h1>
        <p className="text-sm text-silver-400 mt-1">
          {event.name}
        </p>
      </div>

      {/* ── Información del evento ───────────────────────────────────────────── */}
      <SectionHeading>Información del evento</SectionHeading>
      <div className="flex flex-col" data-testid="section-info">
        <SettingRow label="Nombre" value={vm.name} />
        <SettingRow label="Institución" value={vm.institution} />
        <SettingRow label="Carrera" value={vm.career} />
        <SettingRow label="Generación" value={vm.generation} />
        <SettingRow label="Fecha" value={event.date} />
        <SettingRow label="Sede" value={event.venue} />
      </div>

      {/* ── Plan financiero ──────────────────────────────────────────────────── */}
      <SectionHeading>Plan financiero</SectionHeading>
      <div className="flex flex-col" data-testid="section-financial">
        <SettingRow
          label="Planes congelados"
          value={vm.frozenPlansCount > 0 ? String(vm.frozenPlansCount) : 'No configurado'}
        />
      </div>

      {/* ── Fechas límite ────────────────────────────────────────────────────── */}
      <SectionHeading>Fechas límite</SectionHeading>
      <div className="flex flex-col" data-testid="section-deadlines">
        <SettingRow label="Lugares" value={vm.placesDeadline} />
        <SettingRow label="Cambio de mesa" value={vm.tableChangeDeadline} />
        <SettingRow label="Platillos" value={vm.mealsDeadline} />
      </div>

      {/* ── Termo ────────────────────────────────────────────────────────────── */}
      <SectionHeading>Termo</SectionHeading>
      <div className="flex flex-col" data-testid="section-thermo">
        <SettingRow
          label="Umbral de solicitud"
          value={vm.thermoThreshold !== null ? `${vm.thermoThreshold}%` : null}
        />
      </div>

      {/* ── Platillos ────────────────────────────────────────────────────────── */}
      <SectionHeading>Platillos</SectionHeading>
      <div className="flex flex-col" data-testid="section-meals">
        {vm.mealOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2 py-2">
            {vm.mealOptions.map((opt) => (
              <Badge key={opt.id} variant="neutral" size="sm">
                {opt.name}
              </Badge>
            ))}
          </div>
        ) : (
          <SettingRow label="Opciones" value={null} />
        )}
      </div>

      {/* ── Cancelaciones ────────────────────────────────────────────────────── */}
      <SectionHeading>Cancelaciones</SectionHeading>
      <div className="flex flex-col" data-testid="section-cancellations">
        <SettingRow label="Política" value={vm.cancellationPolicy} />
        <div className="py-2">
          <Link
            to={`/admin/events/${event.id}/settings/cancellation-policy`}
            className="text-sm text-silver-400 hover:text-silver-200 underline underline-offset-2"
          >
            Administrar política de cancelación
          </Link>
        </div>
      </div>

      {/* ── Estado del evento (secondary) ────────────────────────────────────── */}
      <SectionHeading>Estado del evento</SectionHeading>
      <div className="flex flex-col gap-4 py-2" data-testid="section-lifecycle">
        <div className="flex items-center gap-3">
          <span className="text-sm text-silver-400">Estado actual</span>
          <Badge variant={getStatusBadgeVariant(vm.effectiveStatus)} size="sm">
            {getEventStatusLabel(vm.effectiveStatus)}
          </Badge>
          {vm.hasLocalPreview && (
            <Badge variant="warning" size="sm">
              Cambio no persistido
            </Badge>
          )}
        </div>

        {vm.hasLocalPreview ? (
          <p className="text-xs text-silver-500">
            Se aplicó un cambio de estado en esta sesión. Los cambios no se han persistido.
          </p>
        ) : availableActions.length === 0 ? (
          <p className="text-xs text-silver-500">
            {vm.effectiveStatus === 'FINALIZED'
              ? 'Evento finalizado. Disponible solo para consulta.'
              : 'Evento cancelado. Disponible solo para consulta.'}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
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

      {/* ── Secondary links ──────────────────────────────────────────────────── */}
      <div className="pt-10 border-t border-silver-800/30 mt-8">
        <Link
          to={`/admin/events/${event.id}/audit`}
          className="text-xs text-silver-500 hover:text-silver-300 underline underline-offset-2"
        >
          Ver historial de cambios
        </Link>
      </div>

      {/* ── Transition Modal ─────────────────────────────────────────────────── */}
      {activeModalAction && (
        <Modal
          isOpen={Boolean(activeModalAction)}
          onClose={() => setActiveModalAction(null)}
          title={`Confirmar: ${getLifecycleActionLabel(activeModalAction)}`}
          size="md"
        >
          <div className="flex flex-col gap-4">
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
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ── Public Export ────────────────────────────────────────────────────────────── */

export const AdminEventSettingsScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  return (
    <AdminEventSettingsContent
      key={paramEventId ?? 'no-event'}
      paramEventId={paramEventId}
    />
  );
};
