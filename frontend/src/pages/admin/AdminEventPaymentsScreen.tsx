import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  EmptyState,
} from '../../design-system';
import {
  mockEvents,
  mockGraduatesList,
  mockPaymentPlansMap,
} from '../../fixtures';
import { EventFinancialSummaryTab } from './payments/EventFinancialSummaryTab';
import { EventPortfolioTab } from './payments/EventPortfolioTab';
import { GraduatePaymentPlanView } from './payments/GraduatePaymentPlanView';
import { EventReconciliationTab } from './payments/EventReconciliationTab';
import { ManualPaymentModal } from './payments/ManualPaymentModal';
import { AdjustmentRefundModal } from './payments/AdjustmentRefundModal';

export type PaymentsTabMode = 'resumen' | 'cartera' | 'conciliacion' | 'plan';

export const AdminEventPaymentsScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Resolved event: strictly based on route parameter
  const eventId = paramEventId || 'evt-derecho-2027';
  const event = mockEvents.find((e) => e.id === eventId);

  // Tab & Graduate derived directly from URL params
  const tabParam = searchParams.get('tab') as PaymentsTabMode | null;
  const graduateIdParam = searchParams.get('graduateId');

  const activeTab: PaymentsTabMode = graduateIdParam
    ? 'plan'
    : tabParam && ['resumen', 'cartera', 'conciliacion'].includes(tabParam)
    ? tabParam
    : 'resumen';

  const selectedGraduateId = graduateIdParam || null;

  // Modals state
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [manualPaymentGradId, setManualPaymentGradId] = useState<string | undefined>(undefined);
  const [manualPaymentInstId, setManualPaymentInstId] = useState<string | undefined>(undefined);

  const [isAdjustmentRefundOpen, setIsAdjustmentRefundOpen] = useState(false);

  const handleTabChange = (tab: PaymentsTabMode) => {
    setSearchParams({ tab });
  };

  const handleSelectGraduatePlan = (gradId: string) => {
    setSearchParams({ tab: 'plan', graduateId: gradId });
  };

  const handleBackToPortfolio = () => {
    setSearchParams({ tab: 'cartera' });
  };

  const handleOpenManualPayment = (graduateId?: string, installmentId?: string) => {
    setManualPaymentGradId(graduateId || selectedGraduateId || undefined);
    setManualPaymentInstId(installmentId);
    setIsManualPaymentOpen(true);
  };

  // Event not found error state
  if (!event) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Evento no encontrado', current: true },
          ]}
        />
        <EmptyState
          title="Evento no encontrado"
          description="No encontramos el evento solicitado para consultar los pagos."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // Selected Graduate strictly scoped to this event
  const selectedGraduate = selectedGraduateId
    ? mockGraduatesList.find((g) => g.id === selectedGraduateId && g.eventId === event.id)
    : null;

  // Selected Plan strictly scoped to this graduate and event (NO fallback to Andrea)
  const selectedPlan = selectedGraduate
    ? (mockPaymentPlansMap[selectedGraduate.id]?.eventId === event.id
        ? mockPaymentPlansMap[selectedGraduate.id]
        : null)
    : null;

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={
          activeTab === 'plan' && selectedGraduate
            ? [
                { label: 'Plataforma GR', href: '/admin' },
                { label: 'Eventos', href: '/admin/events' },
                { label: event.name, href: `/admin/events/${event.id}` },
                {
                  label: 'Pagos',
                  href: `/admin/events/${event.id}/payments?tab=cartera`,
                },
                { label: selectedGraduate.fullName, current: true },
              ]
            : [
                { label: 'Plataforma GR', href: '/admin' },
                { label: 'Eventos', href: '/admin/events' },
                { label: event.name, href: `/admin/events/${event.id}` },
                { label: 'Pagos', current: true },
              ]
        }
      />

      {/* Sub-Navigation Tabs (Visible unless inside detailed graduate plan) */}
      {activeTab !== 'plan' && (
        <div className="flex items-center gap-2 border-b border-surface-high pb-2">
          <button
            type="button"
            onClick={() => handleTabChange('resumen')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all
              ${
                activeTab === 'resumen'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-content-secondary hover:bg-surface-low hover:text-navy-900'
              }
            `}
          >
            <span>Resumen Financiero</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('cartera')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all
              ${
                activeTab === 'cartera'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-content-secondary hover:bg-surface-low hover:text-navy-900'
              }
            `}
          >
            <span>Cartera de Graduados</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('conciliacion')}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all
              ${
                activeTab === 'conciliacion'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-content-secondary hover:bg-surface-low hover:text-navy-900'
              }
            `}
          >
            <span>Conciliación de Pasarelas</span>
          </button>
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === 'resumen' && (
        <EventFinancialSummaryTab
          event={event}
          onNavigateToPortfolio={() => handleTabChange('cartera')}
          onNavigateToReconciliation={() => handleTabChange('conciliacion')}
          onOpenManualPayment={(gradId) => handleOpenManualPayment(gradId)}
          onViewGraduatePlan={(gradId) => handleSelectGraduatePlan(gradId)}
        />
      )}

      {activeTab === 'cartera' && (
        <EventPortfolioTab
          eventId={event.id}
          onSelectGraduatePlan={(gradId) => handleSelectGraduatePlan(gradId)}
          onOpenManualPayment={(gradId) => handleOpenManualPayment(gradId)}
        />
      )}

      {activeTab === 'conciliacion' && (
        <EventReconciliationTab
          eventId={event.id}
          onViewGraduatePlan={(gradId) => handleSelectGraduatePlan(gradId)}
        />
      )}

      {activeTab === 'plan' && (
        <>
          {selectedGraduate && selectedPlan ? (
            <GraduatePaymentPlanView
              event={event}
              graduate={selectedGraduate}
              plan={selectedPlan}
              onBackToPortfolio={handleBackToPortfolio}
              onOpenManualPayment={(instId) =>
                handleOpenManualPayment(selectedGraduate.id, instId)
              }
              onOpenAdjustmentRefund={() => setIsAdjustmentRefundOpen(true)}
            />
          ) : selectedGraduate ? (
            <EmptyState
              title="Plan de pagos no disponible"
              description={`El graduado ${selectedGraduate.fullName} no cuenta con un plan de pagos configurado en este evento.`}
              actionLabel="Volver a cartera"
              onAction={handleBackToPortfolio}
            />
          ) : (
            <EmptyState
              title="Graduado no encontrado"
              description="No se encontró el graduado solicitado en este evento."
              actionLabel="Volver a cartera"
              onAction={handleBackToPortfolio}
            />
          )}
        </>
      )}

      {/* Modals */}
      <ManualPaymentModal
        isOpen={isManualPaymentOpen}
        onClose={() => setIsManualPaymentOpen(false)}
        eventId={event.id}
        initialGraduateId={manualPaymentGradId}
        initialInstallmentId={manualPaymentInstId}
      />

      {selectedGraduate && selectedPlan && (
        <AdjustmentRefundModal
          isOpen={isAdjustmentRefundOpen}
          onClose={() => setIsAdjustmentRefundOpen(false)}
          graduateName={selectedGraduate.fullName}
          installments={selectedPlan.installments.map((i) => ({
            id: i.id,
            label: i.label,
            amount: i.amount,
          }))}
        />
      )}
    </div>
  );
};
