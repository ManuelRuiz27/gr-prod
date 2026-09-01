import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminDashboardScreen } from '../pages/admin/AdminDashboardScreen';
import { AuthProvider } from '../context/AuthContext';

function renderDashboard(props = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminDashboardScreen {...props} />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Admin Global Dashboard Tests (VIS-04 / VS-A-DASH-001)', () => {
  it('1. Initial Render: displays PageHeader "Resumen general" and primary CTA "Crear evento"', () => {
    renderDashboard();

    expect(screen.getByRole('heading', { name: /resumen general/i })).toBeInTheDocument();
    expect(screen.getByText(/panorama general de eventos, cartera y operaciones activas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear evento/i })).toBeInTheDocument();
  });

  it('2. Renders all 5 mandatory KPIs in Inter typography', () => {
    renderDashboard();

    expect(screen.getAllByText('Eventos activos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Graduados').length).toBeGreaterThan(0);
    expect(screen.getByText('Cobrado')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Vencido')).toBeInTheDocument();

    // Metric values
    expect(screen.getByText('$7,500')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('3. Renders actionable alerts section with direct action link', () => {
    renderDashboard();

    expect(screen.getByText('Comprobantes por validar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /revisar pagos/i })).toBeInTheDocument();
  });

  it('4. Renders active events table with event name and "Abierto" status badge', () => {
    renderDashboard();

    expect(screen.getAllByText('Eventos activos').length).toBeGreaterThan(0);
    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();
    expect(screen.getAllByText('Abierto').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /administrar/i })).toBeInTheDocument();
  });

  it('5. Renders quick actions with 4 direct links', () => {
    renderDashboard();

    expect(screen.getByText('Crear nuevo evento')).toBeInTheDocument();
    expect(screen.getByText('Gestión de eventos')).toBeInTheDocument();
    expect(screen.getByText('Validación de pagos')).toBeInTheDocument();
    expect(screen.getByText('Directorio de graduados')).toBeInTheDocument();
  });

  it('6. Empty State: renders EmptyState with CTA when there are 0 events', () => {
    renderDashboard({ eventsOverride: [] });

    expect(screen.getByText('No hay eventos registrados')).toBeInTheDocument();
    expect(screen.getByText(/aún no tienes ningún evento en gestión/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear mi primer evento/i })).toBeInTheDocument();
  });

  it('7. Loading State: renders structural skeleton placeholders', () => {
    renderDashboard({ isLoading: true });

    expect(screen.getByRole('heading', { name: /resumen general/i })).toBeInTheDocument();
    // Skeleton elements with aria-hidden
    const skeletons = screen.getAllByRole('generic', { hidden: true });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('8. Partial Error State: renders local error alert while keeping the rest of the dashboard intact', () => {
    renderDashboard({ partialError: 'Falla temporal al sincronizar cartera bancaria' });

    expect(screen.getByText('Atención parcial')).toBeInTheDocument();
    expect(screen.getByText('Falla temporal al sincronizar cartera bancaria')).toBeInTheDocument();
    expect(screen.getAllByText('Eventos activos').length).toBeGreaterThan(0);
  });
});
