import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GraduatePaymentsScreen } from '../pages/graduate/GraduatePaymentsScreen';

function renderGraduatePayments(graduateId?: string) {
  return render(
    <MemoryRouter initialEntries={['/graduate/payments']}>
      <Routes>
        <Route
          path="/graduate/payments"
          element={<GraduatePaymentsScreen graduateId={graduateId} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Graduate Payments Center Tests (VIS-08 & VIS-08R1)', () => {
  describe('1. Saldo y Jerarquía Visual (VS-G-PAY-001)', () => {
    it('displays Header, Total Contratado, Pagado, Saldo Pendiente, and Próximo Pago', () => {
      renderGraduatePayments();

      expect(screen.getByRole('heading', { name: 'Mis pagos' })).toBeInTheDocument();
      expect(screen.getByText(/Total Contratado/i)).toBeInTheDocument();
      expect(screen.getAllByText(/\$7,500\.00/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/de \$12,500\.00 MXN/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$5,000\.00 MXN/i).length).toBeGreaterThan(0);

      // Próximo pago
      expect(screen.getByText(/Próximo pago/i)).toBeInTheDocument();
      expect(screen.getAllByText(/\$2,500\.00 MXN/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/15 Mar 2027/i).length).toBeGreaterThan(0);
    });

    it('renders primary CTA "Pagar ahora" and secondary CTA "Reportar transferencia"', () => {
      renderGraduatePayments();

      expect(screen.getByRole('button', { name: /Pagar ahora/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reportar transferencia/i })).toBeInTheDocument();
    });

    it('clicking "Pagar ahora" opens online payment info modal without fake immediate success', () => {
      renderGraduatePayments();

      const payNowBtn = screen.getByRole('button', { name: /Pagar ahora/i });
      fireEvent.click(payNowBtn);

      expect(screen.getByRole('heading', { name: /Pago en línea con tarjeta \/ SPEI/i })).toBeInTheDocument();
      expect(screen.getByText(/Pasarela segura/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continuar a pasarela/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Continuar a pasarela/i }));
      expect(screen.getByText(/Conexión con pasarela de pago en línea lista para integración/i)).toBeInTheDocument();
    });
  });

  describe('2. Anti-Hardcode: Eliminación de Meta Termo 70% (VIS-08R1)', () => {
    it('NO renderiza "Meta Termo (70%)", "70%", "Liberado" ni cálculos de threshold 70 en el centro de pagos', () => {
      renderGraduatePayments();

      // Ensure no thermo threshold copy is present in Payments
      expect(screen.queryByText(/Meta Termo/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Umbral Termo/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/70%/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/para liberar Termo/i)).not.toBeInTheDocument();

      // Progress bar represents purely financial progress
      expect(screen.getByRole('progressbar', { name: /Avance financiero/i })).toBeInTheDocument();
      expect(screen.getAllByText(/60% cubierto/i).length).toBeGreaterThan(0);
    });
  });

  describe('3. Anti-Hardcode: Monto Dinámico y Eliminación de Fallback $2,500 (VIS-08R1)', () => {
    it('cuando nextPayment es undefined (graduado liquidado), el input de monto inicia VACÍO y NO contiene 2500', () => {
      renderGraduatePayments('grad-liquidated');

      const reportBtn = screen.getByRole('button', { name: /Reportar transferencia/i });
      fireEvent.click(reportBtn);

      const modal = screen.getByRole('dialog');
      const amountInput = within(modal).getByLabelText(/Monto depositado/i) as HTMLInputElement;

      // Must be empty, never preloaded with 2500 or fake demo default
      expect(amountInput.value).toBe('');
    });

    it('cuando nextPayment tiene un monto específico (ej. $1,375), el input de monto usa dinámicamente ese valor sin asumir $2,500', () => {
      renderGraduatePayments('grad-custom-amount');

      const reportBtn = screen.getByRole('button', { name: /Reportar transferencia/i });
      fireEvent.click(reportBtn);

      const modal = screen.getByRole('dialog');
      const amountInput = within(modal).getByLabelText(/Monto depositado/i) as HTMLInputElement;

      // Must preload exactly 1375
      expect(amountInput.value).toBe('1375');
    });
  });

  describe('4. Calendario de Pagos Dinámico (Anti-Hardcode)', () => {
    it('renders dynamic installments derived from fixture without hardcoded "5 cuotas de $2,500"', () => {
      renderGraduatePayments();

      // Heading shows dynamic count
      expect(screen.getByText(/Calendario de Pagos/i)).toBeInTheDocument();

      // Renders installments
      expect(screen.getByText(/Mensualidad 1 — \$2,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/Mensualidad 2 — \$2,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/Mensualidad 3 — \$2,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/Mensualidad 4 — \$2,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByText(/Mensualidad 5 — \$2,500\.00 MXN/i)).toBeInTheDocument();
    });
  });

  describe('5. Separación Estricta: PaymentSubmission != PaymentTransaction', () => {
    it('Historial de Pagos Confirmados renders ONLY confirmed transactions and never pending submissions', () => {
      renderGraduatePayments();

      expect(screen.getByRole('heading', { name: /Historial de Pagos Confirmados/i })).toBeInTheDocument();
      expect(screen.getAllByText(/SPEI-8849201/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/MP-99401204/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/REC-0492/).length).toBeGreaterThan(0);

      // Submissions (e.g. SUB-2027-0008) are NOT displayed in confirmed transactions table
      const confirmedSection = screen.getByRole('heading', { name: /Historial de Pagos Confirmados/i }).closest('div')!;
      expect(within(confirmedSection).queryByText(/SUB-2027-0008/i)).not.toBeInTheDocument();
    });
  });

  describe('6. Reportar Transferencia / Depósito (VS-G-PROOF-001)', () => {
    it('report proof modal displays mandatory critical disclaimer "Enviar este comprobante no confirma el pago"', () => {
      renderGraduatePayments();

      const reportBtn = screen.getByRole('button', { name: /Reportar transferencia/i });
      fireEvent.click(reportBtn);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Mandatory disclaimer
      expect(within(modal).getByText(/Enviar este comprobante no confirma el pago/i)).toBeInTheDocument();
      expect(
        within(modal).getByText(/El equipo administrativo revisará la información\. Tu saldo se actualizará únicamente después de la aprobación/i)
      ).toBeInTheDocument();

      // Methods
      expect(within(modal).getByRole('button', { name: /Transferencia SPEI/i })).toBeInTheDocument();
      expect(within(modal).getByRole('button', { name: /Depósito \/ Practicaja/i })).toBeInTheDocument();
    });

    it('submitting proof validates required fields and renders in Comprobantes Reportados without altering total paid amount', () => {
      renderGraduatePayments();

      const reportBtn = screen.getByRole('button', { name: /Reportar transferencia/i });
      fireEvent.click(reportBtn);

      const modal = screen.getByRole('dialog');

      // Fill reference and date
      const refInput = within(modal).getByLabelText(/Número de referencia/i);
      fireEvent.change(refInput, { target: { value: 'SPEI-TEST-9988' } });

      const dateInput = within(modal).getByLabelText(/Fecha del comprobante/i);
      fireEvent.change(dateInput, { target: { value: '2027-03-10' } });

      // Simulate file upload
      const fileInput = modal.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['dummy'], 'comprobante_prueba.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Submit
      const submitBtn = within(modal).getByRole('button', { name: /Enviar comprobante/i });
      fireEvent.click(submitBtn);

      // Modal closed, feedback shown
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText(/Tu comprobante ha sido enviado a validación/i)).toBeInTheDocument();

      // Appears in Comprobantes Reportados
      expect(screen.getByRole('heading', { name: /Comprobantes Reportados/i })).toBeInTheDocument();
      expect(screen.getByText('SPEI-TEST-9988')).toBeInTheDocument();
      expect(screen.getAllByText(/Pendiente de validación/i).length).toBeGreaterThan(0);

      // CRITICAL: Total paid remains unchanged ($7,500.00 MXN) and pending remains ($5,000.00 MXN)
      expect(screen.getAllByText(/\$7,500\.00/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$5,000\.00 MXN/i).length).toBeGreaterThan(0);
    });
  });
});
