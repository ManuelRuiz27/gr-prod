import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminDashboardScreen } from '../pages/admin/AdminDashboardScreen';
import { AuthProvider } from '../context/AuthContext';

const renderDashboard = (props = {}) => render(
  <AuthProvider>
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminDashboardScreen {...props} />} />
        <Route path="/admin/events/:eventId/graduates/:graduateId" element={<div data-testid="grad-detail">Expediente</div>} />
        <Route path="/admin/events/:eventId/payments" element={<div data-testid="payments-queue">Cola de pagos</div>} />
      </Routes>
    </MemoryRouter>
  </AuthProvider>,
);

describe('Admin Dashboard Operational Inbox (C1)', () => {
  it('does NOT display 5 global KPIs', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: /buenas tardes/i })).toBeInTheDocument();
    expect(screen.queryByText('eventos activos')).not.toBeInTheDocument();
    expect(screen.queryByText('graduados')).not.toBeInTheDocument();
    expect(screen.queryByText('cobrado')).not.toBeInTheDocument();
    expect(screen.queryByText('pendiente')).not.toBeInTheDocument();
    expect(screen.queryByText('vencido')).not.toBeInTheDocument();
  });

  it('renders quick operational actions: Registrar abono, Revisar comprobantes, + Evento', () => {
    renderDashboard();
    expect(screen.getByRole('button', { name: /registrar abono/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /revisar comprobantes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ evento/i })).toBeInTheDocument();
  });

  it('searches globally by folio and displays matching graduate result', () => {
    renderDashboard();
    const searchInput = screen.getByLabelText(/buscar graduado/i);
    fireEvent.change(searchInput, { target: { value: 'GR-2027-0042' } });

    expect(screen.getByText('GR-2027-0042')).toBeInTheDocument();
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
  });

  it('searches globally by name and matches correctly without false identity', () => {
    renderDashboard();
    const searchInput = screen.getByLabelText(/buscar graduado/i);
    fireEvent.change(searchInput, { target: { value: 'Andrea' } });

    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
    expect(screen.queryByText('Carlos Martínez')).not.toBeInTheDocument();
  });

  it('displays real operational pending items linking to review', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: /pendientes/i })).toBeInTheDocument();
    expect(screen.getByText(/comprobantes por revisar/i)).toBeInTheDocument();
    const reviewLinks = screen.getAllByRole('link', { name: /revisar →/i });
    expect(reviewLinks.length).toBeGreaterThan(0);
  });

  it('preserves empty and partial error states', () => {
    const { unmount } = renderDashboard({ eventsOverride: [] });
    expect(screen.getByText(/aún no hay eventos/i)).toBeInTheDocument();
    unmount();
    renderDashboard({ partialError: 'Falla temporal al sincronizar cartera bancaria' });
    expect(screen.getByText('Falla temporal al sincronizar cartera bancaria')).toBeInTheDocument();
  });
});

