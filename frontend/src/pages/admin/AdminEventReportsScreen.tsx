/**
 * AdminEventReportsScreen.tsx
 *
 * Route: /admin/events/:eventId/reports
 * Ticket: FRONTEND-07 — Reportes ADMIN
 *
 * Implements UX-A-REP-001..004, API_CONTRACTS 82-87, BR-REP-001..007
 *
 * Rules enforced:
 * - Strictly scoped to :eventId — no fallback.
 * - Non-existent event shows EmptyState.
 * - Displays 5 normative report categories:
 *     1. Financiero (Cobranza)
 *     2. Cartera
 *     3. Mesas
 *     4. Platillos
 *     5. Termos
 * - Reutilizes approved event-scoped fixtures without inventing data.
 * - Neutral unconfigured state if a report category has no data.
 * - NO fake downloads or simulated success notifications.
 * - Export buttons (XLSX, CSV, PDF) indicate "Exportación pendiente de backend" and are disabled.
 * - No hardcoded 70%, fixed menu option strings or invented totals.
 * - No technical identifiers or invented provider/committee references.
 */

import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, EmptyState, Card, Badge, Button, Icon, Alert } from '../../design-system';
import { mockEvents } from '../../fixtures/eventFixtures';
import { mockGraduatesList } from '../../fixtures/graduateFixtures';
import { mockPaymentPlansMap } from '../../fixtures/paymentFixtures';
import { mockTables } from '../../fixtures/layoutFixtures';
import { buildEventReportsViewModel } from './reports/reportViewModel';

interface AdminEventReportsContentProps {
  paramEventId?: string;
}

