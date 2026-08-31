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
  sequence?: number;
  label: string;
  dueDate: string;
  amount: number;
  status: InstallmentStatus;
  paidAt?: string;
  paidAmount?: number;
}

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
  graduateName?: string;
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
  transactions?: PaymentTransactionMock[];
  adjustments?: PaymentAdjustmentMock[];
  refunds?: PaymentRefundMock[];
}

// 1. Plan normativo baseline de Andrea Martínez (satisfies all existing baseline tests)
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

// 2. Mapa normativo de planes por graduado (sólo conserva baseline existente)
export const mockPaymentPlansMap: Record<string, PaymentPlanMock> = {
  'grad-andrea-martinez': mockPaymentPlan,
};
