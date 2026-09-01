import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GraduateLayout } from './GraduateLayout';
import { AuthProvider } from '../../context/AuthContext';

describe('Shell GRADUATE — GraduateLayout Integration', () => {
  it('renders skip link, header, main content, and bottom navigation on /graduate', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/graduate']}>
          <Routes>
            <Route path="/graduate" element={<GraduateLayout />}>
              <Route index element={<div>Graduate Home Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/saltar al contenido principal/i)).toBeInTheDocument();
    expect(screen.getByText('Graduate Home Content')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'graduate-main-content');
    expect(screen.getByRole('navigation', { name: /navegación inferior/i })).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Mi grupo')).toBeInTheDocument();
    expect(screen.getByText('Pagos')).toBeInTheDocument();
    expect(screen.getByText('Más')).toBeInTheDocument();
  });

  it('renders subroute title and back button on secondary routes', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/graduate/table']}>
          <Routes>
            <Route path="/graduate" element={<GraduateLayout />}>
              <Route path="table" element={<div>Table View</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Asignación de Mesa')).toBeInTheDocument();
    expect(screen.getByLabelText(/volver a la vista principal/i)).toBeInTheDocument();
    expect(screen.getByText('Table View')).toBeInTheDocument();
  });

  it('supports deep links into /graduate/payments directly', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/graduate/payments']}>
          <Routes>
            <Route path="/graduate" element={<GraduateLayout />}>
              <Route path="payments" element={<div>Payments View Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Payments View Content')).toBeInTheDocument();
    const paymentsTab = screen.getByText('Pagos').closest('a');
    expect(paymentsTab).toHaveAttribute('aria-current', 'page');
  });
});
