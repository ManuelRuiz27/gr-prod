import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, EmptyState, Icon, SkeletonText } from '../../design-system';
import { activeEventMock, currentGraduateMock, mockPaymentPlan, type EventMock, type GraduateMock, type PaymentPlanMock } from '../../fixtures';
import { useAuth } from '../../context/AuthContext';

export interface GraduateHomeScreenProps {
  isLoading?: boolean;
  partialError?: string | null;
  eventOverride?: EventMock | null;
  graduateOverride?: GraduateMock;
  paymentPlanOverride?: PaymentPlanMock;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount);

export const GraduateHomeScreen: React.FC<GraduateHomeScreenProps> = ({
  isLoading = false,
  partialError = null,
  eventOverride = activeEventMock,
  graduateOverride = currentGraduateMock,
  paymentPlanOverride = mockPaymentPlan,
}) => {
  const { user } = useAuth();
  if (isLoading) return <div className="space-y-4 animate-fadeIn"><SkeletonText lines={2} /><SkeletonText lines={4} /></div>;
  if (!eventOverride) return <EmptyState icon="building" title="Sin evento asignado" description="Contacta a la coordinación para vincular tu evento." />;

  const graduateName = user?.full_name || graduateOverride.fullName;
  const firstName = graduateName.split(' ')[0];
  const plan = paymentPlanOverride;
  const isOverdue = (plan.overdueAmount || 0) > 0;
  const nextAmount = isOverdue ? (plan.overdueAmount || plan.nextPaymentAmount) : plan.nextPaymentAmount;
  const pendingLabel = isOverdue ? 'Pago vencido' : 'Próximo pendiente';
  const thermoLabel = graduateOverride.thermoStatus === 'AVAILABLE' ? 'Disponible' : graduateOverride.thermoStatus === 'DELIVERED' ? 'Entregado' : graduateOverride.thermoStatus === 'IN_PRODUCTION' ? 'En producción' : 'Bloqueado';
  const mealsSelected = graduateOverride.guests.filter((guest) => Boolean(guest.meal)).length;
  const mealsPending = Math.max(graduateOverride.guests.length - mealsSelected, 0);
  const mealsLabel = mealsPending === 0
    ? `${mealsSelected} de ${graduateOverride.guests.length}`
    : `${mealsPending} pendiente${mealsPending === 1 ? '' : 's'}`;
  const rows = [
    ['Mi grupo', `${graduateOverride.guests.length} de ${graduateOverride.ticketCount}`, '/graduate/group'],
    ['Mesa', graduateOverride.tableNumber === null ? 'Pendiente' : `Mesa ${graduateOverride.tableNumber}`, '/graduate/table'],
    ['Platillos', graduateOverride.guests.length ? mealsLabel : 'Pendiente', '/graduate/meals'],
    ['Termo', thermoLabel, '/graduate/thermo'],
  ];

  return <div className="w-full max-w-4xl mx-auto flex flex-col gap-7 font-sans animate-fadeIn pb-12 lg:gap-9">
    <header className="space-y-1">
      <h1 className="text-2xl font-display font-bold text-silver-50">Hola, {firstName}</h1>
      <p className="text-sm font-medium text-silver-200">{eventOverride.name}</p>
      <p className="text-xs text-silver-400">{eventOverride.date} · {eventOverride.venue}</p>
    </header>
    {partialError && <Alert variant="error" title="No pudimos actualizar toda la información">{partialError}</Alert>}
    {plan.pendingAmount === 0 ? (
      <section aria-label="Estado de pagos" className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-silver-400">Pagos</p>
        <h2 className="text-xl font-display font-bold text-silver-50">Tu plan está completo</h2>
        <Link to="/graduate/payments"><Button variant="outline" size="sm">Ver pagos</Button></Link>
      </section>
    ) : (
      <section aria-label={pendingLabel} className="space-y-3 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-x-8">
        <div className="space-y-1">
          <p className={`text-xs font-semibold uppercase tracking-wider ${isOverdue ? 'text-status-error' : 'text-silver-400'}`}>{pendingLabel}</p>
          <h2 className="text-3xl font-sans font-bold text-silver-50">Abono de {formatCurrency(nextAmount)}</h2>
          <p className="text-sm text-silver-400">{plan.nextPaymentDueDate}</p>
        </div>
        <Link to="/graduate/payments" className="inline-flex"><Button variant={isOverdue ? 'danger' : 'primary'} size="md">Abonar</Button></Link>
      </section>
    )}
    <section aria-label="Estado de tu graduación" className="space-y-1">
      {rows.map(([label, value, to]) => <Link key={label} to={to} className="flex items-center justify-between gap-4 py-3 hover:bg-obsidian-900/40 rounded-lg px-2 -mx-2 transition-colors">
        <span className="text-sm font-medium text-silver-100">{label}</span><span className="flex items-center gap-2 text-xs text-silver-400 text-right">{value}<Icon name="chevron-right" size={15} /></span>
      </Link>)}
    </section>
  </div>;
};
