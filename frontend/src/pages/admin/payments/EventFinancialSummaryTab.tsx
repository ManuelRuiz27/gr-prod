import React from 'react';
import {
  Card,
  Button,
  Badge,
  Icon,
} from '../../../design-system';
import {
  mockEventFinancialSummary,
  type EventMock,
} from '../../../fixtures';

export interface EventFinancialSummaryTabProps {
  event: EventMock;
  onNavigateToPortfolio: () => void;
  onNavigateToReconciliation: () => void;
  onOpenManualPayment: (graduateId?: string) => void;
  onViewGraduatePlan?: (graduateId: string) => void;
}

export const EventFinancialSummaryTab: React.FC<EventFinancialSummaryTabProps> = ({
  event,
  onNavigateToPortfolio,
  onNavigateToReconciliation,
  onOpenManualPayment,
  onViewGraduatePlan,
}) => {
  const summary = mockEventFinancialSummary;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
            Estado de Cuenta Global
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            {event.name} • {event.venue} • {event.date}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            iconStart="users"
            onClick={onNavigateToPortfolio}
          >
            Ver cartera
          </Button>
          <Button
            variant="secondary"
            size="sm"
            iconStart="refresh"
            onClick={onNavigateToReconciliation}
          >
            Conciliación
          </Button>
          <Button
            variant="primary"
            size="sm"
            iconStart="plus"
            onClick={() => onOpenManualPayment()}
          >
            Registrar pago
          </Button>
        </div>
      </div>

      {/* Bento Grid: 4 Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Contratado */}
        <Card className="p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-content-secondary">Total contratado</span>
            <div className="w-8 h-8 rounded-full bg-navy-50 text-navy-800 flex items-center justify-center">
              <Icon name="payment" size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-navy-900 font-display">
              ${summary.contractedTotal.toLocaleString('es-MX')} MXN
            </h3>
            <p className="text-[11px] text-content-muted mt-1">Cartera de graduados</p>
          </div>
        </Card>

        {/* Metric 2: Total Cobrado / Recaudado */}
        <Card className="p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute bottom-0 left-0 h-1 bg-surface-low w-full">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${summary.collectedPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-content-secondary">Recaudado</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Icon name="check" size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-navy-900 font-display">
                ${summary.collectedTotal.toLocaleString('es-MX')} MXN
              </h3>
              <span className="text-xs font-bold text-emerald-700">
                {summary.collectedPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-content-muted mt-1">De lo contratado</p>
          </div>
        </Card>

        {/* Metric 3: Saldo Pendiente */}
        <Card className="p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-content-secondary">Pendiente</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <Icon name="clock" size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-navy-900 font-display">
                ${summary.pendingTotal.toLocaleString('es-MX')} MXN
              </h3>
              <span className="text-xs font-bold text-amber-700">
                {summary.pendingPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-content-muted mt-1">Programado en calendario</p>
          </div>
        </Card>

        {/* Metric 4: Saldo Vencido */}
        <Card className="p-5 flex flex-col justify-between relative overflow-hidden bg-rose-50/30 border-rose-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-rose-800">Vencido</span>
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <Icon name="alert" size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-rose-700 font-display">
                ${summary.overdueTotal.toLocaleString('es-MX')} MXN
              </h3>
              <span className="text-xs font-bold text-rose-700">
                {summary.overduePercentage}%
              </span>
            </div>
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <Icon name="alert" size={12} />
              Requiere atención
            </p>
          </div>
        </Card>
      </div>

      {/* Distribution Progress Bar Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-navy-900">Distribución de Cartera</h3>
            <p className="text-xs text-content-secondary">
              Comportamiento global de pagos y cobrabilidad del evento.
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            Total $1,250,000 MXN
          </Badge>
        </div>

        {/* Segmented Bar */}
        <div
          role="progressbar"
          aria-label="Distribución de cartera"
          aria-valuenow={summary.distribution.paid.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full h-5 rounded-full flex overflow-hidden bg-surface-low border border-surface-high p-0.5 gap-0.5"
        >
          <div
            className="bg-emerald-600 h-full rounded-l-full transition-all duration-500"
            style={{ width: `${summary.distribution.paid.percentage}%` }}
            title={`Pagados: ${summary.distribution.paid.percentage}%`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-500"
            style={{ width: `${summary.distribution.upcoming.percentage}%` }}
            title={`Próximos: ${summary.distribution.upcoming.percentage}%`}
          />
          <div
            className="bg-rose-600 h-full rounded-r-full transition-all duration-500"
            style={{ width: `${summary.distribution.overdue.percentage}%` }}
            title={`Vencidos: ${summary.distribution.overdue.percentage}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-surface-low text-xs">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0" />
            <div>
              <span className="text-content-secondary font-medium">Pagados</span>
              <p className="font-bold text-navy-900 text-sm">
                ${summary.distribution.paid.amount.toLocaleString('es-MX')} ({summary.distribution.paid.percentage}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
            <div>
              <span className="text-content-secondary font-medium">Próximos (Al corriente)</span>
              <p className="font-bold text-navy-900 text-sm">
                ${summary.distribution.upcoming.amount.toLocaleString('es-MX')} ({summary.distribution.upcoming.percentage}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shrink-0" />
            <div>
              <span className="text-rose-700 font-medium">Vencidos</span>
              <p className="font-bold text-rose-700 text-sm">
                ${summary.distribution.overdue.amount.toLocaleString('es-MX')} ({summary.distribution.overdue.percentage}%)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actionable Sections: Critical Overdue & Upcoming Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Card */}
        <Card className="p-0 overflow-hidden flex flex-col justify-between">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="alert" size={16} className="text-rose-600" />
              <h4 className="text-sm font-bold text-rose-900">Vencimientos críticos</h4>
            </div>
            <Badge variant="error" size="sm">
              {summary.criticalOverdue.length} Casos
            </Badge>
          </div>

          <div className="divide-y divide-surface-low">
            {summary.criticalOverdue.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-surface-low/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-900">{item.graduateName}</p>
                    <p className="text-[11px] text-content-secondary">{item.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-rose-700">
                    ${item.amount.toLocaleString('es-MX')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (onViewGraduatePlan) {
                        onViewGraduatePlan(item.graduateId);
                      } else {
                        onNavigateToPortfolio();
                      }
                    }}
                  >
                    Ver caso
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-surface-low text-center border-t border-surface-high">
            <button
              type="button"
              onClick={onNavigateToPortfolio}
              className="text-xs font-semibold text-navy-900 hover:text-gold-600 transition-colors"
            >
              Ver todos los graduados en Cartera →
            </button>
          </div>
        </Card>

        {/* Upcoming Projections Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-navy-900">Próximos ingresos estimados</h4>
              <Badge variant="warning" size="sm">
                Proyección
              </Badge>
            </div>

            <div className="flex flex-col items-center text-center py-4 bg-surface-low rounded-2xl border border-surface-high mb-4">
              <div className="w-12 h-12 rounded-full bg-navy-100/50 text-navy-900 flex items-center justify-center mb-2">
                <Icon name="calendar" size={22} />
              </div>
              <span className="text-2xl font-extrabold text-navy-900 font-display">
                ${summary.upcomingIncome.estimatedAmount.toLocaleString('es-MX')} MXN
              </span>
              <p className="text-xs text-content-secondary mt-1">
                {summary.upcomingIncome.periodLabel}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-surface-low pt-3">
            <div className="flex justify-between">
              <span className="text-content-secondary">Cuotas ordinarias calendario</span>
              <span className="font-bold text-navy-900">
                ${summary.upcomingIncome.ordinaryInstallments.toLocaleString('es-MX')} MXN
              </span>
            </div>
            <div className="flex justify-between text-content-muted text-[11px]">
              <span>Pasarela sugerida</span>
              <span>Mercado Pago (Electrónico) / Transferencia</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
