// Tipos y fixtures normativos para el módulo Pagos ADMIN
// Fuentes de verdad: docs/FINANCIAL_DOMAIN.md, docs/API_CONTRACTS.md (72-77), docs/UX_FLOWS.md (28-34)

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'MERCADO_PAGO' | 'OPENPAY';
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'REFUNDED' | 'PARTIAL';
export type InstallmentStatus = 'PAID' | 'UPCOMING' | 'DUE' | 'OVERDUE' | 'FUTURE' | 'CANCELLED';
export type AdjustmentType = 'CREDIT' | 'DEBIT';
export type RefundMode = 'PROVIDER' | 'MANUAL';
export type ReconciliationStatus = 'MATCHED' | 'REQUIRES_REVIEW' | 'PENDING_CONFIRMATION';
export type GatewayProviderFilter = 'ALL' | 'MERCADO_PAGO' | 'OPENPAY' | 'MANUAL';
export type PortfolioFilterStatus = 'ALL' | 'CURRENT' | 'UPCOMING' | 'OVERDUE';

export interface InstallmentMock {
  id: string;
  number: number;
  sequence: number;
  label: string;
  dueDate: string;
  amount: number;
  status: InstallmentMockStatus;
  paidAt?: string;
  paidAmount?: number;
}

export type InstallmentMockStatus = 'PAID' | 'UPCOMING' | 'DUE' | 'OVERDUE' | 'FUTURE' | 'CANCELLED';

export interface PaymentTransactionMock {
  id: string;
  installmentId?: string;
  installmentLabel?: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  evidenceFileName?: string;
}

export interface PaymentAdjustmentMock {
  id: string;
  type: AdjustmentType;
  amount: number;
  reason: string;
  relatedInstallmentId?: string;
  relatedInstallmentLabel?: string;
  createdAt: string;
}

export interface PaymentRefundMock {
  id: string;
  mode: RefundMode;
  amount: number;
  reason: string;
  manualMethod?: 'TRANSFER' | 'CASH';
  reference?: string;
  status: 'PENDING' | 'CONFIRMED';
  createdAt: string;
}

export interface PaymentPlanMock {
  graduateId: string;
  graduateName: string;
  eventId: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount?: number;
  progressPercentage: number;
  nextPaymentAmount: number;
  nextPaymentDueDate: string;
  isFrozen: boolean;
  frozenAt?: string;
  installments: InstallmentMock[];
  transactions: PaymentTransactionMock[];
  adjustments: PaymentAdjustmentMock[];
  refunds: PaymentRefundMock[];
}

export interface PortfolioItemMock {
  id: string;
  membershipId: string;
  graduateId: string;
  graduateName: string;
  email: string;
  folio: string;
  career: string;
  ticketCount: number;
  totalAmount: number;
  paidTotal: number;
  pendingTotal: number;
  overdueTotal: number;
  status: 'CURRENT' | 'UPCOMING' | 'OVERDUE';
  nextInstallment: {
    label: string;
    amount: number;
    dueDate: string;
    isOverdue: boolean;
  };
}

export interface ReconciliationItemMock {
  id: string;
  graduateId: string;
  graduateName: string;
  folio: string;
  concept: string;
  expectedAmount: number;
  registeredAmount: number;
  sourceChannel: 'GATEWAY' | 'MANUAL';
  gatewayProvider: 'MERCADO_PAGO' | 'OPENPAY' | 'MANUAL';
  gatewayConfirmedAmount: number;
  difference: number;
  status: ReconciliationStatus;
  updatedAt: string;
}

