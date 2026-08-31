import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  EmptyState,
  Icon,
} from '../../design-system';
import {
  mockEvents,
  mockGraduatesList,
  mockPaymentPlansMap,
  type PaymentAdjustmentMock,
  type PaymentRefundMock,
} from '../../fixtures';
import { EventFinancialSummaryTab } from './payments/EventFinancialSummaryTab';
import { EventPortfolioTab } from './payments/EventPortfolioTab';
import { GraduatePaymentPlanView } from './payments/GraduatePaymentPlanView';
import { EventReconciliationTab } from './payments/EventReconciliationTab';
import { ManualPaymentModal, type ManualPaymentSubmitData } from './payments/ManualPaymentModal';
import { AdjustmentRefundModal } from './payments/AdjustmentRefundModal';

export type PaymentsTabMode = 'resumen' | 'cartera' | 'conciliacion' | 'plan';

export const AdminEventPaymentsScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Resolved event: fallback to default mock event if on global /admin/payments route
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handlePaymentRegistered = (data: ManualPaymentSubmitData) => {
    setToastMessage(`Pago de $${data.amount.toLocaleString('es-MX')} registrado para ${data.graduateName}.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleAdjustmentCreated = (adj: PaymentAdjustmentMock) => {
    setToastMessage(`Ajuste por $${adj.amount.toLocaleString('es-MX')} guardado correctamente.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleRefundCreated = (ref: PaymentRefundMock) => {
    setToastMessage(`Reembolso por $${ref.amount.toLocaleString('es-MX')} procesado.`);
    setTimeout(() => setToastMessage(null), 5000);
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

  // Selected Graduate for Plan View
  const selectedGraduate = selectedGraduateId
    ? mockGraduatesList.find((g) => g.id === selectedGraduateId)
    : null;
  const selectedPlan = selectedGraduateId
    ? mockPaymentPlansMap[selectedGraduateId] || mockPaymentPlansMap['grad-andrea-martinez']
    : null;

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="p-3 bg-navy-900 text-white text-xs rounded-xl flex items-center justify-between shadow-floating animate-fadeIn">
          <div className="flex items-center gap-2">
            <Icon name="check" size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

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
            <Icon name="payment" size={16} />
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
            <Icon name="users" size={16} />
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
            <Icon name="refresh" size={16} />
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
          onSelectGraduatePlan={(gradId) => handleSelectGraduatePlan(gradId)}
          onOpenManualPayment={(gradId) => handleOpenManualPayment(gradId)}
        />
      )}

      {activeTab === 'conciliacion' && (
        <EventReconciliationTab
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
          ) : (
            <EmptyState
              title="Graduado no encontrado"
              description="No se encontró el plan de pagos del graduado solicitado."
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
        initialGraduateId={manualPaymentGradId}
        initialInstallmentId={manualPaymentInstId}
        onPaymentRegistered={handlePaymentRegistered}
      />

      {selectedGraduate && selectedPlan && (
        <AdjustmentRefundModal
          isOpen={isAdjustmentRefundOpen}
          onClose={() => setIsAdjustmentRefundOpen(false)}
          graduateName={selectedGraduate.fullName}
          planId={selectedPlan.graduateId}
          installments={selectedPlan.installments.map((i) => ({
            id: i.id,
            label: i.label,
            amount: i.amount,
          }))}
          onAdjustmentCreated={handleAdjustmentCreated}
          onRefundCreated={handleRefundCreated}
        />
      )}
    </div>
  );
};
