import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AuthProvider } from '../../context/AuthContext';

describe('Shell ADMIN — AdminSidebar', () => {
  it('renders global admin navigation: Inicio, Eventos, Graduados, Pagos, Reportes, Más', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <AdminSidebar />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByText('Graduados')).toBeInTheDocument();
    expect(screen.getByText('Pagos')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
    expect(screen.getByText('Más')).toBeInTheDocument();
  });

  it('renders account area with ADMIN role indicator and logout button', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <AdminSidebar />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByLabelText(/cerrar sesión/i)).toBeInTheDocument();
  });

  it('calls onNavigate callback when navigation link is clicked', () => {
    const handleNavigate = vi.fn();
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <AdminSidebar onNavigate={handleNavigate} />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Eventos'));
    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });
});
