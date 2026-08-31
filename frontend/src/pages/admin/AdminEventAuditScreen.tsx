/**
 * AdminEventAuditScreen.tsx
 *
 * Route: /admin/events/:eventId/audit and /admin/audit
 * Ticket: FRONTEND-09 — Auditoría ADMIN
 *
 * Implements BR-AUD-001..004, DATA_MODEL AuditLog, UX_FLOWS section 41
 *
 * Rules enforced:
 * - Scoped strictly to :eventId when in event context.
 * - Missing/invalid event renders EmptyState.
 * - Supports states: loading, ready, empty, error.
 * - Without backend: renders "Historial de auditoría no disponible" with "Integración con backend pendiente".
 * - Does NOT fabricate fake "Mariana hizo...", fake dates, actors, movements, or reasons.
 * - Prepared to render real immutable AuditLog items (actor, timestamp, action, entity, diff, reason) when available.
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  EmptyState,
  Alert,
  StateBoundary,
  type UIState,
} from '../../design-system';
import { mockEvents } from '../../fixtures/eventFixtures';
import { AuditLogList } from './audit/AuditLogList';
import type { AuditLogItem } from './audit/auditViewModel';

interface AdminEventAuditContentProps {
  paramEventId?: string;
  initialState?: UIState;
  initialLogs?: AuditLogItem[];
}

export const AdminEventAuditContent: React.FC<AdminEventAuditContentProps> = ({
  paramEventId,
  initialState,
  initialLogs = [],
}) => {
  const navigate = useNavigate();

  // ── 1. Event resolution — strictly from URL param, no fallback ──────────────
  const event = paramEventId
    ? mockEvents.find((e) => e.id === paramEventId)
    : null;

  // ── State handling: defaults to 'error' (unintegrated backend state) ────────
  // Unless explicitly provided with real logs / custom state
  const [uiState] = useState<UIState>(
    initialState ?? (initialLogs.length > 0 ? 'ready' : 'error')
  );
  const [logs] = useState<AuditLogItem[]>(initialLogs);

  // ── Guard: No event ID in URL ────────────────────────────────────────────────
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Auditoría', current: true },
          ]}
        />
        <EmptyState
          icon="alert"
          title="Selecciona un evento"
          description="Para consultar el registro de auditoría e historial de cambios, selecciona un evento desde el catálogo."
          actionLabel="Ver eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // ── Guard: Event not found ───────────────────────────────────────────────────
  if (!event) {
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
          description="No encontramos el evento solicitado para consultar su historial de auditoría."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // ── Happy path with StateBoundary ────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, href: `/admin/events/${event.id}` },
          { label: 'Auditoría', current: true },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
          Historial de Cambios y Auditoría
        </h2>
        <p className="text-xs text-content-secondary">
          {event.name} • {event.venue} • {event.date}
        </p>
      </div>

      {/* State Boundary */}
      <StateBoundary
        state={uiState}
        loadingMessage="Cargando historial de auditoría..."
        errorTitle="Historial de auditoría no disponible"
        errorMessage="Integración con backend pendiente. El registro inmutable de auditoría estará disponible una vez conectado el servicio de auditoría del servidor."
        emptyIcon="alert"
        emptyTitle="Sin registros de auditoría"
        emptyDescription="No se han registrado acciones auditables para este evento."
      >
        <div className="flex flex-col gap-4">
          <Alert variant="info" title="Registro inmutable de operaciones">
            Este módulo audita cambios de lugares, mesas, platillos, pagos manuales, ajustes financieros, reembolsos, cancelaciones y transiciones de estado.
          </Alert>

          {/* Render real logs if present in ready state */}
          {logs.length > 0 ? (
            <AuditLogList logs={logs} />
          ) : (
            <EmptyState
              icon="alert"
              title="Sin registros de auditoría"
              description="No se han registrado acciones auditables para este evento."
            />
          )}
        </div>
      </StateBoundary>
    </div>
  );
};

// ── Public Export Wrapper (Keyed to strictly reset on route change) ───────────

export const AdminEventAuditScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  return (
    <AdminEventAuditContent
      key={paramEventId ?? 'no-event'}
      paramEventId={paramEventId}
    />
  );
};
