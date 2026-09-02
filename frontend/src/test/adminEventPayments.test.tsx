import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventPaymentsScreen } from '../pages/admin/AdminEventPaymentsScreen';
import { EventPortfolioTab } from '../pages/admin/payments/EventPortfolioTab';
import { EventFinancialSummaryTab } from '../pages/admin/payments/EventFinancialSummaryTab';
import { EventProofQueueTab } from '../pages/admin/payments/EventProofQueueTab';
import { EventReconciliationTab } from '../pages/admin/payments/EventReconciliationTab';
import { ManualPaymentModal } from '../pages/admin/payments/ManualPaymentModal';
import { type EventMock } from '../fixtures';

function renderPaymentsScreen(
  initialEntry = '/admin/events/evt-derecho-2027/payments'
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/admin/events/:eventId/payments"
          element={<AdminEventPaymentsScreen />}
        />
        <Route
          path="/admin/payments"
          element={<AdminEventPaymentsScreen />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Event Payments Hub Tests (VIS-08 / VS-A-PAY-001, VS-A-PAY-002, VS-A-PROOF-001)', () => {
  describe('1. Resumen Financiero del Evento (VS-A-PAY-001)', () => {
    it('renders global account status with metrics derived strictly from the event plans', () => {
      renderPaymentsScreen();

      // Heading & Context
      expect(screen.getByRole('heading', { name: /Estado de Cuenta Global/i })).toBeInTheDocument();
      expect(screen.getAllByText(/Graduación Facultad de Derecho 2027/i).length).toBeGreaterThan(0);

      // Bento 4 Key Metrics (Derived strictly from Andrea Martinez in evt-derecho-2027: $12,500 total, $7,500 paid [60%], $5,000 pending [40%], $0 overdue [0%])
      expect(screen.getByText(/Total contratado/i)).toBeInTheDocument();
      expect(screen.getAllByText(/\$12,500\.00 MXN/i).length).toBeGreaterThan(0);

      expect(screen.getByText(/Recaudado/i)).toBeInTheDocument();
      expect(screen.getByText(/\$7,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getAllByText(/60%/i).length).toBeGreaterThan(0);

      expect(screen.getByText(/Pendiente/i)).toBeInTheDocument();
      expect(screen.getByText(/\$5,000\.00 MXN/i)).toBeInTheDocument();

      expect(screen.getAllByText(/Vencido/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/\$0\.00 MXN/i)).toBeInTheDocument();

      // Distribution Bar & Legend
      expect(screen.getByRole('heading', { name: /Distribución de Cartera/i })).toBeInTheDocument();
      expect(screen.getByText(/Pagados/i)).toBeInTheDocument();
      expect(screen.getByText(/Próximos \(Al corriente\)/i)).toBeInTheDocument();

      // Overdue section indicates no overdue cases
      expect(screen.getByText(/No hay obligaciones vencidas registradas en este evento/i)).toBeInTheDocument();
    });

    it('navigates to Cartera tab when clicking "Ver cartera"', () => {
      renderPaymentsScreen();

      const verCarteraBtn = screen.getByRole('button', { name: /Ver cartera/i });
      fireEvent.click(verCarteraBtn);

      expect(screen.getByRole('heading', { name: /Cartera de Graduados/i })).toBeInTheDocument();
    });

    it('navigates to Comprobantes por validar tab when clicking the tab trigger', () => {
      renderPaymentsScreen();

      const comprobantesTab = screen.getByRole('tab', { name: /Comprobantes por validar/i });
      fireEvent.click(comprobantesTab);

      expect(screen.getByRole('heading', { name: /Comprobantes por validar/i })).toBeInTheDocument();
      expect(screen.getByText(/Cola de revisión para depósitos y transferencias/i)).toBeInTheDocument();
    });

    it('navigates to Conciliación tab when clicking "Conciliación"', () => {
      renderPaymentsScreen();

      const conciliacionBtn = screen.getByRole('button', { name: /Conciliación/i });
      fireEvent.click(conciliacionBtn);

      expect(screen.getByRole('heading', { name: /Conciliación de pagos/i })).toBeInTheDocument();
    });
  });

  describe('2. Cartera de Graduados (VS-A-PAY-001)', () => {
    it('displays portfolio table for graduates with Folio, Graduado, and priority columns', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      expect(screen.getByRole('heading', { name: /Cartera de Graduados/i })).toBeInTheDocument();
      expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
      expect(screen.getByText('Fernando Torres')).toBeInTheDocument();
      expect(screen.getByText('GR-2027-0042')).toBeInTheDocument();

      // Andrea has real plan ($2,500 next installment, due 15 Mar 2027, $5,000 pending, status Próximo)
      expect(screen.getByText(/\$2,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText('15 Mar 2027')).toBeInTheDocument();

      // Graduates without plan show neutral '—' and 'Sin plan' badge
      expect(screen.getAllByText('Sin plan').length).toBe(3); // Fernando, Mariana, Roberto
    });

    it('searches in portfolio in realtime and shows EmptyState on no match', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      const searchInput = screen.getByLabelText(/Buscar graduados en cartera/i);
      fireEvent.change(searchInput, { target: { value: 'Andrea' } });

      expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
      expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'Inexistente 9999' } });
      expect(screen.getByText(/No se encontraron graduados en la cartera/i)).toBeInTheDocument();
    });
  });

  describe('3. Pagos por Validar / Submissions Queue (VS-A-PROOF-001)', () => {
    it('renders submissions queue with Folio, Graduado, Monto, and opens evidence drawer', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=comprobantes');

      expect(screen.getByText('SUB-2027-0012')).toBeInTheDocument();
      expect(screen.getByText('Mariana López')).toBeInTheDocument();
      expect(screen.getByText('SUB-2027-0014')).toBeInTheDocument();
      expect(screen.getByText('Roberto Sánchez')).toBeInTheDocument();

      // Click on Mariana's submission to open drawer
      const reviewBtns = screen.getAllByRole('button', { name: /Revisar/i });
      fireEvent.click(reviewBtns[0]);

      expect(screen.getByRole('heading', { name: /Comprobante SUB-2027-0012/i })).toBeInTheDocument();
      expect(screen.getByText('comprobante_spei_noviembre.pdf')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Aprobar comprobante/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Rechazar/i })).toBeInTheDocument();
    });

    it('Approve action displays mandatory warning explaining backend will determine allocation', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=comprobantes');

      const reviewBtns = screen.getAllByRole('button', { name: /Revisar/i });
      fireEvent.click(reviewBtns[0]);

      const approveBtn = screen.getByRole('button', { name: /Aprobar comprobante/i });
      fireEvent.click(approveBtn);

      expect(screen.getByRole('heading', { name: /Aprobar comprobante de pago/i })).toBeInTheDocument();
      expect(
        screen.getByText(/Aprobar este comprobante generará un movimiento financiero confirmado y su aplicación a cuotas u obligaciones será determinada por el backend/i)
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Confirmar aprobación/i }));
      expect(screen.getByText(/aprobado en preview/i)).toBeInTheDocument();
    });

    it('Reject action requires mandatory non-empty reason and disables confirm button when empty', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=comprobantes');

      const reviewBtns = screen.getAllByRole('button', { name: /Revisar/i });
      fireEvent.click(reviewBtns[0]);

      const rejectBtn = screen.getByRole('button', { name: /Rechazar/i });
      fireEvent.click(rejectBtn);

      expect(screen.getByRole('heading', { name: /Rechazar comprobante de pago/i })).toBeInTheDocument();
      const confirmRejectBtn = screen.getByRole('button', { name: /Confirmar rechazo/i });
      expect(confirmRejectBtn).toBeDisabled();

      const reasonInput = screen.getByLabelText(/Motivo de rechazo/i);
      fireEvent.change(reasonInput, { target: { value: 'Comprobante borroso sin datos legibles' } });
      expect(confirmRejectBtn).not.toBeDisabled();

      fireEvent.click(confirmRejectBtn);
      expect(screen.getByText(/marcado como rechazado con motivo/i)).toBeInTheDocument();
    });
  });

  describe('4. Plan de Pagos & Eliminación de Fallback Incorrecto', () => {
    it('renders Andrea Martinez payment plan when she has a configured plan', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=plan&graduateId=grad-andrea-martinez');

      expect(screen.getByRole('heading', { name: /Pagos de Andrea Martínez/i })).toBeInTheDocument();
      expect(screen.getByText('Total contratado')).toBeInTheDocument();
      expect(screen.getByText(/\$12,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/\$7,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/\$5,000\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();

      // Installments table
      const table = screen.getByRole('table');
      expect(within(table).getByText('Mensualidad M1')).toBeInTheDocument();
      expect(within(table).getByText('Mensualidad M2')).toBeInTheDocument();
      expect(within(table).getByText('Mensualidad M3')).toBeInTheDocument();
      expect(within(table).getByText('Mensualidad M4')).toBeInTheDocument();
      expect(within(table).getByText('Mensualidad M5')).toBeInTheDocument();
    });

    it('CRITICAL: Graduate without plan (Fernando Torres) NEVER receives Andrea Martinez plan and displays EmptyState', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=plan&graduateId=grad-fernando-torres');

      // Must NOT show Andrea's heading or amounts
      expect(screen.queryByText(/Pagos de Andrea Martínez/i)).not.toBeInTheDocument();

      // Must show EmptyState for plan not available
      expect(screen.getByText(/Plan de pagos no disponible/i)).toBeInTheDocument();
      expect(screen.getByText(/El graduado Fernando Torres no cuenta con un plan de pagos configurado en este evento/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver a cartera/i })).toBeInTheDocument();
    });
  });

  describe('5. R4: ManualPaymentModal (VS-A-PAY-002) — Métodos CASH, TRANSFER y DEPOSIT', () => {
    it('supports Efectivo, Transferencia, and Depósito methods and informs that posterior balance will be calculated by backend', () => {
      render(
        <ManualPaymentModal
          isOpen={true}
          onClose={() => {}}
          eventId="evt-derecho-2027"
          initialGraduateId="grad-andrea-martinez"
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // All 3 methods
      expect(within(modal).getByRole('button', { name: /Efectivo/i })).toBeInTheDocument();
      expect(within(modal).getByRole('button', { name: /Transferencia/i })).toBeInTheDocument();
      expect(within(modal).getByRole('button', { name: /Depósito/i })).toBeInTheDocument();

      // Informative preview
      expect(within(modal).getByText(/Disponible al integrar cálculo del backend/i)).toBeInTheDocument();
    });

    it('graduate with plan (Andrea) fills obligation amount, requires date, and submits neutral non-persistent capture', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      const abonarBtns = screen.getAllByRole('button', { name: /Abonar/i });
      fireEvent.click(abonarBtns[0]); // Andrea

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Fill valid date
      const dateInput = within(modal).getByLabelText(/Fecha de pago/i);
      fireEvent.change(dateInput, { target: { value: '2027-03-15' } });

      // Submit form
      const submitBtn = within(modal).getByRole('button', { name: /Registrar pago/i });
      fireEvent.click(submitBtn);

      // Neutral confirmation step without claiming DB persistence
      expect(within(modal).getByText(/Registro capturado/i)).toBeInTheDocument();
      expect(within(modal).getAllByText(/Integración con backend pendiente/i).length).toBeGreaterThan(0);

      // Close
      fireEvent.click(within(modal).getByRole('button', { name: /Volver a pagos/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('6. Aislamiento Estricto entre Eventos (Event Isolation)', () => {
    it('CRITICAL: Unrelated Event does NOT show Event A financial data or graduates in tabs', () => {
      const mockEventB: EventMock = {
        id: 'evt-aislado-999',
        name: 'Evento Aislado B',
        institution: 'Facultad B',
        career: 'Carrera B',
        generation: '2027',
        date: '20 Jul 2027',
        venue: 'Sede B',
        status: 'OPEN',
      };

      // 1. Resumen Tab on Event B: $0.00 and no data leakage
      const { unmount: unmountSummary } = render(
        <EventFinancialSummaryTab
          event={mockEventB}
          onNavigateToPortfolio={() => {}}
          onNavigateToReconciliation={() => {}}
          onOpenManualPayment={() => {}}
        />
      );
      expect(screen.getAllByText(/\$0\.00 MXN/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/\$12,500\.00 MXN/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Andrea Martínez/i)).not.toBeInTheDocument();
      unmountSummary();

      // 2. Cartera Tab on Event B: EmptyState
      const { unmount: unmountPortfolio } = render(
        <EventPortfolioTab
          eventId={mockEventB.id}
          onSelectGraduatePlan={() => {}}
          onOpenManualPayment={() => {}}
        />
      );
      expect(screen.getByText(/No se encontraron graduados en la cartera/i)).toBeInTheDocument();
      expect(screen.queryByText(/Andrea Martínez/i)).not.toBeInTheDocument();
      unmountPortfolio();

      // 3. Proof Queue on Event B: EmptyState
      const { unmount: unmountProofs } = render(
        <EventProofQueueTab
          eventId={mockEventB.id}
        />
      );
      expect(screen.getByText(/No hay comprobantes para mostrar/i)).toBeInTheDocument();
      unmountProofs();

      // 4. Conciliación Tab on Event B: EmptyState
      render(
        <EventReconciliationTab
          eventId={mockEventB.id}
        />
      );
      expect(screen.getByText(/No se encontraron registros de conciliación/i)).toBeInTheDocument();
    });
  });

  describe('7. Neutral Unscoped State on /admin/payments', () => {
    it('CRITICAL: Navigating to /admin/payments without eventId renders neutral EmptyState asking user to select an event', () => {
      renderPaymentsScreen('/admin/payments');

      // Must show prompt to select an event
      expect(screen.getByRole('heading', { name: /Selecciona un evento/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ver eventos/i })).toBeInTheDocument();

      // Must NOT render financial tabs or auto-selected event
      expect(screen.queryByText(/Graduación Facultad de Derecho 2027/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Total contratado/i)).not.toBeInTheDocument();
    });
  });

  describe('8. Fallback de Evento no existente', () => {
    it('renders EmptyState when eventId does not exist', () => {
      renderPaymentsScreen('/admin/events/evt-no-existe/payments');

      expect(screen.getAllByText('Evento no encontrado').length).toBeGreaterThan(0);
      expect(screen.getByText(/No encontramos el evento solicitado para consultar los pagos/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver a eventos/i })).toBeInTheDocument();
    });
  });
});
