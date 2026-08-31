import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventPaymentsScreen } from '../pages/admin/AdminEventPaymentsScreen';

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

describe('Admin Event Payments Hub Tests (FRONTEND-PAYMENTS-ADMIN)', () => {
  describe('1. Resumen Financiero del Evento (Global Financial Overview)', () => {
    it('renders global account status, key metrics, and distribution progress bar', () => {
      renderPaymentsScreen();

      // Heading & Context
      expect(screen.getByRole('heading', { name: /Estado de Cuenta Global/i })).toBeInTheDocument();
      expect(screen.getAllByText(/Graduación Facultad de Derecho 2027/i).length).toBeGreaterThan(0);

      // Bento 4 Key Metrics
      expect(screen.getByText(/Total contratado/i)).toBeInTheDocument();
      expect(screen.getAllByText(/\$1,250,000 MXN/i).length).toBeGreaterThan(0);

      expect(screen.getByText(/Recaudado/i)).toBeInTheDocument();
      expect(screen.getByText(/\$850,000 MXN/i)).toBeInTheDocument();
      expect(screen.getAllByText(/68%/i).length).toBeGreaterThan(0);

      expect(screen.getByText(/Pendiente/i)).toBeInTheDocument();
      expect(screen.getByText(/\$350,000 MXN/i)).toBeInTheDocument();

      expect(screen.getAllByText(/Vencido/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/\$50,000 MXN/i)).toBeInTheDocument();

      // Distribution Bar & Legend
      expect(screen.getByRole('heading', { name: /Distribución de Cartera/i })).toBeInTheDocument();
      expect(screen.getByText(/Pagados/i)).toBeInTheDocument();
      expect(screen.getByText(/Próximos \(Al corriente\)/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Vencidos/i).length).toBeGreaterThan(0);

      // Critical Overdue & Upcoming Income Widgets
      expect(screen.getByText(/Vencimientos críticos/i)).toBeInTheDocument();
      expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
      expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Próximos ingresos estimados/i })).toBeInTheDocument();
      expect(screen.getByText(/\$120,000 MXN/i)).toBeInTheDocument();
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

  describe('2. Cartera de Graduados (Portfolio)', () => {
    it('displays portfolio table with graduates, installments, due dates, pending totals, and badges', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      expect(screen.getByRole('heading', { name: /Cartera de Graduados/i })).toBeInTheDocument();
      expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
      expect(screen.getByText('Fernando Torres')).toBeInTheDocument();
      expect(screen.getByText('Mariana López')).toBeInTheDocument();
      expect(screen.getByText('Roberto Sánchez')).toBeInTheDocument();

      // Badges inside table
      const table = screen.getByRole('table');
      expect(within(table).getByText('Al día')).toBeInTheDocument();
      expect(within(table).getAllByText('Próximo').length).toBeGreaterThan(0);
      expect(within(table).getByText('Vencido')).toBeInTheDocument();
    });

    it('filters portfolio by status pills', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      // Filter "Al día"
      const alDiaBtn = screen.getByRole('button', { name: /^Al día$/i });
      fireEvent.click(alDiaBtn);

      expect(screen.getByText('Fernando Torres')).toBeInTheDocument();
      expect(screen.queryByText('Andrea Martínez')).not.toBeInTheDocument();
      expect(screen.queryByText('Roberto Sánchez')).not.toBeInTheDocument();

      // Filter "Vencidos"
      const vencidosBtn = screen.getByRole('button', { name: /^Vencidos$/i });
      fireEvent.click(vencidosBtn);

      expect(screen.getByText('Roberto Sánchez')).toBeInTheDocument();
      expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();
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

    it('navigates from Cartera row to individual graduate payment plan', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      const planButtons = screen.getAllByRole('button', { name: /Ver plan/i });
      fireEvent.click(planButtons[0]); // Andrea Martínez

      expect(screen.getByRole('heading', { name: /Pagos de Andrea Martínez/i })).toBeInTheDocument();
      expect(screen.getAllByText(/Plan congelado/i).length).toBeGreaterThan(0);
    });
  });

  describe('3. Plan de Pagos de Graduado & Calendario de Obligaciones', () => {
    it('displays full financial commitment, progress towards thermo (70%), installments, and history toggle', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=plan&graduateId=grad-andrea-martinez');

      expect(screen.getByRole('heading', { name: /Pagos de Andrea Martínez/i })).toBeInTheDocument();

      // Summary Card
      expect(screen.getByText('Total contratado')).toBeInTheDocument();
      expect(screen.getByText(/\$12,500.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/\$7,500.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/\$5,000.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText(/Falta 10% para liberar Termo/i)).toBeInTheDocument();

      // Installments Table
      const table = screen.getByRole('table');
      expect(screen.getByRole('heading', { name: /Calendario de Obligaciones/i })).toBeInTheDocument();
      expect(within(table).getByText('Mensualidad M1')).toBeInTheDocument();
      expect(within(table).getByText('Mensualidad M2')).toBeInTheDocument();
      expect(within(table).getByText('Mensualidad M3')).toBeInTheDocument();
      expect(within(table).getByText('Mensualidad M4')).toBeInTheDocument();
      expect(within(table).getByText('Mensualidad M5')).toBeInTheDocument();

      // Status badges in table
      expect(within(table).getAllByText('Pagado').length).toBe(3); // M1, M2, M3
      expect(within(table).getByText('Próximo')).toBeInTheDocument(); // M4
      expect(within(table).getByText('Futuro')).toBeInTheDocument(); // M5

      // History Toggle
      const historyToggle = screen.getByRole('button', { name: /Ver historial/i });
      fireEvent.click(historyToggle);

      expect(screen.getByRole('heading', { name: /Historial de Transacciones y Movimientos/i })).toBeInTheDocument();
      expect(screen.getByText(/Pago Confirmado — Mensualidad 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Transferencia SPEI/i)).toBeInTheDocument();
      expect(screen.getByText(/SPEI-8849201/i)).toBeInTheDocument();
    });

    it('returns to Cartera when clicking "Volver a Cartera"', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=plan&graduateId=grad-andrea-martinez');

      const backBtn = screen.getByRole('button', { name: /Volver a Cartera/i });
      fireEvent.click(backBtn);

      expect(screen.getByRole('heading', { name: /Cartera de Graduados/i })).toBeInTheDocument();
    });
  });

  describe('4. Registro de Pago Manual (UX-29 & UX-30)', () => {
    it('opens manual payment modal, captures payment, and transitions to UX-30 "Pago registrado"', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=cartera');

      // Click "Abonar" on first row
      const abonarBtns = screen.getAllByRole('button', { name: /Abonar/i });
      fireEvent.click(abonarBtns[0]);

      // Form step UX-29
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText('Registrar pago manual')).toBeInTheDocument();
      expect(within(modal).getByLabelText(/Monto \(MXN\)/i)).toBeInTheDocument();
      expect(within(modal).getByLabelText(/Fecha de pago/i)).toBeInTheDocument();
      expect(within(modal).getByText(/Este pago se registrará inmediatamente en el historial/i)).toBeInTheDocument();

      // Submit payment
      const submitBtn = within(modal).getByRole('button', { name: /Registrar pago/i });
      fireEvent.click(submitBtn);

      // Confirmation step UX-30
      expect(within(modal).getByRole('heading', { name: 'Pago registrado' })).toBeInTheDocument();
      expect(within(modal).getByText('El movimiento quedó registrado en el historial.')).toBeInTheDocument();
      expect(within(modal).getByText(/\$2,500.00 MXN/i)).toBeInTheDocument();
      expect(within(modal).getByText('Andrea Martínez')).toBeInTheDocument();
      expect(within(modal).getByRole('button', { name: /Volver a pagos/i })).toBeInTheDocument();

      // Close
      fireEvent.click(within(modal).getByRole('button', { name: /Volver a pagos/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('5. Ajuste y Reembolso (UX-32 & FIN-PLAN-004)', () => {
    it('renders adjustment and refund form with mandatory disclaimer and captures reason', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=plan&graduateId=grad-andrea-martinez');

      const ajusteBtn = screen.getByRole('button', { name: /Ajuste \/ Reembolso/i });
      fireEvent.click(ajusteBtn);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText(/El pago original permanecerá en el historial/i)).toBeInTheDocument();
      expect(within(modal).getByText(/Sentido del ajuste/i)).toBeInTheDocument();

      // Switch to Reembolso
      const refundBtn = within(modal).getByRole('button', { name: /^Reembolso$/i });
      fireEvent.click(refundBtn);

      expect(within(modal).getByText(/Canal del reembolso/i)).toBeInTheDocument();
      expect(within(modal).getByText(/Reembolso Manual/i)).toBeInTheDocument();

      // Close modal
      const cancelBtn = within(modal).getByRole('button', { name: /Cancelar/i });
      fireEvent.click(cancelBtn);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('6. Conciliación de Pagos (UX-34)', () => {
    it('displays reconciliation bento, table, and filters without exposing technical IDs or webhooks', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=conciliacion');

      expect(screen.getByRole('heading', { name: /Conciliación de pagos/i })).toBeInTheDocument();
      expect(screen.getByText(/\$1,245,000 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/\$1,180,500 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/-\$64,500 MXN/i)).toBeInTheDocument();

      // Table data
      const table = screen.getByRole('table');
      expect(within(table).getByText('Carlos Rivera')).toBeInTheDocument();
      expect(within(table).getByText('Revisión necesaria')).toBeInTheDocument();
      expect(within(table).getAllByText('Sin diferencias').length).toBe(2);
      expect(within(table).getByText('Pendiente de confirmación')).toBeInTheDocument();

      // No raw technical tokens or webhooks
      const containerText = table.textContent || '';
      expect(containerText).not.toMatch(/webhook/i);
      expect(containerText).not.toMatch(/payment_intent/i);
      expect(containerText).not.toMatch(/client_secret/i);

      // Trigger sync
      const syncBtn = screen.getByRole('button', { name: /Sincronizar pasarelas/i });
      fireEvent.click(syncBtn);
      expect(syncBtn).toBeInTheDocument();
    });

    it('filters reconciliation list by gateway provider', () => {
      renderPaymentsScreen('/admin/events/evt-derecho-2027/payments?tab=conciliacion');

      const providerSelect = screen.getByLabelText(/Filtrar por pasarela/i);
      fireEvent.change(providerSelect, { target: { value: 'OPENPAY' } });

      const table = screen.getByRole('table');
      expect(within(table).getByText('Fernando Torres')).toBeInTheDocument();
      expect(within(table).queryByText('Carlos Rivera')).not.toBeInTheDocument();
    });
  });

  describe('7. Fallback & Error State', () => {
    it('renders EmptyState when eventId does not exist', () => {
      renderPaymentsScreen('/admin/events/evt-no-existe/payments');

      expect(screen.getAllByText('Evento no encontrado').length).toBeGreaterThan(0);
      expect(screen.getByText(/No encontramos el evento solicitado para consultar los pagos/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver a eventos/i })).toBeInTheDocument();
    });
  });
});
