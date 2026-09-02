import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  EmptyState,
  Card,
  Badge,
  Button,
  Icon,
  Alert,
  Tabs,
  Select,
} from '../../design-system';
import { mockEvents } from '../../fixtures/eventFixtures';
import { mockGraduatesList } from '../../fixtures/graduateFixtures';
import { mockPaymentPlansMap } from '../../fixtures/paymentFixtures';
import { mockTables } from '../../fixtures/layoutFixtures';
import {
  buildEventReportsViewModel,
} from './reports/reportViewModel';
import type { ReportTimeRange } from '../../fixtures/cancellationReportsAuditVisualFixtures';

interface AdminEventReportsContentProps {
  paramEventId?: string;
}

export const AdminEventReportsContent: React.FC<AdminEventReportsContentProps> = ({
  paramEventId,
}) => {
  const navigate = useNavigate();

  // Selected event for global mode
  const [selectedGlobalEventId, setSelectedGlobalEventId] = useState<string>(
    paramEventId || ''
  );
  const [timeRange, setTimeRange] = useState<ReportTimeRange>('monthly');

  const effectiveEventId = paramEventId || selectedGlobalEventId;

  const event = effectiveEventId
    ? mockEvents.find((e) => e.id === effectiveEventId)
    : null;

  // View model derived for the selected event and time range
  const reportsVm = useMemo(() => {
    return event
      ? buildEventReportsViewModel(
          event,
          mockGraduatesList,
          mockPaymentPlansMap,
          mockTables,
          timeRange
        )
      : null;
  }, [event, timeRange]);

  // Guard: No event ID in URL and no event selected in global mode
  if (!effectiveEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Reportes y cortes', current: true },
          ]}
        />
        <EmptyState
          icon="download"
          title="Selecciona un evento"
          description="Para consultar y exportar los reportes operativos de cobranza, pagos, mesas, platillos y termos, selecciona un evento desde el catálogo."
          actionLabel="Ver eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // Guard: event not found
  if (!event || !reportsVm) {
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
          description="No encontramos el evento solicitado para consultar los reportes."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  const { financial, portfolio, payments, submissions, tables, meals, thermos } = reportsVm;

  const timeRangeTabs = [
    { id: 'daily', label: 'Diario' },
    { id: 'weekly', label: 'Semanal' },
    { id: 'monthly', label: 'Mensual' },
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
                { label: 'Reportes y cortes', current: true },
              ]
            : [
                { label: 'Plataforma GR', href: '/admin' },
                { label: 'Reportes y cortes', current: true },
              ]
        }
      />

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
              Reportes y cortes
            </h1>
            <Badge variant="neutral" size="sm">
              Centro de Reportes y Exportaciones
            </Badge>
          </div>
          <p className="text-xs text-silver-400">
            {event.name} • {event.venue} • {event.date}
          </p>
        </div>

        {/* Global Event Selector (if in global mode) */}
        {!paramEventId && (
          <div className="min-w-[260px]">
            <Select
              id="globalEventFilter"
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

      {/* Notice Banner */}
      <Alert variant="info" title="Integración de Exportaciones">
        Las descargas en formatos XLSX, CSV y PDF quedarán habilitadas al conectar los servicios de exportación con el backend.
      </Alert>

      {/* Time Range Selector Tabs */}
      <div className="flex items-center justify-between border-b border-silver-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-silver-400">Periodo de consulta:</span>
          <Tabs
            tabs={timeRangeTabs}
            activeTab={timeRange}
            onChange={(tabId) => setTimeRange(tabId as ReportTimeRange)}
          />
        </div>
      </div>

      {/* Reports Grid — 7 Families */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Reporte Financiero / Cobranza */}
        <Card className="p-5 flex flex-col justify-between gap-4 bg-obsidian-850 border border-silver-800/80" data-testid="report-financial">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-obsidian-800 text-gold-400 flex items-center justify-center shrink-0 border border-silver-700/80">
                  <Icon name="payment" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-silver-100">
                    Reporte Financiero y Cobranza
                  </h3>
                  <p className="text-xs text-silver-400 mt-0.5">
                    Resumen de recaudación, saldos por cobrar y obligaciones vencidas.
                  </p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">XLSX • CSV • PDF</Badge>
            </div>

            {/* Metrics */}
            {financial.hasData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-silver-400 block">Contratado</span>
                  <span className="text-sm font-bold text-silver-100 font-mono">
                    ${financial.totalContracted.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-silver-400 block">Recaudado</span>
                  <span className="text-sm font-bold text-status-success font-mono">
                    ${financial.totalCollected.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-silver-400 block">Pendiente</span>
                  <span className="text-sm font-bold text-silver-200 font-mono">
                    ${financial.totalPending.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-silver-400 block">Vencido</span>
                  <span className="text-sm font-bold text-status-error font-mono">
                    ${financial.totalOverdue.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-obsidian-900 rounded-xl text-xs text-silver-400 text-center border border-silver-800">
                Sin planes financieros registrados para este periodo.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-silver-800/80">
            <span className="text-[11px] text-silver-500 italic">
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

        {/* 2. Reporte de Cartera */}
        <Card className="p-5 flex flex-col justify-between gap-4 bg-obsidian-850 border border-silver-800/80" data-testid="report-portfolio">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-obsidian-800 text-gold-400 flex items-center justify-center shrink-0 border border-silver-700/80">
                  <Icon name="bar-chart" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-silver-100">
                    Reporte de Cartera por Graduado
                  </h3>
                  <p className="text-xs text-silver-400 mt-0.5">
                    Saldos individuales, próximos vencimientos y estado de cuentas.
                  </p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">XLSX • CSV</Badge>
            </div>

            {portfolio.hasData ? (
              <div className="flex flex-col gap-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                    <span className="text-[10px] uppercase font-semibold text-silver-400 block">Planes con seguimiento</span>
                    <span className="text-sm font-bold text-silver-100 font-mono">
                      {portfolio.graduatesWithPlan.length}
                    </span>
                  </div>
                  <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                    <span className="text-[10px] uppercase font-semibold text-silver-400 block">Graduados del evento</span>
                    <span className="text-sm font-bold text-silver-100 font-mono">
                      {thermos.total}
                    </span>
                  </div>
                </div>
                {portfolio.graduatesWithPlan.slice(0, 2).map((item) => (
                  <div key={item.graduateId} className="flex justify-between items-center text-xs p-2.5 bg-obsidian-900 rounded-lg border border-silver-800">
                    <span className="font-semibold text-silver-100">{item.fullName}</span>
                    <span className="text-silver-400 font-mono">
                      Saldo: ${item.pendingAmount.toLocaleString()} • Próx: {item.nextPaymentDueDate}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-obsidian-900 rounded-xl text-xs text-silver-400 text-center border border-silver-800">
                Sin registros de cartera disponibles para este periodo.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-silver-800/80">
            <span className="text-[11px] text-silver-500 italic">
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

        {/* 3. Reporte de Pagos (PaymentTransaction confirmadas) */}
        <Card className="p-5 flex flex-col justify-between gap-4 bg-obsidian-850 border border-silver-800/80" data-testid="report-payments">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-obsidian-800 text-status-success flex items-center justify-center shrink-0 border border-silver-700/80">
                  <Icon name="check" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-silver-100">
                    Reporte de Transacciones y Pagos Confirmados
                  </h3>
                  <p className="text-xs text-silver-400 mt-0.5">
                    Movimientos en firme conciliados en pasarelas o registrados en caja.
                  </p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">XLSX • CSV</Badge>
            </div>

            {payments.hasData ? (
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex justify-between items-center px-1 text-xs">
                  <span className="text-silver-400">Total movimientos confirmados:</span>
                  <span className="font-bold text-status-success font-mono text-sm">
                    ${payments.totalConfirmedAmount.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {payments.transactions.map((tx) => (
                    <div key={tx.id} className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-silver-100 block">{tx.graduateName}</span>
                        <span className="text-[11px] text-silver-400">{tx.concept} • {tx.method}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-silver-50 block">${tx.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-silver-500">{tx.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-obsidian-900 rounded-xl text-xs text-silver-400 text-center border border-silver-800">
                Sin transacciones confirmadas en este periodo.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-silver-800/80">
            <span className="text-[11px] text-silver-500 italic">
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

        {/* 4. Reporte de Comprobantes (PaymentSubmission) */}
        <Card className="p-5 flex flex-col justify-between gap-4 bg-obsidian-850 border border-silver-800/80" data-testid="report-submissions">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-obsidian-800 text-gold-400 flex items-center justify-center shrink-0 border border-silver-700/80">
                  <Icon name="ticket" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-silver-100">
                    Reporte de Comprobantes por Validar
                  </h3>
                  <p className="text-xs text-silver-400 mt-0.5">
                    Seguimiento de comprobantes bancarios reportados por graduados.
                  </p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">XLSX • CSV</Badge>
            </div>

            {submissions.hasData ? (
              <div className="flex flex-col gap-2 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 text-center">
                    <span className="text-[10px] uppercase text-silver-400 block font-semibold">Pendientes</span>
                    <span className="font-bold text-status-warning font-mono">{submissions.pendingCount}</span>
                  </div>
                  <div className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 text-center">
                    <span className="text-[10px] uppercase text-silver-400 block font-semibold">Aprobados</span>
                    <span className="font-bold text-status-success font-mono">{submissions.approvedCount}</span>
                  </div>
                  <div className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 text-center">
                    <span className="text-[10px] uppercase text-silver-400 block font-semibold">Rechazados</span>
                    <span className="font-bold text-status-error font-mono">{submissions.rejectedCount}</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {submissions.queue.map((sub) => (
                    <div key={sub.id} className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-silver-100 block">{sub.graduateName}</span>
                        <span className="text-[11px] text-silver-400">{sub.folio} • {sub.method}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-silver-50 block">${sub.reportedAmount.toLocaleString()}</span>
                        <Badge variant={sub.status === 'APPROVED' ? 'success' : sub.status === 'REJECTED' ? 'error' : 'warning'} size="sm">
                          {sub.status === 'APPROVED' ? 'Aprobado' : sub.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-obsidian-900 rounded-xl text-xs text-silver-400 text-center border border-silver-800">
                Sin comprobantes registrados en este periodo.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-silver-800/80">
            <span className="text-[11px] text-silver-500 italic">
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

        {/* 5. Reporte de Mesas */}
        <Card className="p-5 flex flex-col justify-between gap-4 bg-obsidian-850 border border-silver-800/80" data-testid="report-tables">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-obsidian-800 text-gold-400 flex items-center justify-center shrink-0 border border-silver-700/80">
                  <Icon name="table" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-silver-100">
                    Reporte de Ocupación de Mesas
                  </h3>
                  <p className="text-xs text-silver-400 mt-0.5">
                    Capacidad física total, lugares asignados y disponibilidad.
                  </p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">PDF • XLSX</Badge>
            </div>

            {/* Metrics */}
            {tables.hasData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-silver-400 block">Mesas</span>
                  <span className="text-sm font-bold text-silver-100 font-mono">
                    {tables.tablesCount}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-silver-400 block">Capacidad</span>
                  <span className="text-sm font-bold text-silver-100 font-mono">
                    {tables.totalCapacity}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-silver-400 block">Ocupados</span>
                  <span className="text-sm font-bold text-silver-200 font-mono">
                    {tables.totalOccupied}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-silver-400 block">Disponibles</span>
                  <span className="text-sm font-bold text-status-success font-mono">
                    {tables.totalAvailable}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-obsidian-900 rounded-xl text-xs text-silver-400 text-center border border-silver-800">
                Sin mesas configuradas en este evento.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-silver-800/80">
            <span className="text-[11px] text-silver-500 italic">
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

        {/* 6. Reporte de Platillos */}
        <Card className="p-5 flex flex-col justify-between gap-4 bg-obsidian-850 border border-silver-800/80" data-testid="report-meals">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-obsidian-800 text-gold-400 flex items-center justify-center shrink-0 border border-silver-700/80">
                  <Icon name="meal" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-silver-100">
                    Reporte de Comanda de Platillos
                  </h3>
                  <p className="text-xs text-silver-400 mt-0.5">
                    Totales por opción registrada y seguimiento de comensales.
                  </p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">PDF • XLSX</Badge>
            </div>

            {meals.hasData ? (
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between text-xs text-silver-400 px-1">
                  <span>Comensales con selección nominal:</span>
                  <span className="font-bold text-silver-100 font-mono">{meals.totalGuestsRegistered}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(meals.optionsTally).map(([option, count]) => (
                    <div key={option} className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                      <span className="text-[10px] uppercase font-semibold text-silver-400 block truncate">
                        {option}
                      </span>
                      <span className="text-sm font-bold text-silver-100 font-mono">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-obsidian-900 rounded-xl text-xs text-silver-400 text-center border border-silver-800">
                Sin información nominal de platillos registrada para este evento.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-silver-800/80">
            <span className="text-[11px] text-silver-500 italic">
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

        {/* 7. Reporte de Termos Conmemorativos */}
        <Card className="p-5 flex flex-col justify-between gap-4 bg-obsidian-850 border border-silver-800/80 lg:col-span-2" data-testid="report-thermos">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-obsidian-800 text-gold-400 flex items-center justify-center shrink-0 border border-silver-700/80">
                  <Icon name="cup" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-silver-100">
                    Reporte de Termos Conmemorativos
                  </h3>
                  <p className="text-xs text-silver-400 mt-0.5">
                    Consolidado de estado operativo y seguimiento por graduado.
                  </p>
                </div>
              </div>
              <Badge variant="neutral" size="sm">PDF • XLSX</Badge>
            </div>

            {thermos.hasData ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-silver-400 block">Bloqueados</span>
                  <span className="text-sm font-bold text-silver-100 font-mono">
                    {thermos.locked}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-gold-400 block">Disponibles</span>
                  <span className="text-sm font-bold text-gold-400 font-mono">
                    {thermos.available}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-silver-300 block">Solicitados</span>
                  <span className="text-sm font-bold text-silver-50 font-mono">
                    {thermos.requested}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-status-warning block">En producción</span>
                  <span className="text-sm font-bold text-status-warning font-mono">
                    {thermos.inProduction}
                  </span>
                </div>
                <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                  <span className="text-[10px] uppercase font-semibold text-status-success block">Entregados</span>
                  <span className="text-sm font-bold text-status-success font-mono">
                    {thermos.delivered}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-obsidian-900 rounded-xl text-xs text-silver-400 text-center border border-silver-800">
                Sin graduados ni termos registrados para este evento.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-silver-800/80">
            <span className="text-[11px] text-silver-500 italic">
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

export const AdminEventReportsScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  return (
    <AdminEventReportsContent
      key={paramEventId ?? 'no-event'}
      paramEventId={paramEventId}
    />
  );
};
