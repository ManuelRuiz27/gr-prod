import type { EventSpreadsheetRow, SpreadsheetTotals } from './eventSpreadsheetViewModel';
import { calculateReportTotals } from './eventSpreadsheetViewModel';

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

  // Data rows
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

  // Totals row at bottom
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

  // UTF-8 BOM prefix (\uFEFF) ensures proper rendering of accents and special characters in Excel
  return '\uFEFF' + lines.join('\r\n');
}

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
