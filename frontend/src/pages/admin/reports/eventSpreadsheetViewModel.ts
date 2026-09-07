import { VISUAL_QA_GRADUATE_RECORDS, type GraduateRecordMock } from '../../../fixtures/adminGraduateVisualFixtures';
import { mockGraduatesList, type GraduateMock } from '../../../fixtures/graduateFixtures';
import { VISUAL_QA_GRADUATE_PAYMENT_STATES, type VisualGraduatePaymentState } from '../../../fixtures/paymentVisualFixtures';
import { mockPaymentPlansMap, type PaymentPlanMock } from '../../../fixtures/paymentFixtures';
import { VISUAL_QA_GROUP_STATES } from '../../../fixtures/contractGroupVisualFixtures';

export interface SpreadsheetAbonoItem {
  id: string;
  contractFolio: string;
  graduateName: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: string;
  /**
   * Cashier / operational receiver who physically collected the funds.
   * If not available in the model, remains undefined (UI '—', XLSX empty cell).
   */
  receivedBy?: string;
  /**
   * Internal audit: voucher reviewer.
   * NEVER mapped to receivedBy or exported under 'Recibido por'.
   */
  reviewedBy?: string;
}

export interface AttendeeComposition {
  adultsCount: number;
  childrenCount: number;
  noDinnerCount: number;
  vegetarianCount: number;
  veganCount: number;
}

/**
 * Derives attendee categories mutually exclusively:
 * 1. Child 4–11 if item indicates child/infant.
 * 2. Sin cena if item indicates sin cena / no dinner (and not child).
 * 3. Adult with dinner for all other seats.
 * Ensures adultsCount + childrenCount + noDinnerCount strictly matches ticketCount.
 */
