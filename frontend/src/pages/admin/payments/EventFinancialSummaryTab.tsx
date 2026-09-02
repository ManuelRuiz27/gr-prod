import React, { useMemo } from 'react';
import {
  Card,
  Button,
  Badge,
  Icon,
} from '../../../design-system';
import {
  mockGraduatesList,
  mockPaymentPlansMap,
  VISUAL_QA_SUBMISSIONS_QUEUE,
  type EventMock,
  type PaymentPlanMock,
} from '../../../fixtures';

export interface EventFinancialSummaryTabProps {
  event: EventMock;
  onNavigateToPortfolio: () => void;
  onNavigateToReconciliation: () => void;
  onNavigateToProofs?: () => void;
  onOpenManualPayment: (graduateId?: string) => void;
  onViewGraduatePlan?: (graduateId: string) => void;
}

export const EventFinancialSummaryTab: React.FC<EventFinancialSummaryTabProps> = ({
  event,
  onNavigateToPortfolio,
  onNavigateToReconciliation,
  onNavigateToProofs,
  onOpenManualPayment,
  onViewGraduatePlan,
}) => {
  // Dynamically derive financial summary strictly from plans belonging to this event
  const metrics = useMemo(() => {
    const eventGraduates = mockGraduatesList.filter((g) => g.eventId === event.id);
    const plans = eventGraduates
      .map((g) => mockPaymentPlansMap[g.id])
      .filter((p): p is PaymentPlanMock => !!p && p.eventId === event.id);

    const contractedTotal = plans.reduce((acc, p) => acc + p.totalAmount, 0);
    const collectedTotal = plans.reduce((acc, p) => acc + p.paidAmount, 0);
    const pendingTotal = plans.reduce((acc, p) => acc + p.pendingAmount, 0);
    const overdueTotal = plans.reduce((acc, p) => acc + (p.overdueAmount || 0), 0);

    const collectedPercentage = contractedTotal > 0 ? Math.round((collectedTotal / contractedTotal) * 100) : 0;
    const pendingPercentage = contractedTotal > 0 ? Math.round((pendingTotal / contractedTotal) * 100) : 0;
    const overduePercentage = contractedTotal > 0 ? Math.round((overdueTotal / contractedTotal) * 100) : 0;

    const overduePlans = plans.filter((p) => (p.overdueAmount || 0) > 0);

    const pendingProofsCount = VISUAL_QA_SUBMISSIONS_QUEUE.filter(
      (s) => s.eventId === event.id && s.status === 'PENDING_REVIEW'
    ).length;

    return {
      hasData: plans.length > 0,
      contractedTotal,
      collectedTotal,
      collectedPercentage,
      pendingTotal,
      pendingPercentage,
      overdueTotal,
      overduePercentage,
      overduePlans,
      pendingProofsCount,
    };
  }, [event.id]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-sans">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-silver-50 tracking-tight">
            Estado de Cuenta Global
          </h2>
          <p className="text-xs text-silver-400 mt-0.5">
            {event.name} • {event.venue} • {event.date}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={onNavigateToPortfolio}
          >
            Ver cartera
          </Button>
          {onNavigateToProofs && (
            <Button
              variant={metrics.pendingProofsCount > 0 ? 'secondary' : 'outline'}
              size="sm"
              onClick={onNavigateToProofs}
            >
              Comprobantes por validar {metrics.pendingProofsCount > 0 && `(${metrics.pendingProofsCount})`}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
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
        <Card className="p-5 flex flex-col justify-between relative overflow-hidden bg-obsidian-850 border border-silver-800/80">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-silver-400">Total contratado</span>
            <div className="w-8 h-8 rounded-full bg-obsidian-800 text-gold-400 flex items-center justify-center">
              <Icon name="payment" size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-silver-50 font-sans">
              {metrics.hasData
                ? `$${metrics.contractedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                : '$0.00 MXN'}
            </h3>
            <p className="text-[11px] text-silver-400 mt-1">Cartera de graduados</p>
          </div>
        </Card>

        {/* Metric 2: Total Cobrado / Recaudado */}
        <Card className="p-5 flex flex-col justify-between relative overflow-hidden bg-obsidian-850 border border-silver-800/80">
          <div className="absolute bottom-0 left-0 h-1 bg-obsidian-900 w-full">
            <div
              className="h-full bg-status-success transition-all duration-500"
              style={{ width: `${metrics.collectedPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-silver-400">Recaudado</span>
            <div className="w-8 h-8 rounded-full bg-status-success/20 text-status-success flex items-center justify-center">
              <Icon name="check" size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-silver-50 font-sans">
                {metrics.hasData
                  ? `$${metrics.collectedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                  : '$0.00 MXN'}
              </h3>
              <span className="text-xs font-bold text-status-success">
                {metrics.collectedPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-silver-400 mt-1">De lo contratado</p>
          </div>
        </Card>

        {/* Metric 3: Saldo Pendiente */}
        <Card className="p-5 flex flex-col justify-between relative overflow-hidden bg-obsidian-850 border border-silver-800/80">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-silver-400">Pendiente</span>
            <div className="w-8 h-8 rounded-full bg-status-warning/20 text-status-warning flex items-center justify-center">
              <Icon name="calendar" size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-silver-50 font-sans">
                {metrics.hasData
                  ? `$${metrics.pendingTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                  : '$0.00 MXN'}
              </h3>
              <span className="text-xs font-bold text-status-warning">
                {metrics.pendingPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-silver-400 mt-1">Programado en calendario</p>
          </div>
        </Card>

        {/* Metric 4: Saldo Vencido */}
        <Card className="p-5 flex flex-col justify-between relative overflow-hidden bg-obsidian-850 border border-silver-800/80">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-status-error">Vencido</span>
            <div className="w-8 h-8 rounded-full bg-status-error/20 text-status-error flex items-center justify-center">
              <Icon name="alert" size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-status-error font-sans">
                {metrics.hasData
                  ? `$${metrics.overdueTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                  : '$0.00 MXN'}
              </h3>
              <span className="text-xs font-bold text-status-error">
                {metrics.overduePercentage}%
              </span>
            </div>
            <p className="text-[11px] text-status-error/80 mt-1 flex items-center gap-1 font-medium">
              <Icon name="alert" size={12} />
              {metrics.overdueTotal > 0 ? 'Requiere atención' : 'Sin atrasos'}
            </p>
          </div>
        </Card>
      </div>

      {/* Distribution Progress Bar Card */}
      <Card className="p-6 bg-obsidian-850 border border-silver-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-silver-50">Distribución de Cartera</h3>
            <p className="text-xs text-silver-400">
              Comportamiento global de pagos y cobrabilidad del evento.
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            Total {metrics.hasData ? `$${metrics.contractedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` : '$0.00 MXN'}
          </Badge>
        </div>

        {/* Segmented Bar */}
        <div
          role="progressbar"
          aria-label="Distribución de cartera"
          aria-valuenow={metrics.collectedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full h-5 rounded-full flex overflow-hidden bg-obsidian-900 border border-silver-800 p-0.5 gap-0.5"
        >
          <div
            className="bg-status-success h-full rounded-l-full transition-all duration-500"
            style={{ width: `${metrics.collectedPercentage}%` }}
            title={`Pagados: ${metrics.collectedPercentage}%`}
          />
          <div
            className="bg-status-warning h-full transition-all duration-500"
            style={{ width: `${metrics.pendingPercentage}%` }}
            title={`Próximos: ${metrics.pendingPercentage}%`}
          />
          <div
            className="bg-status-error h-full rounded-r-full transition-all duration-500"
            style={{ width: `${metrics.overduePercentage}%` }}
            title={`Vencidos: ${metrics.overduePercentage}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-silver-800/60 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-status-success shrink-0" />
            <div>
              <span className="text-silver-400 font-medium">Pagados</span>
              <p className="font-bold text-silver-100 text-sm font-sans">
                ${metrics.collectedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ({metrics.collectedPercentage}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-status-warning shrink-0" />
            <div>
              <span className="text-silver-400 font-medium">Próximos (Al corriente)</span>
              <p className="font-bold text-silver-100 text-sm font-sans">
                ${metrics.pendingTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ({metrics.pendingPercentage}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-status-error shrink-0" />
            <div>
              <span className="text-status-error font-medium">Vencidos</span>
              <p className="font-bold text-status-error text-sm font-sans">
                ${metrics.overdueTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ({metrics.overduePercentage}%)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Overdue Attention Section */}
      <Card className="p-0 overflow-hidden flex flex-col justify-between bg-obsidian-850 border border-silver-800/80">
        <div className="p-4 bg-obsidian-900 border-b border-silver-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="alert" size={16} className="text-status-error" />
            <h4 className="text-sm font-bold text-silver-100">Vencimientos críticos</h4>
          </div>
          <Badge variant={metrics.overduePlans.length > 0 ? 'error' : 'success'} size="sm">
            {metrics.overduePlans.length} {metrics.overduePlans.length === 1 ? 'Caso' : 'Casos'}
          </Badge>
        </div>

        {metrics.overduePlans.length === 0 ? (
          <div className="p-6 text-center text-xs text-silver-400">
            No hay obligaciones vencidas registradas en este evento.
          </div>
        ) : (
          <div className="divide-y divide-silver-800/60">
            {metrics.overduePlans.map((plan) => (
              <div
                key={plan.graduateId}
                className="p-4 flex items-center justify-between hover:bg-obsidian-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-status-error/20 text-status-error flex items-center justify-center font-bold text-xs">
                    {plan.graduateName
                      ? plan.graduateName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                      : 'GR'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-silver-100">{plan.graduateName || 'Graduado'}</p>
                    <p className="text-[11px] text-silver-400">
                      Saldo vencido: ${(plan.overdueAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (onViewGraduatePlan) {
                        onViewGraduatePlan(plan.graduateId);
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
        )}

        <div className="p-3 bg-obsidian-900 text-center border-t border-silver-800">
          <button
            type="button"
            onClick={onNavigateToPortfolio}
            className="text-xs font-semibold text-silver-300 hover:text-gold-400 transition-colors"
          >
            Ver todos los graduados en Cartera →
          </button>
        </div>
      </Card>
    </div>
  );
};
