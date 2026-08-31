import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventPaymentsScreen } from '../pages/admin/AdminEventPaymentsScreen';
import { EventPortfolioTab } from '../pages/admin/payments/EventPortfolioTab';
import { EventFinancialSummaryTab } from '../pages/admin/payments/EventFinancialSummaryTab';
import { EventReconciliationTab } from '../pages/admin/payments/EventReconciliationTab';
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

describe('Admin Event Payments Hub Tests (R3 - Scoping, Zero Invented Data, Real Isolation)', () => {
  describe('1. Resumen Financiero del Evento (Event-Scoped Financial Overview)', () => {
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

    it('navigates to Conciliación tab when clicking "Conciliación"', () => {
      renderPaymentsScreen();

      const conciliacionBtn = screen.getByRole('button', { name: /Conciliación de Pasarelas/i });
      fireEvent.click(conciliacionBtn);

      expect(screen.getByRole('heading', { name: /Conciliación de pagos/i })).toBeInTheDocument();
    });
  });

  describe('2. Cartera de Graduados & Aislamiento por Evento', () => {
    it('displays portfolio table for graduates in the active event with real data for Andrea and neutral placeholder for graduates without plan', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      expect(screen.getByRole('heading', { name: /Cartera de Graduados/i })).toBeInTheDocument();
      expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
      expect(screen.getByText('Fernando Torres')).toBeInTheDocument();

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

  describe('3. Plan de Pagos & Eliminación de Fallback Incorrecto', () => {
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

  describe('4. Aislamiento Estricto entre Eventos (Event Isolation)', () => {
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

      // 3. Conciliación Tab on Event B: EmptyState
      render(
        <EventReconciliationTab
          eventId={mockEventB.id}
        />
      );
      expect(screen.getByText(/No se encontraron registros de conciliación/i)).toBeInTheDocument();
    });
  });

  describe('5. No Simular Persistencia Financiera & Métodos Exactos', () => {
    it('manual payment displays exact methods Efectivo/Transferencia, uses real file input, and submits with neutral non-persistence status', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      const abonarBtns = screen.getAllByRole('button', { name: /Abonar/i });
      fireEvent.click(abonarBtns[0]); // Andrea

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Exact methods
      expect(within(modal).getByRole('button', { name: /Efectivo/i })).toBeInTheDocument();
      expect(within(modal).getByRole('button', { name: /Transferencia/i })).toBeInTheDocument();

      // No fake auto-selected file
      expect(within(modal).queryByText('comprobante_deposito_firmado.pdf')).not.toBeInTheDocument();

      // Submit form
      const submitBtn = within(modal).getByRole('button', { name: /Registrar pago/i });
      fireEvent.click(submitBtn);

      // Neutral confirmation step without claiming DB persistence
      expect(within(modal).getByText(/Registro capturado/i)).toBeInTheDocument();
      expect(within(modal).getAllByText(/Integración con backend pendiente/i).length).toBeGreaterThan(0);
      expect(within(modal).queryByText(/^Pago registrado$/i)).not.toBeInTheDocument();

      // Close
      fireEvent.click(within(modal).getByRole('button', { name: /Volver a pagos/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('adjustment and refund form submits with neutral non-persistence status', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=plan&graduateId=grad-andrea-martinez');

      const ajusteBtn = screen.getByRole('button', { name: /Ajuste \/ Reembolso/i });
      fireEvent.click(ajusteBtn);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText(/El pago original permanecerá en el historial/i)).toBeInTheDocument();

      // Fill reason and amount
      const amountInput = within(modal).getByLabelText(/Monto del ajuste/i);
      fireEvent.change(amountInput, { target: { value: '500' } });

      const reasonInput = within(modal).getByLabelText(/Motivo o justificación obligatoria/i);
      fireEvent.change(reasonInput, { target: { value: 'Ajuste de prueba' } });

      const submitBtn = within(modal).getByRole('button', { name: /Guardar ajuste/i });
      fireEvent.click(submitBtn);

      // Neutral confirmation screen
      expect(within(modal).getByText(/Operación capturada/i)).toBeInTheDocument();
      expect(within(modal).getByText(/Integración con backend pendiente/i)).toBeInTheDocument();

      // Close
      fireEvent.click(within(modal).getByRole('button', { name: /Entendido/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('6. Fallback de Evento no existente', () => {
    it('renders EmptyState when eventId does not exist', () => {
      renderPaymentsScreen('/admin/events/evt-no-existe/payments');

      expect(screen.getAllByText('Evento no encontrado').length).toBeGreaterThan(0);
      expect(screen.getByText(/No encontramos el evento solicitado para consultar los pagos/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver a eventos/i })).toBeInTheDocument();
    });
  });
});
