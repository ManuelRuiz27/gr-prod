import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  EmptyState,
  Tabs,
  type TabItem,
} from '../../design-system';
import {
  mockEvents,
  mockGraduatesList,
  mockPaymentPlansMap,
  VISUAL_QA_SUBMISSIONS_QUEUE,
} from '../../fixtures';
import { EventFinancialSummaryTab } from './payments/EventFinancialSummaryTab';
import { EventPortfolioTab } from './payments/EventPortfolioTab';
import { GraduatePaymentPlanView } from './payments/GraduatePaymentPlanView';
import { EventProofQueueTab } from './payments/EventProofQueueTab';
import { EventReconciliationTab } from './payments/EventReconciliationTab';
import { ManualPaymentModal } from './payments/ManualPaymentModal';
import { AdjustmentRefundModal } from './payments/AdjustmentRefundModal';

export type PaymentsTabMode = 'resumen' | 'cartera' | 'comprobantes' | 'conciliacion' | 'plan';

export const AdminEventPaymentsScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Modals state
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [manualPaymentGradId, setManualPaymentGradId] = useState<string | undefined>(undefined);
  const [manualPaymentInstId, setManualPaymentInstId] = useState<string | undefined>(undefined);
  const [isAdjustmentRefundOpen, setIsAdjustmentRefundOpen] = useState(false);

  // Tab & Graduate derived directly from URL params
  const tabParam = searchParams.get('tab') as PaymentsTabMode | null;
  const graduateIdParam = searchParams.get('graduateId');

  const activeTab: PaymentsTabMode = graduateIdParam
    ? 'plan'
    : tabParam && ['resumen', 'cartera', 'comprobantes', 'conciliacion'].includes(tabParam)
    ? tabParam
    : 'resumen';

  const selectedGraduateId = graduateIdParam || null;

  const handleTabChange = (tab: string) => {
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

  // If no eventId in URL (e.g. /admin/payments), prompt to select an event
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Pagos', current: true },
          ]}
        />
        <EmptyState
          icon="search"
          title="Selecciona un evento"
          description="Para consultar el estado de cuenta global, gestionar la cartera de graduados y conciliar pagos, selecciona un evento desde el catálogo."
          actionLabel="Ver eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // Resolved event: strictly based on route parameter
  const event = mockEvents.find((e) => e.id === paramEventId);

  // Event not found error state
  if (!event) {
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
          icon="search"
          title="Evento no encontrado"
          description="No encontramos el evento solicitado para consultar los pagos."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // Pending proofs count for badge
  const pendingProofsCount = VISUAL_QA_SUBMISSIONS_QUEUE.filter(
    (s) => s.eventId === event.id && s.status === 'PENDING_REVIEW'
  ).length;

  const tabsList: TabItem[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'cartera', label: 'Cartera de Graduados' },
    {
      id: 'comprobantes',
      label: 'Comprobantes por validar',
      count: pendingProofsCount > 0 ? pendingProofsCount : undefined,
    },
    { id: 'conciliacion', label: 'Conciliación de Pasarelas' },
  ];

  // Selected Graduate strictly scoped to this event
  const selectedGraduate = selectedGraduateId
    ? mockGraduatesList.find((g) => g.id === selectedGraduateId && g.eventId === event.id)
    : null;

  // Selected Plan strictly scoped to this graduate and event (NO fallback)
  const selectedPlan = selectedGraduate
    ? (mockPaymentPlansMap[selectedGraduate.id]?.eventId === event.id
        ? mockPaymentPlansMap[selectedGraduate.id]
        : null)
    : null;

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto font-sans pb-16">
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

      {/* Sub-Navigation Tabs */}
      {activeTab !== 'plan' && (
        <Tabs
          tabs={tabsList}
          activeTab={activeTab}
          onChange={handleTabChange}
          variant="line"
        />
      )}

      {/* Main Tab Views */}
      {activeTab === 'resumen' && (
        <EventFinancialSummaryTab
          event={event}
          onNavigateToPortfolio={() => handleTabChange('cartera')}
          onNavigateToProofs={() => handleTabChange('comprobantes')}
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

      {activeTab === 'comprobantes' && (
        <EventProofQueueTab
          eventId={event.id}
          onViewGraduatePlan={(gradId) => handleSelectGraduatePlan(gradId)}
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
              icon="search"
              title="Plan de pagos no disponible"
              description={`El graduado ${selectedGraduate.fullName} no cuenta con un plan de pagos configurado en este evento.`}
              actionLabel="Volver a cartera"
              onAction={handleBackToPortfolio}
            />
          ) : (
            <EmptyState
              icon="search"
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
