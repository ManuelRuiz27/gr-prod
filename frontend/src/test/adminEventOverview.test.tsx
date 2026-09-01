import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventOverviewScreen } from '../pages/admin/AdminEventOverviewScreen';
import { mockGraduatesList, mockTables } from '../fixtures';

function renderOverview(initialEntry = '/admin/events/evt-derecho-2027') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin/events/:eventId" element={<AdminEventOverviewScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Event Overview Tests (VIS-06R1 / VS-A-EVT-003)', () => {
  it('1. Displays event name and natural status label "Abierto"', () => {
    renderOverview();

    expect(
      screen.getByRole('heading', { name: 'Graduación Facultad de Derecho 2027' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('Abierto').length).toBeGreaterThan(0);
  });

  it('2. Asserts legacy invented data and raw technical strings are NOT displayed', () => {
    const { container } = renderOverview();
    const textContent = container.textContent || '';

    // No raw enum
    expect(textContent).not.toMatch(/\bOPEN\b/);
    // No legacy placeholders
    expect(textContent).not.toContain('Generación');
    expect(textContent).not.toContain('$630,000');
    expect(textContent).not.toContain('18 / 26');
    expect(textContent).not.toContain('14 Solicitados');
  });

  it('3. Renders accurately derived metrics from fixtures', () => {
    renderOverview();

    const eventGrads = mockGraduatesList.filter((g) => g.eventId === 'evt-derecho-2027');
    const expectedGrads = eventGrads.length;
    const expectedPlaces = eventGrads.reduce((sum, g) => sum + g.ticketCount, 0);

    const totalTableCap = mockTables.reduce((sum, t) => sum + t.capacity, 0);
    const occupiedTableCap = mockTables.reduce((sum, t) => sum + t.occupied, 0);
    const expectedOccupancy = totalTableCap === 0 ? 0 : Math.round((occupiedTableCap / totalTableCap) * 100);

    expect(screen.getAllByText('Graduados').length).toBeGreaterThan(0);
    expect(screen.getByText(String(expectedGrads))).toBeInTheDocument();

    expect(screen.getByText('Lugares contratados')).toBeInTheDocument();
    expect(screen.getByText(String(expectedPlaces))).toBeInTheDocument();

    expect(screen.getByText('Ocupación de mesas')).toBeInTheDocument();
    expect(screen.getByText(`${expectedOccupancy}%`)).toBeInTheDocument();
  });

  it('4. Renders Resumen financiero section with placeholders', () => {
    renderOverview();

    expect(screen.getByRole('heading', { name: 'Resumen financiero' })).toBeInTheDocument();
    expect(screen.getByText('Recaudado')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Vencido')).toBeInTheDocument();

    expect(screen.getAllByText('—').length).toBe(3);
    expect(
      screen.getAllByText('Disponible al integrar el resumen financiero del evento.').length
    ).toBe(3);
  });

  it('5. Renders operational modules: Cartera, Mesas, Platillos, Termos, and Comprobantes pendientes', () => {
    renderOverview();

    // Cartera module
    expect(screen.getByRole('heading', { name: /^Cartera$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver cartera/i })).toBeInTheDocument();

    // Mesas module
    expect(screen.getByRole('heading', { name: /Mesas y croquis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver mesas/i })).toBeInTheDocument();

    // Platillos module
    expect(screen.getByRole('heading', { name: /^Platillos$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver platillos/i })).toBeInTheDocument();

    // Termos module
    expect(screen.getByRole('heading', { name: /^Termos$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver termos/i })).toBeInTheDocument();

    // Comprobantes pendientes module
    expect(screen.getByRole('heading', { name: /Comprobantes pendientes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver comprobantes/i })).toBeInTheDocument();
  });

  it('6. Renders available actions for OPEN status and handles close transition feedback', () => {
    renderOverview();

    const closeBtn = screen.getByRole('button', { name: 'Cerrar evento' });
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar evento' });

    expect(closeBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    // Click Cerrar evento
    fireEvent.click(closeBtn);
    expect(screen.getByRole('heading', { name: 'Cerrar evento' })).toBeInTheDocument();
    expect(screen.getAllByText('Graduación Facultad de Derecho 2027').length).toBeGreaterThan(0);

    // Confirm close
    const confirmCloseBtn = screen.getAllByRole('button', { name: 'Cerrar evento' })[1];
    fireEvent.click(confirmCloseBtn);

    expect(
      screen.getByText('La transición quedará disponible al integrar el backend.')
    ).toBeInTheDocument();
  });

  it('7. Handles cancel transition and requires a cancellation reason', () => {
    renderOverview();

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar evento' });
    fireEvent.click(cancelBtn);

    expect(screen.getByRole('heading', { name: 'Cancelar evento' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Motivo de cancelación/i)).toBeInTheDocument();

    // Click confirm without reason
    const confirmCancelBtn = screen.getAllByRole('button', { name: 'Cancelar evento' })[1];
    fireEvent.click(confirmCancelBtn);

    expect(screen.getByText('Ingresa el motivo de cancelación.')).toBeInTheDocument();

    // Fill reason and confirm
    const reasonInput = screen.getByLabelText(/Motivo de cancelación/i);
    fireEvent.change(reasonInput, { target: { value: 'Cancelación solicitada por el comité' } });
    fireEvent.click(confirmCancelBtn);

    expect(
      screen.getByText('La transición quedará disponible al integrar el backend.')
    ).toBeInTheDocument();
  });

  it('8. Renders EmptyState when navigating to non-existent event', () => {
    renderOverview('/admin/events/no-existe');

    expect(screen.getAllByText('Evento no encontrado').length).toBeGreaterThan(0);
    expect(screen.getByText('No encontramos el evento solicitado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a eventos' })).toBeInTheDocument();
  });
});
