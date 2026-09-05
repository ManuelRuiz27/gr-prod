import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminDashboardScreen } from '../pages/admin/AdminDashboardScreen';
import { AuthProvider } from '../context/AuthContext';

const renderDashboard = (props = {}) => render(
  <AuthProvider><MemoryRouter initialEntries={['/admin']}><Routes><Route path="/admin" element={<AdminDashboardScreen {...props} />} /></Routes></MemoryRouter></AuthProvider>,
);

describe('Admin dashboard UI v2', () => {
  it('renders a concise operational overview with inline metrics', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: /buenas tardes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nuevo evento/i })).toBeInTheDocument();
    expect(screen.getByText('cobrado')).toBeInTheDocument();
    expect(screen.getByText('pendiente')).toBeInTheDocument();
    expect(screen.getByText('vencido')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /próximos eventos/i })).toBeInTheDocument();
    expect(screen.queryByText(/accesos rápidos/i)).not.toBeInTheDocument();
  });

  it('keeps the empty, loading and partial-error states', () => {
    const { unmount } = renderDashboard({ eventsOverride: [] });
    expect(screen.getByText(/aún no hay eventos/i)).toBeInTheDocument();
    unmount();
    renderDashboard({ partialError: 'Falla temporal al sincronizar cartera bancaria' });
    expect(screen.getByText('Falla temporal al sincronizar cartera bancaria')).toBeInTheDocument();
  });
});