// 1. Plan normativo de Andrea Martínez (satisfies all existing baseline tests)
export const mockPaymentPlan: PaymentPlanMock = {
  graduateId: 'grad-andrea-martinez',
  graduateName: 'Andrea Martínez',
  eventId: 'evt-derecho-2027',
  totalAmount: 12500,
  paidAmount: 7500,
  pendingAmount: 5000,
  overdueAmount: 0,
  progressPercentage: 60,
  nextPaymentAmount: 2500,
  nextPaymentDueDate: '15 Mar 2027',
  isFrozen: true,
  frozenAt: '12 Dic 2026',
  installments: [
    {
      id: 'inst-1',
      number: 1,
      sequence: 1,
      label: 'M1',
      dueDate: '15 Dic 2026',
      amount: 2500,
      status: 'PAID',
      paidAt: '12 Dic 2026',
      paidAmount: 2500,
    },
    {
      id: 'inst-2',
      number: 2,
      sequence: 2,
      label: 'M2',
      dueDate: '15 Ene 2027',
      amount: 2500,
      status: 'PAID',
      paidAt: '14 Ene 2027',
      paidAmount: 2500,
    },
    {
      id: 'inst-3',
      number: 3,
      sequence: 3,
      label: 'M3',
      dueDate: '15 Feb 2027',
      amount: 2500,
      status: 'PAID',
      paidAt: '10 Feb 2027',
      paidAmount: 2500,
    },
    {
      id: 'inst-4',
      number: 4,
      sequence: 4,
      label: 'M4',
      dueDate: '15 Mar 2027',
      amount: 2500,
      status: 'UPCOMING',
      paidAmount: 0,
    },
    {
      id: 'inst-5',
      number: 5,
      sequence: 5,
      label: 'M5',
      dueDate: '15 Abr 2027',
      amount: 2500,
      status: 'FUTURE',
      paidAmount: 0,
    },
  ],
  transactions: [
    {
      id: 'tx-001',
      installmentId: 'inst-1',
      installmentLabel: 'Mensualidad 1',
      amount: 2500,
      method: 'TRANSFER',
      paidAt: '12 Dic 2026',
      status: 'CONFIRMED',
      reference: 'SPEI-8849201',
      notes: 'Comprobante verificado',
      evidenceFileName: 'comprobante_spei_m1.pdf',
    },
    {
      id: 'tx-002',
      installmentId: 'inst-2',
      installmentLabel: 'Mensualidad 2',
      amount: 2500,
      method: 'MERCADO_PAGO',
      paidAt: '14 Ene 2027',
      status: 'CONFIRMED',
      reference: 'MP-99401204',
      notes: 'Pago en línea con tarjeta',
    },
    {
      id: 'tx-003',
      installmentId: 'inst-3',
      installmentLabel: 'Mensualidad 3',
      amount: 2500,
      method: 'CASH',
      paidAt: '10 Feb 2027',
      status: 'CONFIRMED',
      reference: 'REC-0492',
      notes: 'Cobro en oficina',
    },
  ],
  adjustments: [],
  refunds: [],
};

