import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventPaymentsScreen } from '../pages/admin/AdminEventPaymentsScreen';
import { EventPortfolioTab } from '../pages/admin/payments/EventPortfolioTab';
import { EventTransactionsTab } from '../pages/admin/payments/EventTransactionsTab';
import { EventProofQueueTab } from '../pages/admin/payments/EventProofQueueTab';
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

describe('Admin Event Payments Hub Tests (Fase C: Cartera, Movimientos, Comprobantes)', () => {
  describe('1. 3 Tabs & Default Cartera with Inline Summary (C5)', () => {
    it('defaults to Cartera tab with inline collection summary ($X cobrado · $Y pendiente · $Z vencido)', () => {
      renderPaymentsScreen();

      // 3 visible tabs
      expect(screen.getByRole('tab', { name: /^Cartera/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /^Movimientos/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /^Comprobantes/i })).toBeInTheDocument();

      // Legacy tabs are NOT visible
      expect(screen.queryByRole('tab', { name: /^Resumen/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: /^Conciliación/i })).not.toBeInTheDocument();

      // Inline financial summary
      expect(screen.getByText('cobrado')).toBeInTheDocument();
      expect(screen.getByText('pendiente')).toBeInTheDocument();
      expect(screen.getByText('vencido')).toBeInTheDocument();
      expect(screen.getAllByText('$7,500').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$5,000').length).toBeGreaterThan(0);

      // Default active content is Cartera
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
    });

    it('navigates to Movimientos tab when clicking the tab trigger', () => {
      renderPaymentsScreen();

      const movimientosTab = screen.getByRole('tab', { name: /^Movimientos/i });
      fireEvent.click(movimientosTab);

      expect(screen.getByText('Referencia')).toBeInTheDocument();
    });

    it('navigates to Comprobantes tab when clicking the tab trigger', () => {
      renderPaymentsScreen();

      const comprobantesTab = screen.getByRole('tab', { name: /^Comprobantes/i });
      fireEvent.click(comprobantesTab);

      expect(screen.getAllByText('SUB-2027-0012').length).toBeGreaterThan(0);
    });

    it('normalizes ?tab=resumen and ?tab=conciliacion to cartera', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=conciliacion');

      // Should normalize to cartera
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
    });
  });

  describe('2. Cartera de Graduados (C6)', () => {
    it('displays simplified portfolio table for graduates with Folio, Graduado, and priority columns', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Fernando Torres').length).toBeGreaterThan(0);
      expect(screen.getAllByText('GR-2027-0042').length).toBeGreaterThan(0);

      // Andrea has real plan ($2,500 next installment, due 15 Mar 2027, $5,000 pending, status Próximo)
      expect(screen.getAllByText(/\$2,500/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText('15 Mar 2027').length).toBeGreaterThan(0);

      // Graduates without plan show neutral '—' and 'Sin plan' badge
      expect(screen.getAllByText('Sin plan').length).toBeGreaterThanOrEqual(3); // Fernando, Mariana, Roberto
    });

    it('searches in portfolio in realtime and shows EmptyState on no match', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      const searchInput = screen.getByLabelText(/Buscar graduados en cartera/i);
      fireEvent.change(searchInput, { target: { value: 'Andrea' } });

      expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
      expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'Inexistente 9999' } });
      expect(screen.getByText(/No se encontraron graduados en la cartera/i)).toBeInTheDocument();
    });
  });

  describe('3. Movimientos / Transacciones (C7)', () => {
    it('renders transactions list for graduates with payment records', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=movimientos');

      expect(screen.getByText('Referencia')).toBeInTheDocument();
      // Andrea Martinez has transactions in evt-derecho-2027
      expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
      expect(screen.getAllByText('GR-2027-0042').length).toBeGreaterThan(0);
    });
  });

  describe('4. Pagos por Validar / Submissions Queue (C9)', () => {
    it('defaults to PENDING_REVIEW filter and provides quick toggle to history', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=comprobantes');

      expect(screen.getAllByText('SUB-2027-0012').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Mariana López').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SUB-2027-0014').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Roberto Sánchez').length).toBeGreaterThan(0);

      // Quick toggle exists
      const toggleBtn = screen.getByRole('button', { name: /Ver historial/i });
      expect(toggleBtn).toBeInTheDocument();

      // Toggle to history
      fireEvent.click(toggleBtn);
      expect(screen.getByRole('button', { name: /Pendientes/i })).toBeInTheDocument();
    });

    it('renders submissions queue and opens evidence drawer', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=comprobantes');

      // Click on Mariana's submission to open drawer
      const reviewBtns = screen.getAllByRole('button', { name: /Revisar/i });
      fireEvent.click(reviewBtns[0]);

      expect(screen.getByRole('heading', { name: /Comprobante SUB-2027-0012/i })).toBeInTheDocument();
      expect(screen.getByText('comprobante_spei_noviembre.pdf')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Aprobar comprobante/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Rechazar/i })).toBeInTheDocument();
    });

    it('Approve action displays clear warning and confirms approval without technical copy', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=comprobantes');

      const reviewBtns = screen.getAllByRole('button', { name: /Revisar/i });
      fireEvent.click(reviewBtns[0]);

      const approveBtn = screen.getByRole('button', { name: /Aprobar comprobante/i });
      fireEvent.click(approveBtn);

      expect(screen.getByRole('heading', { name: /Aprobar comprobante de pago/i })).toBeInTheDocument();
      expect(
        screen.getByText(/Aprobar este comprobante confirmará la recepción de fondos y registrará el movimiento financiero correspondiente/i)
      ).toBeInTheDocument();
      expect(screen.queryByText(/backend/i)).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Confirmar aprobación/i }));
      expect(screen.getByText(/comprobante sub-2027-0012 aprobado/i)).toBeInTheDocument();
      expect(screen.queryByText(/preview/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/backend/i)).not.toBeInTheDocument();
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
      expect(screen.getByText(/comprobante sub-2027-0012 rechazado/i)).toBeInTheDocument();
      expect(screen.queryByText(/modo visual/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/preview/i)).not.toBeInTheDocument();
    });

    it('does not invent evidence file size, shows only real data, and omits fake download button', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=comprobantes');

      const reviewBtns = screen.getAllByRole('button', { name: /Revisar/i });
      fireEvent.click(reviewBtns[0]);

      expect(screen.getByText('1.2 MB')).toBeInTheDocument();
      expect(screen.queryByText(/formato verificado/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /descargar archivo/i })).not.toBeInTheDocument();
    });

    it('navigates to real graduate dossier when clicking Ver expediente del graduado', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=comprobantes');

      const reviewBtns = screen.getAllByRole('button', { name: /Revisar/i });
      fireEvent.click(reviewBtns[0]);

      expect(screen.getByRole('button', { name: /Ver expediente del graduado/i })).toBeInTheDocument();
    });
  });

  describe('5. Plan de Pagos & Eliminación de Fallback Incorrecto', () => {
    it('renders Andrea Martinez payment plan when she has a configured plan', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=plan&graduateId=grad-andrea-martinez');

      expect(screen.getByRole('heading', { name: /Pagos de Andrea Martínez/i })).toBeInTheDocument();
      expect(screen.getByText('Total contratado')).toBeInTheDocument();
      expect(screen.getByText(/\$12,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/\$7,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getAllByText(/\$5,000\.00 MXN/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/60%/).length).toBeGreaterThan(0);

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

  describe('6. ManualPaymentModal (C8) — Validación de mínimo y eliminación de allocation implícito', () => {
    it('supports Efectivo, Transferencia, and Depósito methods without technical copy', () => {
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

      // Contextual graduate info
      expect(within(modal).getAllByText(/GR-2027-0042/i).length).toBeGreaterThan(0);
      expect(within(modal).getByText(/Saldo/i)).toBeInTheDocument();

      // All 3 methods
      expect(within(modal).getByRole('button', { name: /Efectivo/i })).toBeInTheDocument();
      expect(within(modal).getByRole('button', { name: /Transferencia/i })).toBeInTheDocument();
      expect(within(modal).getByRole('button', { name: /Depósito/i })).toBeInTheDocument();

      // Zero backend / preview technical strings
      expect(within(modal).queryByText(/backend/i)).not.toBeInTheDocument();
      expect(within(modal).queryByText(/preview/i)).not.toBeInTheDocument();
    });

    it('validates minimum amount: rejects amount < minimum, accepts amount >= minimum and submits honest capture', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      const abonarBtns = screen.getAllByRole('button', { name: /Abonar/i });
      fireEvent.click(abonarBtns[0]); // Andrea, minimum $2,500

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Set date
      const dateInput = within(modal).getByLabelText(/Fecha de pago/i);
      fireEvent.change(dateInput, { target: { value: '2027-03-15' } });

      // Try amount < minimum ($2,499)
      const amountInput = within(modal).getByLabelText(/Monto recibido/i);
      fireEvent.change(amountInput, { target: { value: '2499' } });

      const submitBtn = within(modal).getByRole('button', { name: /Registrar abono/i });
      fireEvent.click(submitBtn);

      // Should show minimum error
      expect(within(modal).getByText(/El mínimo actual es \$2,500/i)).toBeInTheDocument();

      // Now set amount >= minimum ($3,000)
      fireEvent.change(amountInput, { target: { value: '3000' } });
      fireEvent.click(submitBtn);

      // Honest confirmation step
      expect(within(modal).getByText(/Abono listo/i)).toBeInTheDocument();
      expect(within(modal).getByText(/Revisa los datos capturados/i)).toBeInTheDocument();
      expect(within(modal).queryByText(/Registro capturado en el sistema/i)).not.toBeInTheDocument();

      // Close
      fireEvent.click(within(modal).getByRole('button', { name: /Volver a pagos/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('7. Aislamiento Estricto entre Eventos (Event Isolation)', () => {
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

      // 1. Cartera Tab on Event B: EmptyState
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

      // 2. Transactions Tab on Event B: EmptyState
      const { unmount: unmountTransactions } = render(
        <EventTransactionsTab
          eventId={mockEventB.id}
        />
      );
      expect(screen.getByText(/Sin movimientos registrados/i)).toBeInTheDocument();
      expect(screen.queryByText(/Andrea Martínez/i)).not.toBeInTheDocument();
      unmountTransactions();

      // 3. Proof Queue on Event B: EmptyState
      render(
        <MemoryRouter>
          <EventProofQueueTab
            eventId={mockEventB.id}
          />
        </MemoryRouter>
      );
      expect(screen.getByText(/No hay comprobantes para mostrar/i)).toBeInTheDocument();
    });
  });

  describe('8. Neutral Unscoped State on /admin/payments', () => {
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

  describe('9. Fallback de Evento no existente', () => {
    it('renders EmptyState when eventId does not exist', () => {
      renderPaymentsScreen('/admin/events/evt-no-existe/payments');

      expect(screen.getAllByText('Evento no encontrado').length).toBeGreaterThan(0);
      expect(screen.getByText(/No encontramos el evento solicitado para consultar los pagos/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver a eventos/i })).toBeInTheDocument();
    });
  });
});

