import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GraduateGroupScreen } from '../pages/graduate/GraduateGroupScreen';

function renderGraduateGroup(groupStateId?: string) {
  return render(
    <MemoryRouter initialEntries={['/graduate/group']}>
      <Routes>
        <Route
          path="/graduate/group"
          element={<GraduateGroupScreen groupStateId={groupStateId} />}
        />
        <Route path="/graduate/contract" element={<div>Pantalla Mi Contrato</div>} />
        <Route path="/graduate/meals" element={<div>Pantalla Platillos</div>} />
        <Route path="/graduate/payments" element={<div>Pantalla Pagos</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Graduate Group & Products Hub Tests (VIS-09 / VS-G-GROUP-001 & UX-G-GROUP-*)', () => {
  describe('1. Jerarquía Visual y Resumen de Capacidad (VS-G-GROUP-001)', () => {
    it('renders "Mi grupo", capacity badges, places summary, and links without legacy "invitados" terminology', () => {
      renderGraduateGroup('group-andrea-available');

      expect(screen.getByRole('heading', { name: /^Mi grupo$/i })).toBeInTheDocument();
      expect(screen.getByText(/3 de 5 Lugares Asignados/i)).toBeInTheDocument();

      // Places summary
      expect(screen.getByText('Lugares contratados')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('1 Paquete Titular + 4 Lugares Adulto')).toBeInTheDocument();
      expect(screen.getByText('Integrantes registrados')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Lugares pendientes de nombre')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();

      // Contract link
      expect(screen.getByRole('button', { name: /Ver contrato/i })).toBeInTheDocument();
    });

    it('identifies primary graduate semantically as "Graduado titular" and shows per-member table and meal summary', () => {
      renderGraduateGroup('group-andrea-available');

      expect(screen.getByText('Graduado titular')).toBeInTheDocument();
      expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();

      // Secondary members
      expect(screen.getByText('Laura González')).toBeInTheDocument();
      expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
      expect(screen.getAllByText('Acompañante').length).toBe(2);

      // Meal and table breakdown
      expect(screen.getAllByText(/Mesa 24/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Menú Tradicional/i)).toBeInTheDocument();
      expect(screen.getByText(/Menú Vegetariano/i)).toBeInTheDocument();

      // CTA to meals hub
      expect(screen.getByText(/Gestionar platillos →/i)).toBeInTheDocument();
    });
  });

  describe('2. Agregar Integrante Nominal (UX-G-GROUP-002)', () => {
    it('opens add member modal, validates name, and gives honest feedback without fake DB persistence', () => {
      renderGraduateGroup('group-andrea-available');

      const addBtn = screen.getByRole('button', { name: /Agregar integrante \(2 restantes\)/i });
      fireEvent.click(addBtn);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByRole('heading', { name: /Agregar integrante/i })).toBeInTheDocument();

      const nameInput = within(modal).getByLabelText(/Nombre completo del integrante/i);
      fireEvent.change(nameInput, { target: { value: 'Mateo Morales' } });

      const submitBtn = within(modal).getByRole('button', { name: /Guardar integrante/i });
      fireEvent.click(submitBtn);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(
        screen.getByText(/Alta preparada en modo visual\. La disponibilidad será validada por el backend\./i)
      ).toBeInTheDocument();
    });
  });

  describe('3. Agregar Producto / Lugar con Cotización Visual Obligatoria (UX-G-GROUP-003)', () => {
    it('opens product modal, displays event products, and shows complete visual quote with catch-up without JS formula calculation', () => {
      renderGraduateGroup('group-andrea-available');

      const addProductBtn = screen.getByRole('button', { name: /Agregar lugar/i });
      fireEvent.click(addProductBtn);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(
        within(modal).getByRole('heading', { name: /Contratar lugares o productos adicionales/i })
      ).toBeInTheDocument();

      // Event Products list
      expect(within(modal).getByText('Lugar Adulto Adicional')).toBeInTheDocument();
      expect(within(modal).getByText('Lugar Infantil')).toBeInTheDocument();
      expect(within(modal).getByText('Lugar Sin Cena')).toBeInTheDocument();

      // Visual Quote breakdown
      expect(within(modal).getByText(/Cotización de Adición/i)).toBeInTheDocument();
      expect(within(modal).getAllByText(/\$2,000\.00 MXN/i).length).toBeGreaterThan(0);
      expect(within(modal).getByText(/\$14,500\.00 MXN/i)).toBeInTheDocument();
      expect(within(modal).getByText(/\$1,200\.00 MXN/i)).toBeInTheDocument();
      expect(within(modal).getByText(/\$5,800\.00 MXN/i)).toBeInTheDocument();

      // Confirm purchase
      const confirmBtn = within(modal).getByRole('button', { name: /Confirmar y continuar al pago/i });
      fireEvent.click(confirmBtn);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(
        screen.getByText(/Cotización validada en modo visual\. La operación definitiva será confirmada por el backend\./i)
      ).toBeInTheDocument();
    });
  });

  describe('4. Estados Operativos y Bloqueos (Full, Deadline, Event Closed)', () => {
    it('Full group state shows Grupo completo and 0 available slots', () => {
      renderGraduateGroup('group-full');

      expect(screen.getByText('3 de 3 Lugares Asignados')).toBeInTheDocument();
      expect(screen.getByText('Grupo completo')).toBeInTheDocument();
    });

    it('Deadline closed state displays warning and disables add member actions', () => {
      renderGraduateGroup('group-deadline-closed');

      expect(
        screen.getByText(/El periodo para registrar o modificar integrantes ha finalizado/i)
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Agregar integrante/i })).not.toBeInTheDocument();
    });

    it('Event closed state displays neutral alert for closed event', () => {
      renderGraduateGroup('group-event-closed');

      expect(
        screen.getByText(/El evento se encuentra cerrado para modificaciones operativas/i)
      ).toBeInTheDocument();
    });

    it('displays clear non-unilateral reduction guidance note', () => {
      renderGraduateGroup('group-andrea-available');

      expect(screen.getByText(/Ajustes y reducciones en tu grupo/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Para solicitar una reducción de lugares contratados.*contacta a la coordinación/i)
      ).toBeInTheDocument();
    });
  });
});
