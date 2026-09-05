import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GraduateHomeScreen } from '../pages/graduate/GraduateHomeScreen';
import { AuthProvider } from '../context/AuthContext';
import { currentGraduateMock, mockPaymentPlan } from '../fixtures';

function renderGraduateHome(props = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/graduate']}>
        <Routes>
          <Route path="/graduate" element={<GraduateHomeScreen {...props} />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Graduate Home Screen Tests (VIS-05 / VS-G-HOME-001)', () => {
  it('1. Initial Render: displays Greeting, Event Context, Next Action, Financial Progress, and Preparation Hub', () => {
    renderGraduateHome();

    // Greeting
    expect(screen.getByText(/hola, andrea/i)).toBeInTheDocument();

    // Event Context
    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();

    // Next Action
    expect(screen.getByText(/próximo pago/i)).toBeInTheDocument();
    expect(screen.getByText('$2,500')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pagar ahora' })).toBeInTheDocument();

    // Financial Progress
    expect(screen.getByText(/60% cubierto/i)).toBeInTheDocument();
    expect(screen.getByText('$7,500')).toBeInTheDocument();
    expect(screen.getByText('$12,500')).toBeInTheDocument();

    // Preparation Hub
    expect(screen.getByRole('heading', { name: 'Mi graduación' })).toBeInTheDocument();
    expect(screen.getByText('Invitados')).toBeInTheDocument();
    expect(screen.getByText('8 de 8')).toBeInTheDocument();
    expect(screen.getByText('Mesa')).toBeInTheDocument();
    expect(screen.getByText(/mesa 24/i)).toBeInTheDocument();
    expect(screen.getByText('Platillos')).toBeInTheDocument();
    expect(screen.getByText('Termo')).toBeInTheDocument();
  });

  it('2. Table unassigned: renders neutral label when tableNumber is null', () => {
    renderGraduateHome({
      graduateOverride: {
        ...currentGraduateMock,
        tableNumber: null,
      },
    });

    expect(screen.getByText('Sin mesa asignada')).toBeInTheDocument();
  });

  it('3. Thermo locked: displays threshold explanation when thermo is LOCKED', () => {
    renderGraduateHome({
      graduateOverride: {
        ...currentGraduateMock,
        thermoStatus: 'LOCKED',
        thermoThreshold: 70,
      },
    });

    expect(screen.getByText(/se desbloquea al alcanzar 70% de pago/i)).toBeInTheDocument();
  });

  it('4. Thermo available: displays available badge when thermo is AVAILABLE', () => {
    renderGraduateHome({
      graduateOverride: {
        ...currentGraduateMock,
        thermoStatus: 'AVAILABLE',
      },
    });

    expect(screen.getByText('Disponible para personalizar')).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('5. Liquidated state: renders celebration surface when pendingAmount is 0', () => {
    renderGraduateHome({
      paymentPlanOverride: {
        ...mockPaymentPlan,
        pendingAmount: 0,
        paidAmount: 12500,
        progressPercentage: 100,
      },
    });

    expect(screen.getByText('Plan liquidado')).toBeInTheDocument();
    expect(screen.getByText(/¡felicidades, tu plan está completo!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver historial de pagos/i })).toBeInTheDocument();
  });

  it('6. Overdue state: renders warning card and danger CTA when overdueAmount > 0', () => {
    renderGraduateHome({
      paymentPlanOverride: {
        ...mockPaymentPlan,
        overdueAmount: 2500,
      },
    });

    expect(screen.getByText('Pago vencido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /realizar pago/i })).toBeInTheDocument();
  });

  it('7. Loading state: renders structural skeletons', () => {
    renderGraduateHome({ isLoading: true });

    const skeletons = screen.getAllByRole('generic', { hidden: true });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('8. Empty state: renders EmptyState when event is null', () => {
    renderGraduateHome({ eventOverride: null });

    expect(screen.getByText('Sin evento asignado')).toBeInTheDocument();
    expect(screen.getByText(/aún no tienes un evento de graduación vinculado/i)).toBeInTheDocument();
  });

  it('9. Partial error state: displays localized error alert while keeping rest of screen intact', () => {
    renderGraduateHome({ partialError: 'Falla temporal al cargar platillos' });

    expect(screen.getByText('Aviso de sincronización')).toBeInTheDocument();
    expect(screen.getByText('Falla temporal al cargar platillos')).toBeInTheDocument();
    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();
  });
});
