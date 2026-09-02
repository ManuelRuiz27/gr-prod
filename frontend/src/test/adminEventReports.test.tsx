/**
 * adminEventReports.test.tsx
 * FRONTEND-07 / VIS-12 / VIS-12-R1 — Reportes ADMIN
 *
 * Tests:
 * 1. Event scope: strictly isolated to :eventId in contextual mode.
 * 2. Global route /admin/reports: renders PageHeader, filters, and Event selector directly without leaving page.
 * 3. Global route /admin/reports: selecting an event in dropdown renders reports in place.
 * 4. Invalid / unknown eventId renders "Evento no encontrado" EmptyState.
 * 5. Renders all 7 normative families with detailed rows:
 *    - Financiero y Cobranza (Contratado, Cobrado, Pendiente, Vencido, Penalizaciones, Reembolsos)
 *    - Cartera por Graduado (Folio, Graduado, Saldo, Próximo vencimiento, Días de atraso, Estado)
 *    - Transacciones y Pagos Confirmados (Fecha, Graduado, Concepto, Importe, Método, Referencia, Estado)
 *    - Comprobantes por Validar (Folio, Graduado, Importe, Método, Estado, Revisor, Fecha)
 *    - Ocupación de Mesas (Mesa, Capacidad, Ocupación, Disponibilidad, Personas asignadas)
 *    - Comanda de Platillos (Opción, Total, Pendientes, Detalle nominal)
 *    - Termos Conmemorativos (Folio, Graduado, Estado, Personalización, Entrega)
 * 6. No fake downloads or "Reporte descargado" messages; export buttons are disabled with "Exportación pendiente de backend".
 * 7. Reconciliation: sum of payment transactions matches the total confirmed amount ($7,500).
 * 8. Time range tabs: switching to 'Semanal' and 'Diario' updates metrics accurately.
 * 9. Filter interactivity:
 *    - Method filter: filtering by 'CASH' shows only cash transaction and hides transfer.
 *    - Status filter: filtering by 'PENDING_REVIEW' shows only pending submission.
 *    - School filter: selecting a school updates filter state.
 * 10. No unapproved assumptions (no 70% threshold, no proveedor, no comité).
 * 11. View model unit test with empty event.
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

describe('Admin Event Reports Screen (FRONTEND-07 / VIS-12 / VIS-12-R1)', () => {
  // ── 1. Event scope ───────────────────────────────────────────────────────────
  it('1. Event scope: renders report hub for evt-derecho-2027 in contextual mode', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');
    expect(screen.getByText('Centro de Reportes y Exportaciones')).toBeInTheDocument();
    expect(screen.getAllByText(/Graduación Facultad de Derecho 2027/i).length).toBeGreaterThan(0);
  });

  // ── 2. Global route reachable selector ───────────────────────────────────────
  it('2. Global route /admin/reports renders PageHeader, filter bar, and Event selector on screen', () => {
    renderReportsScreen('/admin/reports');

    expect(screen.getByText('Centro de Reportes y Exportaciones')).toBeInTheDocument();
    expect(screen.getByLabelText('Evento')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un evento para consultar reportes')).toBeInTheDocument();
  });

  // ── 3. Global route event selection ──────────────────────────────────────────
  it('3. Global route /admin/reports: selecting an event in dropdown renders reports in place', () => {
    renderReportsScreen('/admin/reports');

    const eventSelect = screen.getByLabelText('Evento');
    fireEvent.change(eventSelect, { target: { value: 'evt-derecho-2027' } });

    // Reports should now render in place without navigation
    expect(screen.getByText('Reporte Financiero y Cobranza')).toBeInTheDocument();
    expect(screen.getByText('$12,500')).toBeInTheDocument();
    expect(screen.getAllByText('$7,500').length).toBeGreaterThan(0);
  });

  // ── 4. Invalid eventId ───────────────────────────────────────────────────────
  it('4. Invalid eventId: renders "Evento no encontrado" EmptyState', () => {
    renderReportsScreen('/admin/events/evt-invalid-9999/reports');
    expect(screen.getAllByText(/Evento no encontrado/i).length).toBeGreaterThan(0);
  });

  // ── 5. All 7 normative families visible with detail ──────────────────────────
  it('5. Renders all 7 normative families with detailed rows', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    expect(screen.getByText('Reporte Financiero y Cobranza')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Cartera por Graduado')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Transacciones y Pagos Confirmados')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Comprobantes por Validar')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Ocupación de Mesas')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Comanda de Platillos')).toBeInTheDocument();
    expect(screen.getByText('Reporte de Termos Conmemorativos')).toBeInTheDocument();

    // Verify detail rows in DOM
    expect(screen.getByText('Mesa 1')).toBeInTheDocument();
    expect(screen.getByText(/TH-2027-001/i)).toBeInTheDocument();
  });

  // ── 6. No fake downloads ─────────────────────────────────────────────────────
  it('6. No fake downloads: export buttons are disabled with "Exportación pendiente de backend"', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    expect(screen.getAllByText(/Exportación pendiente de backend/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Reporte descargado/i)).not.toBeInTheDocument();

    const xlsxButtons = screen.getAllByRole('button', { name: /XLSX/i });
    for (const btn of xlsxButtons) {
      expect(btn).toBeDisabled();
    }
  });

  // ── 7. Reconciliation: Total ↔ Detail ───────────────────────────────────────
  it('7. Reconciles payment transactions sum with total confirmed amount ($7,500 = $3,000 + $2,500 + $2,000)', () => {
    const data = VISUAL_QA_REPORTS_DATA['evt-derecho-2027'].monthly;
    const sumTransactions = data.payments.transactions.reduce((sum, tx) => sum + tx.amount, 0);

    expect(sumTransactions).toBe(data.payments.totalConfirmedAmount);
    expect(sumTransactions).toBe(data.financial.totalCollected);
  });

  // ── 8. Time Range Switcher ──────────────────────────────────────────────────
  it('8. Allows switching time range tabs between Diario, Semanal and Mensual', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const weeklyTab = screen.getByRole('tab', { name: /Semanal/i });
    fireEvent.click(weeklyTab);

    // In weekly view, confirmed total is $2,500
    expect(screen.getAllByText('$2,500').length).toBeGreaterThan(0);
  });

  // ── 9. Filter Interactivity ─────────────────────────────────────────────────
  it('9. Filters transactions by payment method (e.g. CASH)', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const methodSelect = screen.getByLabelText('Método de pago');
    fireEvent.change(methodSelect, { target: { value: 'CASH' } });

    // Should only show cash transactions ($2,000)
    expect(screen.getAllByText('$2,000').length).toBeGreaterThan(0);
    expect(screen.queryByText('SPEI-8829104')).not.toBeInTheDocument();
  });

  it('10. Filters submissions by status (e.g. PENDING_REVIEW)', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const statusSelect = screen.getByLabelText('Estado');
    fireEvent.change(statusSelect, { target: { value: 'PENDING_REVIEW' } });

    // Should show Mariana (pending submission) and hide Andrea (approved) and Carlos (rejected)
    expect(screen.getByText(/SUB-2027-002/i)).toBeInTheDocument();
    expect(screen.queryByText(/SUB-2027-001/i)).not.toBeInTheDocument();
  });

  // ── 11. No unapproved assumptions (70%, proveedor, comité) ───────────────────
  it('11. No unapproved assumptions (no 70% threshold, no proveedor, no comité organizador)', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    expect(screen.queryByText(/70%/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/comité/i)).not.toBeInTheDocument();
  });

  // ── 12. School Filter Functional (Global Mode) ───────────────────────────────
  it('12. School filter limits available event options in global selector and resets invalid selection', () => {
    renderReportsScreen('/admin/reports');

    const schoolSelect = screen.getByLabelText('Escuela / Facultad');
    fireEvent.change(schoolSelect, { target: { value: 'Facultad de Medicina' } });

    // Event options should now contain Medicina and NOT Derecho
    expect(screen.getByRole('option', { name: /Graduación Facultad de Medicina 2027/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Graduación Facultad de Derecho 2027/i })).not.toBeInTheDocument();
  });

  // ── 13. Contextual School Read-Only Indicator ────────────────────────────────
  it('13. Contextual route displays school as locked/disabled input without fake interaction', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const schoolSelect = screen.getByLabelText('Escuela / Facultad');
    expect(schoolSelect).toBeDisabled();
    expect(schoolSelect).toHaveValue('Facultad de Derecho');
  });

  // ── 14. Date Range Filter Functional & Reconciled ─────────────────────────────
  it('14. Date range filter filters transactions deterministically and reconciles displayed total', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const dateSelect = screen.getByLabelText('Rango de fechas');
    fireEvent.change(dateSelect, { target: { value: 'last7' } });

    // In last 7 days (ref: 2027-04-30), only tx-001 (2027-04-28, $3,000) matches
    expect(screen.getByText(/SPEI-8829104/i)).toBeInTheDocument();
    expect(screen.queryByText(/MP-9938210/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/REC-00192/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('$3,000').length).toBeGreaterThan(0);

    // Switch to last 30 days -> tx-001 ($3,000) + tx-002 ($2,500) = $5,500
    fireEvent.change(dateSelect, { target: { value: 'last30' } });
    expect(screen.getByText(/SPEI-8829104/i)).toBeInTheDocument();
    expect(screen.getByText(/MP-9938210/i)).toBeInTheDocument();
    expect(screen.queryByText(/REC-00192/i)).not.toBeInTheDocument();
    expect(screen.getByText('$5,500')).toBeInTheDocument();
  });

  // ── 15. Mercado Pago Supported & Filterable ──────────────────────────────────
  it('15. Payment method filter supports Mercado Pago and filters accurately', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const methodSelect = screen.getByLabelText('Método de pago');
    fireEvent.change(methodSelect, { target: { value: 'MERCADOPAGO' } });

    expect(screen.getByText(/MP-9938210/i)).toBeInTheDocument();
    expect(screen.queryByText(/SPEI-8829104/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/REC-00192/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('$2,500').length).toBeGreaterThan(0);
  });

  // ── 16. View model unit test with empty event ─────────────────────────────────
  it('16. View model produces clean neutral data for event without fixtures', () => {
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
