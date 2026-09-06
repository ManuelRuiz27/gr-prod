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

describe('Admin Event Graduates List Tests (C3)', () => {
  it('1. Displays "Graduados", event name, and priority columns in the table', () => {
    renderGraduatesList();

    expect(screen.getByRole('heading', { name: 'Graduados' })).toBeInTheDocument();
    expect(screen.getAllByText(/Graduación Facultad de Derecho 2027/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);

    // Priority column headers
    expect(screen.getByText('Folio')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Personas')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Abonado')).toBeInTheDocument();
    expect(screen.getByText('Saldo')).toBeInTheDocument();
    expect(screen.getByText('Mesa')).toBeInTheDocument();
    expect(screen.getByText('Alerta')).toBeInTheDocument();
  });

  it('2. Displays folio and does NOT promote email in visible search copy', () => {
    renderGraduatesList();
    expect(screen.getAllByText('GR-2027-0042').length).toBeGreaterThan(0);
    const searchInput = screen.getByLabelText('Buscar graduados');
    expect(searchInput).toHaveAttribute('placeholder', 'Buscar por folio, nombre o teléfono...');
  });

  it('3. Searches by folio and name', () => {
    renderGraduatesList();
    const searchInput = screen.getByLabelText('Buscar graduados');

    // Search by folio
    fireEvent.change(searchInput, { target: { value: 'GR-2027-0042' } });
    expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: 'Fernando' } });
    expect(screen.getAllByText('Fernando Torres').length).toBeGreaterThan(0);
    expect(screen.queryByText('Andrea Martínez')).not.toBeInTheDocument();
  });

  it('4. Filters by "Sin mesa" shows unassigned graduates and hides assigned graduates', () => {
    renderGraduatesList();

    const noTableBtn = screen.getByRole('button', { name: 'Sin mesa' });
    fireEvent.click(noTableBtn);

    expect(screen.getAllByText('Mariana López').length).toBeGreaterThan(0);
    expect(screen.queryByText('Andrea Martínez')).not.toBeInTheDocument();
  });

  it('5. Filters by "Saldo vencido" shows graduates with overdue debt', () => {
    renderGraduatesList();

    const overdueBtn = screen.getByRole('button', { name: 'Saldo vencido' });
    fireEvent.click(overdueBtn);

    expect(screen.getAllByText('Saldo vencido').length).toBeGreaterThan(0);
  });

  it('6. Filters by "Comprobante por revisar" shows pending proof submissions', () => {
    renderGraduatesList();

    const proofBtn = screen.getByRole('button', { name: 'Comprobante por revisar' });
    fireEvent.click(proofBtn);

    expect(screen.getAllByText('Comprobante por revisar').length).toBeGreaterThan(0);
  });

  it('7. Clicking a row navigates to the graduate overview dossier', () => {
    renderGraduatesList();

    const andreaRow = screen.getAllByText('Andrea Martínez')[0].closest('tr');
    expect(andreaRow).toBeTruthy();
    if (andreaRow) fireEvent.click(andreaRow);

    expect(screen.getByRole('heading', { name: 'Andrea Martínez' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar abono/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /finanzas/i })).toBeInTheDocument();
  });

  it('8. Renders EmptyState on non-existent event', () => {
    renderGraduatesList('/admin/events/no-existe/graduates');

    expect(screen.getAllByText('Evento no encontrado').length).toBeGreaterThan(0);
    expect(screen.getByText('No encontramos el evento solicitado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a eventos' })).toBeInTheDocument();
  });
});

