import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminGraduateOverviewScreen } from '../pages/admin/graduates/AdminGraduateOverviewScreen';
import { AdminEventGraduatesListScreen } from '../pages/admin/graduates/AdminEventGraduatesListScreen';

function renderGraduateOverview(
  initialEntry = '/admin/events/evt-derecho-2027/graduates/grad-andrea-martinez'
) {
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

describe('Admin Graduate Overview Tests (FRONTEND-03D-A)', () => {
  it('1. Displays Andrea Martinez info: name, email, places, Mesa 24, group count, and Bloqueado', () => {
    renderGraduateOverview();

    expect(screen.getByRole('heading', { name: 'Andrea Martínez' })).toBeInTheDocument();
    expect(screen.getByText('andrea.martinez@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument(); // ticketCount
    expect(screen.getByText('Mesa 24')).toBeInTheDocument();
    expect(screen.getByText('8 integrantes')).toBeInTheDocument();
    expect(screen.getAllByText(/Bloqueado/i).length).toBeGreaterThan(0);
  });

  it('2. Displays Resumen financiero section', () => {
    renderGraduateOverview();

    expect(screen.getByRole('heading', { name: 'Resumen financiero' })).toBeInTheDocument();
    expect(screen.getByText('Contratado')).toBeInTheDocument();
    expect(screen.getByText('Pagado')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Vencido')).toBeInTheDocument();
  });

  it('3. Does NOT display invented financial amounts, rendering "—" placeholders and single helper', () => {
    renderGraduateOverview();

    expect(screen.getAllByText('—').length).toBe(4);
    expect(
      screen.getAllByText('Disponible al integrar el expediente financiero.').length
    ).toBe(1);
    expect(screen.getByText('Lugares contratados')).toBeInTheDocument();
  });


  it('4. Does NOT display raw enum strings (LOCKED, IN_PRODUCTION, AVAILABLE)', () => {
    const { container } = renderGraduateOverview();
    const textContent = container.textContent || '';

    expect(textContent).not.toMatch(/\bLOCKED\b/);
    expect(textContent).not.toMatch(/\bIN_PRODUCTION\b/);
    expect(textContent).not.toMatch(/\bAVAILABLE\b/);
  });

  it('5. Displays members of the group and meal types', () => {
    renderGraduateOverview();

    expect(screen.getByRole('heading', { name: 'Grupo' })).toBeInTheDocument();
    expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
    expect(screen.getAllByText('Tradicional').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vegano').length).toBeGreaterThan(0);
  });

  it('6. Does NOT display seat/silla/asiento numbering in group preview', () => {
    const { container } = renderGraduateOverview();
    const textContent = container.textContent || '';

    expect(textContent).not.toMatch(/\basiento\b/i);
    expect(textContent).not.toMatch(/\bsilla\b/i);
    expect(textContent).not.toMatch(/\bseat\b/i);
  });

  it('7. Displays EmptyState when graduateId does not exist', () => {
    renderGraduateOverview('/admin/events/evt-derecho-2027/graduates/no-existe');

    expect(screen.getAllByText('Graduado no encontrado').length).toBeGreaterThan(0);
    expect(
      screen.getByText('No encontramos este graduado dentro del evento.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a graduados' })).toBeInTheDocument();
  });

  it('8. A graduate belonging to another eventId cannot be resolved under current event', () => {
    // Andrea is in evt-derecho-2027, trying to access under evt-otro-evento
    renderGraduateOverview('/admin/events/evt-otro-evento/graduates/grad-andrea-martinez');

    expect(screen.getAllByText('Graduado no encontrado').length).toBeGreaterThan(0);
  });
});
