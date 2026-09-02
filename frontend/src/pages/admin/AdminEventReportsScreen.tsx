import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
  // Selected event for global mode
  const [selectedGlobalEventId, setSelectedGlobalEventId] = useState<string>(
    paramEventId || ''
  );
  const [timeRange, setTimeRange] = useState<ReportTimeRange>('monthly');

  // Normative filters
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');

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

  const timeRangeTabs = [
    { id: 'daily', label: 'Diario' },
    { id: 'weekly', label: 'Semanal' },
    { id: 'monthly', label: 'Mensual' },
  ];

  // Derived schools from events
  const schoolOptions = useMemo(() => {
    const schools = Array.from(
      new Set(
        mockEvents
          .map((ev) => {
            if (ev.name.includes('Derecho')) return 'Facultad de Derecho';
            if (ev.name.includes('Medicina')) return 'Facultad de Medicina';
            if (ev.name.includes('Ingeniería')) return 'Facultad de Ingeniería';
            return 'General';
          })
      )
    );
    return [
      { value: 'all', label: 'Todas las escuelas' },
      ...schools.map((s) => ({ value: s, label: s })),
    ];
  }, []);

  const methodOptions = [
    { value: 'all', label: 'Todos los métodos' },
    { value: 'TRANSFER', label: 'Transferencia (SPEI)' },
    { value: 'DEPOSIT', label: 'Depósito en ventanilla' },
    { value: 'CASH', label: 'Efectivo en caja' },
    { value: 'OPENPAY', label: 'Tarjeta / Openpay' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'CONFIRMED', label: 'Confirmado / Aprobado' },
    { value: 'PENDING_REVIEW', label: 'Pendiente de validación' },
    { value: 'REJECTED', label: 'Rechazado' },
    { value: 'ATRASADO', label: 'Atrasado / En mora' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Corte completo' },
    { value: 'last7', label: 'Últimos 7 días' },
    { value: 'last30', label: 'Últimos 30 días' },
    { value: 'currentMonth', label: 'Mes en curso' },
  ];

  // Filtered payments by method and status
  const filteredTransactions = useMemo(() => {
    if (!reportsVm) return [];
    return reportsVm.payments.transactions.filter((tx) => {
      const matchMethod = methodFilter === 'all' || tx.method === methodFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'CONFIRMED' && tx.status === 'CONFIRMED') ||
        (statusFilter === 'REVERSED' && tx.status === 'REVERSED');
      return matchMethod && matchStatus;
    });
  }, [reportsVm, methodFilter, statusFilter]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    if (!reportsVm) return [];
    return reportsVm.submissions.queue.filter((sub) => {
      const matchMethod = methodFilter === 'all' || sub.method === methodFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'PENDING_REVIEW' && sub.status === 'PENDING_REVIEW') ||
        (statusFilter === 'CONFIRMED' && sub.status === 'APPROVED') ||
        (statusFilter === 'REJECTED' && sub.status === 'REJECTED');
      return matchMethod && matchStatus;
    });
  }, [reportsVm, methodFilter, statusFilter]);

  // Filtered portfolio
  const filteredPortfolio = useMemo(() => {
    if (!reportsVm) return [];
    return reportsVm.portfolio.graduatesWithPlan.filter((item) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'CONFIRMED' && item.status === 'AL_CORRIENTE') ||
        (statusFilter === 'ATRASADO' && item.status === 'ATRASADO');
      return matchStatus;
    });
  }, [reportsVm, statusFilter]);

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
                { label: 'Reportes y cortes', current: true },
              ]
            : [
                { label: 'Plataforma GR', href: '/admin' },
                { label: 'Reportes y cortes', current: true },
              ]
        }
      />

      {/* Page Header Always Visible */}
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
            {event
              ? `${event.name} • ${event.venue} • ${event.date}`
              : 'Consulta, análisis y exportación de reportes operativos y financieros.'}
          </p>
        </div>
      </div>

      {/* Global & Normative Filter Bar */}
      <Card className="p-4 bg-obsidian-900/90 border border-silver-800 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Global Event Selector (if in global mode without paramEventId) */}
          {!paramEventId && (
            <div>
              <Select
                id="globalEventFilter"
                label="Evento"
                value={effectiveEventId}
                onChange={(e) => setSelectedGlobalEventId(e.target.value)}
                options={[
                  { value: '', label: 'Selecciona un evento…' },
                  ...mockEvents.map((ev) => ({
                    value: ev.id,
                    label: `${ev.name} (${ev.date})`,
                  })),
                ]}
              />
            </div>
          )}

          {/* School Filter */}
          <div>
            <Select
              id="reportSchoolFilter"
              label="Escuela / Facultad"
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              options={schoolOptions}
            />
          </div>

          {/* Payment Method Filter */}
          <div>
            <Select
              id="reportMethodFilter"
              label="Método de pago"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              options={methodOptions}
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              id="reportStatusFilter"
              label="Estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <Select
              id="reportDateRangeFilter"
              label="Rango de fechas"
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              options={dateRangeOptions}
            />
          </div>
        </div>

        {/* Period Tabs */}
        {effectiveEventId && (
          <div className="flex items-center justify-between border-t border-silver-800 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-silver-400">Periodo temporal:</span>
              <Tabs
                tabs={timeRangeTabs}
                activeTab={timeRange}
                onChange={(tabId) => setTimeRange(tabId as ReportTimeRange)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Results Area */}
      {!effectiveEventId ? (
        <EmptyState
          icon="download"
          title="Selecciona un evento para consultar reportes"
          description="Para consultar y exportar los reportes operativos de cobranza, pagos, mesas, platillos y termos, selecciona un evento desde el selector superior."
        />
      ) : !event || !reportsVm ? (
        <EmptyState
          icon="alert"
          title="Evento no encontrado"
          description="No encontramos el evento solicitado para consultar los reportes."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Notice Banner */}
          <Alert variant="info" title="Integración de Exportaciones">
            Las descargas en formatos XLSX, CSV y PDF quedarán habilitadas al conectar los servicios de exportación con el backend.
          </Alert>

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
                        Resumen de recaudación, saldos por cobrar, obligaciones vencidas y ajustes.
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">XLSX • CSV • PDF</Badge>
                </div>

                {/* Metrics */}
                {reportsVm.financial.hasData ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                      <span className="text-[10px] uppercase font-semibold text-silver-400 block">Contratado</span>
                      <span className="text-sm font-bold text-silver-100 font-mono">
                        ${reportsVm.financial.totalContracted.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                      <span className="text-[10px] uppercase font-semibold text-silver-400 block">Recaudado / Cobrado</span>
                      <span className="text-sm font-bold text-status-success font-mono">
                        ${reportsVm.financial.totalCollected.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                      <span className="text-[10px] uppercase font-semibold text-silver-400 block">Pendiente</span>
                      <span className="text-sm font-bold text-silver-200 font-mono">
                        ${reportsVm.financial.totalPending.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                      <span className="text-[10px] uppercase font-semibold text-silver-400 block">Vencido</span>
                      <span className="text-sm font-bold text-status-error font-mono">
                        ${reportsVm.financial.totalOverdue.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                      <span className="text-[10px] uppercase font-semibold text-silver-400 block">Penalizaciones</span>
                      <span className="text-sm font-bold text-status-warning font-mono">
                        ${reportsVm.financial.penaltiesAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                      <span className="text-[10px] uppercase font-semibold text-silver-400 block">Reembolsos</span>
                      <span className="text-sm font-bold text-silver-300 font-mono">
                        ${reportsVm.financial.refundsAmount.toLocaleString()}
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
                        Saldos individuales, próximos vencimientos, días de atraso y estado.
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">XLSX • CSV</Badge>
                </div>

                {filteredPortfolio.length > 0 ? (
                  <div className="flex flex-col gap-2 pt-1 max-h-56 overflow-y-auto">
                    {filteredPortfolio.map((item) => (
                      <div key={item.graduateId} className="flex justify-between items-center text-xs p-2.5 bg-obsidian-900 rounded-lg border border-silver-800">
                        <div>
                          <span className="font-semibold text-silver-100 block">{item.fullName}</span>
                          <span className="text-[11px] text-silver-400">
                            Folio: {item.contractFolio || '—'} • Próx: {item.nextPaymentDueDate}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-silver-100 font-mono font-bold block">
                            Saldo: ${item.pendingAmount.toLocaleString()}
                          </span>
                          <Badge variant={item.status === 'AL_CORRIENTE' ? 'success' : item.status === 'ATRASADO' ? 'error' : 'warning'} size="sm">
                            {item.status === 'AL_CORRIENTE' ? 'Al corriente' : item.status === 'ATRASADO' ? `${item.overdueDays} días atraso` : 'Próximo'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-obsidian-900 rounded-xl text-xs text-silver-400 text-center border border-silver-800">
                    Sin registros de cartera disponibles que coincidan con los filtros.
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

                {filteredTransactions.length > 0 ? (
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex justify-between items-center px-1 text-xs">
                      <span className="text-silver-400">Total movimientos confirmados:</span>
                      <span className="font-bold text-status-success font-mono text-sm">
                        ${filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {filteredTransactions.map((tx) => (
                        <div key={tx.id} className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-silver-100 block">{tx.graduateName}</span>
                            <span className="text-[11px] text-silver-400">
                              {tx.concept} • {tx.method} • Ref: {tx.reference}
                            </span>
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
                    Sin transacciones confirmadas que coincidan con los filtros.
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
                        Seguimiento de comprobantes bancarios, estado, revisor y fechas.
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">XLSX • CSV</Badge>
                </div>

                {filteredSubmissions.length > 0 ? (
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 text-center">
                        <span className="text-[10px] uppercase text-silver-400 block font-semibold">Pendientes</span>
                        <span className="font-bold text-status-warning font-mono">
                          {filteredSubmissions.filter((s) => s.status === 'PENDING_REVIEW').length}
                        </span>
                      </div>
                      <div className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 text-center">
                        <span className="text-[10px] uppercase text-silver-400 block font-semibold">Aprobados</span>
                        <span className="font-bold text-status-success font-mono">
                          {filteredSubmissions.filter((s) => s.status === 'APPROVED').length}
                        </span>
                      </div>
                      <div className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 text-center">
                        <span className="text-[10px] uppercase text-silver-400 block font-semibold">Rechazados</span>
                        <span className="font-bold text-status-error font-mono">
                          {filteredSubmissions.filter((s) => s.status === 'REJECTED').length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {filteredSubmissions.map((sub) => (
                        <div key={sub.id} className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-silver-100 block">{sub.graduateName}</span>
                            <span className="text-[11px] text-silver-400">
                              {sub.folio} • {sub.method} {sub.reviewer ? `• Revisó: ${sub.reviewer}` : ''}
                            </span>
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
                    Sin comprobantes registrados que coincidan con los filtros.
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
                        Capacidad física total, lugares asignados, disponibilidad y desglose de mesas.
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">PDF • XLSX</Badge>
                </div>

                {/* Metrics */}
                {reportsVm.tables.hasData ? (
                  <div className="flex flex-col gap-2.5 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                        <span className="text-[10px] uppercase font-semibold text-silver-400 block">Mesas</span>
                        <span className="text-sm font-bold text-silver-100 font-mono">
                          {reportsVm.tables.tablesCount}
                        </span>
                      </div>
                      <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                        <span className="text-[10px] uppercase font-semibold text-silver-400 block">Capacidad</span>
                        <span className="text-sm font-bold text-silver-100 font-mono">
                          {reportsVm.tables.totalCapacity}
                        </span>
                      </div>
                      <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                        <span className="text-[10px] uppercase font-semibold text-silver-400 block">Ocupados</span>
                        <span className="text-sm font-bold text-silver-200 font-mono">
                          {reportsVm.tables.totalOccupied}
                        </span>
                      </div>
                      <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                        <span className="text-[10px] uppercase font-semibold text-silver-400 block">Disponibles</span>
                        <span className="text-sm font-bold text-status-success font-mono">
                          {reportsVm.tables.totalAvailable}
                        </span>
                      </div>
                    </div>

                    {/* Detailed Table Rows */}
                    {reportsVm.tables.tableRows && reportsVm.tables.tableRows.length > 0 && (
                      <div className="space-y-1 max-h-40 overflow-y-auto pt-1">
                        {reportsVm.tables.tableRows.map((t) => (
                          <div key={t.tableNumber} className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-semibold text-silver-100">Mesa {t.tableNumber}</span>
                              <span className="text-[11px] text-silver-400 block">
                                Capacidad: {t.capacity} • Personas asignadas: {t.assignedPeopleCount}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-silver-200 block">{t.occupied} / {t.capacity}</span>
                              <span className="text-[10px] text-status-success font-semibold">
                                {t.available} libres
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                        Totales por opción registrada, pendientes y detalle nominal de comensales.
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">PDF • XLSX</Badge>
                </div>

                {reportsVm.meals.hasData ? (
                  <div className="flex flex-col gap-2.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-silver-400 px-1">
                      <span>Comensales con selección nominal:</span>
                      <span className="font-bold text-silver-100 font-mono">{reportsVm.meals.totalGuestsRegistered}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(reportsVm.meals.optionsTally).map(([option, count]) => (
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

                    {/* Nominal Selections Detail */}
                    {reportsVm.meals.nominalSelections && reportsVm.meals.nominalSelections.length > 0 && (
                      <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                        {reportsVm.meals.nominalSelections.map((sel, i) => (
                          <div key={i} className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-semibold text-silver-100">{sel.personName}</span>
                              <span className="text-[11px] text-silver-400 block">Titular: {sel.graduateName}</span>
                            </div>
                            <Badge variant="neutral" size="sm">
                              {sel.mealOption}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
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
                        Consolidado por estados operativos, personalización conocida y detalle de entrega.
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">PDF • XLSX</Badge>
                </div>

                {reportsVm.thermos.hasData ? (
                  <div className="flex flex-col gap-3 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                        <span className="text-[10px] uppercase font-semibold text-silver-400 block">Bloqueados</span>
                        <span className="text-sm font-bold text-silver-100 font-mono">
                          {reportsVm.thermos.locked}
                        </span>
                      </div>
                      <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                        <span className="text-[10px] uppercase font-semibold text-gold-400 block">Disponibles</span>
                        <span className="text-sm font-bold text-gold-400 font-mono">
                          {reportsVm.thermos.available}
                        </span>
                      </div>
                      <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                        <span className="text-[10px] uppercase font-semibold text-silver-300 block">Solicitados</span>
                        <span className="text-sm font-bold text-silver-50 font-mono">
                          {reportsVm.thermos.requested}
                        </span>
                      </div>
                      <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                        <span className="text-[10px] uppercase font-semibold text-status-warning block">En producción</span>
                        <span className="text-sm font-bold text-status-warning font-mono">
                          {reportsVm.thermos.inProduction}
                        </span>
                      </div>
                      <div className="p-2.5 bg-obsidian-900 rounded-xl border border-silver-800">
                        <span className="text-[10px] uppercase font-semibold text-status-success block">Entregados</span>
                        <span className="text-sm font-bold text-status-success font-mono">
                          {reportsVm.thermos.delivered}
                        </span>
                      </div>
                    </div>

                    {/* Detailed Thermo Rows */}
                    {reportsVm.thermos.thermoRows && reportsVm.thermos.thermoRows.length > 0 && (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {reportsVm.thermos.thermoRows.map((th) => (
                          <div key={th.folio} className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-semibold text-silver-100">{th.graduateName}</span>
                              <span className="text-[11px] text-silver-400 block">
                                Folio: {th.folio} {th.customName ? `• Personalización: "${th.customName}"` : '• Sin personalización'}
                              </span>
                            </div>
                            <Badge
                              variant={
                                th.status === 'DELIVERED'
                                  ? 'success'
                                  : th.status === 'IN_PRODUCTION'
                                  ? 'warning'
                                  : th.status === 'AVAILABLE'
                                  ? 'info'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {th.status === 'DELIVERED'
                                ? 'Entregado'
                                : th.status === 'IN_PRODUCTION'
                                ? 'En producción'
                                : th.status === 'AVAILABLE'
                                ? 'Disponible'
                                : th.status === 'REQUESTED'
                                ? 'Solicitado'
                                : 'Bloqueado'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
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
      )}
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
