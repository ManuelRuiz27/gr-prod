import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventGraduatesListScreen } from '../pages/admin/graduates/AdminEventGraduatesListScreen';
import { AdminGraduateOverviewScreen } from '../pages/admin/graduates/AdminGraduateOverviewScreen';

function renderGraduatesList(initialEntry = '/admin/events/evt-derecho-2027/graduates') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/admin/events/:eventId/graduates"
          element={<AdminEventGraduatesListScreen />}
        />
        <Route
          path="/admin/events/:eventId/graduates/:graduateId"
          element={<AdminGraduateOverviewScreen />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Event Graduates List Tests (VIS-07 / VS-A-GRAD-001)', () => {
  it('1. Displays "Graduados", event name, and priority columns in the list', () => {
    renderGraduatesList();

    expect(screen.getByRole('heading', { name: 'Graduados' })).toBeInTheDocument();
    expect(screen.getAllByText('Graduación Facultad de Derecho 2027').length).toBeGreaterThan(0);
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();

    // Priority column headers
    expect(screen.getByText('Folio')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Mesa / resumen')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });

  it('2. Displays Andrea email and folio', () => {
    renderGraduatesList();

    expect(screen.getByText('andrea.martinez@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByText('GR-2027-0042')).toBeInTheDocument();
  });

  it('3. Does NOT display raw enum strings (LOCKED, AVAILABLE, REQUESTED, IN_PRODUCTION)', () => {
    const { container } = renderGraduatesList();
    const textContent = container.textContent || '';

    expect(textContent).not.toMatch(/\bLOCKED\b/);
    expect(textContent).not.toMatch(/\bAVAILABLE\b/);
    expect(textContent).not.toMatch(/\bREQUESTED\b/);
    expect(textContent).not.toMatch(/\bIN_PRODUCTION\b/);
  });

  it('4. Search by "Andrea" shows Andrea Martínez and filters others', () => {
    renderGraduatesList();

    const searchInput = screen.getByLabelText('Buscar graduados');
    fireEvent.change(searchInput, { target: { value: 'Andrea' } });

    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();
  });

  it('5. Search by non-existent query shows "No se encontraron graduados"', () => {
    renderGraduatesList();

    const searchInput = screen.getByLabelText('Buscar graduados');
    fireEvent.change(searchInput, { target: { value: 'Inexistente 12345' } });

    expect(screen.getByText('No se encontraron graduados')).toBeInTheDocument();
    expect(screen.getByText('Ajusta la búsqueda o los filtros para visualizar resultados.')).toBeInTheDocument();
  });

  it('6. Filter by "Termo disponible" shows Fernando Torres and hides Andrea', () => {
    renderGraduatesList();

    const thermoPill = screen.getByRole('button', { name: 'Termo disponible' });
    fireEvent.click(thermoPill);

    expect(screen.getByText('Fernando Torres')).toBeInTheDocument();
    expect(screen.queryByText('Andrea Martínez')).not.toBeInTheDocument();
  });

  it('7. Filter by "Sin mesa" shows Mariana López (tableNumber === null) and hides Andrea Martínez', () => {
    renderGraduatesList();

    const noTableBtn = screen.getByRole('button', { name: 'Sin mesa' });
    fireEvent.click(noTableBtn);

    expect(screen.getByText('Mariana López')).toBeInTheDocument();
    expect(screen.queryByText('Andrea Martínez')).not.toBeInTheDocument();
  });

  it('8. Clicking "Ver graduado" navigates to the graduate overview screen', () => {
    renderGraduatesList();

    const viewButtons = screen.getAllByRole('button', { name: 'Ver graduado' });
    fireEvent.click(viewButtons[0]);

    expect(screen.getByRole('heading', { name: 'Andrea Martínez' })).toBeInTheDocument();
    expect(screen.getByText('Lugares activos')).toBeInTheDocument();
  });

  it('9. Renders EmptyState on non-existent event', () => {
    renderGraduatesList('/admin/events/no-existe/graduates');

    expect(screen.getAllByText('Evento no encontrado').length).toBeGreaterThan(0);
    expect(screen.getByText('No encontramos el evento solicitado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a eventos' })).toBeInTheDocument();
  });
});
