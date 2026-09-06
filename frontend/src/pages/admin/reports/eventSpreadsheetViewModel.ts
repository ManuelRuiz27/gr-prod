import { VISUAL_QA_GRADUATE_RECORDS, type GraduateRecordMock } from '../../../fixtures/adminGraduateVisualFixtures';
import { mockGraduatesList, type GraduateMock } from '../../../fixtures/graduateFixtures';
import { VISUAL_QA_GRADUATE_PAYMENT_STATES, type VisualGraduatePaymentState } from '../../../fixtures/paymentVisualFixtures';
import { mockPaymentPlansMap, type PaymentPlanMock } from '../../../fixtures/paymentFixtures';

export interface SpreadsheetAbonoItem {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: string;
}

export interface EventSpreadsheetRow {
  graduateId: string;
  tableNumber: number | null;
  tableLabel: string;
  contractFolio: string;
  graduateName: string;
  adultsCount: number;
  childrenCount: number;
  noDinnerCount: number;
  abonosList: SpreadsheetAbonoItem[];
  abonosSummaryText: string;
  totalToPay: number;
  totalPaid: number;
  pendingBalance: number;
  isLiquidated: boolean;
  financialStatus: 'AL_DIA' | 'ATRASADO' | 'LIQUIDADO' | 'PRORROGA';
  vegetarianCount: number;
  veganCount: number;
  overdueInstallmentsCount: number;
}

export interface SpreadsheetTotals {
  contractsCount: number;
  adultsTotal: number;
  childrenTotal: number;
  noDinnerTotal: number;
  totalToPay: number;
  totalPaid: number;
  totalPending: number;
  vegetarianTotal: number;
  veganTotal: number;
}

export interface SpreadsheetFilterState {
  searchQuery: string;
  tableFilter: string; // 'ALL' | 'without_table' | number string
  financialStatusFilter: string; // 'ALL' | 'AL_DIA' | 'ATRASADO' | 'LIQUIDADO' | 'PRORROGA'
  balanceFilter: string; // 'ALL' | 'pending' | 'liquidated'
  dietFilter: string; // 'ALL' | 'vegetarian' | 'vegan' | 'any_special'
}

export const INITIAL_SPREADSHEET_FILTER_STATE: SpreadsheetFilterState = {
  searchQuery: '',
  tableFilter: 'ALL',
  financialStatusFilter: 'ALL',
  balanceFilter: 'ALL',
  dietFilter: 'ALL',
};

export function formatCurrencyMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAbonosSummary(abonos: SpreadsheetAbonoItem[]): string {
  if (abonos.length === 0) {
    return 'Sin abonos';
  }
  if (abonos.length <= 3) {
    return abonos.map((a) => formatCurrencyMXN(a.amount).replace(/\.00$/, '')).join(' · ');
  }
  const sum = abonos.reduce((acc, a) => acc + a.amount, 0);
  return `${abonos.length} abonos · ${formatCurrencyMXN(sum).replace(/\.00$/, '')}`;
}

function parseCurrencyString(val?: string | number | null): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.-]+/g, '')) || 0;
}

