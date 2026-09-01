import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Badge,
  Button,
  Icon,
  EmptyState,
  Alert,
  SkeletonCard,
  SkeletonText,
} from '../../design-system';
import { GraduateEventContext } from '../../shells/graduate/GraduateEventContext';
import {
  activeEventMock,
  currentGraduateMock,
  mockPaymentPlan,
  type EventMock,
  type GraduateMock,
  type PaymentPlanMock,
} from '../../fixtures';
import { useAuth } from '../../context/AuthContext';

export interface GraduateHomeScreenProps {
  isLoading?: boolean;
  partialError?: string | null;
  eventOverride?: EventMock | null;
  graduateOverride?: GraduateMock;
  paymentPlanOverride?: PaymentPlanMock;
}

export const GraduateHomeScreen: React.FC<GraduateHomeScreenProps> = ({
  isLoading = false,
  partialError = null,
  eventOverride = activeEventMock,
  graduateOverride = currentGraduateMock,
  paymentPlanOverride = mockPaymentPlan,
}) => {
  const { user } = useAuth();
  const event = eventOverride;
  const graduate = graduateOverride;
  const plan = paymentPlanOverride;

  const graduateName = user?.full_name || graduate.fullName;
  const firstName = graduateName.split(' ')[0];

  // Financial formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isLiquidated = plan.pendingAmount === 0;
  const isOverdue = (plan.overdueAmount || 0) > 0;

  // Natural language mapping for thermo status
  const getThermoStatusInfo = () => {
    switch (graduate.thermoStatus) {
      case 'AVAILABLE':
        return {
          label: 'Disponible para personalizar',
          badgeVariant: 'gold' as const,
          isActionable: true,
        };
      case 'REQUESTED':
        return {
          label: 'Personalización enviada',
          badgeVariant: 'neutral' as const,
          isActionable: false,
        };
      case 'IN_PRODUCTION':
        return {
          label: 'En producción',
          badgeVariant: 'neutral' as const,
          isActionable: false,
        };
      case 'DELIVERED':
        return {
          label: 'Entregado',
          badgeVariant: 'success' as const,
          isActionable: false,
        };
      case 'LOCKED':
      default:
        return {
          label: `Se desbloquea al alcanzar ${graduate.thermoThreshold}% de pago`,
          badgeVariant: 'neutral' as const,
          isActionable: false,
        };
    }
  };

  const thermoInfo = getThermoStatusInfo();

  // 1. Loading State (Structured Skeletons)
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 font-sans animate-fadeIn">
        <SkeletonCard />
        <SkeletonCard />
        <div className="flex flex-col gap-3">
          <SkeletonText lines={2} />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // 2. Empty State (No Active Event)
  if (!event) {
    return (
      <div className="flex flex-col gap-5 font-sans animate-fadeIn">
        <EmptyState
          icon="building"
          title="Sin evento asignado"
          description="Aún no tienes un evento de graduación vinculado a tu cuenta. Contacta a los administradores de tu institución para obtener acceso."
        />
      </div>
    );
  }

  // 3. Normal / Ready Graduate Home
  return (
    <div className="flex flex-col gap-5 font-sans animate-fadeIn">
      {/* 1. Greeting */}
      <div className="flex items-baseline justify-between gap-2 px-1">
        <div className="flex flex-col">
          <span className="text-xs text-silver-400 font-sans">Bienvenido(a)</span>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-silver-50 tracking-tight">
            Hola, {firstName}
          </h1>
        </div>
        <span className="text-xs font-semibold text-gold-400 bg-obsidian-850 px-2.5 py-1 rounded-full border border-gold-500/30">
          Graduando
        </span>
      </div>

      {/* Partial Error Alert if one block fails */}
      {partialError && (
        <Alert variant="error" title="Aviso de sincronización">
          {partialError}
        </Alert>
      )}

      {/* 2. Reusable Event Context Card */}
      <GraduateEventContext
        eventName={event.name}
        institution={event.career || event.institution}
        generation={event.generation}
        date={event.date}
        venue={event.venue}
        status={event.status}
      />

      {/* 3. Next Action / Highlight Surface */}
      <section aria-label="Siguiente paso">
        {isLiquidated ? (
          // Liquidated Celebration Card
          <div className="rounded-card p-5 bg-obsidian-850 border border-gold-500/40 shadow-card flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <Badge variant="gold" size="sm" dot>
                Plan liquidado
              </Badge>
              <Icon name="check" size={18} className="text-gold-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-silver-50">
                ¡Felicidades, tu plan está completo!
              </h2>
              <p className="text-xs text-silver-300 mt-0.5 leading-relaxed">
                Has cubierto el 100% de tus aportaciones para la noche de gala.
              </p>
            </div>
            <Link to="/graduate/payments" className="self-start pt-1">
              <Button variant="outline" size="sm" iconEnd="chevron-right">
                Ver historial de pagos
              </Button>
            </Link>
          </div>
        ) : isOverdue ? (
          // Overdue Warning Card
          <div className="rounded-card p-5 bg-status-error/10 border border-status-error/40 shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Badge variant="error" size="sm" dot>
                Pago vencido
              </Badge>
              <Icon name="alert" size={18} className="text-status-error" />
            </div>
            <div>
              <span className="text-xs text-silver-300">Importe pendiente vencido:</span>
              <div className="text-xl sm:text-2xl font-bold text-silver-50 font-sans my-0.5">
                {formatCurrency(plan.overdueAmount || plan.nextPaymentAmount)}
              </div>
              <p className="text-xs text-silver-300">
                Regulariza tu aportación para continuar con la preparación de tu gala.
              </p>
            </div>
            <Link to="/graduate/payments" className="self-start pt-1">
              <Button variant="danger" size="sm" iconEnd="chevron-right">
                Realizar pago
              </Button>
            </Link>
          </div>
        ) : (
          // Upcoming Payment Standard Next Action
          <div className="rounded-card p-5 bg-obsidian-850 border border-silver-800 shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
                Tu siguiente paso
              </span>
              <Badge variant="neutral" size="sm">
                Próxima cuota
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <span className="text-xs text-silver-400">Próximo pago programado</span>
                <div className="text-2xl font-bold text-silver-50 font-sans tracking-tight">
                  {formatCurrency(plan.nextPaymentAmount)}
                </div>
                <span className="text-xs text-silver-400 mt-0.5 block">
                  Fecha límite: <strong className="text-silver-200">{plan.nextPaymentDueDate}</strong>
                </span>
              </div>

              <Link to="/graduate/payments" className="shrink-0 self-start sm:self-center">
                <Button variant="primary" size="md" iconEnd="chevron-right">
                  Ver próximo pago
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 4. Financial Summary & Progress Card */}
      <section aria-label="Resumen financiero">
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-silver-50">Tu avance financiero</h3>
            <span className="text-xs font-bold text-gold-400 font-sans">
              {plan.progressPercentage}% cubierto
            </span>
          </div>

          {/* Accessible Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div
              role="progressbar"
              aria-valuenow={plan.progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progreso financiero: ${plan.progressPercentage}%`}
              className="w-full h-2.5 bg-obsidian-800 rounded-full overflow-hidden border border-silver-800/80"
            >
              <div
                className="h-full bg-gold-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, plan.progressPercentage))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-silver-400">
              <span>{formatCurrency(plan.paidAmount)} aportados</span>
              <span>Total: {formatCurrency(plan.totalAmount)}</span>
            </div>
          </div>

          {/* Financial Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-silver-800/60">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-silver-400 font-medium uppercase tracking-wider">
                Aportado
              </span>
              <span className="text-base font-bold text-status-success font-sans">
                {formatCurrency(plan.paidAmount)}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-silver-400 font-medium uppercase tracking-wider">
                Restante
              </span>
              <span className="text-base font-bold text-silver-200 font-sans">
                {formatCurrency(plan.pendingAmount)}
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* 5. "Tu preparación" (Graduation Preparation Hub) */}
      <section aria-label="Tu preparación">
        <div className="flex flex-col gap-3">
          <div className="px-1 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-silver-400 font-sans">
              Tu preparación
            </h3>
            <span className="text-[11px] text-silver-500">4 módulos</span>
          </div>

          {/* 1. Mi grupo */}
          <Link
            to="/graduate/group"
            className="p-4 rounded-card bg-obsidian-850 hover:bg-obsidian-800 border border-silver-800/80 hover:border-silver-700 transition-all duration-150 flex items-center justify-between gap-3 shadow-card-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-silver-700/60 text-gold-400 flex items-center justify-center shrink-0">
                <Icon name="users" size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-silver-100 truncate">
                  Mi grupo de invitados
                </span>
                <span className="text-xs text-silver-400">
                  {graduate.guests.length} de {graduate.ticketCount} personas registradas
                </span>
              </div>
            </div>
            <Icon name="chevron-right" size={16} className="text-silver-500 shrink-0" />
          </Link>

          {/* 2. Mesa */}
          <Link
            to="/graduate/table"
            className="p-4 rounded-card bg-obsidian-850 hover:bg-obsidian-800 border border-silver-800/80 hover:border-silver-700 transition-all duration-150 flex items-center justify-between gap-3 shadow-card-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-silver-700/60 text-silver-300 flex items-center justify-center shrink-0">
                <Icon name="table" size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-silver-100 truncate">
                  Mesa asignada
                </span>
                <span className="text-xs text-silver-400">
                  {graduate.tableNumber !== null
                    ? `Mesa ${graduate.tableNumber} • ${graduate.ticketCount} lugares`
                    : 'Sin mesa asignada'}
                </span>
              </div>
            </div>
            <Icon name="chevron-right" size={16} className="text-silver-500 shrink-0" />
          </Link>

          {/* 3. Platillos */}
          <Link
            to="/graduate/meals"
            className="p-4 rounded-card bg-obsidian-850 hover:bg-obsidian-800 border border-silver-800/80 hover:border-silver-700 transition-all duration-150 flex items-center justify-between gap-3 shadow-card-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-silver-700/60 text-silver-300 flex items-center justify-center shrink-0">
                <Icon name="meal" size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-silver-100 truncate">
                  Selección de platillos
                </span>
                <span className="text-xs text-silver-400">
                  {graduate.guests.length} selecciones de menú registradas
                </span>
              </div>
            </div>
            <Icon name="chevron-right" size={16} className="text-silver-500 shrink-0" />
          </Link>

          {/* 4. Termo */}
          <Link
            to="/graduate/thermo"
            className="p-4 rounded-card bg-obsidian-850 hover:bg-obsidian-800 border border-silver-800/80 hover:border-silver-700 transition-all duration-150 flex items-center justify-between gap-3 shadow-card-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-silver-700/60 text-silver-300 flex items-center justify-center shrink-0">
                <Icon name="cup" size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-silver-100 truncate">
                    Termo conmemorativo
                  </span>
                  {thermoInfo.isActionable && (
                    <Badge variant="gold" size="sm">
                      Disponible
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-silver-400 truncate">
                  {thermoInfo.label}
                </span>
              </div>
            </div>
            <Icon name="chevron-right" size={16} className="text-silver-500 shrink-0" />
          </Link>
        </div>
      </section>

      {/* 6. Help / Secondary Info */}
      <section aria-label="Ayuda e información">
        <div className="p-4 rounded-card bg-obsidian-900 border border-silver-800/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Icon name="info" size={18} className="text-silver-400 shrink-0" />
            <div className="flex flex-col min-w-0 text-xs">
              <span className="font-semibold text-silver-200">¿Dudas sobre tu graduación?</span>
              <span className="text-silver-400 truncate">Consulta preguntas frecuentes o soporte</span>
            </div>
          </div>
          <Link to="/graduate/more" className="shrink-0">
            <Button variant="ghost" size="sm">
              Ver más
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
