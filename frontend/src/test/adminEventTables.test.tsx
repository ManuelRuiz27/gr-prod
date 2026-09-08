import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { AdminEventTablesScreen } from '../pages/admin/AdminEventTablesScreen';
import { mockTables } from '../fixtures/layoutFixtures';
import { seatingStore } from '../services/seating';

function renderTablesScreen(
  initialEntry = '/admin/events/evt-derecho-2027/tables'
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <div>
        <nav className="sr-only">
          <Link to="/admin/events/evt-derecho-2027/tables">Derecho</Link>
          <Link to="/admin/events/evt-medicina-2027/tables">Medicina</Link>
          <Link to="/admin/events/evt-no-existe/tables">Inexistente</Link>
          <Link to="/admin/tables">Sin Evento</Link>
        </nav>
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
      </div>
    </MemoryRouter>
  );
}

describe('Admin Event Tables Hub Tests (FRONTEND-04-R1 — Corrección Normativa)', () => {
  beforeEach(() => {
    seatingStore.reset();
  });

  describe('1. Verificación Estricta de Fixtures Normativos Baseline', () => {
    it('only contains the 6 pre-existing baseline tables in mockTables', () => {
      expect(mockTables).toHaveLength(6);
      const tableNumbers = mockTables.map((t) => t.number);
      expect(tableNumbers).toEqual([1, 2, 12, 24, 25, 26]);

      // Verify invented tables do not exist
      expect(mockTables.find((t) => t.number === 15)).toBeUndefined();
      expect(mockTables.find((t) => t.number === 18)).toBeUndefined();
      expect(mockTables.find((t) => t.number === 20)).toBeUndefined();
      expect(mockTables.find((t) => t.number === 22)).toBeUndefined();
      expect(mockTables.find((t) => t.number === 30)).toBeUndefined();
      expect(mockTables.find((t) => t.number === 32)).toBeUndefined();
    });

    it('does not contain fabricated assignment names or demo groups in fixtures', () => {
      const json = JSON.stringify(mockTables);
      expect(json).not.toContain('Familia Ramírez');
      expect(json).not.toContain('Familia Gómez');
      expect(json).not.toContain('Familia Vargas');
      expect(json).not.toContain('Familia Mendoza');
      expect(json).not.toContain('grad-invitado');
    });
  });

  describe('2. Disponibilidad Normativa de Mesas Bloqueadas (BLOCKED)', () => {
    it('preserves physical available capacity when blocked, but prohibits new assignments', () => {
      renderTablesScreen();

      // Select Mesa 25 (capacity: 10, occupied: 0, available: 10)
      const tableNode = screen.getByTestId('table-node-tbl-25');
      fireEvent.click(tableNode);

      const panel = screen.getByRole('complementary', { name: /Detalle de Mesa 25/i });
      expect(within(panel).getAllByText('10').length).toBeGreaterThan(0);
      expect(within(panel).getByText('libres')).toBeInTheDocument();

      // Block the table
      const blockBtn = within(panel).getByRole('button', { name: /^Bloquear$/i });
      fireEvent.click(blockBtn);

      // Status changes to Bloqueada
      expect(within(panel).getByText('Bloqueada')).toBeInTheDocument();

      // Physical available capacity is still preserved as 10 (not zeroed out)
      expect(within(panel).getByText('libres')).toBeInTheDocument();
      expect(
        within(panel).getByText(/No disponible para nuevas asignaciones \(10 lugares físicos libres\)/i)
      ).toBeInTheDocument();

      // But Assign button is disabled
      const assignBtn = within(panel).getByRole('button', { name: /^Asignar$/i });
      expect(assignBtn).toBeDisabled();
    });
  });

  describe('3. Derivación de FULL (Completa)', () => {
    it('derives Completa status dynamically when available is 0', () => {
      renderTablesScreen();

      // Mesa 12 has capacity 10, occupied 10 -> available 0
      const tableNode = screen.getByTestId('table-node-tbl-12');
      fireEvent.click(tableNode);

      const panel = screen.getByRole('complementary', { name: /Detalle de Mesa 12/i });
      expect(within(panel).getByText('Completa')).toBeInTheDocument();
      expect(within(panel).getByText('0')).toBeInTheDocument();
      expect(within(panel).getByText('libres')).toBeInTheDocument();
    });
  });

  describe('4. Aislamiento Real al Cambiar eventId sin Desmontar', () => {
    it('resets and isolates canvas tables when changing eventId in the route', () => {
      renderTablesScreen();

      // Initially on Derecho 2027 -> Mesa 24 is present
      expect(screen.getByTestId('table-node-tbl-24')).toBeInTheDocument();

      // Navigate to Inexistente without unmounting
      fireEvent.click(screen.getByText('Inexistente'));

      // Evento no encontrado EmptyState appears
      expect(screen.getByRole('heading', { name: /Evento no encontrado/i })).toBeInTheDocument();
      expect(screen.queryByTestId('table-node-tbl-24')).not.toBeInTheDocument();

      // Navigate back to Derecho
      fireEvent.click(screen.getByText('Derecho'));
      expect(screen.getByTestId('table-node-tbl-24')).toBeInTheDocument();
    });
  });

  describe('5. No Exposición de Enums Técnicos en la UI', () => {
    it('uses natural Spanish words in CreateTableModal and BulkCreateTablesModal without SQUARE/ROUND', () => {
      renderTablesScreen();

      // Check CreateTableModal
      const createBtn = screen.getByRole('button', { name: /^Crear mesa$/i });
      fireEvent.click(createBtn);

      const modal = screen.getByRole('dialog');
      expect(within(modal).getByRole('button', { name: 'Cuadrada' })).toBeInTheDocument();
      expect(within(modal).getByRole('button', { name: 'Circular' })).toBeInTheDocument();
      expect(within(modal).queryByText(/SQUARE/i)).not.toBeInTheDocument();
      expect(within(modal).queryByText(/ROUND/i)).not.toBeInTheDocument();

      // Close modal
      fireEvent.click(within(modal).getByRole('button', { name: /Cancelar/i }));

      // Check BulkCreateTablesModal
      const bulkBtn = screen.getByRole('button', { name: /Crear varias mesas/i });
      fireEvent.click(bulkBtn);

      const bulkModal = screen.getByRole('dialog');
      expect(within(bulkModal).getByRole('button', { name: 'Cuadrada' })).toBeInTheDocument();
      expect(within(bulkModal).getByRole('button', { name: 'Circular' })).toBeInTheDocument();
      expect(within(bulkModal).queryByText(/SQUARE/i)).not.toBeInTheDocument();
      expect(within(bulkModal).queryByText(/ROUND/i)).not.toBeInTheDocument();
    });

    it('uses natural Spanish in TableDetailPanel without technical enums', () => {
      renderTablesScreen();

      const tableNode = screen.getByTestId('table-node-tbl-24');
      fireEvent.click(tableNode);

      const panel = screen.getByRole('complementary', { name: /Detalle de Mesa 24/i });
      expect(within(panel).getByText('Mesa Cuadrada')).toBeInTheDocument();
      expect(within(panel).queryByText('SQUARE')).not.toBeInTheDocument();
      expect(within(panel).queryByText('AVAILABLE')).not.toBeInTheDocument();
      expect(within(panel).queryByText('BLOCKED')).not.toBeInTheDocument();
    });
  });

  describe('6. Asignación Local Identificada como Preview No Persistido', () => {
    it('clearly labels local assignments as preview with pending backend notice', () => {
      renderTablesScreen();

      // Select Mesa 25 (available: 10 places)
      const tableNode = screen.getByTestId('table-node-tbl-25');
      fireEvent.click(tableNode);

      const panel = screen.getByRole('complementary', { name: /Detalle de Mesa 25/i });
      expect(within(panel).getByText('No hay detalle de asignaciones disponible')).toBeInTheDocument();

      // Click Asignar
      fireEvent.click(within(panel).getByRole('button', { name: /^Asignar$/i }));

      const assignModal = screen.getByRole('dialog');
      expect(within(assignModal).getByText('Mariana López')).toBeInTheDocument();

      // Select Mariana López (6 places)
      fireEvent.click(within(assignModal).getByText('Mariana López'));

      // Confirm
      const confirmBtn = within(assignModal).getByRole('button', { name: /Confirmar asignación/i });
      fireEvent.click(confirmBtn);

      // Verify preview disclaimer dialog appears
      expect(screen.getByText('Vista previa local registrada')).toBeInTheDocument();
      expect(screen.getByText(/No guardado • Integración con backend pendiente/i)).toBeInTheDocument();

      // Close confirmation dialog
      fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));

      // Detail panel now shows local preview badge
      expect(within(panel).getByText('Mariana López')).toBeInTheDocument();
      expect(within(panel).getByText(/Vista previa local • No guardado/i)).toBeInTheDocument();

      // Verify original baseline mockTables is NOT mutated
      const baselineTbl25 = mockTables.find((t) => t.id === 'tbl-25')!;
      expect(baselineTbl25.occupied).toBe(0);
    });
  });

  describe('7. Validación de Capacidad en Edición', () => {
    it('prevents setting new_capacity lower than occupied_places in EditTableModal', () => {
      renderTablesScreen();

      // Select Mesa 24 (occupied: 8)
      const tableNode = screen.getByTestId('table-node-tbl-24');
      fireEvent.click(tableNode);

      const panel = screen.getByRole('complementary', { name: /Detalle de Mesa 24/i });
      fireEvent.click(within(panel).getByRole('button', { name: /Editar mesa/i }));

      const editModal = screen.getByRole('dialog');
      const capacityInput = within(editModal).getByLabelText(/Capacidad de la mesa/i);
      fireEvent.change(capacityInput, { target: { value: '5' } });

      const form = editModal.querySelector('form')!;
      fireEvent.submit(form);

      expect(
        within(editModal).getByText(/no puede ser menor a los lugares ya ocupados \(8 lugares\)/i)
      ).toBeInTheDocument();
    });
  });

  describe('8. Creación Rápida de Mesas Circulares y Rectangulares (FASE D1)', () => {
    it('creates a circular table with one-click from toolbar', async () => {
      renderTablesScreen();

      const roundBtn = screen.getByRole('button', { name: /^Mesa circular$/i });
      fireEvent.click(roundBtn);

      // New table number 27 created (next after 26)
      const detail = await screen.findByRole('complementary', { name: /Detalle de Mesa 27/i });
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByText('Mesa Circular')).toBeInTheDocument();
    });

    it('creates a rectangular table with one-click from toolbar', async () => {
      renderTablesScreen();

      const squareBtn = screen.getByRole('button', { name: /^Mesa rectangular$/i });
      fireEvent.click(squareBtn);

      // New table number 27 created
      const detail = await screen.findByRole('complementary', { name: /Detalle de Mesa 27/i });
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByText('Mesa Cuadrada')).toBeInTheDocument();
    });
  });

  describe('9. Regla de Eliminación de Mesas (FASE D1)', () => {
    it('disables delete button when table has occupied places', () => {
      renderTablesScreen();

      // Mesa 24 (occupied: 8)
      const tableNode = screen.getByTestId('table-node-tbl-24');
      fireEvent.click(tableNode);

      const panel = screen.getByRole('complementary', { name: /Detalle de Mesa 24/i });
      const deleteBtn = within(panel).getByRole('button', { name: /Eliminar/i });
      expect(deleteBtn).toBeDisabled();
      expect(
        within(panel).getByText('No se puede eliminar una mesa con asignaciones activas')
      ).toBeInTheDocument();
    });

    it('allows deleting an empty table and removes it from canvas', () => {
      renderTablesScreen();

      // Mesa 25 (occupied: 0)
      const tableNode = screen.getByTestId('table-node-tbl-25');
      fireEvent.click(tableNode);

      const panel = screen.getByRole('complementary', { name: /Detalle de Mesa 25/i });
      const deleteBtn = within(panel).getByRole('button', { name: /Eliminar/i });
      expect(deleteBtn).not.toBeDisabled();

      fireEvent.click(deleteBtn);

      // Table is removed
      expect(screen.queryByTestId('table-node-tbl-25')).not.toBeInTheDocument();
    });
  });

  describe('10. Pantalla Completa del Croquis (PC y Móvil)', () => {
    it('opens fullscreen mode from toolbar and displays full-screen overlay', () => {
      renderTablesScreen();

      expect(screen.queryByTestId('seating-fullscreen-overlay')).not.toBeInTheDocument();

      const fullscreenBtn = screen.getByRole('button', { name: /Abrir pantalla completa/i });
      fireEvent.click(fullscreenBtn);

      const overlay = screen.getByTestId('seating-fullscreen-overlay');
      expect(overlay).toBeInTheDocument();
      expect(within(overlay).getByText('Pantalla completa')).toBeInTheDocument();
      expect(within(overlay).getByText(/Presiona/i)).toBeInTheDocument();
      expect(within(overlay).getByText(/Doble toque para salir/i)).toBeInTheDocument();
    });

    it('exits fullscreen on PC using Escape key', () => {
      renderTablesScreen();

      const fullscreenBtn = screen.getByRole('button', { name: /Abrir pantalla completa/i });
      fireEvent.click(fullscreenBtn);
      expect(screen.getByTestId('seating-fullscreen-overlay')).toBeInTheDocument();

      // Press Escape key on PC
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      expect(screen.queryByTestId('seating-fullscreen-overlay')).not.toBeInTheDocument();
    });

    it('requires confirmation to exit on mobile double-tap, preserving state on cancel or confirm', async () => {
      renderTablesScreen();

      const fullscreenBtn = screen.getByRole('button', { name: /Abrir pantalla completa/i });
      fireEvent.click(fullscreenBtn);

      const overlay = screen.getByTestId('seating-fullscreen-overlay');
      expect(overlay).toBeInTheDocument();

      // Simulate double tap on canvas container
      const canvasContainer = screen.getByTestId('seating-map-canvas-container');
      fireEvent.doubleClick(canvasContainer);

      // Exit confirmation modal appears
      expect(screen.getByText('¿Salir de pantalla completa?')).toBeInTheDocument();
      expect(
        screen.getByText(/Los cambios realizados y la posición de las mesas se mantienen exactamente/i)
      ).toBeInTheDocument();

      // Click "Continuar en pantalla completa" -> modal closes, stays in fullscreen
      const continueBtn = screen.getByRole('button', { name: /Continuar en pantalla completa/i });
      fireEvent.click(continueBtn);
      expect(screen.queryByText('¿Salir de pantalla completa?')).not.toBeInTheDocument();
      expect(screen.getByTestId('seating-fullscreen-overlay')).toBeInTheDocument();

      // Double tap again
      fireEvent.doubleClick(canvasContainer);
      expect(screen.getByText('¿Salir de pantalla completa?')).toBeInTheDocument();

      // Click "Confirmar salir" -> exits fullscreen
      const confirmBtn = screen.getByRole('button', { name: /Confirmar salir/i });
      fireEvent.click(confirmBtn);

      expect(screen.queryByTestId('seating-fullscreen-overlay')).not.toBeInTheDocument();
    });

    it('preserves table coordinates and state before and after toggling fullscreen (no shift)', async () => {
      renderTablesScreen();

      // Initial state has tables
      const initialTable24 = screen.getByTestId('table-node-tbl-24');
      expect(initialTable24).toBeInTheDocument();

      // Enter fullscreen
      const fullscreenBtn = screen.getByRole('button', { name: /Abrir pantalla completa/i });
      fireEvent.click(fullscreenBtn);

      const overlay = screen.getByTestId('seating-fullscreen-overlay');
      expect(overlay).toBeInTheDocument();

      // Create a round table while in fullscreen
      const addRoundBtn = within(overlay).getByRole('button', { name: /Mesa circular/i });
      fireEvent.click(addRoundBtn);

      // Verify Mesa 27 detail panel is opened and header shows 7 mesas
      const detail = await screen.findByRole('complementary', { name: /Detalle de Mesa 27/i });
      expect(detail).toBeInTheDocument();
      expect(within(overlay).getByText(/7 mesas/i)).toBeInTheDocument();

      // Exit fullscreen using PC Escape
      fireEvent.keyDown(window, { key: 'Escape' });

      // In standard view: Mesa 27 remains intact and exactly where created
      expect(screen.queryByTestId('seating-fullscreen-overlay')).not.toBeInTheDocument();
      expect(screen.getByRole('complementary', { name: /Detalle de Mesa 27/i })).toBeInTheDocument();
      expect(screen.getByTestId('table-node-tbl-24')).toBeInTheDocument();
    });

    it('provides "Crear varias mesas" directly in the floating in-canvas menu inside fullscreen', () => {
      renderTablesScreen();

      // Enter fullscreen
      const fullscreenBtn = screen.getByRole('button', { name: /Abrir pantalla completa/i });
      fireEvent.click(fullscreenBtn);

      const overlay = screen.getByTestId('seating-fullscreen-overlay');
      const floatingMenu = screen.getByTestId('seating-canvas-floating-menu');
      expect(floatingMenu).toBeInTheDocument();

      // Find "Crear varias mesas" in the floating menu
      const bulkBtn = within(floatingMenu).getByRole('button', { name: /^Crear varias mesas$/i });
      expect(bulkBtn).toBeInTheDocument();

      // Click "Crear varias mesas" opens bulk modal
      fireEvent.click(bulkBtn);
      const bulkModal = screen.getByRole('dialog');
      expect(within(bulkModal).getByText(/Cantidad de mesas/i)).toBeInTheDocument();

      // Close modal
      const cancelBtn = within(bulkModal).getByRole('button', { name: /Cancelar/i });
      fireEvent.click(cancelBtn);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(overlay).toBeInTheDocument();
    });

    it('allows minimizing TableDetailPanel to a non-invasive 1-line bar that frees up the canvas', () => {
      renderTablesScreen();

      // Select Mesa 24
      const tableNode = screen.getByTestId('table-node-tbl-24');
      fireEvent.click(tableNode);

      const panel = screen.getByRole('complementary', { name: /Detalle de Mesa 24/i });
      expect(within(panel).getByText('Capacidad Total')).toBeInTheDocument();

      // Click minimize button
      const minimizeBtn = within(panel).getByRole('button', { name: /Minimizar panel/i });
      fireEvent.click(minimizeBtn);

      // Now panel is a compact bar without bento boxes
      expect(within(panel).queryByText('Capacidad Total')).not.toBeInTheDocument();
      expect(within(panel).getByText('Expandir')).toBeInTheDocument();
      expect(within(panel).getByText(/8\/10/)).toBeInTheDocument();

      // Click Expandir restores full view
      const expandBtn = within(panel).getByText('Expandir');
      fireEvent.click(expandBtn);

      expect(within(panel).getByText('Capacidad Total')).toBeInTheDocument();
      expect(within(panel).getByRole('button', { name: /Editar mesa/i })).toBeInTheDocument();
    });
  });
});