export function buildEventSpreadsheetRows(eventId: string): EventSpreadsheetRow[] {
  const seenIds = new Set<string>();

  interface CandidateRecord {
    id: string;
    name: string;
    contractFolio: string;
    tableNumber: number | null;
    ticketCount: number;
    visualRecord?: GraduateRecordMock;
    gradMock?: GraduateMock;
    paymentState?: VisualGraduatePaymentState;
    planMock?: PaymentPlanMock;
  }

  const candidates: CandidateRecord[] = [];

  // 1. From VISUAL_QA_GRADUATE_RECORDS
  Object.values(VISUAL_QA_GRADUATE_RECORDS).forEach((rec: GraduateRecordMock) => {
    if (rec.eventId === eventId && !seenIds.has(rec.id)) {
      seenIds.add(rec.id);
      candidates.push({
        id: rec.id,
        name: rec.fullName,
        contractFolio: rec.contractFolio || `CT-${rec.id}`,
        tableNumber: rec.tableNumber,
        ticketCount: rec.ticketCount,
        visualRecord: rec,
        paymentState: VISUAL_QA_GRADUATE_PAYMENT_STATES[rec.id],
        planMock: mockPaymentPlansMap[rec.id],
      });
    }
  });

  // 2. From mockGraduatesList
  mockGraduatesList.forEach((grad: GraduateMock) => {
    if (grad.eventId === eventId && !seenIds.has(grad.id)) {
      seenIds.add(grad.id);
      candidates.push({
        id: grad.id,
        name: grad.fullName,
        contractFolio: `CT-${grad.id}`,
        tableNumber: grad.tableNumber,
        ticketCount: grad.ticketCount,
        gradMock: grad,
        paymentState: VISUAL_QA_GRADUATE_PAYMENT_STATES[grad.id],
        planMock: mockPaymentPlansMap[grad.id],
      });
    }
  });

  // 3. Additional candidates from VISUAL_QA_GRADUATE_PAYMENT_STATES
  Object.values(VISUAL_QA_GRADUATE_PAYMENT_STATES).forEach((ps: VisualGraduatePaymentState) => {
    if (ps.eventId === eventId && !seenIds.has(ps.graduateId)) {
      seenIds.add(ps.graduateId);
      candidates.push({
        id: ps.graduateId,
        name: ps.graduateName,
        contractFolio: `CT-${ps.graduateId.replace('grad-', '').toUpperCase()}`,
        tableNumber: null,
        ticketCount: 4,
        paymentState: ps,
      });
    }
  });

  return candidates.map((cand) => {
    let totalToPay = 0;
    let totalPaid = 0;
    let pendingBalance = 0;
    let financialStatus: 'AL_DIA' | 'ATRASADO' | 'LIQUIDADO' | 'PRORROGA' = 'AL_DIA';
    let overdueInstallmentsCount = 0;
    const abonosList: SpreadsheetAbonoItem[] = [];

    if (cand.paymentState) {
      totalToPay = cand.paymentState.totalContracted;
      totalPaid = cand.paymentState.totalPaid;
      pendingBalance = cand.paymentState.totalPending;
      overdueInstallmentsCount = cand.paymentState.installments
        ? cand.paymentState.installments.filter((i) => i.status === 'OVERDUE').length
        : cand.paymentState.totalOverdue > 0
          ? 1
          : 0;

      if (pendingBalance <= 0) {
        financialStatus = 'LIQUIDADO';
      } else if (cand.paymentState.totalOverdue > 0 || overdueInstallmentsCount > 0) {
        financialStatus = 'ATRASADO';
      } else {
        financialStatus = 'AL_DIA';
      }

      if (cand.paymentState.confirmedTransactions) {
        cand.paymentState.confirmedTransactions.forEach((tx) => {
          abonosList.push({
            id: tx.id,
            amount: tx.amount,
            date: tx.paidAt,
            method: tx.method,
            reference: tx.reference || tx.id,
            status: 'APROBADO',
          });
        });
      }
    } else if (cand.planMock) {
      totalToPay = cand.planMock.totalAmount;
      totalPaid = cand.planMock.paidAmount;
      pendingBalance = cand.planMock.pendingAmount;
      overdueInstallmentsCount = cand.planMock.installments.filter((i) => i.status === 'OVERDUE').length;
      financialStatus = pendingBalance <= 0 ? 'LIQUIDADO' : overdueInstallmentsCount > 0 ? 'ATRASADO' : 'AL_DIA';

      if (cand.planMock.transactions) {
        cand.planMock.transactions.forEach((tx) => {
          if (tx.status === 'CONFIRMED') {
            abonosList.push({
              id: tx.id,
              amount: tx.amount,
              date: tx.paidAt,
              method: tx.method,
              reference: tx.reference || tx.id,
              status: 'APROBADO',
            });
          }
        });
      }
    } else if (cand.visualRecord) {
      totalToPay = parseCurrencyString(cand.visualRecord.totalAmount);
      totalPaid = parseCurrencyString(cand.visualRecord.paidAmount);
      pendingBalance = parseCurrencyString(cand.visualRecord.balanceAmount);
      const overdue = parseCurrencyString(cand.visualRecord.overdueAmount);
      overdueInstallmentsCount = overdue > 0 ? 1 : 0;

      if (pendingBalance <= 0 || cand.visualRecord.financialStatus === 'LIQUIDADO') {
        financialStatus = 'LIQUIDADO';
      } else if (cand.visualRecord.financialStatus === 'VENCIDO' || overdue > 0) {
        financialStatus = 'ATRASADO';
      } else {
        financialStatus = 'AL_DIA';
      }

      if (totalPaid > 0) {
        abonosList.push({
          id: `abono-${cand.id}`,
          amount: totalPaid,
          date: cand.visualRecord.contractAcceptedAt || '2026-10-15',
          method: 'Transferencia',
          reference: 'CONF-001',
          status: 'APROBADO',
        });
      }
    }

    // Attendees and Diets
    let adultsCount = cand.ticketCount || 1;
    let childrenCount = 0;
    let noDinnerCount = 0;
    let vegetarianCount = 0;
    let veganCount = 0;

    if (cand.visualRecord && cand.visualRecord.guests && cand.visualRecord.guests.length > 0) {
      cand.visualRecord.guests.forEach((g) => {
        const pType = g.productType.toLowerCase();
        if (pType.includes('niño') || pType.includes('infantil')) {
          childrenCount += 1;
        }
        if (pType.includes('sin cena')) {
          noDinnerCount += 1;
        }
        const m = g.meal.toLowerCase();
        if (m.includes('vegetariano')) vegetarianCount += 1;
        if (m.includes('vegano')) veganCount += 1;
      });
      // Adults are remaining ticketCount or adult guests
      adultsCount = Math.max(1, cand.ticketCount - childrenCount);
    } else if (cand.gradMock && cand.gradMock.guests && cand.gradMock.guests.length > 0) {
      cand.gradMock.guests.forEach((g) => {
        const m = g.meal.toLowerCase();
        if (m.includes('vegetariano')) vegetarianCount += 1;
        if (m.includes('vegano')) veganCount += 1;
      });
    }

    const isLiquidated = pendingBalance <= 0;
    const tableNumber = cand.tableNumber;
    const tableLabel = tableNumber !== null ? `Mesa ${tableNumber}` : 'Sin mesa';

    return {
      graduateId: cand.id,
      tableNumber,
      tableLabel,
      contractFolio: cand.contractFolio,
      graduateName: cand.name,
      adultsCount,
      childrenCount,
      noDinnerCount,
      abonosList,
      abonosSummaryText: formatAbonosSummary(abonosList),
      totalToPay,
      totalPaid,
      pendingBalance,
      isLiquidated,
      financialStatus,
      vegetarianCount,
      veganCount,
      overdueInstallmentsCount,
    };
  });
}

