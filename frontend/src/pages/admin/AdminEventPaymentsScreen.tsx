import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  EmptyState,
  Tabs,
  type TabItem,
} from '../../design-system';
import {
  mockEvents,
  mockGraduatesList,
  mockPaymentPlansMap,
  VISUAL_QA_SUBMISSIONS_QUEUE,
  type PaymentPlanMock,
} from '../../fixtures';
import { EventPortfolioTab } from './payments/EventPortfolioTab';
import { EventTransactionsTab } from './payments/EventTransactionsTab';
import { EventProofQueueTab } from './payments/EventProofQueueTab';
import { GraduatePaymentPlanView } from './payments/GraduatePaymentPlanView';
import { ManualPaymentModal } from './payments/ManualPaymentModal';
import { AdjustmentRefundModal } from './payments/AdjustmentRefundModal';
import { useDemo } from '../../demo/useDemo';
import { isMockDataMode } from '../../demo/config';

export type PaymentsTabMode = 'cartera' | 'movimientos' | 'comprobantes' | 'plan';

export const AdminEventPaymentsScreen: React.FC = () => {
  const { state: demoState } = useDemo();
  const { eventId: paramEventId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Modals state
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [manualPaymentGradId, setManualPaymentGradId] = useState<string | undefined>(undefined);
  const [manualPaymentInstId, setManualPaymentInstId] = useState<string | undefined>(undefined);
  const [isAdjustmentRefundOpen, setIsAdjustmentRefundOpen] = useState(false);

  // Tab & Graduate derived directly from URL params
  const rawTab = searchParams.get('tab');
  const graduateIdParam = searchParams.get('graduateId');

  // Normalize legacy or deferred tabs to 'cartera'
  useEffect(() => {
    if (rawTab === 'conciliacion' || rawTab === 'resumen') {
      setSearchParams({ tab: 'cartera' }, { replace: true });
    }
  }, [rawTab, setSearchParams]);

  const activeTab: PaymentsTabMode = graduateIdParam
    ? 'plan'
    : rawTab === 'movimientos' || rawTab === 'comprobantes'
    ? rawTab
    : 'cartera';

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

  // Resolved event
  const event = mockEvents.find((e) => e.id === paramEventId);

  // Scoped graduates and financial collection summary
  const eventGraduates = useMemo(
    () => (event ? mockGraduatesList.filter((g) => g.eventId === event.id) : []),
    [event]
  );

  const financialSummary = useMemo(() => {
    if (!event) return { totalCollected: 0, totalPending: 0, totalOverdue: 0 };
    const plans = eventGraduates
      .map((g) => mockPaymentPlansMap[g.id])
      .filter((p): p is PaymentPlanMock => Boolean(p) && p.eventId === event.id);

    const totalCollected = plans.reduce((acc, p) => acc + p.paidAmount, 0);
    const totalPending = plans.reduce((acc, p) => acc + p.pendingAmount, 0);
    const totalOverdue = plans.reduce((acc, p) => acc + (p.overdueAmount || 0), 0);

    return {
      totalCollected,
      totalPending,
      totalOverdue,
    };
  }, [event, eventGraduates]);

  // If no eventId in URL, prompt to select an event
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
        <EmptyState
          icon="search"
          title="Selecciona un evento"
          description="Para consultar el estado de cobranza y cartera de graduados, selecciona un evento."
          actionLabel="Ver eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
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
  const pendingProofsCount = (isMockDataMode ? demoState.payment_submissions : VISUAL_QA_SUBMISSIONS_QUEUE).filter(
    (s) => s.eventId === event.id && s.status === 'PENDING_REVIEW'
  ).length;

  // 3 visible tabs
  const tabsList: TabItem[] = [
    { id: 'cartera', label: 'Cartera' },
    { id: 'movimientos', label: 'Movimientos' },
    {
      id: 'comprobantes',
      label: 'Comprobantes',
      count: pendingProofsCount > 0 ? pendingProofsCount : undefined,
    },
  ];

  // Selected Graduate strictly scoped to this event
  const selectedGraduate = selectedGraduateId
    ? mockGraduatesList.find((g) => g.id === selectedGraduateId && g.eventId === event.id)
    : null;

  const selectedPlan = selectedGraduate
    ? (mockPaymentPlansMap[selectedGraduate.id]?.eventId === event.id
        ? mockPaymentPlansMap[selectedGraduate.id]
        : null)
    : null;

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto font-sans pb-16">
      {/* Sub-Navigation Tabs */}
      {activeTab !== 'plan' && (
        <Tabs
          tabs={tabsList}
          activeTab={activeTab}
          onChange={handleTabChange}
          variant="line"
        />
      )}

      {/* Resumen de cobranza mínimo y directo encima de Cartera */}
      {activeTab === 'cartera' && (
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm font-sans border-b border-silver-800/60 pb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-silver-50">
              ${financialSummary.totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-silver-400">cobrado</span>
          </div>
          <span className="text-silver-700 hidden sm:inline">·</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-silver-100">
              ${financialSummary.totalPending.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-silver-400">pendiente</span>
          </div>
          <span className="text-silver-700 hidden sm:inline">·</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-status-warning">
              ${financialSummary.totalOverdue.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-silver-400">vencido</span>
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === 'cartera' && (
        <EventPortfolioTab
          eventId={event.id}
          onSelectGraduatePlan={(gradId) => handleSelectGraduatePlan(gradId)}
          onOpenManualPayment={(gradId) => handleOpenManualPayment(gradId)}
        />
      )}

      {activeTab === 'movimientos' && (
        <EventTransactionsTab
          eventId={event.id}
        />
      )}

      {activeTab === 'comprobantes' && (
        <EventProofQueueTab
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

