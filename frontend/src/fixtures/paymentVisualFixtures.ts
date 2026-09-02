/**
 * VISUAL QA ONLY FIXTURES (NON-NORMATIVE)
 * 
 * Strictly for component showcase, visual alignment, and accessibility testing of VIS-08.
 * These fixtures DO NOT define business defaults, persistence rules, or financial domain formulas.
 */

export type VisualSubmissionStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type VisualSubmissionMethod = 'TRANSFER' | 'DEPOSIT';

export interface VisualPaymentSubmission {
  id: string;
  folio: string;
  graduateId: string;
  graduateName: string;
  graduateEmail: string;
  career: string;
  eventId: string;
  amount: number;
  method: VisualSubmissionMethod;
  declaredDate: string;
  reference: string;
  notes?: string;
  evidenceFileName: string;
  evidenceFileSize?: string;
  status: VisualSubmissionStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface VisualGraduatePaymentState {
  graduateId: string;
  graduateName: string;
  eventId: string;
  totalContracted: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  progressPercentage: number;
  nextPayment?: {
    concept: string;
    amount: number;
    dueDate: string;
    status: 'UPCOMING' | 'DUE' | 'OVERDUE';
  };
  installments: Array<{
    id: string;
    concept: string;
    amount: number;
    dueDate: string;
    paidAt?: string;
    status: 'PAID' | 'UPCOMING' | 'DUE' | 'OVERDUE' | 'FUTURE';
  }>;
  confirmedTransactions: Array<{
    id: string;
    concept: string;
    amount: number;
    method: 'TRANSFER' | 'CASH' | 'DEPOSIT' | 'MERCADO_PAGO' | 'OPENPAY';
    paidAt: string;
    reference: string;
    receiptUrl?: string;
  }>;
  submissions: VisualPaymentSubmission[];
}

export const VISUAL_QA_SUBMISSIONS_QUEUE: VisualPaymentSubmission[] = [
  {
    id: 'sub-001',
    folio: 'SUB-2027-0012',
    graduateId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    graduateEmail: 'mariana.lopez@ejemplo.com',
    career: 'Licenciatura en Derecho',
    eventId: 'evt-derecho-2027',
    amount: 2500,
    method: 'TRANSFER',
    declaredDate: '10 Nov 2026',
    reference: 'SPEI-99283144',
    notes: 'Transferencia BBVA correspondiente a la mensualidad 3.',
    evidenceFileName: 'comprobante_spei_noviembre.pdf',
    evidenceFileSize: '1.2 MB',
    status: 'PENDING_REVIEW',
  },
  {
    id: 'sub-002',
    folio: 'SUB-2027-0014',
    graduateId: 'grad-roberto-sanchez',
    graduateName: 'Roberto Sánchez',
    graduateEmail: 'roberto.sanchez@ejemplo.com',
    career: 'Licenciatura en Derecho',
    eventId: 'evt-derecho-2027',
    amount: 2500,
    method: 'DEPOSIT',
    declaredDate: '12 Nov 2026',
    reference: 'DEP-PRACTICAJA-7741',
    notes: 'Depósito en practicaja Santander.',
    evidenceFileName: 'ticket_practicaja_santander.jpg',
    evidenceFileSize: '840 KB',
    status: 'PENDING_REVIEW',
  },
  {
    id: 'sub-003',
    folio: 'SUB-2027-0008',
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    graduateEmail: 'andrea.martinez@ejemplo.com',
    career: 'Licenciatura en Derecho',
    eventId: 'evt-derecho-2027',
    amount: 2500,
    method: 'TRANSFER',
    declaredDate: '15 Oct 2026',
    reference: 'SPEI-8849201',
    notes: 'Anticipo inicial verificado en banco.',
    evidenceFileName: 'comprobante_spei_m1.pdf',
    evidenceFileSize: '1.5 MB',
    status: 'APPROVED',
    reviewedAt: '16 Oct 2026',
    reviewedBy: 'Admin Finanzas GR',
  },
  {
    id: 'sub-004',
    folio: 'SUB-2027-0005',
    graduateId: 'grad-fernando-torres',
    graduateName: 'Fernando Torres',
    graduateEmail: 'fernando.torres@ejemplo.com',
    career: 'Licenciatura en Derecho',
    eventId: 'evt-derecho-2027',
    amount: 2500,
    method: 'TRANSFER',
    declaredDate: '01 Oct 2026',
    reference: 'SPEI-0019283',
    notes: 'Comprobante borroso no legible.',
    evidenceFileName: 'captura_ilegible.jpg',
    evidenceFileSize: '420 KB',
    status: 'REJECTED',
    reviewedAt: '02 Oct 2026',
    reviewedBy: 'Admin Finanzas GR',
    rejectionReason: 'La imagen del comprobante no es legible y la referencia no coincide con el estado de cuenta.',
  },
];

export const VISUAL_QA_GRADUATE_PAYMENT_STATES: Record<string, VisualGraduatePaymentState> = {
  'grad-andrea-martinez': {
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    totalContracted: 12500,
    totalPaid: 7500,
    totalPending: 5000,
    totalOverdue: 0,
    progressPercentage: 60,
    nextPayment: {
      concept: 'Mensualidad 4',
      amount: 2500,
      dueDate: '15 Mar 2027',
      status: 'UPCOMING',
    },
    installments: [
      { id: 'inst-1', concept: 'Mensualidad 1', amount: 2500, dueDate: '15 Dic 2026', paidAt: '12 Dic 2026', status: 'PAID' },
      { id: 'inst-2', concept: 'Mensualidad 2', amount: 2500, dueDate: '15 Ene 2027', paidAt: '14 Ene 2027', status: 'PAID' },
      { id: 'inst-3', concept: 'Mensualidad 3', amount: 2500, dueDate: '15 Feb 2027', paidAt: '10 Feb 2027', status: 'PAID' },
      { id: 'inst-4', concept: 'Mensualidad 4', amount: 2500, dueDate: '15 Mar 2027', status: 'UPCOMING' },
      { id: 'inst-5', concept: 'Mensualidad 5', amount: 2500, dueDate: '15 Abr 2027', status: 'FUTURE' },
    ],
    confirmedTransactions: [
      { id: 'tx-001', concept: 'Mensualidad 1', amount: 2500, method: 'TRANSFER', paidAt: '12 Dic 2026', reference: 'SPEI-8849201' },
      { id: 'tx-002', concept: 'Mensualidad 2', amount: 2500, method: 'MERCADO_PAGO', paidAt: '14 Ene 2027', reference: 'MP-99401204' },
      { id: 'tx-003', concept: 'Mensualidad 3', amount: 2500, method: 'CASH', paidAt: '10 Feb 2027', reference: 'REC-0492' },
    ],
    submissions: [
      {
        id: 'sub-003',
        folio: 'SUB-2027-0008',
        graduateId: 'grad-andrea-martinez',
        graduateName: 'Andrea Martínez',
        graduateEmail: 'andrea.martinez@ejemplo.com',
        career: 'Licenciatura en Derecho',
        eventId: 'evt-derecho-2027',
        amount: 2500,
        method: 'TRANSFER',
        declaredDate: '15 Oct 2026',
        reference: 'SPEI-8849201',
        notes: 'Anticipo inicial verificado en banco.',
        evidenceFileName: 'comprobante_spei_m1.pdf',
        status: 'APPROVED',
        reviewedAt: '16 Oct 2026',
        reviewedBy: 'Admin Finanzas GR',
      },
    ],
  },
  'grad-mariana-lopez': {
    graduateId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    eventId: 'evt-derecho-2027',
    totalContracted: 9000,
    totalPaid: 6500,
    totalPending: 2500,
    totalOverdue: 0,
    progressPercentage: 72,
    nextPayment: {
      concept: 'Mensualidad 3',
      amount: 2500,
      dueDate: '15 Nov 2026',
      status: 'UPCOMING',
    },
    installments: [
      { id: 'inst-m1', concept: 'Anticipo', amount: 3500, dueDate: '15 Sep 2026', paidAt: '14 Sep 2026', status: 'PAID' },
      { id: 'inst-m2', concept: 'Mensualidad 2', amount: 3000, dueDate: '15 Oct 2026', paidAt: '15 Oct 2026', status: 'PAID' },
      { id: 'inst-m3', concept: 'Mensualidad 3', amount: 2500, dueDate: '15 Nov 2026', status: 'UPCOMING' },
    ],
    confirmedTransactions: [
      { id: 'tx-m1', concept: 'Anticipo', amount: 3500, method: 'TRANSFER', paidAt: '14 Sep 2026', reference: 'SPEI-112233' },
      { id: 'tx-m2', concept: 'Mensualidad 2', amount: 3000, method: 'TRANSFER', paidAt: '15 Oct 2026', reference: 'SPEI-445566' },
    ],
    submissions: [
      {
        id: 'sub-001',
        folio: 'SUB-2027-0012',
        graduateId: 'grad-mariana-lopez',
        graduateName: 'Mariana López',
        graduateEmail: 'mariana.lopez@ejemplo.com',
        career: 'Licenciatura en Derecho',
        eventId: 'evt-derecho-2027',
        amount: 2500,
        method: 'TRANSFER',
        declaredDate: '10 Nov 2026',
        reference: 'SPEI-99283144',
        notes: 'Transferencia BBVA correspondiente a la mensualidad 3.',
        evidenceFileName: 'comprobante_spei_noviembre.pdf',
        evidenceFileSize: '1.2 MB',
        status: 'PENDING_REVIEW',
      },
    ],
  },
};
