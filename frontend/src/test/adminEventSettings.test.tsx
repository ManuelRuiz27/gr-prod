/**
 * adminEventSettings.test.tsx
 * FRONTEND-08 — Configuración y Lifecycle ADMIN
 *
 * Tests:
 * 1. Event scope: strictly isolated to :eventId without fallback.
 * 2. Missing eventId renders "Selecciona un evento" without fallback to mock event.
 * 3. Invalid eventId renders "Evento no encontrado" EmptyState.
 * 4. Renders all 7 normative sections:
 *    - 1. Información del Evento
 *    - 2. Plan Financiero
 *    - 3. Fechas Límite
 *    - 4. Termo Conmemorativo
 *    - 5. Catálogo de Platillos
 *    - 6. Política de Cancelaciones
 *    - 7. Estado del Evento y Ciclo de Vida
 * 5. Deadlines show "Configuración no disponible" and NO invented dates (2027-05-*).
 * 6. Cancellation policy shows "Configuración no disponible" instead of invented policies.
 * 7. Clear disclaimer: "Configuración actual del evento vs. planes financieros congelados" without suggestion that editing defaults rewrites historical obligations.
 * 8. Lifecycle transitions: OPEN event renders "Cerrar evento" and "Cancelar evento".
 * 9. Closing event sets local preview status "Cerrado" with "Vista previa local (No guardado)" badge and blocks chained transitions.
 * 10. Cancelling event requires a non-empty reason and rejects empty submission.
 * 11. Does NOT mutate mockEvents in global fixture.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventSettingsScreen } from '../pages/admin/AdminEventSettingsScreen';
import { mockEvents } from '../fixtures/eventFixtures';
import { buildEventSettingsViewModel } from '../pages/admin/settings/settingsViewModel';
import type { PaymentPlanMock } from '../fixtures/paymentFixtures';

function renderSettingsScreen(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/events/:eventId/settings" element={<AdminEventSettingsScreen />} />
        <Route path="/admin/settings" element={<AdminEventSettingsScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Event Settings & Lifecycle Screen (FRONTEND-08)', () => {
  // ── 1. Event scope ───────────────────────────────────────────────────────────
  it('1. Event scope: renders settings for evt-derecho-2027', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    expect(screen.getByText('Configuración y Parámetros del Evento')).toBeInTheDocument();
    expect(screen.getAllByText(/Graduación Facultad de Derecho 2027/i).length).toBeGreaterThan(0);
  });

  // ── 2. Missing eventId ───────────────────────────────────────────────────────
  it('2. Missing eventId: renders "Selecciona un evento" without fallback', () => {
    renderSettingsScreen('/admin/settings');
    expect(screen.getAllByText(/Selecciona un evento/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Configuración y Parámetros del Evento')).not.toBeInTheDocument();
  });

  // ── 3. Invalid eventId ───────────────────────────────────────────────────────
  it('3. Invalid eventId: renders "Evento no encontrado" EmptyState', () => {
    renderSettingsScreen('/admin/events/evt-invalid-9999/settings');
    expect(screen.getAllByText(/Evento no encontrado/i).length).toBeGreaterThan(0);
  });

  // ── 4. 7 Normative sections ──────────────────────────────────────────────────
  it('4. Renders all 7 normative sections in the settings hub', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    expect(screen.getByTestId('section-info')).toBeInTheDocument();
    expect(screen.getByTestId('section-financial')).toBeInTheDocument();
    expect(screen.getByTestId('section-deadlines')).toBeInTheDocument();
    expect(screen.getByTestId('section-thermo')).toBeInTheDocument();
    expect(screen.getByTestId('section-meals')).toBeInTheDocument();
    expect(screen.getByTestId('section-cancellations')).toBeInTheDocument();
    expect(screen.getByTestId('section-lifecycle')).toBeInTheDocument();
  });

  // ── 5. Deadlines show "Configuración no disponible" and NO invented dates ────
  it('5. Deadlines: displays "Configuración no disponible" without invented dates or technical labels', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    const deadlinesSection = screen.getByTestId('section-deadlines');
    expect(deadlinesSection).toHaveTextContent('Configuración no disponible');

    // No technical labels or invented dates
    expect(screen.queryByText(/places deadline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/table change deadline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/meals deadline/i)).not.toBeInTheDocument();
    expect(screen.queryByText('2027-05-01')).not.toBeInTheDocument();
    expect(screen.queryByText('2027-05-15')).not.toBeInTheDocument();
    expect(screen.queryByText('2027-05-20')).not.toBeInTheDocument();
  });

  // ── 6. Cancellation policy links to dedicated policy editor ────────────
  it('6. Cancellation policy: provides CTA to dedicated cancellation policy editor', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    const cancellationsSection = screen.getByTestId('section-cancellations');
    expect(cancellationsSection).toHaveTextContent(/Administrar política de cancelación/i);
    expect(screen.getByRole('link', { name: /Administrar política de cancelación/i })).toHaveAttribute(
      'href',
      '/admin/events/evt-derecho-2027/settings/cancellation-policy'
    );
  });

  // ── 7. Financial disclaimer ──────────────────────────────────────────────────
  it('7. Financial disclaimer: distinguishes event defaults vs frozen payment plans', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    expect(
      screen.getByText(/Configuración actual del evento vs\. planes financieros congelados/i)
    ).toBeInTheDocument();
  });

  // ── 8. Lifecycle actions for OPEN status ──────────────────────────────────────
  it('8. Lifecycle: OPEN event shows "Cerrar evento" and "Cancelar evento" and excludes invalid actions', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    const lifecycleSection = screen.getByTestId('section-lifecycle');
    expect(within(lifecycleSection).getByRole('button', { name: 'Cerrar evento' })).toBeInTheDocument();
    expect(within(lifecycleSection).getByRole('button', { name: 'Cancelar evento' })).toBeInTheDocument();

    // Invalid actions for OPEN
    expect(within(lifecycleSection).queryByRole('button', { name: 'Abrir evento' })).not.toBeInTheDocument();
    expect(within(lifecycleSection).queryByRole('button', { name: 'Reabrir evento' })).not.toBeInTheDocument();
    expect(within(lifecycleSection).queryByRole('button', { name: 'Finalizar evento' })).not.toBeInTheDocument();
  });

  // ── 9. Transition to CLOSED sets local preview and blocks chained transitions ─
  it('9. Lifecycle: transition to CLOSED applies local preview and blocks chained transitions', async () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    const lifecycleSection = screen.getByTestId('section-lifecycle');
    fireEvent.click(within(lifecycleSection).getByRole('button', { name: 'Cerrar evento' }));

    // Confirmation modal opens
    expect(screen.getByText(/Confirmar: Cerrar evento/i)).toBeInTheDocument();

    // Confirm
    const confirmBtn = screen.getByRole('button', { name: /Confirmar vista previa/i });
    fireEvent.click(confirmBtn);

    // Shows local preview badge and pending backend banner
    expect(screen.getAllByText(/Vista previa local/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Cambio pendiente de backend/i)).toBeInTheDocument();

    // Actions toolbar is replaced by pending notice
    expect(within(screen.getByTestId('section-lifecycle')).queryByRole('button', { name: 'Cerrar evento' })).not.toBeInTheDocument();
  });

  // ── 10. Cancelling event requires a non-empty reason ──────────────────────────
  it('10. Lifecycle: cancelling event requires a non-empty reason', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    const lifecycleSection = screen.getByTestId('section-lifecycle');
    fireEvent.click(within(lifecycleSection).getByRole('button', { name: 'Cancelar evento' }));

    expect(screen.getByText(/Confirmar: Cancelar evento/i)).toBeInTheDocument();

    // Submit empty
    const confirmBtn = screen.getByRole('button', { name: /Confirmar vista previa/i });
    fireEvent.click(confirmBtn);

    // Shows error
    expect(screen.getByText(/Ingresa el motivo obligatorio de cancelación/i)).toBeInTheDocument();

    // Enter reason
    const reasonInput = screen.getByLabelText(/Motivo obligatorio de cancelación/i);
    fireEvent.change(reasonInput, { target: { value: 'Cancelación por causas de fuerza mayor' } });

    fireEvent.click(confirmBtn);

    // Confirms and sets CANCELLED preview
    expect(screen.getAllByText(/Cancelado/i).length).toBeGreaterThan(0);
  });

  // ── 11. Preserves global fixture immutability ────────────────────────────────
  it('11. Preserves fixture immutability: mockEvents status remains OPEN', () => {
    const original = mockEvents.find((e) => e.id === 'evt-derecho-2027')!;
    expect(original.status).toBe('OPEN');
  });

  // ── 12. Thermo threshold not inferred from graduates ─────────────────────────
  it('12. Thermo threshold: is NOT inferred from graduates and displays "Configuración no disponible"', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    const thermoSection = screen.getByTestId('section-thermo');
    expect(thermoSection).toHaveTextContent('Configuración no disponible');
    expect(thermoSection).not.toHaveTextContent('70%');
  });

  // ── 13. Frozen plans only counts plans with isFrozen === true ────────────────
  it('13. Frozen plans: only counts plans where isFrozen === true', () => {
    const mockEvent = mockEvents[0];
    const mockPlansMap: Record<string, PaymentPlanMock> = {
      'grad-1': {
        eventId: mockEvent.id,
        graduateId: 'grad-1',
        totalAmount: 10000,
        paidAmount: 5000,
        pendingAmount: 5000,
        progressPercentage: 50,
        nextPaymentAmount: 2500,
        nextPaymentDueDate: '2027-04-15',
        isFrozen: true, // Frozen
        installments: [],
      },
      'grad-2': {
        eventId: mockEvent.id,
        graduateId: 'grad-2',
        totalAmount: 10000,
        paidAmount: 0,
        pendingAmount: 10000,
        progressPercentage: 0,
        nextPaymentAmount: 2500,
        nextPaymentDueDate: '2027-04-15',
        isFrozen: false, // NOT frozen
        installments: [],
      },
    };

    const vm = buildEventSettingsViewModel(mockEvent, [], [], mockPlansMap, null);
    expect(vm.frozenPlansCount).toBe(1);
  });

  // ── 14. Settings links to Audit screen ───────────────────────────────────────
  it('14. Settings links to event audit screen without creating extra shell tab', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    const auditBtn = screen.getByRole('button', { name: /Ver auditoría del evento/i });
    expect(auditBtn).toBeInTheDocument();
    expect(auditBtn.closest('a')).toHaveAttribute('href', '/admin/events/evt-derecho-2027/audit');
  });
});
