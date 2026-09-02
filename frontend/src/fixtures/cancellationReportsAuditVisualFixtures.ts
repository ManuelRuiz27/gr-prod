/**
 * cancellationReportsAuditVisualFixtures.ts
 *
 * VISUAL_QA_ONLY — NON_NORMATIVE
 * Fixtures dedicados exclusivamente a la validación visual, escenarios de prueba y QA
 * para VIS-12 / VIS-12-R1 (Políticas de cancelación, Cotización de cancelación, Reportes y Auditoría).
 *
 * Las cifras, porcentajes y registros representan escenarios de prueba de UI y no son
 * valores por defecto normativos ni reglas de negocio fijas.
 */

// ── 1. CANCELLATION POLICY TYPES & FIXTURES ──────────────────────────────────

export type CancellationPolicyStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface VisualCancellationPolicyRange {
  id: string;
  daysBeforeMin: number;
  daysBeforeMax: number | null; // null = Sin límite
  penaltyPercent: number;
  sortOrder: number;
}

export interface VisualCancellationPolicy {
  id: string;
  eventId: string;
  version: number;
  status: CancellationPolicyStatus;
  publishedAt?: string;
  publishedBy?: string;
  linkedContractsCount?: number;
  ranges: VisualCancellationPolicyRange[];
}

export const VISUAL_QA_CANCELLATION_POLICIES: Record<string, VisualCancellationPolicy[]> = {
  'evt-derecho-2027': [
    {
      id: 'pol-evt-derecho-v1',
      eventId: 'evt-derecho-2027',
      version: 1,
      status: 'ARCHIVED',
      publishedAt: '2026-11-01 12:00',
      publishedBy: 'Lic. Roberto Méndez',
      linkedContractsCount: 0,
      ranges: [
        { id: 'rng-v1-1', daysBeforeMin: 0, daysBeforeMax: 15, penaltyPercent: 100, sortOrder: 1 },
        { id: 'rng-v1-2', daysBeforeMin: 16, daysBeforeMax: 45, penaltyPercent: 50, sortOrder: 2 },
        { id: 'rng-v1-3', daysBeforeMin: 46, daysBeforeMax: null, penaltyPercent: 20, sortOrder: 3 },
      ],
    },
    {
      id: 'pol-evt-derecho-v2',
      eventId: 'evt-derecho-2027',
      version: 2,
      status: 'ACTIVE',
      publishedAt: '2027-01-15 10:30',
      publishedBy: 'Lic. Roberto Méndez',
      linkedContractsCount: 42,
      ranges: [
        { id: 'rng-v2-1', daysBeforeMin: 0, daysBeforeMax: 30, penaltyPercent: 50, sortOrder: 1 },
        { id: 'rng-v2-2', daysBeforeMin: 31, daysBeforeMax: 60, penaltyPercent: 30, sortOrder: 2 },
        { id: 'rng-v2-3', daysBeforeMin: 61, daysBeforeMax: null, penaltyPercent: 10, sortOrder: 3 },
      ],
    },
    {
      id: 'pol-evt-derecho-v3',
      eventId: 'evt-derecho-2027',
      version: 3,
      status: 'DRAFT',
      linkedContractsCount: 0,
      ranges: [
        { id: 'rng-v3-1', daysBeforeMin: 0, daysBeforeMax: 20, penaltyPercent: 60, sortOrder: 1 },
        { id: 'rng-v3-2', daysBeforeMin: 21, daysBeforeMax: 50, penaltyPercent: 35, sortOrder: 2 },
        { id: 'rng-v3-3', daysBeforeMin: 51, daysBeforeMax: null, penaltyPercent: 15, sortOrder: 3 },
      ],
    },
  ],
  'evt-medicina-2027': [
    {
      id: 'pol-evt-med-v1',
      eventId: 'evt-medicina-2027',
      version: 1,
      status: 'ACTIVE',
      publishedAt: '2026-12-01 09:00',
      publishedBy: 'Dra. Claudia Ramos',
      linkedContractsCount: 18,
      ranges: [
        { id: 'rng-med-1', daysBeforeMin: 0, daysBeforeMax: 40, penaltyPercent: 40, sortOrder: 1 },
        { id: 'rng-med-2', daysBeforeMin: 41, daysBeforeMax: null, penaltyPercent: 10, sortOrder: 2 },
      ],
    },
  ],
};

