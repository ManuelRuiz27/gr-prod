/**
 * Payment Fixtures — Mock financial plans, installments, and ledger
 */

export interface InstallmentMock {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidAt?: string;
  receiptNumber?: string;
}

export interface PaymentPlanMock {
  id: string;
  graduateId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: InstallmentMock[];
}

export const mockPaymentPlan: PaymentPlanMock = {
  id: 'plan-andrea-01',
  graduateId: 'grad-andrea-martinez',
  totalAmount: 7400,
  paidAmount: 7400,
  remainingAmount: 0,
  installments: [
    {
      id: 'inst-1',
      number: 1,
      dueDate: '2026-08-15T23:59:59Z',
      amount: 2500,
      status: 'PAID',
      paidAt: '2026-08-10T14:30:00Z',
      receiptNumber: 'REC-2026-0841',
    },
    {
      id: 'inst-2',
      number: 2,
      dueDate: '2026-09-15T23:59:59Z',
      amount: 2500,
      status: 'PAID',
      paidAt: '2026-09-12T11:15:00Z',
      receiptNumber: 'REC-2026-1192',
    },
    {
      id: 'inst-3',
      number: 3,
      dueDate: '2026-10-15T23:59:59Z',
      amount: 2400,
      status: 'PAID',
      paidAt: '2026-10-05T16:45:00Z',
      receiptNumber: 'REC-2026-1870',
    },
  ],
};

export const mockPartialPaymentPlan: PaymentPlanMock = {
  id: 'plan-roberto-01',
  graduateId: 'grad-roberto-sanchez',
  totalAmount: 11100,
  paidAmount: 5550,
  remainingAmount: 5550,
  installments: [
    {
      id: 'inst-r1',
      number: 1,
      dueDate: '2026-08-15T23:59:59Z',
      amount: 3700,
      status: 'PAID',
      paidAt: '2026-08-14T09:20:00Z',
      receiptNumber: 'REC-2026-0902',
    },
    {
      id: 'inst-r2',
      number: 2,
      dueDate: '2026-09-15T23:59:59Z',
      amount: 3700,
      status: 'PENDING',
    },
    {
      id: 'inst-r3',
      number: 3,
      dueDate: '2026-10-15T23:59:59Z',
      amount: 3700,
      status: 'PENDING',
    },
  ],
};