export function deriveAttendeeComposition(
  ticketCount: number,
  guests?: Array<{ productType?: string; meal?: string; name?: string }> | null
): AttendeeComposition {
  let childrenCount = 0;
  let noDinnerCount = 0;
  let explicitAdultsCount = 0;
  let vegetarianCount = 0;
  let veganCount = 0;

  if (guests && guests.length > 0) {
    guests.forEach((g) => {
      const pType = (g.productType || '').toLowerCase();
      const meal = (g.meal || '').toLowerCase();
      const name = (g.name || '').toLowerCase();

      const isChild =
        pType.includes('niño') ||
        pType.includes('infantil') ||
        pType.includes('child') ||
        meal.includes('infantil') ||
        name.includes('(niño)') ||
        name.includes('(niña)');

      const isNoDinner =
        !isChild &&
        (pType.includes('sin cena') ||
          pType.includes('sin_cena') ||
          pType.includes('no_dinner') ||
          pType.includes('no dinner') ||
          meal.includes('sin cena') ||
          name.includes('(sin cena)'));

      if (isChild) {
        childrenCount += 1;
      } else if (isNoDinner) {
        noDinnerCount += 1;
      } else {
        explicitAdultsCount += 1;
      }

      if (meal.includes('vegetariano')) {
        vegetarianCount += 1;
      } else if (meal.includes('vegano')) {
        veganCount += 1;
      }
    });
  }

  const categorizedExplicit = explicitAdultsCount + childrenCount + noDinnerCount;
  const remainingPlaces = Math.max(0, ticketCount - categorizedExplicit);
  const adultsCount = explicitAdultsCount + remainingPlaces;

  return {
    adultsCount,
    childrenCount,
    noDinnerCount,
    vegetarianCount,
    veganCount,
  };
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
        contractFolio: rec.contractFolio || '',
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
        contractFolio: (grad as any).contractFolio || '',
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
        contractFolio: '',
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
          const matchingSub = cand.paymentState?.submissions?.find(
            (s) => s.reference === tx.reference || s.id === tx.id || (s.amount === tx.amount && s.status === 'APPROVED')
          );

          // Data gap note: 'reviewedBy' represents the voucher auditor, NOT the cashier ('receivedBy').
          // If no explicit receivedBy field exists in domain models, keep receivedBy undefined.
          const explicitReceivedBy = (tx as any).receivedBy || undefined;

          abonosList.push({
            id: tx.id,
            contractFolio: cand.contractFolio,
            graduateName: cand.name,
            amount: tx.amount,
            date: tx.paidAt || '',
            method: tx.method,
            reference: tx.reference || '',
            status: 'APROBADO',
            receivedBy: explicitReceivedBy,
            reviewedBy: matchingSub?.reviewedBy,
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
            const explicitReceivedBy = (tx as any).receivedBy || undefined;
            abonosList.push({
              id: tx.id,
              contractFolio: cand.contractFolio,
              graduateName: cand.name,
              amount: tx.amount,
              date: tx.paidAt || '',
              method: tx.method,
              reference: tx.reference || '',
              status: 'APROBADO',
              receivedBy: explicitReceivedBy,
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
        // Date and reference must come strictly from actual payment records, never contractAcceptedAt or hardcoded 'CONF-001'
        const realPaymentDate =
          cand.visualRecord.pendingProofDetails?.status === 'APPROVED'
            ? cand.visualRecord.pendingProofDetails.date
            : '';
        const realReference =
          cand.visualRecord.pendingProofDetails?.status === 'APPROVED'
            ? cand.visualRecord.pendingProofDetails.reference || ''
            : '';

        abonosList.push({
          id: `abono-${cand.id}`,
          contractFolio: cand.contractFolio,
          graduateName: cand.name,
          amount: totalPaid,
          date: realPaymentDate,
          method: 'Transferencia',
          reference: realReference,
          status: 'APROBADO',
          receivedBy: undefined,
        });
      }
    }

    // Attendees and Diets (mutually exclusive classification)
    const {
      adultsCount,
      childrenCount,
      noDinnerCount,
      vegetarianCount,
      veganCount,
    } = deriveAttendeeComposition(
      cand.ticketCount,
      cand.visualRecord?.guests || cand.gradMock?.guests
    );

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

export interface EventPrices {
  adultPrice: number | null;
  childPrice: number | null;
  noDinnerPrice: number | null;
}

/**
 * Resolves configured ticket prices for an event using real domain data.
 * Falls back to null ('—') if not configured; never fabricates dummy prices.
 */
export function resolveEventPrices(
  eventId: string,
  event?: { institution?: string; career?: string; venue?: string; date?: string } | null
): EventPrices {
  let adultPrice: number | null = null;
  let childPrice: number | null = null;
  let noDinnerPrice: number | null = null;

  // 1. Explicit properties on event object
  if (event) {
    const e = event as any;
    if (typeof e.adultPrice === 'number') adultPrice = e.adultPrice;
    if (typeof e.childPrice === 'number') childPrice = e.childPrice;
    if (typeof e.noDinnerPrice === 'number') noDinnerPrice = e.noDinnerPrice;
    if (e.prices) {
      if (typeof e.prices.adult === 'number') adultPrice = e.prices.adult;
      if (typeof e.prices.child === 'number') childPrice = e.prices.child;
      if (typeof e.prices.noDinner === 'number') noDinnerPrice = e.prices.noDinner;
    }
  }

  // 2. Canonical group state product options for this event
  if (adultPrice === null || childPrice === null || noDinnerPrice === null) {
    for (const groupState of Object.values(VISUAL_QA_GROUP_STATES)) {
      if (groupState.eventId === eventId && groupState.availableProductOptions?.length) {
        for (const opt of groupState.availableProductOptions) {
          if (opt.productType === 'ADULT' && adultPrice === null) {
            adultPrice = opt.price;
          } else if (opt.productType === 'CHILD' && childPrice === null) {
            childPrice = opt.price;
          } else if (opt.productType === 'NO_DINNER' && noDinnerPrice === null) {
            noDinnerPrice = opt.price;
          }
        }
      }
    }
  }

  return { adultPrice, childPrice, noDinnerPrice };
}

export interface EventReservationSummary {
  apartadosTotal: number;
  adultsTotal: number;
  childrenTotal: number;
  noDinnerTotal: number;
  graduatesCount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  penalties: string;
  courtesies: string;
}

export function calculateEventReservationSummary(
  totals: SpreadsheetTotals,
  penalties?: number | string | null,
  courtesies?: number | string | null
): EventReservationSummary {
  return {
    apartadosTotal: totals.adultsTotal + totals.childrenTotal + totals.noDinnerTotal,
    adultsTotal: totals.adultsTotal,
    childrenTotal: totals.childrenTotal,
    noDinnerTotal: totals.noDinnerTotal,
    graduatesCount: totals.contractsCount,
    totalAmount: totals.totalToPay,
    paidAmount: totals.totalPaid,
    pendingAmount: totals.totalPending,
    penalties: penalties !== null && penalties !== undefined ? String(penalties) : '—',
    courtesies: courtesies !== null && courtesies !== undefined ? String(courtesies) : '—',
  };
}
