import * as XLSX from 'xlsx';
import type { EventSpreadsheetRow, SpreadsheetTotals, SpreadsheetAbonoItem } from './eventSpreadsheetViewModel';
import { calculateReportTotals } from './eventSpreadsheetViewModel';

const MONTH_MAP: Record<string, string> = {
  ene: '01',
  feb: '02',
  mar: '03',
  abr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  ago: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dic: '12',
};

/**
 * Parses dates into numeric timestamps for chronological sorting.
 * Handles ISO dates (YYYY-MM-DD) and Spanish text dates (e.g., "15 Oct 2026").
 */
export function parseDateForSort(dateStr?: string | null): number {
  if (!dateStr) return 0;
  const trimmed = dateStr.trim();

  // 1. ISO format: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  }

  // 2. Spanish format: DD Mes YYYY (e.g., "15 Oct 2026", "01 Nov 2026")
  const esMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóú]+)\s+(\d{4})/);
  if (esMatch) {
    const [, d, monthName, y] = esMatch;
    const cleanMonth = monthName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3);
    const monthNum = MONTH_MAP[cleanMonth] !== undefined ? parseInt(MONTH_MAP[cleanMonth], 10) - 1 : 0;
    return new Date(Number(y), monthNum, Number(d)).getTime();
  }

  // 3. Fallback to standard Date.parse
  const parsed = Date.parse(trimmed);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Sorts abonos movements:
 * 1. Primary: Contrato (alphanumeric ascending)
 * 2. Secondary: Fecha (chronological ascending)
 */
export function sortAbonosForExport(abonos: SpreadsheetAbonoItem[]): SpreadsheetAbonoItem[] {
  return [...abonos].sort((a, b) => {
    const contractCompare = (a.contractFolio || '').localeCompare(b.contractFolio || '', undefined, {
      numeric: true,
      sensitivity: 'base',
    });
    if (contractCompare !== 0) return contractCompare;

    const dateA = parseDateForSort(a.date);
    const dateB = parseDateForSort(b.date);
    return dateA - dateB;
  });
}

/**
 * Generates a real multi-sheet Excel Workbook (.xlsx) with:
 * - Sheet 1: "Reporte del evento" (operational overview + totals row)
 * - Sheet 2: "Abonos" (individual payment ledger sorted by contract and date)
 */
export function generateEventReportWorkbook(
  rows: EventSpreadsheetRow[],
  totals?: SpreadsheetTotals
): XLSX.WorkBook {
  const effectiveTotals = totals || calculateReportTotals(rows);

  // ── 1. Hoja 1: "Reporte del evento" ────────────────────────────
  const reportHeaders = [
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
  ];

  const reportDataRows = rows.map((r) => [
    r.tableLabel,
    r.contractFolio,
    r.graduateName,
    r.adultsCount,
    r.childrenCount,
    r.noDinnerCount,
    r.totalToPay,
    r.totalPaid,
    r.pendingBalance,
    r.vegetarianCount,
    r.veganCount,
  ]);

  const reportTotalsRow = [
    'TOTALES',
    `${effectiveTotals.contractsCount} contratos`,
    '',
    effectiveTotals.adultsTotal,
    effectiveTotals.childrenTotal,
    effectiveTotals.noDinnerTotal,
    effectiveTotals.totalToPay,
    effectiveTotals.totalPaid,
    effectiveTotals.totalPending,
    effectiveTotals.vegetarianTotal,
    effectiveTotals.veganTotal,
  ];

  const reportSheetAoa = [reportHeaders, ...reportDataRows, reportTotalsRow];
  const reportWs = XLSX.utils.aoa_to_sheet(reportSheetAoa);

  // Column widths for Hoja 1
  reportWs['!cols'] = [
    { wch: 14 }, // Mesa
    { wch: 22 }, // Número de contrato
    { wch: 30 }, // Nombre
    { wch: 10 }, // Adultos
    { wch: 12 }, // Niños 4–11
    { wch: 10 }, // Sin cena
    { wch: 16 }, // Total a pagar
    { wch: 16 }, // Total abonado
    { wch: 16 }, // Saldo pendiente
    { wch: 14 }, // Vegetarianos
    { wch: 10 }, // Veganos
  ];

  // ── 2. Hoja 2: "Abonos" ────────────────────────────────────────
  const abonosHeaders = [
    'Contrato',
    'Nombre',
    'Fecha',
    'Importe',
    'Método',
    'Folio / referencia',
    'Recibido por',
    'Estado',
  ];

  const allAbonos: SpreadsheetAbonoItem[] = [];
  rows.forEach((r) => {
    r.abonosList.forEach((a) => {
      allAbonos.push({
        ...a,
        contractFolio: a.contractFolio || r.contractFolio,
        graduateName: a.graduateName || r.graduateName,
      });
    });
  });

  const sortedAbonos = sortAbonosForExport(allAbonos);

  const abonosDataRows = sortedAbonos.map((a) => [
    a.contractFolio,
    a.graduateName,
    a.date,
    a.amount,
    a.method,
    a.reference,
    a.receivedBy || '', // Empty string if not recorded; never invent data
    a.status,
  ]);

  const abonosSheetAoa = [abonosHeaders, ...abonosDataRows];
  const abonosWs = XLSX.utils.aoa_to_sheet(abonosSheetAoa);

  // Column widths for Hoja 2
  abonosWs['!cols'] = [
    { wch: 22 }, // Contrato
    { wch: 30 }, // Nombre
    { wch: 14 }, // Fecha
    { wch: 16 }, // Importe
    { wch: 18 }, // Método
    { wch: 24 }, // Folio / referencia
    { wch: 24 }, // Recibido por
    { wch: 14 }, // Estado
  ];

  // Assemble workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, reportWs, 'Reporte del evento');
  XLSX.utils.book_append_sheet(wb, abonosWs, 'Abonos');

  return wb;
}