const AdminEventReportsContent: React.FC<AdminEventReportsContentProps> = ({
  paramEventId,
}) => {
  const navigate = useNavigate();

  // ── 1. Event resolution — strictly from URL param, no fallback ──────────────
  const event = paramEventId
    ? mockEvents.find((e) => e.id === paramEventId)
    : null;

  // ── 2. Reports view model derived from event-scoped fixtures ────────────────
  const reportsVm = useMemo(() => {
    return event
      ? buildEventReportsViewModel(event, mockGraduatesList, mockPaymentPlansMap, mockTables)
      : null;
  }, [event]);

  // ── Guard: no event ID in URL ────────────────────────────────────────────────
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Reportes', current: true },
          ]}
        />
        <EmptyState
          icon="download"
          title="Selecciona un evento"
          description="Para consultar y exportar los reportes operativos, selecciona un evento desde el catálogo."
          actionLabel="Ver eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // ── Guard: event not found ───────────────────────────────────────────────────
  if (!event || !reportsVm) {
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
          description="No encontramos el evento solicitado para consultar los reportes."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // ── Happy path ───────────────────────────────────────────────────────────────
  const { financial, portfolio, tables, meals, thermos } = reportsVm;

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, href: `/admin/events/${event.id}` },
          { label: 'Reportes', current: true },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
          Centro de Reportes y Exportaciones
        </h2>
        <p className="text-xs text-content-secondary">
          {event.name} • {event.venue} • {event.date}
        </p>
      </div>

      {/* Notice Banner */}
      <Alert variant="info" title="Integración de Exportaciones">
        Las descargas en formatos XLSX, CSV y PDF quedarán habilitadas al conectar los servicios de exportación con el backend.
      </Alert>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Reporte Financiero (UX-A-REP-001 / BR-REP-002) */}
        <Card className="p-5 flex flex-col justify-between gap-4" data-testid="report-financial">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy-900 flex items-center justify-center shrink-0">
                  <Icon name="payment" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Reporte Financiero y Cobranza
                  </h3>
                  <p className="text-xs text-content-secondary mt-0.5">
                    Resumen de recaudación, saldos por cobrar y obligaciones vencidas.
                  </p>
                </div>
              </div>
              <Badge variant="outline" size="sm">XLSX • CSV • PDF</Badge>
            </div>

            {/* Metrics */}
            {financial.hasData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 bg-surface-low rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-content-muted block">Contratado</span>
                  <span className="text-sm font-extrabold text-navy-900 font-display">
                    ${financial.totalContracted.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-surface-low rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-content-muted block">Recaudado</span>
                  <span className="text-sm font-extrabold text-emerald-700 font-display">
                    ${financial.totalCollected.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-surface-low rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-content-muted block">Pendiente</span>
                  <span className="text-sm font-extrabold text-navy-800 font-display">
                    ${financial.totalPending.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-surface-low rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-content-muted block">Vencido</span>
                  <span className="text-sm font-extrabold text-rose-700 font-display">
                    ${financial.totalOverdue.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-surface-low rounded-xl text-xs text-content-muted text-center">
                Sin planes financieros registrados para este evento.
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-surface-low">
            <span className="text-[11px] text-content-muted italic">
              Exportación pendiente de backend
            </span>
            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                XLSX
              </Button>
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                CSV
              </Button>
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* 2. Reporte de Cartera (BR-REP-003) */}
        <Card className="p-5 flex flex-col justify-between gap-4" data-testid="report-portfolio">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-800 flex items-center justify-center shrink-0">
                  <Icon name="bar-chart" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Reporte de Cartera por Graduado
                  </h3>
                  <p className="text-xs text-content-secondary mt-0.5">
                    Saldos individuales, próximos vencimientos y estado de cuentas.
                  </p>
                </div>
              </div>
              <Badge variant="outline" size="sm">XLSX • CSV</Badge>
            </div>

            {/* Metrics */}
            {portfolio.hasData ? (
              <div className="flex flex-col gap-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-surface-low rounded-xl">
                    <span className="text-[10px] uppercase font-semibold text-content-muted block">Planes con seguimiento</span>
                    <span className="text-sm font-extrabold text-navy-900 font-display">
                      {portfolio.graduatesWithPlan.length}
                    </span>
                  </div>
                  <div className="p-2.5 bg-surface-low rounded-xl">
                    <span className="text-[10px] uppercase font-semibold text-content-muted block">Graduados del evento</span>
                    <span className="text-sm font-extrabold text-navy-900 font-display">
                      {thermos.total}
                    </span>
                  </div>
                </div>
                {/* Individual preview item */}
                {portfolio.graduatesWithPlan.slice(0, 2).map((item) => (
                  <div key={item.graduateId} className="flex justify-between items-center text-xs p-2 bg-surface-lowest rounded-lg border border-surface-high">
                    <span className="font-semibold text-navy-900">{item.fullName}</span>
                    <span className="text-content-secondary">
                      Saldo: ${item.pendingAmount.toLocaleString()} • Próx: {item.nextPaymentDueDate}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-surface-low rounded-xl text-xs text-content-muted text-center">
                Sin registros de cartera disponibles para este evento.
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-surface-low">
            <span className="text-[11px] text-content-muted italic">
              Exportación pendiente de backend
            </span>
            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                XLSX
              </Button>
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                CSV
              </Button>
            </div>
          </div>
        </Card>

        {/* 3. Reporte de Mesas (UX-A-REP-002 / BR-REP-004) */}
        <Card className="p-5 flex flex-col justify-between gap-4" data-testid="report-tables">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center shrink-0">
                  <Icon name="table" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Reporte de Ocupación de Mesas
                  </h3>
                  <p className="text-xs text-content-secondary mt-0.5">
                    Capacidad física total, lugares asignados y disponibilidad.
                  </p>
                </div>
              </div>
              <Badge variant="outline" size="sm">PDF • XLSX</Badge>
            </div>

            {/* Metrics */}
            {tables.hasData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 bg-surface-low rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-content-muted block">Mesas</span>
                  <span className="text-sm font-extrabold text-navy-900 font-display">
                    {tables.tablesCount}
                  </span>
                </div>
                <div className="p-2.5 bg-surface-low rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-content-muted block">Capacidad</span>
                  <span className="text-sm font-extrabold text-navy-900 font-display">
                    {tables.totalCapacity}
                  </span>
                </div>
                <div className="p-2.5 bg-surface-low rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-content-muted block">Ocupados</span>
                  <span className="text-sm font-extrabold text-navy-800 font-display">
                    {tables.totalOccupied}
                  </span>
                </div>
                <div className="p-2.5 bg-surface-low rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-content-muted block">Disponibles</span>
                  <span className="text-sm font-extrabold text-emerald-700 font-display">
                    {tables.totalAvailable}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-surface-low rounded-xl text-xs text-content-muted text-center">
                Sin mesas configuradas en este evento.
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-surface-low">
            <span className="text-[11px] text-content-muted italic">
              Exportación pendiente de backend
            </span>
            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                PDF
              </Button>
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                XLSX
              </Button>
            </div>
          </div>
        </Card>

        {/* 4. Reporte de Platillos (UX-A-REP-003 / BR-REP-005) */}
        <Card className="p-5 flex flex-col justify-between gap-4" data-testid="report-meals">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                  <Icon name="meal" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Reporte de Comanda de Platillos
                  </h3>
                  <p className="text-xs text-content-secondary mt-0.5">
                    Totales por opción registrada y seguimiento de comensales.
                  </p>
                </div>
              </div>
              <Badge variant="outline" size="sm">PDF • XLSX</Badge>
            </div>

            {/* Metrics */}
            {meals.hasData ? (
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between text-xs text-content-secondary px-1">
                  <span>Comensales con selección nominal:</span>
                  <span className="font-bold text-navy-900">{meals.totalGuestsRegistered}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(meals.optionsTally).map(([option, count]) => (
                    <div key={option} className="p-2.5 bg-surface-low rounded-xl">
                      <span className="text-[10px] uppercase font-semibold text-content-muted block truncate">
                        {option}
                      </span>
                      <span className="text-sm font-extrabold text-navy-900 font-display">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-surface-low rounded-xl text-xs text-content-muted text-center">
                Sin información nominal de platillos registrada para este evento.
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-surface-low">
            <span className="text-[11px] text-content-muted italic">
              Exportación pendiente de backend
            </span>
            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                PDF
              </Button>
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                XLSX
              </Button>
            </div>
          </div>
        </Card>

        {/* 5. Reporte de Termos (UX-A-REP-004 / BR-REP-006) */}
        <Card className="p-5 flex flex-col justify-between gap-4 lg:col-span-2" data-testid="report-thermos">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  <Icon name="cup" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    Reporte de Termos Conmemorativos
                  </h3>
                  <p className="text-xs text-content-secondary mt-0.5">
                    Consolidado de estado operativo y seguimiento por graduado.
                  </p>
                </div>
              </div>
              <Badge variant="outline" size="sm">PDF • XLSX</Badge>
            </div>

            {/* Metrics */}
            {thermos.hasData ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                <div className="p-2.5 bg-surface-low rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-content-muted block">Bloqueados</span>
                  <span className="text-sm font-extrabold text-navy-900 font-display">
                    {thermos.locked}
                  </span>
                </div>
                <div className="p-2.5 bg-gold-50/60 rounded-xl border border-gold-100">
                  <span className="text-[10px] uppercase font-semibold text-gold-800 block">Disponibles</span>
                  <span className="text-sm font-extrabold text-gold-700 font-display">
                    {thermos.available}
                  </span>
                </div>
                <div className="p-2.5 bg-navy-50/60 rounded-xl border border-navy-100">
                  <span className="text-[10px] uppercase font-semibold text-navy-800 block">Solicitados</span>
                  <span className="text-sm font-extrabold text-navy-900 font-display">
                    {thermos.requested}
                  </span>
                </div>
                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                  <span className="text-[10px] uppercase font-semibold text-status-warning block">En producción</span>
                  <span className="text-sm font-extrabold text-status-warning font-display">
                    {thermos.inProduction}
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-semibold text-status-success block">Entregados</span>
                  <span className="text-sm font-extrabold text-status-success font-display">
                    {thermos.delivered}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-surface-low rounded-xl text-xs text-content-muted text-center">
                Sin graduados ni termos registrados para este evento.
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-surface-low">
            <span className="text-[11px] text-content-muted italic">
              Exportación pendiente de backend
            </span>
            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                PDF
              </Button>
              <Button variant="secondary" size="sm" iconStart="download" disabled title="Exportación pendiente de backend">
                XLSX
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Public Export Wrapper (Keyed to strictly reset on event change) ───────────

export const AdminEventReportsScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  return (
    <AdminEventReportsContent
      key={paramEventId ?? 'no-event'}
      paramEventId={paramEventId}
    />
  );
};