// ── 2. CANCELLATION QUOTE TYPES & FIXTURES ───────────────────────────────────

export type CancellationQuoteStatus = 'READY' | 'LOADING' | 'ERROR' | 'EXPIRED';

export interface VisualCancellationQuote {
  id: string;
  graduateMembershipId: string;
  graduateName: string;
  contractFolio: string;
  eventId: string;
  eventName: string;
  calculatedAt: string;
  expiresAt: string;
  status: CancellationQuoteStatus;
  totalContracted: number;
  totalPaid: number;
  daysBeforeEvent: number;
  policyVersion: number;
  policyStatus: string;
  appliedRangeLabel: string;
  penaltyPercent: number;
  penaltyAmount: number;
  retainedAmount: number;
  refundDue: number;
  remainingDue: number;
  releasedPlacesSummary?: {
    activeMembers: number;
    assignedTables: string[];
    totalPlaces: number;
  };
}

export const VISUAL_QA_CANCELLATION_QUOTES: Record<string, VisualCancellationQuote> = {
  // Scenario 1: Ready with refund (Andrea Martínez)
  'quote-andrea-martinez': {
    id: 'quote-can-0042',
    graduateMembershipId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    contractFolio: 'CT-2027-0042',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    calculatedAt: '2027-04-10 11:20',
    expiresAt: '2027-04-10 13:20',
    status: 'READY',
    totalContracted: 24500,
    totalPaid: 14700,
    daysBeforeEvent: 45,
    policyVersion: 2,
    policyStatus: 'Activa',
    appliedRangeLabel: '31 a 60 días antes del evento',
    penaltyPercent: 30,
    penaltyAmount: 7350,
    retainedAmount: 7350,
    refundDue: 7350,
    remainingDue: 0,
    releasedPlacesSummary: {
      activeMembers: 3,
      assignedTables: ['Mesa 24'],
      totalPlaces: 3,
    },
  },

  // Scenario 2: Ready with remaining due (Fernando Torres)
  'quote-remaining-due': {
    id: 'quote-can-0058',
    graduateMembershipId: 'grad-fernando-torres',
    graduateName: 'Fernando Torres',
    contractFolio: 'CT-2027-0058',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    calculatedAt: '2027-04-10 11:25',
    expiresAt: '2027-04-10 13:25',
    status: 'READY',
    totalContracted: 15000,
    totalPaid: 3000,
    daysBeforeEvent: 20,
    policyVersion: 2,
    policyStatus: 'Activa',
    appliedRangeLabel: '0 a 30 días antes del evento',
    penaltyPercent: 50,
    penaltyAmount: 7500,
    retainedAmount: 3000,
    refundDue: 0,
    remainingDue: 4500,
    releasedPlacesSummary: {
      activeMembers: 2,
      assignedTables: ['Mesa 12'],
      totalPlaces: 2,
    },
  },

  // Scenario 3: Ready with zero refund and zero remaining (Mariana López)
  'quote-zero-balance': {
    id: 'quote-can-0077',
    graduateMembershipId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    contractFolio: 'CT-2027-0077',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    calculatedAt: '2027-04-10 11:30',
    expiresAt: '2027-04-10 13:30',
    status: 'READY',
    totalContracted: 10000,
    totalPaid: 5000,
    daysBeforeEvent: 25,
    policyVersion: 2,
    policyStatus: 'Activa',
    appliedRangeLabel: '0 a 30 días antes del evento',
    penaltyPercent: 50,
    penaltyAmount: 5000,
    retainedAmount: 5000,
    refundDue: 0,
    remainingDue: 0,
    releasedPlacesSummary: {
      activeMembers: 1,
      assignedTables: ['Mesa 08'],
      totalPlaces: 1,
    },
  },

  // Scenario 4: Expired quote (Andrea)
  'quote-expired': {
    id: 'quote-can-0033',
    graduateMembershipId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    contractFolio: 'CT-2027-0042',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    calculatedAt: '2027-04-09 08:00',
    expiresAt: '2027-04-09 10:00',
    status: 'EXPIRED',
    totalContracted: 24500,
    totalPaid: 14700,
    daysBeforeEvent: 46,
    policyVersion: 2,
    policyStatus: 'Activa',
    appliedRangeLabel: '31 a 60 días antes del evento',
    penaltyPercent: 30,
    penaltyAmount: 7350,
    retainedAmount: 7350,
    refundDue: 7350,
    remainingDue: 0,
  },

  // Scenario 5: Error calculation
  'quote-error': {
    id: 'quote-can-err',
    graduateMembershipId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    contractFolio: 'CT-2027-0042',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    calculatedAt: '',
    expiresAt: '',
    status: 'ERROR',
    totalContracted: 0,
    totalPaid: 0,
    daysBeforeEvent: 0,
    policyVersion: 0,
    policyStatus: '',
    appliedRangeLabel: '',
    penaltyPercent: 0,
    penaltyAmount: 0,
    retainedAmount: 0,
    refundDue: 0,
    remainingDue: 0,
  },
};

