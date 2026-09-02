import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Breadcrumb,
  EmptyState,
  Alert,
  Card,
  StateBoundary,
  Select,
  Search,
  type UIState,
} from '../../design-system';
import {
  VISUAL_QA_AUDIT_LOGS,
  AUDIT_REFERENCE_DATE,
  isWithinDeterministicRange,
  VISUAL_QA_EVENTS,
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
  const [selectedGlobalEventId, setSelectedGlobalEventId] = useState<string>(
    paramEventId || ''
  );
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [actionCategoryFilter, setActionCategoryFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const effectiveEventId = paramEventId || selectedGlobalEventId;

  const event = effectiveEventId
    ? VISUAL_QA_EVENTS.find((e) => e.id === effectiveEventId)
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

  // Filter logs by actor origin, action category, entity, deterministic date range, and search
  const filteredLogs = useMemo(() => {
    return availableLogs.filter((log) => {
      // 1. Actor origin filter (includes Proveedor!)
      const matchActor =
        actorFilter === 'all' ||
        (actorFilter === 'ADMIN' && log.actorOrigin === 'ADMIN') ||
        (actorFilter === 'Sistema' && log.actorOrigin === 'Sistema') ||
        (actorFilter === 'Proceso automático' && log.actorOrigin === 'Proceso automático') ||
        (actorFilter === 'Proveedor' && log.actorOrigin === 'Proveedor');

      // 2. Action category filter
      const matchAction =
        actionCategoryFilter === 'all' ||
        log.action === actionCategoryFilter ||
        log.actionLabel.toLowerCase().includes(actionCategoryFilter.toLowerCase());

      // 3. Entity filter
      const matchEntity =
        entityFilter === 'all' ||
        log.entityType === entityFilter;

      // 4. Date range filter
      const matchDate = isWithinDeterministicRange(
        log.timestamp,
        dateRangeFilter,
        AUDIT_REFERENCE_DATE
      );

      // 5. Search keyword
      const matchSearch =
        search.trim() === '' ||
        log.actor.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase()) ||
        log.entityId.toLowerCase().includes(search.toLowerCase()) ||
        (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()));

      return matchActor && matchAction && matchEntity && matchDate && matchSearch;
    });
  }, [availableLogs, actorFilter, actionCategoryFilter, entityFilter, dateRangeFilter, search]);

  const actorFilterOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos los orígenes' },
    { value: 'ADMIN', label: 'ADMIN' },
    { value: 'Sistema', label: 'Sistema' },
    { value: 'Proceso automático', label: 'Procesos automáticos' },
    { value: 'Proveedor', label: 'Proveedor' },
  ];

  const actionCategoryOptions = [
    { value: 'all', label: 'Todas las acciones' },
    { value: 'TABLE_CHANGED', label: 'Cambio de mesa' },
    { value: 'MEAL_OVERRIDE', label: 'Modificación de platillo' },
    { value: 'THERMO_UNLOCKED', label: 'Desbloqueo de termo' },
    { value: 'POLICY_PUBLISHED', label: 'Publicación de política' },
    { value: 'PROOF_APPROVED', label: 'Aprobación de comprobante' },
    { value: 'MANUAL_PAYMENT', label: 'Pago manual' },
  ];

  const entityOptions = [
    { value: 'all', label: 'Todas las entidades' },
    { value: 'TABLE', label: 'Mesas' },
    { value: 'MEAL', label: 'Platillos' },
    { value: 'THERMO', label: 'Termos' },
    { value: 'POLICY', label: 'Políticas' },
    { value: 'PROOF', label: 'Comprobantes' },
    { value: 'PAYMENT', label: 'Pagos' },
    { value: 'GRADUATE', label: 'Graduados' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Histórico completo' },
    { value: 'last7', label: 'Últimos 7 días' },
    { value: 'last30', label: 'Últimos 30 días' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans pb-16">
      {/* Breadcrumb */}
      <Breadcrumb
        items={
          paramEventId && event
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

      {/* Header Always Rendered */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Historial de Cambios y Auditoría
          </h1>
          <p className="text-xs text-silver-400">
            {event
              ? `${event.name} • ${event.venue} • ${event.date}`
              : 'Registro inmutable de operaciones administrativas y eventos del sistema.'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-obsidian-900/90 border border-silver-800 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Global Event Selector */}
          {!paramEventId && (
            <div>
              <Select
                id="globalAuditEventFilter"
                label="Evento"
                value={effectiveEventId}
                onChange={(e) => setSelectedGlobalEventId(e.target.value)}
                options={[
                  { value: '', label: 'Selecciona un evento…' },
                  ...VISUAL_QA_EVENTS.map((ev) => ({
                    value: ev.id,
                    label: `${ev.name} (${ev.date})`,
                  })),
                ]}
              />
            </div>
          )}

          {/* Action Category Filter */}
          <div>
            <Select
              id="auditActionCategoryFilter"
              label="Acción / Categoría"
              value={actionCategoryFilter}
              onChange={(e) => setActionCategoryFilter(e.target.value)}
              options={actionCategoryOptions}
            />
          </div>

          {/* Entity Filter */}
          <div>
            <Select
              id="auditEntityFilter"
              label="Entidad / Contexto"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              options={entityOptions}
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <Select
              id="auditDateRangeFilter"
              label="Rango de fechas"
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              options={dateRangeOptions}
            />
          </div>
        </div>

        {/* Actor / Origin Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-silver-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-silver-400 mr-1">Origen:</span>
            {actorFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActorFilter(opt.value)}
                className={`h-7 px-3 rounded-full text-xs font-semibold border transition-colors ${
                  actorFilter === opt.value
                    ? 'bg-gold-500 text-obsidian-950 border-gold-500'
                    : 'bg-obsidian-900 text-silver-400 border-silver-800 hover:border-silver-700 hover:text-silver-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-auto min-w-[240px]">
            <Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en auditoría…"
            />
          </div>
        </div>
      </Card>

      {/* Results Area */}
      {!effectiveEventId ? (
        <EmptyState
          icon="alert"
          title="Selecciona un evento para consultar auditoría"
          description="Para consultar el registro de auditoría e historial de cambios inmutables, selecciona un evento desde el selector superior."
        />
      ) : !event ? (
        <EmptyState
          icon="alert"
          title="Evento no encontrado"
          description="No encontramos el evento solicitado para consultar su historial de auditoría."
        />
      ) : (
        /* State Boundary */
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
      )}
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
