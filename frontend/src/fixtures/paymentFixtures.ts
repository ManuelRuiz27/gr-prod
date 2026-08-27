/**
 * Payment Fixtures — Normalized financial demo data based on approved docs
 */

export type InstallmentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export interface InstallmentMock {
  id: string;
  number: number;
  label: string; // M1, M2, M3, M4, M5
  dueDate: string;
  amount: number;
  status: InstallmentStatus;
  paidAt?: string;
}

export interface PaymentPlanMock {
  graduateId: string;
  totalAmount: number; // $12,500
  paidAmount: number; // $7,500
  pendingAmount: number; // $5,000
  progressPercentage: number; // 60%
  nextPaymentAmount: number; // $2,500
  nextPaymentDueDate: string; // 15 Mar 2027
  installments: InstallmentMock[];
}

export const mockPaymentPlan: PaymentPlanMock = {
  graduateId: 'grad-andrea-martinez',
  totalAmount: 12500,
  paidAmount: 7500,
  pendingAmount: 5000,
  progressPercentage: 60,
  nextPaymentAmount: 2500,
  nextPaymentDueDate: '15 Mar 2027',
  installments: [
    {
      id: 'inst-1',
      number: 1,
      label: 'M1',
      dueDate: '15 Dic 2026',
      amount: 2500,
      status: 'PAID',
      paidAt: '12 Dic 2026',
    },
    {
      id: 'inst-2',
      number: 2,
      label: 'M2',
      dueDate: '15 Ene 2027',
      amount: 2500,
      status: 'PAID',
      paidAt: '14 Ene 2027',
    },
    {
      id: 'inst-3',
      number: 3,
      label: 'M3',
      dueDate: '15 Feb 2027',
      amount: 2500,
      status: 'PAID',
      paidAt: '10 Feb 2027',
    },
    {
      id: 'inst-4',
      number: 4,
      label: 'M4',
      dueDate: '15 Mar 2027',
      amount: 2500,
      status: 'PENDING',
    },
    {
      id: 'inst-5',
      number: 5,
      label: 'M5',
      dueDate: '15 Abr 2027',
      amount: 2500,
      status: 'PENDING',
    },
  ],
};