/**
 * Triggers client-side browser download of real .xlsx workbook.
 */
export function downloadEventReportXLSX(
  rows: EventSpreadsheetRow[],
  eventTitle: string,
  totals?: SpreadsheetTotals
): void {
  const wb = generateEventReportWorkbook(rows, totals);
  const sanitizedTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `reporte-${sanitizedTitle}-${timestamp}.xlsx`;

  // Write workbook to binary array and trigger download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes strings for CSV cells (backward compatibility).
 */
export function escapeCSVCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates CSV string (backward compatibility).
 */
export function generateEventReportCSV(rows: EventSpreadsheetRow[], totals?: SpreadsheetTotals): string {
  const effectiveTotals = totals || calculateReportTotals(rows);

  const headers = [
    'Mesa',
    'Nº contrato',
    'Nombre',
    'Adultos',
    'Niños 4–11',
    'Sin cena',
    'Abonos',
    'Total a pagar',
    'Total abonado',
    'Saldo pendiente',
    'Vegetarianos',
    'Veganos',
  ];

  const lines: string[] = [];
  lines.push(headers.map(escapeCSVCell).join(','));

  rows.forEach((row) => {
    const abonosDetail =
      row.abonosList.length > 0
        ? row.abonosList.map((a) => `$${a.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (${a.date})`).join('; ')
        : 'Sin abonos';

    const rowCells = [
      row.tableLabel,
      row.contractFolio,
      row.graduateName,
      row.adultsCount,
      row.childrenCount,
      row.noDinnerCount,
      abonosDetail,
      row.totalToPay.toFixed(2),
      row.totalPaid.toFixed(2),
      row.pendingBalance.toFixed(2),
      row.vegetarianCount,
      row.veganCount,
    ];
    lines.push(rowCells.map(escapeCSVCell).join(','));
  });

  const totalsCells = [
    'TOTALES',
    `${effectiveTotals.contractsCount} contratos`,
    '',
    effectiveTotals.adultsTotal,
    effectiveTotals.childrenTotal,
    effectiveTotals.noDinnerTotal,
    '',
    effectiveTotals.totalToPay.toFixed(2),
    effectiveTotals.totalPaid.toFixed(2),
    effectiveTotals.totalPending.toFixed(2),
    effectiveTotals.vegetarianTotal,
    effectiveTotals.veganTotal,
  ];
  lines.push(totalsCells.map(escapeCSVCell).join(','));

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Downloads CSV (backward compatibility).
 */
export function downloadEventReportExcelCSV(
  rows: EventSpreadsheetRow[],
  eventTitle: string,
  totals?: SpreadsheetTotals
): void {
  const csvContent = generateEventReportCSV(rows, totals);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const sanitizedTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `reporte-${sanitizedTitle}-${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
