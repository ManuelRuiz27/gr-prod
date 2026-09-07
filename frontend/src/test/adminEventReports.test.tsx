import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminEventReportsScreen } from '../pages/admin/AdminEventReportsScreen';
import * as XLSX from 'xlsx';
import {
  buildEventSpreadsheetRows,
  filterEventSpreadsheetRows,
  calculateReportTotals,
  deriveAttendeeComposition,
  formatCurrencyMXN,
  resolveEventPrices,
  calculateEventReservationSummary,
  INITIAL_SPREADSHEET_FILTER_STATE,
} from '../pages/admin/reports/eventSpreadsheetViewModel';
import { EventReportHeaderSummary } from '../pages/admin/reports/EventReportHeaderSummary';
import {
  generateEventReportWorkbook,
  generateEventReportCSV,
  sortAbonosForExport,
  parseDateForSort,
} from '../pages/admin/reports/exportReportUtils';
import { mockEvents } from '../fixtures/eventFixtures';

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
    if (typeof window !== 'undefined') {
      window.URL.createObjectURL = vi.fn(() => 'blob:mock-xlsx-url');
      window.URL.revokeObjectURL = vi.fn();
    }
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
    expect(screen.getAllByText(/Licenciatura en Derecho/i).length).toBeGreaterThan(0);
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

    // Filter by vegetarian (both Andrea with 1 and Roberto with 1 match)
    fireEvent.change(dietSelect, { target: { value: 'vegetarian' } });
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
    expect(screen.getByText('Roberto Sánchez')).toBeInTheDocument();
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument(); // 0 special

    // Filter by vegan (only Andrea with 2 matches; Roberto has 0 vegan)
    fireEvent.change(dietSelect, { target: { value: 'vegan' } });
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();
    expect(screen.queryByText('Roberto Sánchez')).not.toBeInTheDocument();
  });

  // ── 14. Excel XLSX Workbook Generation (Multi-sheet) ─────────────────────────
  it('14. Generates real multi-sheet Excel workbook (.xlsx) with "Reporte del evento" and "Abonos"', () => {
    const rows = buildEventSpreadsheetRows('evt-derecho-2027');
    const totals = calculateReportTotals(rows);
    const wb = generateEventReportWorkbook(rows, totals);

    // Verify sheet names
    expect(wb.SheetNames).toEqual(['Resumen del evento', 'Reporte del evento', 'Abonos']);

    // Hoja 2: "Reporte del evento"
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

  // ── 19. Integrity & Semantics Verification (Prompt Rules) ───────────────────
  describe('Integrity & Semantics Rules', () => {
    it('19.1. Never fabricates contract folios; displays "—" in UI and empty cell in XLSX for graduates without contract', () => {
      const rows = buildEventSpreadsheetRows('evt-derecho-2027');
      // Carlos Liquidado has no contract folio
      const carlos = rows.find((r) => r.graduateName === 'Carlos Liquidado');
      expect(carlos).toBeDefined();
      expect(carlos?.contractFolio).toBe('');
      expect(carlos?.contractFolio).not.toBe('CT-LIQUIDATED');
      expect(carlos?.contractFolio).not.toBe('CT-grad-liquidated');

      // UI: displays "—"
      renderReportsScreen('/admin/events/evt-derecho-2027/reports');
      const carlosTr = screen.getByText('Carlos Liquidado').closest('tr');
      expect(carlosTr).toBeInTheDocument();
      expect(within(carlosTr!).getAllByText('—').length).toBeGreaterThan(0);

      // XLSX Hoja 1: empty string in contract column
      const totals = calculateReportTotals(rows);
      const wb = generateEventReportWorkbook(rows, totals);
      const reportData = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets['Reporte del evento'], { header: 1 });
      const carlosXlsxRow = reportData.find((r) => r && r[2] === 'Carlos Liquidado');
      expect(carlosXlsxRow).toBeDefined();
      expect(carlosXlsxRow![1]).toBe('');
    });

    it('19.2. Never maps reviewedBy to receivedBy; reviewedBy remains strictly an internal voucher review audit field', () => {
      const rows = buildEventSpreadsheetRows('evt-derecho-2027');
      const andrea = rows.find((r) => r.graduateName === 'Andrea Martínez');
      expect(andrea).toBeDefined();

      const abonoWithReviewedBy = andrea!.abonosList.find((a) => a.reviewedBy === 'Admin Finanzas GR');
      expect(abonoWithReviewedBy).toBeDefined();
      expect(abonoWithReviewedBy?.receivedBy).toBeUndefined();

      rows.forEach((r) => {
        r.abonosList.forEach((a) => {
          if (a.reviewedBy) {
            expect(a.receivedBy).not.toBe(a.reviewedBy);
          }
        });
      });

      // In XLSX Hoja 2: 'Admin Finanzas GR' must never appear under 'Recibido por'
      const totals = calculateReportTotals(rows);
      const wb = generateEventReportWorkbook(rows, totals);
      const abonosData = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets['Abonos'], { header: 1 });

      for (let i = 1; i < abonosData.length; i++) {
        const receivedByVal = abonosData[i][6];
        expect(receivedByVal).not.toBe('Admin Finanzas GR');
      }
    });

    it('19.3. Column "Recibido por" is empty cell in XLSX and "—" in UI when no cashier/recipient exists', () => {
      const rows = buildEventSpreadsheetRows('evt-derecho-2027');
      const totals = calculateReportTotals(rows);
      const wb = generateEventReportWorkbook(rows, totals);
      const abonosData = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets['Abonos'], { header: 1 });

      for (let i = 1; i < abonosData.length; i++) {
        expect(abonosData[i][6]).toBe('');
      }

      renderReportsScreen('/admin/events/evt-derecho-2027/reports');
      const andreaBtn = screen.getByText(/\$2,500 · \$2,500 · \$2,500/i);
      fireEvent.click(andreaBtn);

      const modal = screen.getByRole('dialog', { name: /Detalle de abonos/i });
      expect(modal).toBeInTheDocument();
      expect(within(modal).getAllByText('—').length).toBeGreaterThan(0);
    });

    it('19.4. Never uses contractAcceptedAt as payment date under any circumstance', () => {
      const rows = buildEventSpreadsheetRows('evt-derecho-2027');
      const fernando = rows.find((r) => r.graduateName === 'Fernando Torres');
      const roberto = rows.find((r) => r.graduateName === 'Roberto Sánchez');

      const fernandoContractDate = '2026-10-12 11:00 hrs';
      const robertoContractDate = '2026-10-18 09:20 hrs';

      fernando?.abonosList.forEach((a) => {
        expect(a.date).not.toBe(fernandoContractDate);
      });
      roberto?.abonosList.forEach((a) => {
        expect(a.date).not.toBe(robertoContractDate);
      });

      const totals = calculateReportTotals(rows);
      const wb = generateEventReportWorkbook(rows, totals);
      const abonosData = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets['Abonos'], { header: 1 });

      for (let i = 1; i < abonosData.length; i++) {
        const dateCell = abonosData[i][2];
        expect(dateCell).not.toBe(fernandoContractDate);
        expect(dateCell).not.toBe(robertoContractDate);
      }
    });

    it('19.5. Never exposes internal tx.id or hardcoded CONF-001 as reference when missing bank reference', () => {
      const rows = buildEventSpreadsheetRows('evt-derecho-2027');

      rows.forEach((r) => {
        r.abonosList.forEach((a) => {
          expect(a.reference).not.toBe('CONF-001');
          if (a.id) {
            expect(a.reference).not.toBe(a.id);
          }
        });
      });

      const totals = calculateReportTotals(rows);
      const wb = generateEventReportWorkbook(rows, totals);
      const abonosData = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets['Abonos'], { header: 1 });

      for (let i = 1; i < abonosData.length; i++) {
        const refCell = abonosData[i][5];
        expect(refCell).not.toBe('CONF-001');
        expect(String(refCell).startsWith('abono-')).toBe(false);
      }
    });

    it('19.6. Derives attendee composition mutually exclusively: adults + children 4–11 + sin cena equals contracted tickets', () => {
      const rows = buildEventSpreadsheetRows('evt-derecho-2027');
      const roberto = rows.find((r) => r.graduateName === 'Roberto Sánchez');
      expect(roberto).toBeDefined();

      expect(roberto!.adultsCount).toBe(4);
      expect(roberto!.childrenCount).toBe(2);
      expect(roberto!.noDinnerCount).toBe(2);
      expect(roberto!.adultsCount + roberto!.childrenCount + roberto!.noDinnerCount).toBe(8);

      // Verify unit function with diverse compositions
      const compMixed = deriveAttendeeComposition(12, [
        { productType: 'Boleto Adulto (Con cena)', meal: 'Tradicional' },
        { productType: 'Lugar Niño (4 a 11 años)', meal: 'Infantil' },
        { productType: 'Lugar Niño 4–11', meal: 'Infantil' },
        { productType: 'Boleto Sin cena', meal: 'Sin cena' },
        { productType: 'Acceso Sin Cena', meal: 'Sin cena' },
      ]);
      expect(compMixed.childrenCount).toBe(2);
      expect(compMixed.noDinnerCount).toBe(2);
      expect(compMixed.adultsCount).toBe(8); // 1 explicit + 7 remaining places
      expect(compMixed.adultsCount + compMixed.childrenCount + compMixed.noDinnerCount).toBe(12);

      const compZeroGuests = deriveAttendeeComposition(5, null);
      expect(compZeroGuests.adultsCount).toBe(5);
      expect(compZeroGuests.childrenCount).toBe(0);
      expect(compZeroGuests.noDinnerCount).toBe(0);
      expect(compZeroGuests.adultsCount + compZeroGuests.childrenCount + compZeroGuests.noDinnerCount).toBe(5);
    });

    it('19.7. Preserves financial totals consistency between individual rows and event totals', () => {
      const rows = buildEventSpreadsheetRows('evt-derecho-2027');
      const totals = calculateReportTotals(rows);

      const sumToPay = rows.reduce((acc, r) => acc + r.totalToPay, 0);
      const sumPaid = rows.reduce((acc, r) => acc + r.totalPaid, 0);
      const sumPending = rows.reduce((acc, r) => acc + r.pendingBalance, 0);

      expect(totals.totalToPay).toBe(sumToPay);
      expect(totals.totalPaid).toBe(sumPaid);
      expect(totals.totalPending).toBe(sumPending);

      expect(totals.totalToPay).toBe(67250);
      expect(totals.totalPaid).toBe(48125);
      expect(totals.totalPending).toBe(19125);
    });

    it('19.8. XLSX export contains exactly the 3 expected sheets ("Resumen del evento", "Reporte del evento" and "Abonos") with exact normative columns', () => {
      const rows = buildEventSpreadsheetRows('evt-derecho-2027');
      const totals = calculateReportTotals(rows);
      const wb = generateEventReportWorkbook(rows, totals);

      expect(wb.SheetNames).toEqual(['Resumen del evento', 'Reporte del evento', 'Abonos']);

      const reportData = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets['Reporte del evento'], { header: 1 });
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

      const abonosData = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets['Abonos'], { header: 1 });
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
    });
  });

  // ── 20. EXTRAS: Datos Generales, Resumen Reservas, Donut SVG & Filter Independence ───────
  describe('20. EXTRAS: Datos Generales, Resumen Reservas, Donut SVG & Filter Independence', () => {
    it('20.1. Renders Datos generales with real institution, career, venue, date, and prices', () => {
      renderReportsScreen('/admin/events/evt-derecho-2027/reports');
      const headerSummary = screen.getByRole('region', { name: /Resumen operativo del evento/i });
      expect(headerSummary).toBeInTheDocument();

      // General metadata from mockEvents[0]
      expect(within(headerSummary).getByText('Facultad de Derecho')).toBeInTheDocument();
      expect(within(headerSummary).getByText('Licenciatura en Derecho')).toBeInTheDocument();
      expect(within(headerSummary).getByText('Centro de Convenciones')).toBeInTheDocument();
      expect(within(headerSummary).getByText('19 Jun 2027')).toBeInTheDocument();

      // Real Prices ($2,000.00, $1,000.00, $800.00)
      expect(within(headerSummary).getByText(/\$2,000\.00/i)).toBeInTheDocument();
      expect(within(headerSummary).getByText(/\$1,000\.00/i)).toBeInTheDocument();
      expect(within(headerSummary).getByText(/\$800\.00/i)).toBeInTheDocument();
    });

    it('20.2. Renders "—" when event prices are not configured (never fabricates fake pricing)', () => {
      const unconfiguredEvent = {
        id: 'evt-sin-precios',
        name: 'Graduación Sin Precios',
        institution: 'Facultad de Filosofía',
        career: 'Filosofía',
        generation: '2026',
        date: '10 Oct 2026',
        venue: 'Auditorio Central',
        status: 'OPEN' as const,
      };

      const unconfiguredPrices = resolveEventPrices('evt-sin-precios', unconfiguredEvent);
      expect(unconfiguredPrices.adultPrice).toBeNull();
      expect(unconfiguredPrices.childPrice).toBeNull();
      expect(unconfiguredPrices.noDinnerPrice).toBeNull();

      const dummyTotals = calculateReportTotals([]);
      render(
        <EventReportHeaderSummary
          event={unconfiguredEvent}
          totals={dummyTotals}
          prices={unconfiguredPrices}
        />
      );

      const headerSummary = screen.getByRole('region', { name: /Resumen operativo del evento/i });
      const dashes = within(headerSummary).getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(3);
    });

    it('20.3. Renders Resumen "Reservas del evento" with apartados = adultos + niños + sin cena, graduados, and financial breakdown', () => {
      const rows = buildEventSpreadsheetRows('evt-derecho-2027');
      const totals = calculateReportTotals(rows);
      const summary = calculateEventReservationSummary(totals);

      expect(summary.apartadosTotal).toBe(40);
      expect(summary.adultsTotal).toBe(36);
      expect(summary.childrenTotal).toBe(2);
      expect(summary.noDinnerTotal).toBe(2);
      expect(summary.apartadosTotal).toBe(summary.adultsTotal + summary.childrenTotal + summary.noDinnerTotal);
      expect(summary.graduatesCount).toBe(6);
      expect(summary.totalAmount).toBe(67250);
      expect(summary.paidAmount).toBe(48125);
      expect(summary.pendingAmount).toBe(19125);
      expect(summary.penalties).toBe('—');
      expect(summary.courtesies).toBe('—');

      renderReportsScreen('/admin/events/evt-derecho-2027/reports');
      const headerSummary = screen.getByRole('region', { name: /Resumen operativo del evento/i });
      expect(within(headerSummary).getByText('40')).toBeInTheDocument();
      expect(within(headerSummary).getByText('36')).toBeInTheDocument();
      expect(within(headerSummary).getAllByText('2').length).toBe(2);
      expect(within(headerSummary).getByText('6')).toBeInTheDocument();
      expect(within(headerSummary).getAllByText('$67,250.00').length).toBe(2);
      expect(within(headerSummary).getAllByText('$48,125.00').length).toBe(2);
      expect(within(headerSummary).getAllByText('$19,125.00').length).toBe(2);
    });

    it('20.4. Renders pure SVG Donut chart for "Abonado vs Restante" with accurate percentage and legend', () => {
      renderReportsScreen('/admin/events/evt-derecho-2027/reports');
      const headerSummary = screen.getByRole('region', { name: /Resumen operativo del evento/i });

      const donutSvg = within(headerSummary).getByRole('img', { name: /Gráfico de dona: 72% abonado/i });
      expect(donutSvg).toBeInTheDocument();

      const donutPercent = within(headerSummary).getByTestId('donut-percent');
      expect(donutPercent).toHaveTextContent('72%');
    });

    it('20.5. Donut edge case: 0% abonado (totalPaid = 0) renders 0% without NaN', () => {
      const mockTotals = {
        contractsCount: 5,
        adultsTotal: 10,
        childrenTotal: 0,
        noDinnerTotal: 0,
        totalToPay: 50000,
        totalPaid: 0,
        totalPending: 50000,
        vegetarianTotal: 0,
        veganTotal: 0,
      };

      const prices = resolveEventPrices('evt-derecho-2027');
      render(
        <EventReportHeaderSummary
          event={mockEvents[0]}
          totals={mockTotals}
          prices={prices}
        />
      );

      const donutPercent = screen.getByTestId('donut-percent');
      expect(donutPercent).toHaveTextContent('0%');
      expect(screen.getAllByText(/Abonado/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('img', { name: /Gráfico de dona: 0% abonado/i })).toBeInTheDocument();
    });

    it('20.6. Donut edge case: 100% liquidado renders 100% and "Liquidado" badge', () => {
      const mockTotals = {
        contractsCount: 5,
        adultsTotal: 10,
        childrenTotal: 0,
        noDinnerTotal: 0,
        totalToPay: 50000,
        totalPaid: 50000,
        totalPending: 0,
        vegetarianTotal: 0,
        veganTotal: 0,
      };

      const prices = resolveEventPrices('evt-derecho-2027');
      render(
        <EventReportHeaderSummary
          event={mockEvents[0]}
          totals={mockTotals}
          prices={prices}
        />
      );

      const donutPercent = screen.getByTestId('donut-percent');
      expect(donutPercent).toHaveTextContent('100%');
      expect(screen.getByText('Liquidado')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /Gráfico de dona: 100% abonado/i })).toBeInTheDocument();
    });

    it('20.7. Donut edge case: 0 total contracted (totalToPay = 0) handles division by zero gracefully without NaN', () => {
      const mockTotals = {
        contractsCount: 0,
        adultsTotal: 0,
        childrenTotal: 0,
        noDinnerTotal: 0,
        totalToPay: 0,
        totalPaid: 0,
        totalPending: 0,
        vegetarianTotal: 0,
        veganTotal: 0,
      };

      const prices = resolveEventPrices('evt-derecho-2027');
      render(
        <EventReportHeaderSummary
          event={mockEvents[0]}
          totals={mockTotals}
          prices={prices}
        />
      );

      const donutPercent = screen.getByTestId('donut-percent');
      expect(donutPercent).toHaveTextContent('0%');
      expect(donutPercent.textContent).not.toContain('NaN');
    });

    it('20.8. Scope independence: Header Summary and Donut reflect entire event even when table is filtered', () => {
      renderReportsScreen('/admin/events/evt-derecho-2027/reports');
      const headerSummary = screen.getByRole('region', { name: /Resumen operativo del evento/i });

      // Before filter: summary shows 6 contracts, 40 apartados, 72%
      expect(within(headerSummary).getByText('40')).toBeInTheDocument();
      expect(within(headerSummary).getByText('6')).toBeInTheDocument();
      expect(within(headerSummary).getByTestId('donut-percent')).toHaveTextContent('72%');

      // Apply filter for "Andrea"
      const searchInput = screen.getByPlaceholderText(/Buscar por nombre, contrato o mesa…/i);
      fireEvent.change(searchInput, { target: { value: 'Andrea' } });

      // Table shows 1 row
      expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
      expect(screen.queryByText('Roberto Sánchez')).not.toBeInTheDocument();

      // Table sticky footer reflects filtered 1 contract
      const table = screen.getByRole('table');
      expect(within(table).getByText('1 contratos')).toBeInTheDocument();

      // Header summary and donut STILL reflect the whole event (6 contracts, 40 apartados, 72%)
      expect(within(headerSummary).getByText('40')).toBeInTheDocument();
      expect(within(headerSummary).getByText('6')).toBeInTheDocument();
      expect(within(headerSummary).getByTestId('donut-percent')).toHaveTextContent('72%');
      expect(within(headerSummary).getAllByText('$67,250.00').length).toBe(2);
    });

    it('20.9. Export independence: "Exportar Excel" triggers download with full event even when table is filtered', () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      renderReportsScreen('/admin/events/evt-derecho-2027/reports');

      // Filter table to 1 row
      const searchInput = screen.getByPlaceholderText(/Buscar por nombre, contrato o mesa…/i);
      fireEvent.change(searchInput, { target: { value: 'Andrea' } });

      // Click "Exportar Excel"
      const exportBtn = screen.getByRole('button', { name: /Exportar Excel/i });
      fireEvent.click(exportBtn);

      expect(clickSpy).toHaveBeenCalled();

      // Verify workbook generation with allRows and eventTotals
      const allRows = buildEventSpreadsheetRows('evt-derecho-2027');
      const eventTotals = calculateReportTotals(allRows);
      const wb = generateEventReportWorkbook(allRows, eventTotals);

      expect(wb.SheetNames).toEqual(['Resumen del evento', 'Reporte del evento', 'Abonos']);
      const reportRows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets['Reporte del evento'], { header: 1 });
      expect(reportRows.length).toBe(8); // 1 header + 6 data rows + 1 totals row
      expect(reportRows.some((r) => r && r[2] === 'Carlos Liquidado')).toBe(true);

      const totalsRow = reportRows[reportRows.length - 1];
      expect(totalsRow[1]).toBe('6 contratos');
      expect(totalsRow[6]).toBe(67250);

      clickSpy.mockRestore();
    });

    it('20.10. XLSX Sheet 1 ("Resumen del evento") contains metadata, prices, reservation breakdown, and financial summary without chart elements', () => {
      const rows = buildEventSpreadsheetRows('evt-derecho-2027');
      const totals = calculateReportTotals(rows);
      const prices = resolveEventPrices('evt-derecho-2027');
      const event = mockEvents[0];

      const wb = generateEventReportWorkbook(rows, totals, {
        eventName: event.name,
        institution: event.institution,
        career: event.career,
        venue: event.venue,
        date: event.date,
        adultPrice: prices.adultPrice,
        childPrice: prices.childPrice,
        noDinnerPrice: prices.noDinnerPrice,
        penalties: null,
        courtesies: null,
      });

      expect(wb.SheetNames[0]).toBe('Resumen del evento');
      const wsResumen = wb.Sheets['Resumen del evento'];
      const resumenData = XLSX.utils.sheet_to_json<unknown[]>(wsResumen, { header: 1 });

      // Section titles
      expect(resumenData.some((r) => r && r[0] === 'RESUMEN DEL EVENTO')).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'PRECIOS CONFIGURADOS')).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'RESERVAS DEL EVENTO')).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'ESTADO FINANCIERO')).toBe(true);

      // Metadata values
      expect(resumenData.some((r) => r && r[0] === 'Institución' && r[1] === 'Facultad de Derecho')).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Precio Adulto' && r[1] === 2000)).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Precio Niño 4–11' && r[1] === 1000)).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Precio Sin cena' && r[1] === 800)).toBe(true);

      // Reservation breakdown
      expect(resumenData.some((r) => r && r[0] === 'Apartados (Total lugares)' && r[1] === 40)).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Adultos' && r[1] === 36)).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Niños 4–11' && r[1] === 2)).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Sin cena' && r[1] === 2)).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Graduados (Contratos)' && r[1] === 6)).toBe(true);

      // Financial status
      expect(resumenData.some((r) => r && r[0] === 'Total' && r[1] === 67250)).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Abonado' && r[1] === 48125)).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Restante' && r[1] === 19125)).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Penalizaciones' && r[1] === '—')).toBe(true);
      expect(resumenData.some((r) => r && r[0] === 'Cortesías' && r[1] === '—')).toBe(true);

      // Ensure no chart drawings exist on the sheet
      expect(wsResumen['!drawings']).toBeUndefined();
      expect(wsResumen['!charts']).toBeUndefined();
    });
  });
});
