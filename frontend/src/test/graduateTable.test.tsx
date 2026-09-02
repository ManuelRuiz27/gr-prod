import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GraduateTableScreen } from '../pages/graduate/GraduateTableScreen';

function renderGraduateTableScreen(stateId = 'seating-andrea-partial') {
  return render(
    <MemoryRouter initialEntries={['/graduate/table']}>
      <Routes>
        <Route
          path="/graduate/table"
          element={<GraduateTableScreen seatingStateId={stateId} />}
        />
        <Route
          path="/graduate/payments"
          element={<div>Página de Pagos</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Graduate Seating Screen (VIS-10 / VS-G-SEAT-001)', () => {
  describe('1. Financial Lock / Ineligible State', () => {
    it('renders financial block message and CTA to /graduate/payments', () => {
      renderGraduateTableScreen('seating-locked-financial');

      expect(screen.getByRole('heading', { name: /Asignación de mesas/i })).toBeInTheDocument();
      expect(screen.getByText(/Selección de mesa no disponible/i)).toBeInTheDocument();
      expect(
        screen.getByText(/La selección de mesa aún no está disponible\. Completa el pago requerido para continuar\./i)
      ).toBeInTheDocument();

      const paymentsBtn = screen.getByRole('button', { name: /Ver mis pagos/i });
      expect(paymentsBtn).toBeInTheDocument();
      fireEvent.click(paymentsBtn);

      expect(screen.getByText('Página de Pagos')).toBeInTheDocument();
    });
  });

  describe('2. Privacy Protection (Zero Leakage of Third-Party PII)', () => {
    it('never renders other graduates names, emails, or folios on the graduate table screen', () => {
      renderGraduateTableScreen('seating-andrea-partial');

      // Names from other memberships in fixtures
      expect(screen.queryByText('Mariana López')).not.toBeInTheDocument();
      expect(screen.queryByText('Jorge López')).not.toBeInTheDocument();
      expect(screen.queryByText('Alejandro Ruiz')).not.toBeInTheDocument();
      expect(screen.queryByText('Gabriel Solís')).not.toBeInTheDocument();
      expect(screen.queryByText('Roberto Sánchez')).not.toBeInTheDocument();
      expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();

      // Only own members
      expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
      expect(screen.getByText('Laura González')).toBeInTheDocument();
      expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
    });
  });

  describe('3. Per-Person Seating & Distributed Group Support', () => {
    it('renders distinct table locations per member and does not collapse into single table', () => {
      renderGraduateTableScreen('seating-andrea-distributed');

      // In distributed scenario:
      // Andrea -> Mesa 24
      // Laura -> Mesa 24
      // Carlos -> Mesa 17
      expect(screen.getByText('Mesas de tu grupo')).toBeInTheDocument();
      expect(screen.getAllByText('Mesa 24').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Mesa 17').length).toBeGreaterThan(0);

      // Verify each individual member card has their correct badge
      const andreaRow = screen.getByText('Andrea Martínez').closest('.p-3') as HTMLElement;
      expect(within(andreaRow).getByText('Graduado titular')).toBeInTheDocument();

      const carlosRow = screen.getByText('Carlos Martínez').closest('.p-3') as HTMLElement;
      expect(within(carlosRow).getByText('Lugar Adulto')).toBeInTheDocument();
    });
  });

  describe('4. Member Selection & Table Assignment Flow', () => {
    it('allows selecting unassigned member, picking table from list, and confirming preview', () => {
      renderGraduateTableScreen('seating-andrea-partial');

      // Carlos is unassigned in this scenario
      expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
      expect(screen.getByText('Sin mesa asignada')).toBeInTheDocument();

      // Select Mesa 17 (which has 6 places free)
      const mesa17Card = screen.getByText('Mesa 17').closest('.p-4') as HTMLElement;
      expect(within(mesa17Card).getByText('6 libres')).toBeInTheDocument();

      const assignBtn = within(mesa17Card).getByRole('button', { name: /Asignar aquí/i });
      fireEvent.click(assignBtn);

      // Modal appears
      const modal = screen.getByRole('dialog');
      expect(within(modal).getByText(/Asignar a Mesa 17/i)).toBeInTheDocument();
      expect(within(modal).getByText('Carlos Martínez')).toBeInTheDocument();

      // Confirm assignment
      const confirmBtn = within(modal).getByRole('button', { name: /Confirmar asignación/i });
      fireEvent.click(confirmBtn);

      // Success preview alert appears
      expect(
        screen.getByText(/Se asignó temporalmente a Mesa 17\. La disponibilidad y asignación definitiva serán validadas por el backend\./i)
      ).toBeInTheDocument();
    });
  });

  describe('5. Capacity Guard Check', () => {
    it('disables assignment if selected members exceed available table capacity', () => {
      renderGraduateTableScreen('seating-andrea-partial');

      // Select all 3 members
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((cb) => {
        if (!cb.getAttribute('checked')) {
          fireEvent.click(cb);
        }
      });

      // Mesa 12 has 0 available (Completa)
      const mesa12Card = screen.getByText('Mesa 12').closest('.p-4') as HTMLElement;
      expect(within(mesa12Card).getByText('Completa')).toBeInTheDocument();

      const mesa12Btn = within(mesa12Card).getByRole('button');
      expect(mesa12Btn).toBeDisabled();
    });
  });

  describe('6. Deadline Closed Mode', () => {
    it('renders read-only mode without checkboxes or assignment CTAs when deadline is closed', () => {
      renderGraduateTableScreen('seating-deadline-closed');

      expect(
        screen.getByText(/El periodo para cambios de mesa ha finalizado\. La asignación actual es definitiva\./i)
      ).toBeInTheDocument();

      // No checkboxes
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

      // No "Elige una mesa" selection section
      expect(screen.queryByText(/Elige una mesa para tu selección/i)).not.toBeInTheDocument();
    });
  });

  describe('7. Concurrency Conflict State', () => {
    it('displays warning when table capacity has changed during selection', () => {
      renderGraduateTableScreen('seating-concurrency-conflict');

      expect(
        screen.getByText(/Esta mesa acaba de cambiar y ya no tiene espacio suficiente\. Por favor, selecciona otra mesa disponible\./i)
      ).toBeInTheDocument();
    });
  });

  describe('8. Anti-Seat & Anti-Hardcode Verification', () => {
    it('contains no individual chair/seat selectable units in the DOM', () => {
      const { container } = renderGraduateTableScreen('seating-andrea-partial');
      const html = container.innerHTML.toLowerCase();

      expect(html).not.toContain('seat_id');
      expect(html).not.toContain('chair_id');
      expect(html).not.toContain('seat_number');
      expect(html).not.toContain('silla 1');
      expect(html).not.toContain('asiento 1');
    });

    it('contains no fixed "Pista de Baile / Escenario Principal" hardcode', () => {
      const { container } = renderGraduateTableScreen('seating-andrea-partial');
      expect(container.innerHTML).not.toContain('Pista de Baile / Escenario Principal');
    });
  });

  describe('9. Accessible View Tabs (List vs Canvas)', () => {
    it('switches smoothly between List and Canvas view modes', () => {
      renderGraduateTableScreen('seating-andrea-partial');

      // List is active by default
      expect(screen.getByText('Mesa 1')).toBeInTheDocument();
      expect(screen.getByText('Mesa 2')).toBeInTheDocument();

      // Switch to Canvas
      const canvasTab = screen.getByRole('tab', { name: /Ver plano de mesas/i });
      fireEvent.click(canvasTab);

      expect(
        screen.getByText(/Toca cualquier mesa disponible para consultar detalles y asignar a tus integrantes seleccionados\./i)
      ).toBeInTheDocument();
    });
  });
});