/**
 * Mapping of visual QA cancellation quotes strictly by graduateId.
 * No hardcoded defaults or unintended cross-graduate fallbacks.
 */
export const VISUAL_QA_CANCELLATION_QUOTE_BY_GRADUATE_ID: Record<string, VisualCancellationQuote> = {
  'grad-andrea-martinez': VISUAL_QA_CANCELLATION_QUOTES['quote-andrea-martinez'],
  'grad-fernando-torres': VISUAL_QA_CANCELLATION_QUOTES['quote-remaining-due'],
  'grad-mariana-lopez': VISUAL_QA_CANCELLATION_QUOTES['quote-zero-balance'],
};

/**
 * Resolver function for Visual QA cancellation quotes.
 * Strictly verifies identity invariants (graduateMembershipId and contractFolio).
 * Returns null if no valid scenario exists for the specific graduate.
 */
export function getVisualQaCancellationQuote(
  graduateId: string,
  contractFolio?: string,
  scenarioOverrideId?: string
): VisualCancellationQuote | null {
  if (scenarioOverrideId && VISUAL_QA_CANCELLATION_QUOTES[scenarioOverrideId]) {
    const override = VISUAL_QA_CANCELLATION_QUOTES[scenarioOverrideId];
    // Error or expired scenario overrides are valid for QA testing
    if (override.status === 'ERROR' || override.status === 'EXPIRED') {
      return override;
    }
    // For ready override scenarios, ensure graduateId matches
    if (override.graduateMembershipId === graduateId) {
      return override;
    }
    return null;
  }

  const quote = VISUAL_QA_CANCELLATION_QUOTE_BY_GRADUATE_ID[graduateId];
  if (!quote) {
    return null;
  }

  // Invariant 1: Graduate ID must match
  if (quote.graduateMembershipId !== graduateId) {
    return null;
  }

  // Invariant 2: If contractFolio is provided and not empty/placeholder, check compatibility
  if (contractFolio && contractFolio !== '—' && quote.contractFolio) {
    const quoteNum = quote.contractFolio.replace(/^[A-Za-z-]+/, '');
    const folioNum = contractFolio.replace(/^[A-Za-z-]+/, '');
    if (quote.contractFolio !== contractFolio && quoteNum !== folioNum) {
      return null;
    }
  }

  return quote;
}

// ── 3. REPORTS TYPES & FIXTURES (7 FAMILIES + TEMPORAL RESOLUTION) ───────────

export type ReportTimeRange = 'daily' | 'weekly' | 'monthly';