// 2. Planes para otros graduados en el evento
export const mockPaymentPlansMap: Record<string, PaymentPlanMock> = {
  'grad-andrea-martinez': mockPaymentPlan,
  'grad-fernando-torres': {
    graduateId: 'grad-fernando-torres',
    graduateName: 'Fernando Torres',
    eventId: 'evt-derecho-2027',
    totalAmount: 15000,
    paidAmount: 15000,
    pendingAmount: 0,
    overdueAmount: 0,
    progressPercentage: 100,
    nextPaymentAmount: 0,
    nextPaymentDueDate: 'Liquidado',
    isFrozen: true,
    frozenAt: '10 Dic 2026',
    installments: [
      { id: 'inst-ft-1', number: 1, sequence: 1, label: 'M1', dueDate: '15 Dic 2026', amount: 3000, status: 'PAID', paidAt: '10 Dic 2026', paidAmount: 3000 },
      { id: 'inst-ft-2', number: 2, sequence: 2, label: 'M2', dueDate: '15 Ene 2027', amount: 3000, status: 'PAID', paidAt: '12 Ene 2027', paidAmount: 3000 },
      { id: 'inst-ft-3', number: 3, sequence: 3, label: 'M3', dueDate: '15 Feb 2027', amount: 3000, status: 'PAID', paidAt: '14 Feb 2027', paidAmount: 3000 },
      { id: 'inst-ft-4', number: 4, sequence: 4, label: 'M4', dueDate: '15 Mar 2027', amount: 3000, status: 'PAID', paidAt: '14 Feb 2027', paidAmount: 3000 },
      { id: 'inst-ft-5', number: 5, sequence: 5, label: 'M5', dueDate: '15 Abr 2027', amount: 3000, status: 'PAID', paidAt: '14 Feb 2027', paidAmount: 3000 },
    ],
    transactions: [
      { id: 'tx-ft-01', installmentLabel: 'Pago Total Anticipado', amount: 15000, method: 'TRANSFER', paidAt: '14 Feb 2027', status: 'CONFIRMED', reference: 'SPEI-992384' },
    ],
    adjustments: [],
    refunds: [],
  },
  'grad-mariana-lopez': {
    graduateId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    eventId: 'evt-derecho-2027',
    totalAmount: 10000,
    paidAmount: 4000,
    pendingAmount: 6000,
    overdueAmount: 0,
    progressPercentage: 40,
    nextPaymentAmount: 2000,
    nextPaymentDueDate: '15 Mar 2027',
    isFrozen: true,
    frozenAt: '15 Dic 2026',
    installments: [
      { id: 'inst-ml-1', number: 1, sequence: 1, label: 'M1', dueDate: '15 Dic 2026', amount: 2000, status: 'PAID', paidAt: '15 Dic 2026', paidAmount: 2000 },
      { id: 'inst-ml-2', number: 2, sequence: 2, label: 'M2', dueDate: '15 Ene 2027', amount: 2000, status: 'PAID', paidAt: '15 Ene 2027', paidAmount: 2000 },
      { id: 'inst-ml-3', number: 3, sequence: 3, label: 'M3', dueDate: '15 Mar 2027', amount: 2000, status: 'UPCOMING', paidAmount: 0 },
      { id: 'inst-ml-4', number: 4, sequence: 4, label: 'M4', dueDate: '15 Abr 2027', amount: 2000, status: 'FUTURE', paidAmount: 0 },
      { id: 'inst-ml-5', number: 5, sequence: 5, label: 'M5', dueDate: '15 May 2027', amount: 2000, status: 'FUTURE', paidAmount: 0 },
    ],
    transactions: [
      { id: 'tx-ml-01', installmentLabel: 'M1', amount: 2000, method: 'MERCADO_PAGO', paidAt: '15 Dic 2026', status: 'CONFIRMED' },
      { id: 'tx-ml-02', installmentLabel: 'M2', amount: 2000, method: 'MERCADO_PAGO', paidAt: '15 Ene 2027', status: 'CONFIRMED' },
    ],
    adjustments: [],
    refunds: [],
  },
  'grad-roberto-sanchez': {
    graduateId: 'grad-roberto-sanchez',
    graduateName: 'Roberto Sánchez',
    eventId: 'evt-derecho-2027',
    totalAmount: 12500,
    paidAmount: 7500,
    pendingAmount: 5000,
    overdueAmount: 2500,
    progressPercentage: 60,
    nextPaymentAmount: 2500,
    nextPaymentDueDate: '15 Feb 2027',
    isFrozen: true,
    frozenAt: '15 Dic 2026',
    installments: [
      { id: 'inst-rs-1', number: 1, sequence: 1, label: 'M1', dueDate: '15 Dic 2026', amount: 2500, status: 'PAID', paidAt: '15 Dic 2026', paidAmount: 2500 },
      { id: 'inst-rs-2', number: 2, sequence: 2, label: 'M2', dueDate: '15 Ene 2027', amount: 2500, status: 'PAID', paidAt: '15 Ene 2027', paidAmount: 2500 },
      { id: 'inst-rs-3', number: 3, sequence: 3, label: 'M3', dueDate: '15 Feb 2027', amount: 2500, status: 'PAID', paidAt: '15 Feb 2027', paidAmount: 2500 },
      { id: 'inst-rs-4', number: 4, sequence: 4, label: 'M4', dueDate: '15 Feb 2027', amount: 2500, status: 'OVERDUE', paidAmount: 0 },
      { id: 'inst-rs-5', number: 5, sequence: 5, label: 'M5', dueDate: '15 Abr 2027', amount: 2500, status: 'FUTURE', paidAmount: 0 },
    ],
    transactions: [
      { id: 'tx-rs-01', installmentLabel: 'M1', amount: 2500, method: 'OPENPAY', paidAt: '15 Dic 2026', status: 'CONFIRMED' },
      { id: 'tx-rs-02', installmentLabel: 'M2', amount: 2500, method: 'OPENPAY', paidAt: '15 Ene 2027', status: 'CONFIRMED' },
      { id: 'tx-rs-03', installmentLabel: 'M3', amount: 2500, method: 'OPENPAY', paidAt: '15 Feb 2027', status: 'CONFIRMED' },
    ],
    adjustments: [],
    refunds: [],
  },
};

