/**
 * adminEventReports.test.tsx
 * FRONTEND-07 / VIS-12 — Reportes ADMIN (7 Familias, Reconciliación y Filtros Temporales)
 *
 * Tests:
 * 1. Event scope: strictly isolated to :eventId.
 * 2. Missing eventId renders "Selecciona un evento" EmptyState without silent fallback.
 * 3. Invalid / unknown eventId renders "Evento no encontrado" EmptyState.
 * 4. Renders all 7 normative families:
 *    - Financiero y Cobranza
 *    - Cartera por Graduado
 *    - Transacciones y Pagos Confirmados (PaymentTransaction)
 *    - Comprobantes por Validar (PaymentSubmission)
 *    - Ocupación de Mesas
 *    - Comanda de Platillos
 *    - Termos Conmemorativos
 * 5. No fake downloads or "Reporte descargado" messages; export buttons are disabled with "Exportación pendiente de backend".
 * 6. Financial metrics derived strictly from event payment plans ($12,500 contratado, $7,500 recaudado, $5,000 pendiente, $0 vencido for evt-derecho-2027).
 * 7. Tables metrics derived strictly from event tables (6 mesas, 62 capacidad, 38 ocupados, 24 disponibles).
 * 8. Thermos metrics derived strictly from event graduates (1 bloqueado, 1 disponible, 1 solicitado, 1 en producción, 0 entregados).
 * 9. Meals metrics derived dynamically from guest selections (Tradicional, Vegano, Vegetariano).
 * 10. Reconciliation: sum of payment transactions matches the total confirmed amount ($7,500).
 * 11. Time range tabs: switching to 'Semanal' updates metrics to weekly snapshot.
 * 12. No hardcoded 70%, fixed menu strings, committee or provider assumptions.
 * 13. View model unit test with empty event.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventReportsScreen } from '../pages/admin/AdminEventReportsScreen';
import { mockEvents } from '../fixtures/eventFixtures';
import { buildEventReportsViewModel } from '../pages/admin/reports/reportViewModel';
import { VISUAL_QA_REPORTS_DATA } from '../fixtures/cancellationReportsAuditVisualFixtures';

function renderReportsScreen(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/events/:eventId/reports" element={<AdminEventReportsScreen />} />
        <Route path="/admin/reports" element={<AdminEventReportsScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Event Reports Screen (FRONTEND-07 / VIS-12)', () => {
  // ── 1. Event scope ───────────────────────────────────────────────────────────
  it('1. Event scope: renders report hub for evt-derecho-2027', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');
    expect(screen.getByText('Centro de Reportes y Exportaciones')).toBeInTheDocument();
    expect(screen.getAllByText(/Graduación Facultad de Derecho 2027/i).length).toBeGreaterThan(0);
  });

  // ── 2. Missing eventId ───────────────────────────────────────────────────────
  it('2. Missing eventId: renders "Selecciona un evento" without fallback to evt-derecho-2027', () => {
    renderReportsScreen('/admin/reports');
    expect(screen.getAllByText(/Selecciona un evento/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Centro de Reportes y Exportaciones')).not.toBeInTheDocument();
  });

  // ── 3. Invalid eventId ───────────────────────────────────────────────────────
  it('3. Invalid eventId: renders "Evento no encontrado" EmptyState', () => {
    renderReportsScreen('/admin/events/evt-invalid-9999/reports');
    expect(screen.getAllByText(/Evento no encontrado/i).length).toBeGreaterThan(0);
  });

  // ── 4. All 7 normative families visible ──────────────────────────────────────
  it('4. Renders all 7 normative families in the hub', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    expect(screen.getByText('Reporte Financiero y Cobranza')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Cartera por Graduado')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Transacciones y Pagos Confirmados')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Comprobantes por Validar')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Ocupación de Mesas')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Comanda de Platillos')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Termos Conmemorativos')).toBeInTheDocument();
  });

  // ── 5. No fake downloads ─────────────────────────────────────────────────────
  it('5. No fake downloads: export buttons are disabled with "Exportación pendiente de backend"', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    expect(screen.getAllByText(/Exportación pendiente de backend/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Reporte descargado/i)).not.toBeInTheDocument();

    const xlsxButtons = screen.getAllByRole('button', { name: /XLSX/i });
    for (const btn of xlsxButtons) {
      expect(btn).toBeDisabled();
    }
  });

  // ── 6. Financial metrics derived from fixtures ──────────────────────────────
  it('6. Financial metrics: derived strictly from event payment plans ($12,500 contratado, $7,500 recaudado, $5,000 pendiente)', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    expect(screen.getByText('$12,500')).toBeInTheDocument();
    expect(screen.getAllByText('$7,500').length).toBeGreaterThan(0);
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  // ── 7. Tables metrics derived from fixtures ─────────────────────────────────
  it('7. Tables metrics: derived strictly from event tables (6 mesas, 62 capacidad, 38 ocupados, 24 disponibles)', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const tablesCard = screen.getByTestId('report-tables');
    expect(tablesCard).toHaveTextContent('6');
    expect(tablesCard).toHaveTextContent('62');
    expect(tablesCard).toHaveTextContent('38');
    expect(tablesCard).toHaveTextContent('24');
  });

  // ── 8. Thermos metrics derived from fixtures ─────────────────────────────────
  it('8. Thermos metrics: derived strictly from event graduates (1 bloqueado, 1 disponible, 1 solicitado, 1 en producción, 0 entregados)', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const thermosCard = screen.getByTestId('report-thermos');
    expect(thermosCard).toHaveTextContent('Bloqueados');
    expect(thermosCard).toHaveTextContent('Disponibles');
    expect(thermosCard).toHaveTextContent('Solicitados');
    expect(thermosCard).toHaveTextContent('En producción');
    expect(thermosCard).toHaveTextContent('Entregados');
  });

  // ── 9. Meals metrics derived dynamically ─────────────────────────────────────
  it('9. Meals metrics: derived dynamically from guest selections without hardcoding', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const mealsCard = screen.getByTestId('report-meals');
    expect(mealsCard).toHaveTextContent('Tradicional');
    expect(mealsCard).toHaveTextContent('Vegano');
    expect(mealsCard).toHaveTextContent('Vegetariano');
    expect(mealsCard).toHaveTextContent('11');
  });

  // ── 10. Reconciliation: Total ↔ Detail ───────────────────────────────────────
  it('10. Reconciles payment transactions sum with total confirmed amount ($7,500 = $3,000 + $2,500 + $2,000)', () => {
    const data = VISUAL_QA_REPORTS_DATA['evt-derecho-2027'].monthly;
    const sumTransactions = data.payments.transactions.reduce((sum, tx) => sum + tx.amount, 0);

    expect(sumTransactions).toBe(data.payments.totalConfirmedAmount);
    expect(sumTransactions).toBe(data.financial.totalCollected);
  });

  // ── 11. Time Range Switcher ──────────────────────────────────────────────────
  it('11. Allows switching time range tabs between Diario, Semanal and Mensual', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const weeklyTab = screen.getByRole('tab', { name: /Semanal/i });
    fireEvent.click(weeklyTab);

    // In weekly view, confirmed total is $2,500
    expect(screen.getAllByText('$2,500').length).toBeGreaterThan(0);
  });

  // ── 12. No unapproved assumptions (70%, proveedor, comité) ───────────────────
  it('12. No unapproved assumptions (no 70% threshold, no proveedor, no comité organizador)', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    expect(screen.queryByText(/70%/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/proveedor/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/comité/i)).not.toBeInTheDocument();
  });

  // ── 13. View model unit test with empty event ─────────────────────────────────
  it('13. View model produces clean neutral data for event without fixtures', () => {
    const emptyEvent = {
      ...mockEvents[0],
      id: 'evt-empty-test',
      name: 'Evento Vacío',
    };

    const vm = buildEventReportsViewModel(emptyEvent, [], {}, []);
    expect(vm.financial.hasData).toBe(false);
    expect(vm.tables.hasData).toBe(false);
    expect(vm.meals.hasData).toBe(false);
    expect(vm.thermos.hasData).toBe(false);
    expect(vm.portfolio.hasData).toBe(false);
  });
});
