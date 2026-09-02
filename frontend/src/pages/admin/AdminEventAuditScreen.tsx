import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  EmptyState,
  Alert,
  StateBoundary,
  Select,
  Search,
  type UIState,
} from '../../design-system';
import { mockEvents } from '../../fixtures/eventFixtures';
import {
  VISUAL_QA_AUDIT_LOGS,
} from '../../fixtures/cancellationReportsAuditVisualFixtures';
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

  const [selectedGlobalEventId, setSelectedGlobalEventId] = useState<string>(
    paramEventId || ''
  );
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const effectiveEventId = paramEventId || selectedGlobalEventId;

  const event = effectiveEventId
    ? mockEvents.find((e) => e.id === effectiveEventId)
    : null;

  // Determine available logs (either from props, or from QA fixtures if QA mode/ready)
  const availableLogs: AuditLogItem[] = useMemo(() => {
    if (initialLogs.length > 0) return initialLogs;
    if (effectiveEventId && VISUAL_QA_AUDIT_LOGS[effectiveEventId]) {
      return VISUAL_QA_AUDIT_LOGS[effectiveEventId].map((l) => ({
        id: l.id,
        actor: l.actor,
        actorOrigin: l.actorOrigin,
        timestamp: l.timestamp,
        action: l.action,
        actionLabel: l.actionLabel,
        entityType: l.entityType,
        entityLabel: l.entityLabel,
        entityId: l.entityId,
        description: l.description,
        diff: l.diff,
        reason: l.reason,
      }));
    }
    return [];
  }, [initialLogs, effectiveEventId]);

  // State handling: defaults to 'error' (unintegrated backend state) unless initial state provided
  const [uiState] = useState<UIState>(
    initialState ?? (initialLogs.length > 0 ? 'ready' : 'error')
  );

  // Filter logs by actor and search
  const filteredLogs = useMemo(() => {
    return availableLogs.filter((log) => {
      const matchActor =
        actorFilter === 'all' ||
        (actorFilter === 'ADMIN' && log.actorOrigin === 'ADMIN') ||
        (actorFilter === 'Sistema' && log.actorOrigin === 'Sistema') ||
        (actorFilter === 'Proceso automático' && log.actorOrigin === 'Proceso automático') ||
        (actorFilter === 'Proveedor' && log.actorOrigin === 'Proveedor');

      const matchSearch =
        search.trim() === '' ||
        log.actor.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase()) ||
        log.entityId.toLowerCase().includes(search.toLowerCase()) ||
        (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()));

      return matchActor && matchSearch;
    });
  }, [availableLogs, actorFilter, search]);

  // Guard: No event ID in URL and no event selected in global mode
  if (!effectiveEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
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

  // Guard: Event not found
  if (!event) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
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

  const actorFilterOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos los orígenes' },
    { value: 'ADMIN', label: 'ADMIN' },
    { value: 'Sistema', label: 'Sistema' },
    { value: 'Proceso automático', label: 'Procesos automáticos' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans pb-16">
      {/* Breadcrumb */}
      <Breadcrumb
        items={
          paramEventId
            ? [
                { label: 'Plataforma GR', href: '/admin' },
                { label: 'Eventos', href: '/admin/events' },
                { label: event.name, href: `/admin/events/${event.id}` },
                { label: 'Auditoría', current: true },
              ]
            : [
                { label: 'Plataforma GR', href: '/admin' },
                { label: 'Auditoría', current: true },
              ]
        }
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Historial de Cambios y Auditoría
          </h1>
          <p className="text-xs text-silver-400">
            {event.name} • {event.venue} • {event.date}
          </p>
        </div>

        {/* Global Event Selector (if in global mode) */}
        {!paramEventId && (
          <div className="min-w-[260px]">
            <Select
              id="globalAuditEventFilter"
              label="Filtrar por evento"
              value={effectiveEventId}
              onChange={(e) => setSelectedGlobalEventId(e.target.value)}
              options={mockEvents.map((ev) => ({
                value: ev.id,
                label: `${ev.name} (${ev.date})`,
              }))}
            />
          </div>
        )}
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

          {/* Filters Bar */}
          <div className="p-4 bg-obsidian-900/80 rounded-xl border border-silver-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {actorFilterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActorFilter(opt.value)}
                  className={`h-8 px-3 rounded-full text-xs font-semibold border transition-colors ${
                    actorFilter === opt.value
                      ? 'bg-gold-500 text-obsidian-950 border-gold-500'
                      : 'bg-obsidian-900 text-silver-400 border-silver-800 hover:border-silver-700 hover:text-silver-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-auto min-w-[220px]">
              <Search
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar en auditoría…"
              />
            </div>
          </div>

          {/* Render real logs if present in ready state */}
          {filteredLogs.length > 0 ? (
            <AuditLogList logs={filteredLogs} />
          ) : (
            <EmptyState
              icon="alert"
              title="Sin registros de auditoría"
              description="No se han registrado acciones auditables que coincidan con los filtros aplicados."
            />
          )}
        </div>
      </StateBoundary>
    </div>
  );
};

export const AdminEventAuditScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  return (
    <AdminEventAuditContent
      key={paramEventId ?? 'no-event'}
      paramEventId={paramEventId}
    />
  );
};