// 3. Cartera de graduados del evento (UX-33 & API Contract 76)
export const mockPortfolioList: PortfolioItemMock[] = [
  {
    id: 'port-1',
    membershipId: 'mem-andrea-martinez',
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    email: 'andrea.martinez@ejemplo.com',
    folio: 'GE-24-089',
    career: 'Licenciatura en Derecho',
    ticketCount: 8,
    totalAmount: 12500,
    paidTotal: 7500,
    pendingTotal: 5000,
    overdueTotal: 0,
    status: 'UPCOMING',
    nextInstallment: {
      label: 'Mensualidad 4 (Cuota 4/5)',
      amount: 2500,
      dueDate: '15 Mar 2027',
      isOverdue: false,
    },
  },
  {
    id: 'port-2',
    membershipId: 'mem-fernando-torres',
    graduateId: 'grad-fernando-torres',
    graduateName: 'Fernando Torres',
    email: 'fernando.torres@ejemplo.com',
    folio: 'GE-24-012',
    career: 'Licenciatura en Derecho',
    ticketCount: 10,
    totalAmount: 15000,
    paidTotal: 15000,
    pendingTotal: 0,
    overdueTotal: 0,
    status: 'CURRENT',
    nextInstallment: {
      label: 'Plan Liquidado',
      amount: 0,
      dueDate: 'Al corriente',
      isOverdue: false,
    },
  },
  {
    id: 'port-3',
    membershipId: 'mem-mariana-lopez',
    graduateId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    email: 'mariana.lopez@ejemplo.com',
    folio: 'GE-24-105',
    career: 'Licenciatura en Derecho',
    ticketCount: 6,
    totalAmount: 10000,
    paidTotal: 4000,
    pendingTotal: 6000,
    overdueTotal: 0,
    status: 'UPCOMING',
    nextInstallment: {
      label: 'Mensualidad 3 (Cuota 3/5)',
      amount: 2000,
      dueDate: '15 Mar 2027',
      isOverdue: false,
    },
  },
  {
    id: 'port-4',
    membershipId: 'mem-roberto-sanchez',
    graduateId: 'grad-roberto-sanchez',
    graduateName: 'Roberto Sánchez',
    email: 'roberto.sanchez@ejemplo.com',
    folio: 'GE-24-044',
    career: 'Licenciatura en Derecho',
    ticketCount: 8,
    totalAmount: 12500,
    paidTotal: 7500,
    pendingTotal: 5000,
    overdueTotal: 2500,
    status: 'OVERDUE',
    nextInstallment: {
      label: 'Mensualidad 4 (Atrasada)',
      amount: 2500,
      dueDate: '15 Feb 2027',
      isOverdue: true,
    },
  },
];

// 4. Conciliación de pagos (UX-34 & API Contract 77)
export const mockReconciliationList: ReconciliationItemMock[] = [
  {
    id: 'rec-1',
    graduateId: 'grad-carlos-rivera',
    graduateName: 'Carlos Rivera',
    folio: 'GR-27-0102',
    concept: 'Mensualidad 3',
    expectedAmount: 15000,
    registeredAmount: 15000,
    sourceChannel: 'GATEWAY',
    gatewayProvider: 'MERCADO_PAGO',
    gatewayConfirmedAmount: 10000,
    difference: -5000,
    status: 'REQUIRES_REVIEW',
    updatedAt: '2027-03-01',
  },
  {
    id: 'rec-2',
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    folio: 'GR-27-0089',
    concept: 'Mensualidad 3',
    expectedAmount: 2500,
    registeredAmount: 2500,
    sourceChannel: 'MANUAL',
    gatewayProvider: 'MANUAL',
    gatewayConfirmedAmount: 2500,
    difference: 0,
    status: 'MATCHED',
    updatedAt: '2027-02-10',
  },
  {
    id: 'rec-3',
    graduateId: 'grad-fernando-torres',
    graduateName: 'Fernando Torres',
    folio: 'GR-27-0044',
    concept: 'Mensualidad 5',
    expectedAmount: 3000,
    registeredAmount: 3000,
    sourceChannel: 'GATEWAY',
    gatewayProvider: 'OPENPAY',
    gatewayConfirmedAmount: 3000,
    difference: 0,
    status: 'MATCHED',
    updatedAt: '2027-02-14',
  },
  {
    id: 'rec-4',
    graduateId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    folio: 'GR-27-0067',
    concept: 'Mensualidad 2',
    expectedAmount: 2000,
    registeredAmount: 2000,
    sourceChannel: 'GATEWAY',
    gatewayProvider: 'MERCADO_PAGO',
    gatewayConfirmedAmount: 0,
    difference: -2000,
    status: 'PENDING_CONFIRMATION',
    updatedAt: '2027-03-02',
  },
];
