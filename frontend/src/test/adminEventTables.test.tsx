import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { AdminEventTablesScreen } from '../pages/admin/AdminEventTablesScreen';
import { testSeatingGateway } from './fixtures/presetSeatingFixture';

afterEach(cleanup);
describe('Admin preset seating', () => {
  it('shows the bundled preview and omits editing, import and catalog controls', async () => {
    render(<MemoryRouter initialEntries={['/admin/events/event-a/tables']}><Routes><Route path="/admin/events/:eventId/tables" element={<AdminEventTablesScreen />} /></Routes></MemoryRouter>);
    expect(await screen.findByText(/Vista previa: capacidades pendientes/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Crear|Cargar|Detectar|Fondo|Editar|Eliminar|Importar/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('preset-table-100'));
    expect(screen.getByRole('heading', { name: 'Mesa 100' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar lugares' })).not.toBeInTheDocument();
  });
  it('does not invent an event when route context is absent', () => {
    render(<MemoryRouter><AdminEventTablesScreen /></MemoryRouter>);
    expect(screen.getByText('Abre un evento para consultar su croquis.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Mesas del evento')).not.toBeInTheDocument();
  });
  it('consults operational counts without graduate quantity mutations', async () => {
    render(<MemoryRouter initialEntries={['/admin/events/test-event/tables']}><Routes><Route path="/admin/events/:eventId/tables" element={<AdminEventTablesScreen gateway={testSeatingGateway()} />} /></Routes></MemoryRouter>);
    fireEvent.click(await screen.findByTestId('preset-table-1'));
    expect(screen.getByText('9 lugares ocupados · 15 en total')).toBeInTheDocument();
    expect(screen.queryByLabelText('Lugares en esta mesa')).not.toBeInTheDocument();
  });
  it('clears selections when navigating to another event', async () => {
    render(<MemoryRouter initialEntries={['/admin/events/a/tables']}><Link to="/admin/events/b/tables">Otro evento</Link><Routes><Route path="/admin/events/:eventId/tables" element={<AdminEventTablesScreen />} /></Routes></MemoryRouter>);
    fireEvent.click(await screen.findByTestId('preset-table-24'));
    fireEvent.click(screen.getByRole('link', { name: 'Otro evento' }));
    await screen.findByTestId('preset-table-24');
    expect(screen.getByTestId('preset-table-24')).toHaveAttribute('aria-pressed', 'false');
  });
});
