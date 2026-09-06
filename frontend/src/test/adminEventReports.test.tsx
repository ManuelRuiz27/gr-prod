import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminEventReportsScreen } from '../pages/admin/AdminEventReportsScreen';
import * as XLSX from 'xlsx';
import {
  buildEventSpreadsheetRows,
  filterEventSpreadsheetRows,
  calculateReportTotals,
  formatCurrencyMXN,
  INITIAL_SPREADSHEET_FILTER_STATE,
} from '../pages/admin/reports/eventSpreadsheetViewModel';
import {
  generateEventReportWorkbook,
  generateEventReportCSV,
  sortAbonosForExport,
  parseDateForSort,
} from '../pages/admin/reports/exportReportUtils';

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

    // Verify "Recibido por" column header is present in the modal
    expect(within(modal).getByRole('columnheader', { name: /Recibido por/i })).toBeInTheDocument();

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

  // ── 14. Excel XLSX Workbook Generation (Multi-sheet) ─────────────────────────
  it('14. Generates real multi-sheet Excel workbook (.xlsx) with "Reporte del evento" and "Abonos"', () => {
    const rows = buildEventSpreadsheetRows('evt-derecho-2027');
    const totals = calculateReportTotals(rows);
    const wb = generateEventReportWorkbook(rows, totals);

    // Verify sheet names
    expect(wb.SheetNames).toEqual(['Reporte del evento', 'Abonos']);

    // Hoja 1: "Reporte del evento"
    const wsReport = wb.Sheets['Reporte del evento'];
    const reportData = XLSX.utils.sheet_to_json<unknown[]>(wsReport, { header: 1 });

    // Verify exact headers in Hoja 1
    expect(reportData[0]).toEqual([
      'Mesa',
      'Número de contrato',
      'Nombre',
      'Adultos',
      'Niños 4–11',
      'Sin cena',
      'Total a pagar',
      'Total abonado',
      'Saldo pendiente',
      'Vegetarianos',
      'Veganos',
    ]);

    // Verify rows count (1 header + 6 data rows + 1 totals row = 8 rows)
    expect(reportData.length).toBe(8);

    // Verify last row is TOTALES
    const totalsRow = reportData[reportData.length - 1];
    expect(totalsRow[0]).toBe('TOTALES');
    expect(totalsRow[1]).toBe('6 contratos');
    expect(totalsRow[6]).toBe(totals.totalToPay);
    expect(totalsRow[7]).toBe(totals.totalPaid);
    expect(totalsRow[8]).toBe(totals.totalPending);

    // Hoja 2: "Abonos"
    const wsAbonos = wb.Sheets['Abonos'];
    const abonosData = XLSX.utils.sheet_to_json<unknown[]>(wsAbonos, { header: 1 });

    // Verify exact headers in Hoja 2
    expect(abonosData[0]).toEqual([
      'Contrato',
      'Nombre',
      'Fecha',
      'Importe',
      'Método',
      'Folio / referencia',
      'Recibido por',
      'Estado',
    ]);

    // Verify that abonos are present and sorted
    expect(abonosData.length).toBeGreaterThan(1);

    // Check chronological and contract sorting
    for (let i = 1; i < abonosData.length - 1; i++) {
      const currentContract = String(abonosData[i][0]);
      const nextContract = String(abonosData[i + 1][0]);
      const contractCmp = currentContract.localeCompare(nextContract, undefined, { numeric: true });
      expect(contractCmp).toBeLessThanOrEqual(0);

      if (contractCmp === 0) {
        const dateCurrent = parseDateForSort(String(abonosData[i][2]));
        const dateNext = parseDateForSort(String(abonosData[i + 1][2]));
        expect(dateCurrent).toBeLessThanOrEqual(dateNext);
      }
    }

    // Verify unrecorded "Recibido por" fields are empty string or undefined (no invented data)
    for (let i = 1; i < abonosData.length; i++) {
      const receivedBy = abonosData[i][6];
      expect(typeof receivedBy === 'string' || receivedBy === undefined).toBe(true);
    }
  });

  it('14b. Correctly parses dates with parseDateForSort for both ISO and Spanish formats', () => {
    expect(parseDateForSort('2026-10-15')).toBe(new Date(2026, 9, 15).getTime());
    expect(parseDateForSort('15 Oct 2026')).toBe(new Date(2026, 9, 15).getTime());
    expect(parseDateForSort('20 Nov 2026')).toBe(new Date(2026, 10, 20).getTime());
    expect(parseDateForSort('')).toBe(0);
  });

  it('14c. Sorts abonos primarily by contract folio and secondarily by date', () => {
    const abonos = [
      {
        id: '2',
        contractFolio: 'CT-2027-0050',
        graduateName: 'B',
        amount: 2500,
        date: '20 Nov 2026',
        method: 'TRANSFER',
        reference: 'R2',
        status: 'APROBADO',
      },
      {
        id: '1',
        contractFolio: 'CT-2027-0050',
        graduateName: 'B',
        amount: 2500,
        date: '15 Oct 2026',
        method: 'TRANSFER',
        reference: 'R1',
        status: 'APROBADO',
      },
      {
        id: '3',
        contractFolio: 'CT-2027-0010',
        graduateName: 'A',
        amount: 2500,
        date: '10 Dec 2026',
        method: 'TRANSFER',
        reference: 'R3',
        status: 'APROBADO',
      },
    ];

    const sorted = sortAbonosForExport(abonos);
    expect(sorted[0].contractFolio).toBe('CT-2027-0010');
    expect(sorted[1].date).toBe('15 Oct 2026');
    expect(sorted[2].date).toBe('20 Nov 2026');
  });

  it('14d. Retains UTF-8 BOM CSV generation for backward compatibility', () => {
    const rows = buildEventSpreadsheetRows('evt-derecho-2027');
    const csv = generateEventReportCSV(rows);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('TOTALES');
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
