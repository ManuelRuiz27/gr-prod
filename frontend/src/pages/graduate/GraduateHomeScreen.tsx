import React from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Icon,
  EmptyState,
  Alert,
  SkeletonText,
} from '../../design-system';
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

  // 1. Loading State (Pure line skeletons, no SkeletonCard)
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 font-sans animate-fadeIn">
        <div className="space-y-2">
          <SkeletonText lines={1} />
          <SkeletonText lines={2} />
        </div>
        <div className="space-y-3 pt-4">
          <SkeletonText lines={1} />
          <SkeletonText lines={1} />
          <SkeletonText lines={1} />
        </div>
        <div className="space-y-3 pt-4">
          <SkeletonText lines={4} />
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

  // 3. Normal / Ready Graduate Home — Pure Domain-First Visual Composition
  return (
    <div className="flex flex-col gap-6 font-sans animate-fadeIn pb-16">
      {/* 1. Header: Greeting & Event Context directly on the page */}
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-2xl font-serif font-bold text-silver-50">
          Hola, {firstName}
        </h1>
        <div className="text-xs text-silver-400 space-y-0.5 mt-1">
          <div className="text-silver-200 font-medium">{event.name}</div>
          <div>Generación {event.generation}</div>
          <div>{event.date}</div>
        </div>
      </div>

      {/* Partial Error Alert if one block fails */}
      {partialError && (
        <Alert variant="error" title="Aviso de sincronización">
          {partialError}
        </Alert>
      )}

      {/* 2. Próximo pago / Avance financiero directly on the page (0 cards) */}
      <section aria-label="Próximo pago" className="px-1 space-y-4">
        {isLiquidated ? (
          // Liquidated Celebration Surface (Flat)
          <div className="space-y-3 py-2">
            <Badge variant="gold" size="sm" dot>
              Plan liquidado
            </Badge>
            <div>
              <h2 className="text-lg font-bold font-serif text-silver-50">
                ¡Felicidades, tu plan está completo!
              </h2>
              <p className="text-xs text-silver-300 mt-1 leading-relaxed">
                Has cubierto el 100% de tus aportaciones para la noche de gala.
              </p>
            </div>
            <Link to="/graduate/payments" className="inline-block pt-1">
              <Button variant="outline" size="sm" iconEnd="chevron-right">
                Ver historial de pagos
              </Button>
            </Link>
          </div>
        ) : isOverdue ? (
          // Overdue State (Flat)
          <div className="space-y-3 py-2">
            <Badge variant="error" size="sm" dot>
              Pago vencido
            </Badge>
            <div>
              <span className="text-xs text-silver-400">Importe pendiente vencido</span>
              <div className="text-3xl font-extrabold text-silver-50 font-sans tracking-tight mt-1">
                {formatCurrency(plan.overdueAmount || plan.nextPaymentAmount)}
              </div>
              <p className="text-xs text-status-error mt-1">
                Regulariza tu aportación para continuar con la preparación de tu gala.
              </p>
            </div>
            <Link to="/graduate/payments" className="inline-block pt-1">
              <Button variant="danger" size="sm" iconEnd="chevron-right">
                Realizar pago
              </Button>
            </Link>
          </div>
        ) : (
          // Upcoming Payment Standard Composition
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
                Próximo pago
              </span>
              <div className="text-3xl font-extrabold text-silver-50 font-sans tracking-tight mt-1">
                {formatCurrency(plan.nextPaymentAmount)}
              </div>
              <span className="text-xs text-silver-400 block mt-0.5">
                {plan.nextPaymentDueDate}
              </span>
            </div>

            {/* Financial Progress Bar & Summary */}
            <div className="space-y-2 pt-1">
              <div
                role="progressbar"
                aria-valuenow={plan.progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso financiero: ${plan.progressPercentage}%`}
                className="w-full h-2 bg-obsidian-900 rounded-full overflow-hidden border border-silver-800"
              >
                <div
                  className="h-full bg-gold-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, plan.progressPercentage))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-silver-400 font-sans">
                <span>
                  <span>{formatCurrency(plan.paidAmount)}</span> de <span>{formatCurrency(plan.totalAmount)}</span>
                </span>
                <span className="font-semibold text-silver-200 font-sans">
                  {plan.progressPercentage}% cubierto
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Link to="/graduate/payments">
                <Button variant="primary" size="md">
                  Pagar ahora
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Hairline separator */}
      <hr className="border-silver-800/60 my-1" />

      {/* 3. "Mi graduación": Clean rows with hairline dividers (0 cards) */}
      <section aria-label="Mi graduación" className="space-y-1">
        <div className="px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-silver-400 font-sans">
            Mi graduación
          </h2>
        </div>

        <div className="divide-y divide-silver-800/60">
          {/* 1. Invitados */}
          <Link
            to="/graduate/group"
            className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
          >
            <span className="text-sm text-silver-200 group-hover:text-silver-100 font-medium">
              Invitados
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-silver-400 font-sans">
                {graduate.guests.length} de {graduate.ticketCount}
              </span>
              <Icon name="chevron-right" size={14} className="text-silver-500 group-hover:text-silver-300" />
            </div>
          </Link>

          {/* 2. Mesa */}
          <Link
            to="/graduate/table"
            className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
          >
            <span className="text-sm text-silver-200 group-hover:text-silver-100 font-medium">
              Mesa
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-silver-400 font-sans">
                {graduate.tableNumber !== null ? `Mesa ${graduate.tableNumber}` : 'Sin mesa asignada'}
              </span>
              <Icon name="chevron-right" size={14} className="text-silver-500 group-hover:text-silver-300" />
            </div>
          </Link>

          {/* 3. Platillos */}
          <Link
            to="/graduate/meals"
            className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
          >
            <span className="text-sm text-silver-200 group-hover:text-silver-100 font-medium">
              Platillos
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-silver-400">
                {graduate.guests.length > 0 ? 'Completado' : 'Pendiente'}
              </span>
              <Icon name="chevron-right" size={14} className="text-silver-500 group-hover:text-silver-300" />
            </div>
          </Link>

          {/* 4. Termo */}
          <Link
            to="/graduate/thermo"
            className="py-3 px-1 flex items-center justify-between hover:bg-obsidian-900/30 transition-colors group"
          >
            <span className="text-sm text-silver-200 group-hover:text-silver-100 font-medium">
              Termo
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-silver-400">
                {thermoInfo.label}
              </span>
              {thermoInfo.isActionable && (
                <Badge variant="gold" size="sm">
                  Disponible
                </Badge>
              )}
              <Icon name="chevron-right" size={14} className="text-silver-500 group-hover:text-silver-300" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

