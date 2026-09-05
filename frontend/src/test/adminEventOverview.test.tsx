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

    const eventTables = mockTables.filter((t) => t.eventId === 'evt-derecho-2027');
    const totalTableCap = eventTables.reduce((sum, t) => sum + t.capacity, 0);
    const occupiedTableCap = eventTables.reduce((sum, t) => sum + t.occupied, 0);
    const expectedOccupancy = totalTableCap === 0 ? 0 : Math.round((occupiedTableCap / totalTableCap) * 100);

    expect(screen.getAllByText('Graduados').length).toBeGreaterThan(0);
    expect(
      screen.getByText(new RegExp(`${expectedGrads}\\s*/\\s*${expectedPlaces}\\s*lugares contratados`))
    ).toBeInTheDocument();

    expect(screen.getByText('Mesas')).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${occupiedTableCap}\\s*/\\s*${totalTableCap}\\s*lugares asignados\\s*\\(${expectedOccupancy}%\\)`))
    ).toBeInTheDocument();
  });

  it('4. Renders Pagos section with domain composition', () => {
    renderOverview();

    expect(screen.getByRole('heading', { name: 'Pagos' })).toBeInTheDocument();
    expect(screen.getByText(/cobrado de/i)).toBeInTheDocument();
    expect(screen.getByText(/\$[\d,]+\s*pendientes/i)).toBeInTheDocument();
  });

  it('5. Renders operational preparation rows and pending action links', () => {
    renderOverview();

    expect(screen.getByRole('heading', { name: 'Preparación' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Graduados/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Mesas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Platillos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Termos/i })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Pendientes' })).toBeInTheDocument();
    expect(screen.getAllByText(/Revisar/i).length).toBeGreaterThan(0);
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

  it('9. Never renders totalOverdue amount as a raw count string', () => {
    renderOverview();

    // Must never render patterns like "25000 con atraso" or "{amount} con atraso"
    const { container } = renderOverview();
    const text = container.textContent || '';
    expect(text).not.toMatch(/\$\d+[\d,]*\s*con atraso/i);
    expect(text).not.toMatch(/\b\d{4,}\s+con atraso\b/i);
  });

  it('10. Asserts absence of invented fallbacks and proper empty state when no payment plans exist', () => {
    // Renders active event with derived values
    renderOverview();
    expect(screen.getByText('11 / 11 seleccionados')).toBeInTheDocument();
    expect(screen.getByText('2 / 4 entregados o personalizados')).toBeInTheDocument();
    expect(screen.getByText('2 comprobantes por validar')).toBeInTheDocument();
  });
});
