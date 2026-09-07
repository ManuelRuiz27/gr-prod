/**
 * adminEventSettings.test.tsx
 * FASE D4 — Configuración simplificada
 *
 * Tests:
 *  1. Event scope: renders settings for evt-derecho-2027.
 *  2. Missing eventId renders "Selecciona un evento".
 *  3. Invalid eventId renders "Evento no encontrado".
 *  4. No grid layout (no md:grid-cols-2).
 *  5. No card containers per section.
 *  6. No technical copy (preview, no guardado, backend, DATA_MODEL, BR-*).
 *  7. Real values preserved (event name, institution, career, etc.).
 *  8. Missing config shows "No configurado".
 *  9. Audit is not a CTA button — just a link.
 * 10. Lifecycle is secondary (last section).
 * 11. Lifecycle transitions still work (OPEN → CLOSED).
 * 12. Cancel still requires non-empty reason.
 * 13. Fixture immutability preserved.
 * 14. Mobile: single column, no grid.
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

describe('Admin Event Settings — FASE D4 Simplificación', () => {
  // ── 1. Event scope ────────────────────────────────────────────────────────────
  it('1. renders settings for a valid event', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getAllByText(/Graduación Facultad de Derecho 2027/i).length).toBeGreaterThan(0);
  });

  // ── 2. Missing eventId ────────────────────────────────────────────────────────
  it('2. missing eventId renders "Selecciona un evento"', () => {
    renderSettingsScreen('/admin/settings');
    expect(screen.getAllByText(/Selecciona un evento/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Configuración')).not.toBeInTheDocument();
  });

  // ── 3. Invalid eventId ────────────────────────────────────────────────────────
  it('3. invalid eventId renders "Evento no encontrado"', () => {
    renderSettingsScreen('/admin/events/evt-invalid-9999/settings');
    expect(screen.getAllByText(/Evento no encontrado/i).length).toBeGreaterThan(0);
  });

  // ── 4. No grid layout ────────────────────────────────────────────────────────
  it('4. no md:grid-cols-2 grid layout exists', () => {
    const { container } = renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    const gridElements = container.querySelectorAll('.md\\:grid-cols-2, .grid-cols-2');
    expect(gridElements.length).toBe(0);
  });

  // ── 5. No card containers per section ─────────────────────────────────────────
  it('5. no card/box containers wrapping individual sections', () => {
    const { container } = renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    // No rounded-xl cards with bg and border patterns around sections
    const sectionCards = container.querySelectorAll('[data-testid^="section-"] .rounded-xl');
    expect(sectionCards.length).toBe(0);
    // No mini-cards inside sections (bg-obsidian-900/60 + border + rounded-lg)
    const miniCards = container.querySelectorAll('[data-testid^="section-"] .bg-obsidian-900\\/60');
    expect(miniCards.length).toBe(0);
  });

  // ── 6. No technical copy ──────────────────────────────────────────────────────
  it('6. no technical jargon in UI', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    expect(screen.queryByText(/Vista previa local/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No guardado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/integración pendiente/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DATA_MODEL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/BR-/)).not.toBeInTheDocument();
    expect(screen.queryByText(/planes financieros congelados/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/defaults/i)).not.toBeInTheDocument();
  });

  // ── 7. Real values preserved ──────────────────────────────────────────────────
  it('7. real values from event fixture are displayed', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    const infoSection = screen.getByTestId('section-info');
    expect(within(infoSection).getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();
    expect(within(infoSection).getByText('Facultad de Derecho')).toBeInTheDocument();
    expect(within(infoSection).getByText('Licenciatura en Derecho')).toBeInTheDocument();
    expect(within(infoSection).getByText('2027')).toBeInTheDocument();
    expect(within(infoSection).getByText('19 Jun 2027')).toBeInTheDocument();
    expect(within(infoSection).getByText('Centro de Convenciones')).toBeInTheDocument();
  });

  // ── 8. Missing config shows "No configurado" ─────────────────────────────────
  it('8. missing configuration shows "No configurado"', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    const noConfigTexts = screen.getAllByText('No configurado');
    expect(noConfigTexts.length).toBeGreaterThan(0);

    // Deadlines should all show "No configurado"
    const deadlinesSection = screen.getByTestId('section-deadlines');
    const deadlineNoConfig = within(deadlinesSection).getAllByText('No configurado');
    expect(deadlineNoConfig.length).toBe(3);

    // Thermo threshold
    const thermoSection = screen.getByTestId('section-thermo');
    expect(within(thermoSection).getByText('No configurado')).toBeInTheDocument();
  });

  // ── 9. Audit is not a CTA button ─────────────────────────────────────────────
  it('9. audit is a secondary link, not a CTA button', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    // No button with audit text
    expect(screen.queryByRole('button', { name: /auditoría/i })).not.toBeInTheDocument();
    // Has a plain link
    const auditLink = screen.getByText(/historial de cambios/i);
    expect(auditLink).toBeInTheDocument();
    expect(auditLink.closest('a')).toHaveAttribute('href', '/admin/events/evt-derecho-2027/audit');
  });

  // ── 10. Lifecycle is secondary ────────────────────────────────────────────────
  it('10. lifecycle section is the last data section', () => {
    const { container } = renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    const sections = container.querySelectorAll('[data-testid^="section-"]');
    const sectionIds = Array.from(sections).map((s) => s.getAttribute('data-testid'));
    // lifecycle should be last in the list of sections
    expect(sectionIds[sectionIds.length - 1]).toBe('section-lifecycle');
  });

  // ── 11. Lifecycle transitions work ────────────────────────────────────────────
  it('11. lifecycle: OPEN event can transition to CLOSED', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    const lifecycleSection = screen.getByTestId('section-lifecycle');
    expect(within(lifecycleSection).getByRole('button', { name: 'Cerrar evento' })).toBeInTheDocument();
    expect(within(lifecycleSection).getByRole('button', { name: 'Cancelar evento' })).toBeInTheDocument();

    // Click close
    fireEvent.click(within(lifecycleSection).getByRole('button', { name: 'Cerrar evento' }));
    expect(screen.getByText(/Confirmar: Cerrar evento/i)).toBeInTheDocument();

    // Confirm
    fireEvent.click(screen.getByRole('button', { name: /Confirmar$/i }));

    // Now shows Cerrado badge and no action buttons
    expect(screen.getAllByText(/Cerrado/i).length).toBeGreaterThan(0);
    expect(within(screen.getByTestId('section-lifecycle')).queryByRole('button', { name: 'Cerrar evento' })).not.toBeInTheDocument();
  });

  // ── 12. Cancel requires non-empty reason ──────────────────────────────────────
  it('12. cancel requires a non-empty reason', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');

    const lifecycleSection = screen.getByTestId('section-lifecycle');
    fireEvent.click(within(lifecycleSection).getByRole('button', { name: 'Cancelar evento' }));

    // Submit empty
    fireEvent.click(screen.getByRole('button', { name: /Confirmar$/i }));
    expect(screen.getByText(/Ingresa el motivo obligatorio de cancelación/i)).toBeInTheDocument();

    // Enter reason and confirm
    const reasonInput = screen.getByLabelText(/Motivo obligatorio de cancelación/i);
    fireEvent.change(reasonInput, { target: { value: 'Cancelación por fuerza mayor' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar$/i }));

    expect(screen.getAllByText(/Cancelado/i).length).toBeGreaterThan(0);
  });

  // ── 13. Fixture immutability ──────────────────────────────────────────────────
  it('13. mockEvents status remains OPEN after transitions', () => {
    const original = mockEvents.find((e) => e.id === 'evt-derecho-2027')!;
    expect(original.status).toBe('OPEN');
  });

  // ── 14. Frozen plans ViewModel correctness ────────────────────────────────────
  it('14. frozen plans: only counts plans where isFrozen === true', () => {
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
        isFrozen: true,
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
        isFrozen: false,
        installments: [],
      },
    };

    const vm = buildEventSettingsViewModel(mockEvent, [], [], mockPlansMap, null);
    expect(vm.frozenPlansCount).toBe(1);
  });

  // ── 15. No numbered sections ──────────────────────────────────────────────────
  it('15. no numbered section headings (1., 2., etc.)', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    expect(screen.queryByText(/^1\. /)).not.toBeInTheDocument();
    expect(screen.queryByText(/^2\. /)).not.toBeInTheDocument();
    expect(screen.queryByText(/^3\. /)).not.toBeInTheDocument();
    expect(screen.queryByText(/^7\. /)).not.toBeInTheDocument();
  });

  // ── 16. No invented dates ─────────────────────────────────────────────────────
  it('16. no invented dates in deadlines or anywhere', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    expect(screen.queryByText('2027-05-01')).not.toBeInTheDocument();
    expect(screen.queryByText('2027-05-15')).not.toBeInTheDocument();
    expect(screen.queryByText('2027-05-20')).not.toBeInTheDocument();
  });

  // ── 17. Meal options displayed ────────────────────────────────────────────────
  it('17. meal options from fixture are displayed', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    const mealsSection = screen.getByTestId('section-meals');
    expect(within(mealsSection).getByText('Tradicional')).toBeInTheDocument();
    expect(within(mealsSection).getByText('Vegetariano')).toBeInTheDocument();
    expect(within(mealsSection).getByText('Vegano')).toBeInTheDocument();
  });

  // ── 18. Cancellation policy link ──────────────────────────────────────────────
  it('18. cancellation section links to policy editor', () => {
    renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    const link = screen.getByText(/Administrar política de cancelación/i);
    expect(link.closest('a')).toHaveAttribute(
      'href',
      '/admin/events/evt-derecho-2027/settings/cancellation-policy',
    );
  });

  // ── 19. No decorative icons in section headings ───────────────────────────────
  it('19. no decorative Icon components in section headings', () => {
    const { container } = renderSettingsScreen('/admin/events/evt-derecho-2027/settings');
    // Section headings (h2) should not contain svg/icon elements
    const headings = container.querySelectorAll('h2');
    headings.forEach((h) => {
      expect(h.querySelector('svg')).toBeNull();
    });
  });
});
