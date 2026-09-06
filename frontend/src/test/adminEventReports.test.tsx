import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminEventReportsScreen } from '../pages/admin/AdminEventReportsScreen';
import {
  buildEventSpreadsheetRows,
  filterEventSpreadsheetRows,
  calculateReportTotals,
  formatCurrencyMXN,
  INITIAL_SPREADSHEET_FILTER_STATE,
} from '../pages/admin/reports/eventSpreadsheetViewModel';
import { generateEventReportCSV } from '../pages/admin/reports/exportReportUtils';

function renderReportsScreen(initialRoute = '/admin/events/evt-derecho-2027/reports') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/admin/events/:eventId/reports" element={<AdminEventReportsScreen />} />
        <Route path="/admin/reports" element={<AdminEventReportsScreen />} />
        <Route path="/admin/events/:eventId/graduates/:graduateId" element={<div>Graduate Detail Screen</div>} />
        <Route path="/admin/events" element={<div>Events List Screen</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminEventReportsScreen - Operational Spreadsheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 1. Render & Layout ───────────────────────────────────────────────────────
  it('1. Renders operational reports screen without crashing for a valid eventId', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');
    expect(screen.getByRole('heading', { name: /Reporte del evento/i })).toBeInTheDocument();
  });

  // ── 2. Compact Event Header ──────────────────────────────────────────────────
  it('2. Renders compact event header with context metadata (School, Career, Gen, Date)', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');
    // Context text
    expect(screen.getAllByText(/Facultad de Derecho/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Licenciatura en Derecho/i)).toBeInTheDocument();
    expect(screen.getAllByText(/2027/i).length).toBeGreaterThan(0);
    // Excel Export action button
    expect(screen.getByRole('button', { name: /Exportar Excel/i })).toBeInTheDocument();
  });

  // ── 3. Invalid eventId ───────────────────────────────────────────────────────
  it('3. Renders "Evento no encontrado" EmptyState when eventId does not exist', () => {
    renderReportsScreen('/admin/events/evt-invalid-9999/reports');
    expect(screen.getByText(/Evento no encontrado/i)).toBeInTheDocument();
  });

  // ── 4. Minimum 12 Normative Columns ──────────────────────────────────────────
  it('4. Renders all 12 normative columns in the operational spreadsheet table', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const table = screen.getByRole('table', { name: /Tabla de reporte operativo del evento/i });
    expect(table).toBeInTheDocument();

    // Verify all 12 required column headers
    expect(within(table).getByRole('columnheader', { name: /^Mesa$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Nº contrato$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Nombre$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Adultos$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Niños 4–11$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Sin cena$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Abonos$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Total a pagar$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Total abonado$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Saldo pendiente$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Vegetarianos$/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /^Veganos$/i })).toBeInTheDocument();
  });

  // ── 5. Frozen Columns On Desktop ─────────────────────────────────────────────
  it('5. Applies frozen sticky classes to Mesa, Nº contrato, and Nombre columns', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const table = screen.getByRole('table', { name: /Tabla de reporte operativo del evento/i });
    const mesaHeader = within(table).getByRole('columnheader', { name: /^Mesa$/i });
    const contratoHeader = within(table).getByRole('columnheader', { name: /^Nº contrato$/i });
    const nombreHeader = within(table).getByRole('columnheader', { name: /^Nombre$/i });

    expect(mesaHeader).toHaveClass('sticky', 'left-0');
    expect(contratoHeader).toHaveClass('sticky');
    expect(nombreHeader).toHaveClass('sticky');
  });

  // ── 6. Financial Formatting & Visual Differentiation ─────────────────────────
  it('6. Formats currency in MXN and differentiates Total abonado and Liquidado status', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    // Consistent MXN format
    expect(screen.getAllByText('$12,500.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$7,500.00').length).toBeGreaterThan(0);

    // Liquidated contract shows "Liquidado"
    expect(screen.getAllByText('Liquidado').length).toBeGreaterThan(0);

    // Total abonado column has emerald differentiation
    const totalAbonadoCell = screen.getAllByText('$7,500.00')[0];
    expect(totalAbonadoCell).toHaveClass('text-emerald-400');
  });

  // ── 7. Abonos Column & Detail Modal ──────────────────────────────────────────
  it('7. Displays concise abonos representation and opens ledger detail modal upon clicking', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    // Andrea has 3 payments: $2,500 · $2,500 · $2,500
    const abonosButton = screen.getByText(/\$2,500 · \$2,500 · \$2,500/i);
    expect(abonosButton).toBeInTheDocument();

    // Click to open abonos breakdown modal
    fireEvent.click(abonosButton);

    const modal = screen.getByRole('dialog', { name: /Detalle de abonos/i });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText(/Andrea Martínez/i)).toBeInTheDocument();
    expect(within(modal).getByText(/transfer/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = within(modal).getByRole('button', { name: 'Cerrar modal' });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: /Detalle de abonos/i })).not.toBeInTheDocument();
  });

  // ── 8. Calculated Totales Row ────────────────────────────────────────────────
  it('8. Renders sticky Totales row calculating sum of loaded contracts, guests, amounts and diets', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const table = screen.getByRole('table', { name: /Tabla de reporte operativo del evento/i });
    expect(within(table).getByText('TOTALES')).toBeInTheDocument();
    expect(within(table).getByText(/6 contratos/i)).toBeInTheDocument();

    // Amounts row in totals
    const rows = buildEventSpreadsheetRows('evt-derecho-2027');
    const totals = calculateReportTotals(rows);

    expect(within(table).getByText(formatCurrencyMXN(totals.totalToPay))).toBeInTheDocument();
    expect(within(table).getByText(formatCurrencyMXN(totals.totalPaid))).toBeInTheDocument();
    expect(within(table).getByText(formatCurrencyMXN(totals.totalPending))).toBeInTheDocument();
  });

  // ── 9. Search Filter ─────────────────────────────────────────────────────────
  it('9. Filters rows by name, contract folio, or table in search input', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre, contrato o mesa…/i);

    // Search by Name: "Andrea"
    fireEvent.change(searchInput, { target: { value: 'Andrea' } });
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();

    // Search by Contract Folio: "CT-2027-0058"
    fireEvent.change(searchInput, { target: { value: 'CT-2027-0058' } });
    expect(screen.getByText('Fernando Torres')).toBeInTheDocument();
    expect(screen.queryByText('Andrea Martínez')).not.toBeInTheDocument();

    // Search by Table: "Mesa 24"
    fireEvent.change(searchInput, { target: { value: 'Mesa 24' } });
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();
  });

  // ── 10. Table Filter Dropdown ────────────────────────────────────────────────
  it('10. Filters rows by specific assigned table or "Sin mesa"', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const tableSelect = screen.getByLabelText(/Filtrar por mesa/i);

    // Filter by Mesa 12 (Fernando Torres)
    fireEvent.change(tableSelect, { target: { value: '12' } });
    expect(screen.getByText('Fernando Torres')).toBeInTheDocument();
    expect(screen.queryByText('Andrea Martínez')).not.toBeInTheDocument();

    // Filter by Sin mesa (Mariana López)
    fireEvent.change(tableSelect, { target: { value: 'without_table' } });
    expect(screen.getByText('Mariana López')).toBeInTheDocument();
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();
  });

  // ── 11. Financial Status Filter ──────────────────────────────────────────────
  it('11. Filters rows by financial status (e.g. ATRASADO, LIQUIDADO)', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const statusSelect = screen.getByLabelText(/Filtrar por estado financiero/i);

    // Filter by ATRASADO (Roberto Sánchez has overdue installments)
    fireEvent.change(statusSelect, { target: { value: 'ATRASADO' } });
    expect(screen.getByText('Roberto Sánchez')).toBeInTheDocument();
    expect(screen.queryByText('Andrea Martínez')).not.toBeInTheDocument();

    // Filter by LIQUIDADO (Fernando Torres / Carlos Liquidado)
    fireEvent.change(statusSelect, { target: { value: 'LIQUIDADO' } });
    expect(screen.getByText('Fernando Torres')).toBeInTheDocument();
    expect(screen.queryByText('Roberto Sánchez')).not.toBeInTheDocument();
  });

  // ── 12. Balance Filter (Con saldo / Liquidado) ───────────────────────────────
  it('12. Filters rows by balance state (Con saldo pendiente / Liquidado)', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const balanceSelect = screen.getByLabelText(/Filtrar por saldo pendiente o liquidado/i);

    // Filter by Liquidado
    fireEvent.change(balanceSelect, { target: { value: 'liquidated' } });
    expect(screen.getByText('Fernando Torres')).toBeInTheDocument();
    expect(screen.queryByText('Andrea Martínez')).not.toBeInTheDocument();

    // Filter by Con saldo pendiente
    fireEvent.change(balanceSelect, { target: { value: 'pending' } });
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();
  });

  // ── 13. Dietary Filter (Vegetarianos, Veganos) ────────────────────────────────
  it('13. Filters rows by special dietary requirements', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const dietSelect = screen.getByLabelText(/Filtrar por requerimiento dietético/i);

    // Filter by vegetarian
    fireEvent.change(dietSelect, { target: { value: 'vegetarian' } });
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument(); // 1 vegetarian
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument(); // 0 special

    // Filter by vegan
    fireEvent.change(dietSelect, { target: { value: 'vegan' } });
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument(); // 2 vegan
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument(); // 0 vegan
  });

  // ── 14. Excel CSV Generation & UTF-8 BOM ─────────────────────────────────────
  it('14. Generates Excel CSV with UTF-8 BOM and correct columns', () => {
    const rows = buildEventSpreadsheetRows('evt-derecho-2027');
    const csv = generateEventReportCSV(rows);

    // Must start with UTF-8 BOM
    expect(csv.startsWith('\uFEFF')).toBe(true);

    // Must contain required headers
    expect(csv).toContain('"Mesa","Nº contrato","Nombre","Adultos","Niños 4–11","Sin cena","Abonos","Total a pagar","Total abonado","Saldo pendiente","Vegetarianos","Veganos"');

    // Must contain totals row
    expect(csv).toContain('TOTALES');
    expect(csv).toContain('6 contratos');
  });

  // ── 15. Row Navigation to Graduate Overview ──────────────────────────────────
  it('15. Clicking graduate name navigates to graduate detail screen', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const gradLink = screen.getByRole('button', { name: 'Andrea Martínez' });
    fireEvent.click(gradLink);

    expect(screen.getByText('Graduate Detail Screen')).toBeInTheDocument();
  });

  // ── 16. Empty State When No Filter Results ───────────────────────────────────
  it('16. Displays empty state when search/filters match zero rows', () => {
    renderReportsScreen('/admin/events/evt-derecho-2027/reports');

    const searchInput = screen.getByPlaceholderText(/Buscar por nombre, contrato o mesa…/i);
    fireEvent.change(searchInput, { target: { value: 'XYZNonExistentPerson' } });

    expect(screen.getByText(/No se encontraron registros/i)).toBeInTheDocument();
  });

  // ── 17. Global /admin/reports Selection ───────────────────────────────────────
  it('17. Allows event selection and institution filtering when rendered at /admin/reports', () => {
    renderReportsScreen('/admin/reports');

    const eventSelect = screen.getByLabelText(/Seleccionar evento para reporte/i);
    expect(eventSelect).toBeInTheDocument();

    const instSelect = screen.getByLabelText(/Filtrar eventos por institución/i);
    expect(instSelect).toBeInTheDocument();

    // Default renders first event spreadsheet
    expect(screen.getByRole('table', { name: /Tabla de reporte operativo del evento/i })).toBeInTheDocument();
  });

  // ── 18. ViewModel Aggregation Correctness ────────────────────────────────────
  it('18. Aggregates data accurately from VISUAL_QA_GRADUATE_PAYMENT_STATES and mockPaymentPlans', () => {
    const rows = buildEventSpreadsheetRows('evt-derecho-2027');
    expect(rows.length).toBe(6);

    const andrea = rows.find((r) => r.graduateName === 'Andrea Martínez');
    expect(andrea).toBeDefined();
    expect(andrea?.contractFolio).toBe('CT-2027-0042');
    expect(andrea?.tableNumber).toBe(24);
    expect(andrea?.adultsCount).toBe(8);
    expect(andrea?.childrenCount).toBe(0);
    expect(andrea?.noDinnerCount).toBe(0);
    expect(andrea?.vegetarianCount).toBe(1);
    expect(andrea?.veganCount).toBe(2);
    expect(andrea?.totalToPay).toBe(12500);
    expect(andrea?.totalPaid).toBe(7500);
    expect(andrea?.pendingBalance).toBe(5000);
    expect(andrea?.abonosList.length).toBe(3);

    // Filtering test
    const filtered = filterEventSpreadsheetRows(rows, {
      ...INITIAL_SPREADSHEET_FILTER_STATE,
      searchQuery: 'Andrea',
    });
    expect(filtered.length).toBe(1);
    expect(filtered[0].graduateName).toBe('Andrea Martínez');
  });
});