export function filterEventSpreadsheetRows(
  rows: EventSpreadsheetRow[],
  filters: SpreadsheetFilterState
): EventSpreadsheetRow[] {
  return rows.filter((row) => {
    // 1. Text Search (name, folio, table)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = row.graduateName.toLowerCase().includes(q);
      const matchFolio = row.contractFolio.toLowerCase().includes(q);
      const matchTable =
        row.tableLabel.toLowerCase().includes(q) ||
        (row.tableNumber !== null && String(row.tableNumber).includes(q));

      if (!matchName && !matchFolio && !matchTable) {
        return false;
      }
    }

    // 2. Table Filter
    if (filters.tableFilter !== 'ALL') {
      if (filters.tableFilter === 'without_table') {
        if (row.tableNumber !== null) return false;
      } else {
        if (String(row.tableNumber) !== filters.tableFilter) return false;
      }
    }

    // 3. Financial Status Filter
    if (filters.financialStatusFilter !== 'ALL') {
      if (row.financialStatus !== filters.financialStatusFilter) {
        return false;
      }
    }

    // 4. Balance Filter
    if (filters.balanceFilter !== 'ALL') {
      if (filters.balanceFilter === 'liquidated' && !row.isLiquidated) return false;
      if (filters.balanceFilter === 'pending' && row.isLiquidated) return false;
    }

    // 5. Diet Filter
    if (filters.dietFilter !== 'ALL') {
      if (filters.dietFilter === 'vegetarian' && row.vegetarianCount <= 0) return false;
      if (filters.dietFilter === 'vegan' && row.veganCount <= 0) return false;
      if (filters.dietFilter === 'any_special' && row.vegetarianCount <= 0 && row.veganCount <= 0)
        return false;
    }

    return true;
  });
}

export function calculateReportTotals(rows: EventSpreadsheetRow[]): SpreadsheetTotals {
  return rows.reduce<SpreadsheetTotals>(
    (acc, row) => ({
      contractsCount: acc.contractsCount + 1,
      adultsTotal: acc.adultsTotal + row.adultsCount,
      childrenTotal: acc.childrenTotal + row.childrenCount,
      noDinnerTotal: acc.noDinnerTotal + row.noDinnerCount,
      totalToPay: acc.totalToPay + row.totalToPay,
      totalPaid: acc.totalPaid + row.totalPaid,
      totalPending: acc.totalPending + row.pendingBalance,
      vegetarianTotal: acc.vegetarianTotal + row.vegetarianCount,
      veganTotal: acc.veganTotal + row.veganCount,
    }),
    {
      contractsCount: 0,
      adultsTotal: 0,
      childrenTotal: 0,
      noDinnerTotal: 0,
      totalToPay: 0,
      totalPaid: 0,
      totalPending: 0,
      vegetarianTotal: 0,
      veganTotal: 0,
    }
  );
}
