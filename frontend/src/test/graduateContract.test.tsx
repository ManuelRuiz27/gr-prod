import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GraduateContractScreen } from '../pages/graduate/GraduateContractScreen';

function renderGraduateContract(contractId?: string) {
  return render(
    <MemoryRouter initialEntries={['/graduate/contract']}>
      <Routes>
        <Route
          path="/graduate/contract"
          element={<GraduateContractScreen contractId={contractId} />}
        />
        <Route path="/graduate/group" element={<div>Pantalla Mi Grupo</div>} />
        <Route path="/graduate/payments" element={<div>Pantalla Centro de Pagos</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Graduate Contract Tests (VIS-09 / VS-G-CON-001 & UX-G-CON-*)', () => {
  describe('1. Estructura y Jerarquía Contractual (VS-G-CON-001)', () => {
    it('displays Header, Folio CT-2027-0042, Event Name, Status Badge, Financial Summary, and Products', () => {
      renderGraduateContract('contract-andrea-pending');

      expect(screen.getByRole('heading', { name: /Mi Contrato/i })).toBeInTheDocument();
      expect(screen.getByText('CT-2027-0042')).toBeInTheDocument();
      expect(screen.getByText(/Graduación Facultad de Derecho 2027/i)).toBeInTheDocument();
      expect(screen.getByText(/Pendiente de aceptación/i)).toBeInTheDocument();

      // Financial Summary
      expect(screen.getByText(/Resumen de la Membresía/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Lugares/i)).toBeInTheDocument();
      expect(screen.getByText(/\$12,500\.00 MXN/i)).toBeInTheDocument();

      // Products / Line Items
      expect(screen.getByText(/Productos y Lugares Incluidos/i)).toBeInTheDocument();
      expect(screen.getByText(/Paquete de Graduación \(Graduado Titular \+ Termo\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Lugar Adulto \(Cena formal 3 tiempos\)/i)).toBeInTheDocument();
      expect(screen.getAllByText(/\$4,500\.00 MXN/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/\$8,000\.00 MXN/i)).toBeInTheDocument();

      // Payment Scheme
      expect(screen.getByText(/Esquema de Pagos Acordado/i)).toBeInTheDocument();
      expect(screen.getByText(/\$2,500\.00 MXN/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ver mis pagos →/i })).toBeInTheDocument();

      // Policy & Terms
      expect(screen.getByText(/Política de Cancelación Aplicable/i)).toBeInTheDocument();
      expect(screen.getByText('POL-2027-A')).toBeInTheDocument();
      expect(screen.getByText(/Términos del Contrato/i)).toBeInTheDocument();
      expect(screen.getByText(/1\. Objeto del Contrato de Membresía/i)).toBeInTheDocument();
    });
  });

  describe('2. Aceptación Explícita y Feedback Honesto (UX-G-CON-002)', () => {
    it('renders dominant "Aceptar contrato" CTA, opens confirmation modal, requires checkbox, and transitions to visual preview without fake DB mutation', () => {
      renderGraduateContract('contract-andrea-pending');

      const acceptBtn = screen.getByRole('button', { name: /Aceptar contrato/i });
      expect(acceptBtn).toBeInTheDocument();
      fireEvent.click(acceptBtn);

      // Modal is open
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText(/Confirmar aceptación de contrato/i)).toBeInTheDocument();
      expect(within(modal).getByText('CT-2027-0042')).toBeInTheDocument();
      expect(within(modal).getByText(/\$12,500\.00 MXN/i)).toBeInTheDocument();

      // Confirm button is initially disabled
      const confirmBtn = within(modal).getByRole('button', { name: /Aceptar y continuar/i });
      expect(confirmBtn).toBeDisabled();

      // Check the explicit confirmation checkbox
      const checkbox = within(modal).getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(confirmBtn).not.toBeDisabled();

      // Click confirm
      fireEvent.click(confirmBtn);

      // Modal closed, honest feedback alert displayed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(
        screen.getByText(/Confirmación validada en modo visual\. La aceptación definitiva será registrada por el backend\./i)
      ).toBeInTheDocument();

      // Status transitioned to Aceptado in local view
      expect(screen.getByText(/Contrato formalizado y aceptado/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ver mi grupo →/i })).toBeInTheDocument();
    });
  });

  describe('3. Estados Contractuales Normativos (ACCEPTED, SUPERSEDED, CANCELLED)', () => {
    it('renders ACCEPTED contract in read-only mode with accepted banner and no accept CTA', () => {
      renderGraduateContract('contract-andrea-accepted');

      expect(screen.getByText('Aceptado')).toBeInTheDocument();
      expect(screen.getByText(/Contrato formalizado y aceptado/i)).toBeInTheDocument();
      expect(screen.getByText(/12 Oct 2026, 14:35 hrs/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Aceptar contrato$/i })).not.toBeInTheDocument();
    });

    it('renders SUPERSEDED contract with archival notice and read-only mode', () => {
      renderGraduateContract('contract-superseded');

      expect(screen.getByText('Sustituido')).toBeInTheDocument();
      expect(screen.getByText(/Este contrato fue sustituido por una versión posterior/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Aceptar contrato$/i })).not.toBeInTheDocument();
    });

    it('renders CANCELLED contract with cancellation alert', () => {
      renderGraduateContract('contract-cancelled');

      expect(screen.getByText('Cancelado')).toBeInTheDocument();
      expect(screen.getByText(/Este contrato y su membresía asociada han sido cancelados/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Aceptar contrato$/i })).not.toBeInTheDocument();
    });

    it('renders EmptyState when contract does not exist', () => {
      renderGraduateContract('non-existent-contract');

      expect(screen.getByText(/Contrato no disponible/i)).toBeInTheDocument();
    });
  });
});