export interface VisualReportPaymentTransaction {
  id: string;
  date: string;
  graduateName: string;
  concept: string;
  amount: number;
  method: 'TRANSFER' | 'DEPOSIT' | 'CASH' | 'OPENPAY' | 'MERCADOPAGO';
  reference: string;
  status: 'CONFIRMED' | 'REVERSED';
}

export interface VisualReportPaymentSubmission {
  id: string;
  folio: string;
  graduateName: string;
  reportedAmount: number;
  method: 'TRANSFER' | 'DEPOSIT';
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewer?: string;
  reviewDate?: string;
}

export interface VisualReportPortfolioItem {
  graduateId: string;
  fullName: string;
  contractFolio: string;
  totalContracted: number;
  paidAmount: number;
  pendingAmount: number;
  nextPaymentDueDate: string;
  overdueDays: number;
  status: 'AL_CORRIENTE' | 'PROXIMO' | 'ATRASADO';
}

export interface VisualReportTableItem {
  tableNumber: number;
  capacity: number;
  occupied: number;
  available: number;
  assignedPeopleCount: number;
  assignedNames?: string[];
}

export interface VisualReportMealItem {
  graduateName: string;
  personName: string;
  mealOption: string;
  isCustomDiet?: boolean;
}

export interface VisualReportThermoItem {
  folio: string;
  graduateName: string;
  status: 'LOCKED' | 'AVAILABLE' | 'REQUESTED' | 'IN_PRODUCTION' | 'DELIVERED';
  customName?: string;
  deliveredAt?: string;
  receivedBy?: string;
}

export interface VisualEventReportsData {
  eventId: string;
  eventName: string;
  timeRange: ReportTimeRange;
  // 1. Cobranza
  financial: {
    totalContracted: number;
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    penaltiesAmount: number;
    refundsAmount: number;
    hasData: boolean;
  };
  // 2. Cartera
  portfolio: {
    graduatesWithPlan: VisualReportPortfolioItem[];
    hasData: boolean;
  };
  // 3. Pagos (PaymentTransaction confirmadas)
  payments: {
    transactions: VisualReportPaymentTransaction[];
    totalConfirmedAmount: number;
    hasData: boolean;
  };
  // 4. Comprobantes (PaymentSubmission)
  submissions: {
    queue: VisualReportPaymentSubmission[];
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    hasData: boolean;
  };
  // 5. Mesas
  tables: {
    tablesCount: number;
    totalCapacity: number;
    totalOccupied: number;
    totalAvailable: number;
    tableRows: VisualReportTableItem[];
    hasData: boolean;
  };
  // 6. Platillos
  meals: {
    totalGuestsRegistered: number;
    optionsTally: Record<string, number>;
    pendingCount: number;
    nominalSelections?: VisualReportMealItem[];
    hasData: boolean;
  };
  // 7. Termos
  thermos: {
    total: number;
    locked: number;
    available: number;
    requested: number;
    inProduction: number;
    delivered: number;
    thermoRows?: VisualReportThermoItem[];
    hasData: boolean;
  };
}

// Reconciled sample transactions for evt-derecho-2027:
// Sum of confirmed = 3000 + 2500 + 2000 = 7500 (Matches totalCollected!)
const SAMPLE_TRANSACTIONS_EVT_DERECHO: VisualReportPaymentTransaction[] = [
  {
    id: 'tx-001',
    date: '2027-02-15 10:15',
    graduateName: 'Andrea Martínez',
    concept: 'Pago Inicial Contrato CT-2027-0042',
    amount: 3000,
    method: 'TRANSFER',
    reference: 'SPEI-8829104',
    status: 'CONFIRMED',
  },
  {
    id: 'tx-002',
    date: '2027-03-01 14:20',
    graduateName: 'Andrea Martínez',
    concept: 'Mensualidad 1 Contrato CT-2027-0042',
    amount: 2500,
    method: 'TRANSFER',
    reference: 'SPEI-9938210',
    status: 'CONFIRMED',
  },
  {
    id: 'tx-003',
    date: '2027-03-05 16:45',
    graduateName: 'Fernando Torres',
    concept: 'Pago Inicial Contrato CT-2027-0099',
    amount: 2000,
    method: 'CASH',
    reference: 'REC-00192',
    status: 'CONFIRMED',
  },
];

