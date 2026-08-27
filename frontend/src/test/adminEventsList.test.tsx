import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventsScreen } from '../pages/admin/AdminEventsScreen';
import { CreateEventWizardScreen } from '../pages/admin/event-create/CreateEventWizardScreen';

function renderAdminEventsScreen(initialEntry = '/admin/events') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin/events" element={<AdminEventsScreen />} />
        <Route path="/admin/events/new" element={<CreateEventWizardScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Events List Tests (FRONTEND-03A & FRONTEND-03A-R1)', () => {
  it('1. Initial Render: displays "Eventos", the event name, and natural status label "Abierto"', () => {
    renderAdminEventsScreen();

    expect(screen.getByRole('heading', { name: /^Eventos$/i })).toBeInTheDocument();
    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();
    expect(screen.getAllByText('Abierto').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('2. Asserts unsupported and technical fields are NOT rendered in the table view', () => {
    const { container } = renderAdminEventsScreen();
    const textContent = container.textContent || '';

    // No raw enum strings
    expect(textContent).not.toMatch(/\bOPEN\b/);
    // No legacy/unsupported fields in this screen
    expect(textContent).not.toContain('Generación 2027');
    expect(textContent).not.toContain('Licenciatura en Derecho');
    expect(textContent).not.toContain('Evento Operativo');
  });

  it('3. Search: filters events correctly by name or venue, showing EmptyState on no match', () => {
    renderAdminEventsScreen();

    const searchInput = screen.getByLabelText('Buscar eventos');

    // Matching venue
    fireEvent.change(searchInput, { target: { value: 'Convenciones' } });
    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();

    // Non-matching query
    fireEvent.change(searchInput, { target: { value: 'Evento inexistente' } });
    expect(screen.getByText('No se encontraron eventos')).toBeInTheDocument();
    expect(
      screen.getByText('Ajusta la búsqueda o los filtros para ver otros resultados.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Graduación Facultad de Derecho 2027')).not.toBeInTheDocument();
  });

  it('4. Status filter pills: filters by status and recovers when selecting matching status', () => {
    renderAdminEventsScreen();

    const cerradoPill = screen.getByRole('button', { name: 'Cerrado' });
    fireEvent.click(cerradoPill);

    expect(screen.getByText('No se encontraron eventos')).toBeInTheDocument();

    const abiertoPill = screen.getByRole('button', { name: 'Abierto' });
    fireEvent.click(abiertoPill);

    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();
    expect(screen.queryByText('No se encontraron eventos')).not.toBeInTheDocument();
  });

  it('5. Navigation to wizard: clicking "Crear evento" opens wizard with heading and "Paso 1 de 5"', () => {
    renderAdminEventsScreen();

    const createBtn = screen.getByRole('button', { name: /Crear evento/i });
    fireEvent.click(createBtn);

    expect(screen.getByRole('heading', { name: /Crear evento/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Paso 1 de 5/i).length).toBeGreaterThan(0);
  });
});
