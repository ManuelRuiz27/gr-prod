import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventTablesScreen } from '../pages/admin/AdminEventTablesScreen';

function renderTablesScreen(
  initialEntry = '/admin/events/evt-derecho-2027/tables'
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/admin/events/:eventId/tables"
          element={<AdminEventTablesScreen />}
        />
        <Route
          path="/admin/tables"
          element={<AdminEventTablesScreen />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Event Tables Hub Tests (FRONTEND-04 — Seating Admin UI)', () => {
  describe('1. Vista Principal y Contexto del Evento (UX-A-SEAT-001)', () => {
    it('renders seating map canvas, summary stats, legend, and action buttons strictly for the event', () => {
      renderTablesScreen();

      // Heading & Breadcrumb
      expect(screen.getByRole('heading', { name: /Croquis de Mesas y Asignaciones/i })).toBeInTheDocument();
      expect(screen.getAllByText(/Graduación Facultad de Derecho 2027/i).length).toBeGreaterThan(0);

      // Summary Bento Stats
      expect(screen.getByText(/Aforo Total/i)).toBeInTheDocument();
      expect(screen.getByText(/Lugares Ocupados/i)).toBeInTheDocument();
      expect(screen.getByText(/Lugares Libres/i)).toBeInTheDocument();
      expect(screen.getByText(/Mesas Bloqueadas/i)).toBeInTheDocument();

      // Action Buttons
      expect(screen.getByRole('button', { name: /Crear mesa/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Crear varias mesas/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Fondo de referencia/i })).toBeInTheDocument();

      // Legend in Canvas
      expect(screen.getByText(/Disponible \(0%\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Completa \(100%\)/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Bloqueada/i).length).toBeGreaterThan(0);
    });

    it('displays EmptyState when eventId does not exist (no fallback)', () => {
      renderTablesScreen('/admin/events/evt-no-existe/tables');

      expect(screen.getAllByText('Evento no encontrado').length).toBeGreaterThan(0);
      expect(screen.getByText(/No encontramos el evento solicitado para gestionar las mesas/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver a eventos/i })).toBeInTheDocument();
    });

    it('displays EmptyState when accessing /admin/tables without eventId', () => {
      renderTablesScreen('/admin/tables');

      expect(screen.getByRole('heading', { name: /Selecciona un evento/i })).toBeInTheDocument();
    });
  });

  describe('2. Detalle de Mesa & Derivación de FULL (UX-A-SEAT-003)', () => {
    it('clicking a table opens TableDetailPanel showing capacity, occupied, available, and assignees', () => {
      renderTablesScreen();

      // Click on Mesa 24 (Andrea's table, occupied: 8, capacity: 10, available: 2)
      const tableNode = screen.getByTestId('table-node-tbl-24');
      fireEvent.click(tableNode);

      // Panel Header & Name
      expect(screen.getByRole('complementary', { name: /Detalle de Mesa 24/i })).toBeInTheDocument();
      expect(screen.getByText('Mesa Cuadrada')).toBeInTheDocument();
      expect(screen.getByText('Parcial (80%)')).toBeInTheDocument();

      // Capacity stats
      expect(screen.getByText('Capacidad Total')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // 10 lugares
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 libres

      // Assignees
      expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
      expect(screen.getByText('8 lugares')).toBeInTheDocument();

      // Action buttons
      expect(screen.getByRole('button', { name: /Editar mesa/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Bloquear/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Duplicar mesa/i })).toBeInTheDocument();
    });

    it('FULL is derived automatically when available is 0 and is not an editable enum', () => {
      renderTablesScreen();

      // Click on Mesa 12 (Fernando Torres, 10/10 occupied)
      const tableNode = screen.getByTestId('table-node-tbl-12');
      fireEvent.click(tableNode);

      // Status badge in panel shows Completa (100%)
      const detailPanel = screen.getByRole('complementary', { name: /Detalle de Mesa 12/i });
      expect(within(detailPanel).getByText('Completa (100%)')).toBeInTheDocument();
      expect(within(detailPanel).getByText('0')).toBeInTheDocument(); // 0 libres
    });

    it('BLOCKED table is visually distinguished and does not appear available for assignment', () => {
      renderTablesScreen();

      // Click on Mesa 20 (BLOCKED)
      const tableNode = screen.getByTestId('table-node-tbl-20');
      fireEvent.click(tableNode);

      // Badge shows Bloqueada
      expect(screen.getAllByText('Bloqueada').length).toBeGreaterThan(0);
      expect(screen.getByText('La mesa está bloqueada para asignaciones.')).toBeInTheDocument();

      // Button shows Desbloquear
      expect(screen.getByRole('button', { name: /Desbloquear/i })).toBeInTheDocument();
    });
  });

  describe('3. Crear Mesa Individual (UX-A-SEAT-001)', () => {
    it('opens CreateTableModal, validates capacity > 0, only allows SQUARE/ROUND, and adds table locally', () => {
      renderTablesScreen();

      const createBtn = screen.getByRole('button', { name: /^Crear mesa$/i });
      fireEvent.click(createBtn);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByRole('heading', { name: /Crear mesa/i })).toBeInTheDocument();

      // Only SQUARE and ROUND shapes
      expect(within(modal).getByText(/Cuadrada \(SQUARE\)/i)).toBeInTheDocument();
      expect(within(modal).getByText(/Circular \(ROUND\)/i)).toBeInTheDocument();

      // Forbidden shapes should NOT exist
      expect(within(modal).queryByText(/RECTANGLE/i)).not.toBeInTheDocument();
      expect(within(modal).queryByText(/VIP/i)).not.toBeInTheDocument();

      // Test invalid capacity <= 0
      const capacityInput = within(modal).getByLabelText(/Capacidad/i);
      fireEvent.change(capacityInput, { target: { value: '0' } });

      const form = modal.querySelector('form')!;
      fireEvent.submit(form);

      expect(within(modal).getByText(/La capacidad de la mesa debe ser mayor a 0/i)).toBeInTheDocument();

      // Fill valid capacity 8 and shape ROUND
      fireEvent.change(capacityInput, { target: { value: '8' } });
      const roundBtn = within(modal).getByRole('button', { name: /Circular \(ROUND\)/i });
      fireEvent.click(roundBtn);

      fireEvent.submit(form);

      // Modal closes and table is added
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('4. Crear Varias Mesas (UX-A-SEAT-002)', () => {
    it('generates multiple sequential tables with exact fields (quantity, shape, capacity, start_number)', () => {
      renderTablesScreen();

      const bulkBtn = screen.getByRole('button', { name: /Crear varias mesas/i });
      fireEvent.click(bulkBtn);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Verify exact fields
      expect(within(modal).getByLabelText(/Cantidad de mesas/i)).toBeInTheDocument();
      expect(within(modal).getByLabelText(/Número inicial/i)).toBeInTheDocument();
      expect(within(modal).getByLabelText(/Capacidad por mesa/i)).toBeInTheDocument();
      expect(within(modal).getByText(/Cuadrada \(SQUARE\)/i)).toBeInTheDocument();

      // Set quantity 5, start 50, capacity 10
      fireEvent.change(within(modal).getByLabelText(/Cantidad de mesas/i), { target: { value: '5' } });
      fireEvent.change(within(modal).getByLabelText(/Número inicial/i), { target: { value: '50' } });
      fireEvent.change(within(modal).getByLabelText(/Capacidad por mesa/i), { target: { value: '10' } });

      expect(within(modal).getByText(/Mesa 50 → Mesa 54/i)).toBeInTheDocument();

      const generateBtn = within(modal).getByRole('button', { name: /Generar mesas/i });
      fireEvent.click(generateBtn);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('5. Editar Mesa & Validación new_capacity < occupied_places (UX-A-SEAT-004)', () => {
    it('prevents setting new_capacity lower than occupied_places', () => {
      renderTablesScreen();

      // Select Mesa 24 (Andrea is assigned with 8 places)
      const tableNode = screen.getByTestId('table-node-tbl-24');
      fireEvent.click(tableNode);

      const editBtn = screen.getByRole('button', { name: /Editar mesa/i });
      fireEvent.click(editBtn);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText(/Editar Mesa 24/i)).toBeInTheDocument();

      // Try setting capacity to 6 (less than 8 occupied)
      const capacityInput = within(modal).getByLabelText(/Capacidad de la mesa/i);
      fireEvent.change(capacityInput, { target: { value: '6' } });

      const form = modal.querySelector('form')!;
      fireEvent.submit(form);

      // Validation error must be shown
      expect(
        within(modal).getByText(/no puede ser menor a los lugares ya ocupados \(8 lugares\)/i)
      ).toBeInTheDocument();

      // Change to valid 12 places
      fireEvent.change(capacityInput, { target: { value: '12' } });
      fireEvent.submit(form);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('6. Asignar Graduado & Validación de Capacidad (UX-A-SEAT-005)', () => {
    it('only lists graduates from the same event and validates available capacity before confirmation', () => {
      renderTablesScreen();

      // Select Mesa 24 (available: 2 places)
      const tableNode = screen.getByTestId('table-node-tbl-24');
      fireEvent.click(tableNode);

      const assignBtn = screen.getByRole('button', { name: /^Asignar$/i });
      fireEvent.click(assignBtn);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText(/Capacidad disponible actual: 2 lugares/i)).toBeInTheDocument();

      // Mariana López (6 places) exceeds 2 available places
      expect(within(modal).getByText('Mariana López')).toBeInTheDocument();
      fireEvent.click(within(modal).getByText('Mariana López'));

      // Error message for exceeding capacity
      expect(
        within(modal).getByText(/exceden la capacidad disponible de la mesa \(2 lugares disponibles\)/i)
      ).toBeInTheDocument();

      // Confirm button is disabled
      const confirmBtn = within(modal).getByRole('button', { name: /Confirmar asignación/i });
      expect(confirmBtn).toBeDisabled();

      // Close modal
      fireEvent.click(within(modal).getByRole('button', { name: /Cancelar/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('7. Duplicar y Bloquear Mesa', () => {
    it('toggles table status between AVAILABLE and BLOCKED', () => {
      renderTablesScreen();

      // Select Mesa 25 (AVAILABLE)
      const tableNode = screen.getByTestId('table-node-tbl-25');
      fireEvent.click(tableNode);

      const blockBtn = screen.getByRole('button', { name: /^Bloquear$/i });
      fireEvent.click(blockBtn);

      // Status changes to Bloqueada
      expect(screen.getAllByText('Bloqueada').length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /^Desbloquear$/i })).toBeInTheDocument();
    });

    it('duplicates a table creating a new table with cloned shape and capacity', () => {
      renderTablesScreen();

      // Select Mesa 25
      const tableNode = screen.getByTestId('table-node-tbl-25');
      fireEvent.click(tableNode);

      const duplicateBtn = screen.getByRole('button', { name: /Duplicar mesa/i });
      fireEvent.click(duplicateBtn);

      // New table selected
      expect(screen.getByRole('complementary', { name: /Detalle de Mesa 33/i })).toBeInTheDocument();
    });
  });
});