const SAMPLE_SUBMISSIONS_EVT_DERECHO: VisualReportPaymentSubmission[] = [
  {
    id: 'sub-001',
    folio: 'SUB-2027-001',
    graduateName: 'Andrea Martínez',
    reportedAmount: 2500,
    method: 'TRANSFER',
    status: 'APPROVED',
    reviewer: 'Admin Finanzas',
    reviewDate: '2027-03-01 14:30',
  },
  {
    id: 'sub-002',
    folio: 'SUB-2027-002',
    graduateName: 'Mariana López',
    reportedAmount: 2500,
    method: 'DEPOSIT',
    status: 'PENDING_REVIEW',
  },
  {
    id: 'sub-003',
    folio: 'SUB-2027-003',
    graduateName: 'Carlos Gómez',
    reportedAmount: 1800,
    method: 'TRANSFER',
    status: 'REJECTED',
    reviewer: 'Admin Finanzas',
    reviewDate: '2027-03-02 09:15',
  },
];

const SAMPLE_PORTFOLIO_GRADUATES: VisualReportPortfolioItem[] = [
  {
    graduateId: 'grad-andrea-martinez',
    fullName: 'Andrea Martínez',
    contractFolio: 'CT-2027-0042',
    totalContracted: 12500,
    paidAmount: 7500,
    pendingAmount: 5000,
    nextPaymentDueDate: '2027-04-15',
    overdueDays: 0,
    status: 'AL_CORRIENTE',
  },
  {
    graduateId: 'grad-fernando-torres',
    fullName: 'Fernando Torres',
    contractFolio: 'CT-2027-0099',
    totalContracted: 15000,
    paidAmount: 3000,
    pendingAmount: 12000,
    nextPaymentDueDate: '2027-03-20',
    overdueDays: 15,
    status: 'ATRASADO',
  },
  {
    graduateId: 'grad-mariana-lopez',
    fullName: 'Mariana López',
    contractFolio: 'CT-2027-0077',
    totalContracted: 10000,
    paidAmount: 5000,
    pendingAmount: 5000,
    nextPaymentDueDate: '2027-04-10',
    overdueDays: 0,
    status: 'PROXIMO',
  },
  {
    graduateId: 'grad-carlos-gomez',
    fullName: 'Carlos Gómez',
    contractFolio: 'CT-2027-0015',
    totalContracted: 8000,
    paidAmount: 4000,
    pendingAmount: 4000,
    nextPaymentDueDate: '2027-04-20',
    overdueDays: 0,
    status: 'AL_CORRIENTE',
  },
];

const SAMPLE_THERMOS_ROWS: VisualReportThermoItem[] = [
  {
    folio: 'TH-2027-001',
    graduateName: 'Andrea Martínez',
    status: 'AVAILABLE',
    customName: 'Andrea Martínez G.',
  },
  {
    folio: 'TH-2027-002',
    graduateName: 'Mariana López',
    status: 'REQUESTED',
    customName: 'Mariana López',
  },
  {
    folio: 'TH-2027-003',
    graduateName: 'Fernando Torres',
    status: 'LOCKED',
  },
  {
    folio: 'TH-2027-004',
    graduateName: 'Carlos Gómez',
    status: 'IN_PRODUCTION',
    customName: 'Lic. Carlos Gómez',
  },
];

