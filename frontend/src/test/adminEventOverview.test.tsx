import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventOverviewScreen } from '../pages/admin/AdminEventOverviewScreen';
import {
  mockEvents,
  mockGraduatesList,
  mockPaymentPlansMap,
  type EventMock,
  type GraduateMock,
  type PaymentPlanMock,
} from '../fixtures';

function renderOverview(initialEntry = '/admin/events/evt-derecho-2027') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin/events/:eventId" element={<AdminEventOverviewScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Event Overview (C2)', () => {
  it('1. Displays event name and natural status label "Abierto"', () => {
    renderOverview();

    expect(
      screen.getByRole('heading', { name: 'Graduación Facultad de Derecho 2027' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('Abierto').length).toBeGreaterThan(0);
  });

  it('2. Asserts legacy invented data and raw technical strings are NOT displayed', () => {
    const { container } = renderOverview();
    const textContent = container.textContent || '';

    expect(textContent).not.toMatch(/\bOPEN\b/);
    expect(textContent).not.toContain('$630,000');
  });

  it('3. Assert section "Preparación" does NOT exist', () => {
    renderOverview();
    expect(screen.queryByRole('heading', { name: /preparación/i })).not.toBeInTheDocument();
  });

  it('4. Renders compact inline Cobranza strip ($X cobrados · $Y pendientes · $Z vencidos)', () => {
    renderOverview();

    expect(screen.getByRole('heading', { name: /cobranza/i })).toBeInTheDocument();
    expect(screen.getByText(/cobrados/i)).toBeInTheDocument();
    expect(screen.getAllByText(/pendientes/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/vencidos/i)).toBeInTheDocument();
  });

  it('5. Renders actionable "Necesita atención" items with review links', () => {
    renderOverview();

    expect(screen.getByRole('heading', { name: /necesita atención/i })).toBeInTheDocument();
    const reviewLinks = screen.getAllByRole('link', { name: /revisar →/i });
    expect(reviewLinks.length).toBeGreaterThan(0);

    // Meals semantic check: does NOT claim "especiales" without evidence
    expect(screen.queryByText(/platillos especiales pendientes/i)).not.toBeInTheDocument();
  });

  it('6. Lifecycle actions are housed in a secondary menu (···) and do not dominate overview', () => {
    renderOverview();

    // The lifecycle header is NOT directly displayed as a primary block
    expect(screen.queryByRole('heading', { name: /ciclo de vida del evento/i })).not.toBeInTheDocument();

    // Open ··· menu
    const menuBtn = screen.getByLabelText(/acciones de ciclo de vida/i);
    expect(menuBtn).toBeInTheDocument();
    fireEvent.click(menuBtn);

    // Menu options appear
    const closeBtn = screen.getByRole('button', { name: 'Cerrar evento' });
    expect(closeBtn).toBeInTheDocument();

    // Trigger dialog from menu
    fireEvent.click(closeBtn);
    expect(screen.getByRole('heading', { name: 'Cerrar evento' })).toBeInTheDocument();

    // Confirm close
    const confirmCloseBtn = screen.getAllByRole('button', { name: 'Cerrar evento' })[0];
    fireEvent.click(confirmCloseBtn);

    expect(
      screen.getByText('El cambio no está disponible en esta demostración.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/backend/i)).not.toBeInTheDocument();
  });

  it('7. Renders EmptyState when navigating to non-existent event', () => {
    renderOverview('/admin/events/no-existe');

    expect(screen.getAllByText('Evento no encontrado').length).toBeGreaterThan(0);
    expect(screen.getByText('No encontramos el evento solicitado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a eventos' })).toBeInTheDocument();
  });

  it('8. Navigates to ?tab=cartera&filter=overdue when clicking Revisar on pagos vencidos item', () => {
    const testEventId = 'evt-overview-overdue';
    const testEvent: EventMock = {
      id: testEventId,
      name: 'Evento Con Vencidos Overview',
      institution: 'Facultad Test',
      career: 'Derecho',
      generation: '2027',
      date: '20 Nov 2027',
      venue: 'Sede Test',
      status: 'OPEN',
    };

    const overdueGrad: GraduateMock = {
      id: 'grad-overview-overdue',
      eventId: testEventId,
      fullName: 'Estudiante Con Mora',
      email: 'mora@test.com',
      career: 'Derecho',
      generation: '2027',
      ticketCount: 8,
      tableNumber: 1,
      thermoStatus: 'LOCKED',
      thermoThreshold: 70,
      guests: [],
    };

    const overduePlan: PaymentPlanMock = {
      graduateId: overdueGrad.id,
      graduateName: overdueGrad.fullName,
      eventId: testEventId,
      totalAmount: 12500,
      paidAmount: 5000,
      pendingAmount: 7500,
      overdueAmount: 2500,
      progressPercentage: 40,
      nextPaymentAmount: 2500,
      nextPaymentDueDate: '15 Ene 2027',
      isFrozen: false,
      installments: [],
    };

    mockEvents.push(testEvent);
    mockGraduatesList.push(overdueGrad);
    mockPaymentPlansMap[overdueGrad.id] = overduePlan;

    try {
      renderOverview(`/admin/events/${testEventId}`);

      expect(screen.getByText(/1 pagos vencidos/i)).toBeInTheDocument();
      const overdueItem = screen.getByText(/1 pagos vencidos/i).closest('div');
      const reviewLink = within(overdueItem!).getByRole('link', { name: /revisar →/i });
      expect(reviewLink).toHaveAttribute(
        'href',
        `/admin/events/${testEventId}/payments?tab=cartera&filter=overdue`
      );
    } finally {
      const evIdx = mockEvents.findIndex((e) => e.id === testEventId);
      if (evIdx !== -1) mockEvents.splice(evIdx, 1);
      const gIdx = mockGraduatesList.findIndex((g) => g.id === overdueGrad.id);
      if (gIdx !== -1) mockGraduatesList.splice(gIdx, 1);
      delete mockPaymentPlansMap[overdueGrad.id];
    }
  });
});