export const VISUAL_QA_REPORTS_DATA: Record<string, Record<ReportTimeRange, VisualEventReportsData>> = {
  'evt-derecho-2027': {
    monthly: {
      eventId: 'evt-derecho-2027',
      eventName: 'Graduación Facultad de Derecho 2027',
      timeRange: 'monthly',
      financial: {
        totalContracted: 12500,
        totalCollected: 7500,
        totalPending: 5000,
        totalOverdue: 0,
        penaltiesAmount: 0,
        refundsAmount: 0,
        hasData: true,
      },
      portfolio: {
        graduatesWithPlan: SAMPLE_PORTFOLIO_GRADUATES,
        hasData: true,
      },
      payments: {
        transactions: SAMPLE_TRANSACTIONS_EVT_DERECHO,
        totalConfirmedAmount: 7500,
        hasData: true,
      },
      submissions: {
        queue: SAMPLE_SUBMISSIONS_EVT_DERECHO,
        pendingCount: 1,
        approvedCount: 1,
        rejectedCount: 1,
        hasData: true,
      },
      tables: {
        tablesCount: 6,
        totalCapacity: 62,
        totalOccupied: 38,
        totalAvailable: 24,
        tableRows: [
          { tableNumber: 1, capacity: 10, occupied: 8, available: 2, assignedPeopleCount: 8, assignedNames: ['Andrea Martínez', 'Roberto M.', 'Familia M. (6)'] },
          { tableNumber: 2, capacity: 10, occupied: 6, available: 4, assignedPeopleCount: 6, assignedNames: ['Fernando Torres', 'Acompañantes (5)'] },
          { tableNumber: 3, capacity: 10, occupied: 10, available: 0, assignedPeopleCount: 10, assignedNames: ['Mariana López (10)'] },
          { tableNumber: 4, capacity: 10, occupied: 7, available: 3, assignedPeopleCount: 7, assignedNames: ['Carlos Gómez (7)'] },
          { tableNumber: 5, capacity: 10, occupied: 4, available: 6, assignedPeopleCount: 4, assignedNames: ['Sofía R. (4)'] },
          { tableNumber: 6, capacity: 12, occupied: 3, available: 9, assignedPeopleCount: 3, assignedNames: ['Mesa Mixta (3)'] },
        ],
        hasData: true,
      },
      meals: {
        totalGuestsRegistered: 11,
        optionsTally: {
          Tradicional: 6,
          Vegetariano: 2,
          Vegano: 3,
        },
        pendingCount: 2,
        nominalSelections: [
          { graduateName: 'Andrea Martínez', personName: 'Andrea Martínez (Titular)', mealOption: 'Tradicional' },
          { graduateName: 'Andrea Martínez', personName: 'Laura González', mealOption: 'Vegano' },
          { graduateName: 'Andrea Martínez', personName: 'Carlos Martínez', mealOption: 'Vegetariano' },
          { graduateName: 'Fernando Torres', personName: 'Fernando Torres (Titular)', mealOption: 'Tradicional' },
          { graduateName: 'Mariana López', personName: 'Mariana López (Titular)', mealOption: 'Vegano' },
        ],
        hasData: true,
      },
      thermos: {
        total: 4,
        locked: 1,
        available: 1,
        requested: 1,
        inProduction: 1,
        delivered: 0,
        thermoRows: SAMPLE_THERMOS_ROWS,
        hasData: true,
      },
    },
    weekly: {
      eventId: 'evt-derecho-2027',
      eventName: 'Graduación Facultad de Derecho 2027',
      timeRange: 'weekly',
      financial: {
        totalContracted: 12500,
        totalCollected: 2500,
        totalPending: 5000,
        totalOverdue: 0,
        penaltiesAmount: 0,
        refundsAmount: 0,
        hasData: true,
      },
      portfolio: {
        graduatesWithPlan: SAMPLE_PORTFOLIO_GRADUATES.slice(0, 2),
        hasData: true,
      },
      payments: {
        transactions: [SAMPLE_TRANSACTIONS_EVT_DERECHO[1]], // 2500
        totalConfirmedAmount: 2500,
        hasData: true,
      },
      submissions: {
        queue: [SAMPLE_SUBMISSIONS_EVT_DERECHO[1]],
        pendingCount: 1,
        approvedCount: 0,
        rejectedCount: 0,
        hasData: true,
      },
      tables: {
        tablesCount: 6,
        totalCapacity: 62,
        totalOccupied: 38,
        totalAvailable: 24,
        tableRows: [
          { tableNumber: 1, capacity: 10, occupied: 8, available: 2, assignedPeopleCount: 8 },
        ],
        hasData: true,
      },
      meals: {
        totalGuestsRegistered: 11,
        optionsTally: {
          Tradicional: 6,
          Vegetariano: 2,
          Vegano: 3,
        },
        pendingCount: 2,
        hasData: true,
      },
      thermos: {
        total: 4,
        locked: 1,
        available: 1,
        requested: 1,
        inProduction: 1,
        delivered: 0,
        thermoRows: SAMPLE_THERMOS_ROWS,
        hasData: true,
      },
    },
    daily: {
      eventId: 'evt-derecho-2027',
      eventName: 'Graduación Facultad de Derecho 2027',
      timeRange: 'daily',
      financial: {
        totalContracted: 12500,
        totalCollected: 0,
        totalPending: 5000,
        totalOverdue: 0,
        penaltiesAmount: 0,
        refundsAmount: 0,
        hasData: true,
      },
      portfolio: {
        graduatesWithPlan: [],
        hasData: false,
      },
      payments: {
        transactions: [],
        totalConfirmedAmount: 0,
        hasData: false,
      },
      submissions: {
        queue: [],
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        hasData: false,
      },
      tables: {
        tablesCount: 6,
        totalCapacity: 62,
        totalOccupied: 38,
        totalAvailable: 24,
        tableRows: [],
        hasData: true,
      },
      meals: {
        totalGuestsRegistered: 11,
        optionsTally: {
          Tradicional: 6,
          Vegetariano: 2,
          Vegano: 3,
        },
        pendingCount: 2,
        hasData: true,
      },
      thermos: {
        total: 4,
        locked: 1,
        available: 1,
        requested: 1,
        inProduction: 1,
        delivered: 0,
        thermoRows: SAMPLE_THERMOS_ROWS,
        hasData: true,
      },
    },
  },
};

// ── 4. AUDIT LOGS TYPES & FIXTURES ───────────────────────────────────────────

export type AuditActorOrigin = 'ADMIN' | 'Sistema' | 'Proveedor' | 'Proceso automático';

export interface VisualAuditDiffRow {
  field: string;
  before: string;
  after: string;
}

export interface VisualAuditLogItem {
  id: string;
  eventId: string;
  eventName: string;
  timestamp: string;
  actor: string;
  actorOrigin: AuditActorOrigin;
  action: string;
  actionLabel: string;
  entityType: 'GRADUATE' | 'TABLE' | 'MEAL' | 'PAYMENT' | 'PROOF' | 'THERMO' | 'POLICY' | 'EVENT';
  entityLabel: string;
  entityId: string;
  description: string;
  diff: VisualAuditDiffRow[];
  reason?: string;
}

export const VISUAL_QA_AUDIT_LOGS: Record<string, VisualAuditLogItem[]> = {
  'evt-derecho-2027': [
    {
      id: 'aud-001',
      eventId: 'evt-derecho-2027',
      eventName: 'Graduación Facultad de Derecho 2027',
      timestamp: '2027-04-10 14:30',
      actor: 'Lic. Roberto Méndez',
      actorOrigin: 'ADMIN',
      action: 'TABLE_CHANGED',
      actionLabel: 'Reasignó una mesa',
      entityType: 'TABLE',
      entityLabel: 'Mesa',
      entityId: 'tbl-24',
      description: 'Reasignación de integrantes del grupo Andrea Martínez de Mesa 18 a Mesa 24',
      diff: [
        { field: 'Mesa asignada', before: 'Mesa 18', after: 'Mesa 24' },
        { field: 'Lugares ocupados en Mesa 24', before: '0 / 10', after: '3 / 10' },
      ],
      reason: 'Acomodo grupal solicitado por graduada titular',
    },
    {
      id: 'aud-002',
      eventId: 'evt-derecho-2027',
      eventName: 'Graduación Facultad de Derecho 2027',
      timestamp: '2027-04-11 10:15',
      actor: 'Lic. Roberto Méndez',
      actorOrigin: 'ADMIN',
      action: 'MEAL_OVERRIDE',
      actionLabel: 'Modificó opción de platillo',
      entityType: 'MEAL',
      entityLabel: 'Platillo',
      entityId: 'gm-andrea-02',
      description: 'Override administrativo de menú post-deadline para Laura González',
      diff: [
        { field: 'Opción de platillo', before: 'Tradicional', after: 'Vegano' },
        { field: 'Estado de selección', before: 'Seleccionado', after: 'Override administrativo' },
      ],
      reason: 'Alergia alimentaria reportada formalmente por el graduado',
    },
    {
      id: 'aud-003',
      eventId: 'evt-derecho-2027',
      eventName: 'Graduación Facultad de Derecho 2027',
      timestamp: '2027-04-11 16:45',
      actor: 'Proceso nocturno',
      actorOrigin: 'Proceso automático',
      action: 'THERMO_UNLOCKED',
      actionLabel: 'Desbloqueó termo conmemorativo',
      entityType: 'THERMO',
      entityLabel: 'Termo',
      entityId: 'th-andrea-0042',
      description: 'Desbloqueo de solicitud de termo tras confirmación de pago',
      diff: [
        { field: 'Estado del termo', before: 'Bloqueado', after: 'Disponible para solicitud' },
        { field: 'Porcentaje financiero', before: '60%', after: '75%' },
      ],
      reason: 'Conciliación bancaria automática alcanzó el umbral del 70%',
    },
    {
      id: 'aud-004',
      eventId: 'evt-derecho-2027',
      eventName: 'Graduación Facultad de Derecho 2027',
      timestamp: '2027-04-12 09:00',
      actor: 'Lic. Roberto Méndez',
      actorOrigin: 'ADMIN',
      action: 'POLICY_PUBLISHED',
      actionLabel: 'Publicó política de cancelación',
      entityType: 'POLICY',
      entityLabel: 'Política',
      entityId: 'pol-evt-derecho-v2',
      description: 'Publicación oficial de la versión 2 de la política de cancelación',
      diff: [
        { field: 'Versión activa', before: 'Versión 1 (Archivada)', after: 'Versión 2 (Activa)' },
        { field: 'Rango 0 a 30 días', before: '100% penalización', after: '50% penalización' },
      ],
      reason: 'Ajuste de porcentajes aprobado por el comité estudiantil',
    },
    {
      id: 'aud-005',
      eventId: 'evt-derecho-2027',
      eventName: 'Graduación Facultad de Derecho 2027',
      timestamp: '2027-04-12 11:30',
      actor: 'Sistema',
      actorOrigin: 'Sistema',
      action: 'PROOF_APPROVED',
      actionLabel: 'Aprobó comprobante de pago',
      entityType: 'PROOF',
      entityLabel: 'Comprobante',
      entityId: 'SUB-2027-001',
      description: 'Aprobación de comprobante bancario por $2,500 de Andrea Martínez',
      diff: [
        { field: 'Estado de revisión', before: 'Pendiente de revisión', after: 'Aprobado' },
        { field: 'Saldo pendiente del plan', before: '$7,500', after: '$5,000' },
      ],
      reason: 'Referencia bancaria validada contra estado de cuenta SPEI',
    },
    {
      id: 'aud-006',
      eventId: 'evt-derecho-2027',
      eventName: 'Graduación Facultad de Derecho 2027',
      timestamp: '2027-04-12 15:00',
      actor: 'Banquetes y Eventos Premier',
      actorOrigin: 'Proveedor',
      action: 'MEAL_OVERRIDE',
      actionLabel: 'Actualizó capacidad de cocina',
      entityType: 'MEAL',
      entityLabel: 'Platillo',
      entityId: 'srv-banquete-01',
      description: 'Confirmación de capacidad operativa de cocina para menú vegano y tradicional',
      diff: [
        { field: 'Cupo garantizado menú vegano', before: '15 raciones', after: '25 raciones' },
      ],
      reason: 'Ampliación de insumos alimentarios especiales por proveedor externo',
    },
  ],
};
