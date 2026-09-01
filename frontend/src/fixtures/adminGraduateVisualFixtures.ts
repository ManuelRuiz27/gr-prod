/**
 * VISUAL QA ONLY FIXTURES (NON-NORMATIVE)
 * 
 * Strictly for component showcase, visual alignment, and accessibility testing of VIS-07.
 * These fixtures DO NOT define business defaults, persistence rules, or financial domain formulas.
 */

export type GraduateMembershipStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
export type GraduateContractStatus = 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'SUPERSEDED' | 'CANCELLED';
export type PaymentSubmissionStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type FinancialStatusCategory = 'AL_CORRIENTE' | 'PROXIMO' | 'VENCIDO' | 'LIQUIDADO' | 'SIN_DATOS';

export interface InternalNoteMock {
  id: string;
  author: string;
  createdAt: string;
  content: string;
}

export interface AuditLogMock {
  id: string;
  actor: string;
  action: string;
  context: string;
  timestamp: string;
  reason?: string;
}

export interface GraduateGroupMemberMock {
  id: string;
  name: string;
  productType: string;
  tableNumber: number | null;
  meal: string;
  status: string;
}

export interface GraduateRecordMock {
  id: string;
  eventId: string;
  folio: string;
  fullName: string;
  email: string;
  phone: string;
  career: string;
  generation: string;
  membershipStatus: GraduateMembershipStatus;
  contractStatus: GraduateContractStatus;
  contractVersion: string;
  contractAcceptedAt: string | null;
  cancellationPolicyVersion: string;
  ticketCount: number;
  tableNumber: number | null;
  thermoStatus: 'LOCKED' | 'AVAILABLE' | 'REQUESTED' | 'IN_PRODUCTION' | 'DELIVERED';
  thermoThreshold: number;
  thermoCustomName?: string;
  financialStatus: FinancialStatusCategory;
  totalAmount: string | null;
  paidAmount: string | null;
  balanceAmount: string | null;
  overdueAmount: string | null;
  hasPendingProof: boolean;
  pendingProofDetails?: {
    id: string;
    amount: string;
    date: string;
    reference: string;
    status: PaymentSubmissionStatus;
  };
  guests: GraduateGroupMemberMock[];
  notes: InternalNoteMock[];
  auditLogs: AuditLogMock[];
}

export const VISUAL_QA_GRADUATE_RECORDS: Record<string, GraduateRecordMock> = {
  'grad-andrea-martinez': {
    id: 'grad-andrea-martinez',
    eventId: 'evt-derecho-2027',
    folio: 'GR-2027-0042',
    fullName: 'Andrea Martínez',
    email: 'andrea.martinez@ejemplo.com',
    phone: '+52 55 4912 3847',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    membershipStatus: 'ACTIVE',
    contractStatus: 'ACCEPTED',
    contractVersion: 'v1.2 (Contrato Digital Estandarizado)',
    contractAcceptedAt: '2026-10-15 14:32 hrs',
    cancellationPolicyVersion: 'POL-CAN-2027-V1',
    ticketCount: 8,
    tableNumber: 24,
    thermoStatus: 'LOCKED',
    thermoThreshold: 70,
    thermoCustomName: 'Andrea Martínez',
    financialStatus: 'AL_CORRIENTE',
    totalAmount: '$12,500',
    paidAmount: '$7,500',
    balanceAmount: '$5,000',
    overdueAmount: '$0',
    hasPendingProof: false,
    guests: [
      { id: 'gst-1', name: 'Andrea Martínez', productType: 'Boleto Adulto (Con cena)', tableNumber: 24, meal: 'Tradicional', status: 'Confirmado' },
      { id: 'gst-2', name: 'Carlos Martínez', productType: 'Boleto Adulto (Con cena)', tableNumber: 24, meal: 'Vegano', status: 'Confirmado' },
      { id: 'gst-3', name: 'Elena Martínez', productType: 'Boleto Adulto (Con cena)', tableNumber: 24, meal: 'Tradicional', status: 'Confirmado' },
      { id: 'gst-4', name: 'Luis Martínez', productType: 'Boleto Adulto (Con cena)', tableNumber: 24, meal: 'Tradicional', status: 'Confirmado' },
      { id: 'gst-5', name: 'Sofía Ramírez', productType: 'Boleto Adulto (Con cena)', tableNumber: 24, meal: 'Vegetariano', status: 'Confirmado' },
      { id: 'gst-6', name: 'Diego Ramírez', productType: 'Boleto Adulto (Con cena)', tableNumber: 24, meal: 'Tradicional', status: 'Confirmado' },
      { id: 'gst-7', name: 'Paula Hernández', productType: 'Boleto Adulto (Con cena)', tableNumber: 24, meal: 'Vegano', status: 'Confirmado' },
      { id: 'gst-8', name: 'Mateo Hernández', productType: 'Boleto Adulto (Con cena)', tableNumber: 24, meal: 'Tradicional', status: 'Confirmado' },
    ],
    notes: [
      { id: 'not-1', author: 'Coordinación GR', createdAt: '2026-11-02 10:15', content: 'Confirmó requerimiento de menú especial vegano para 2 invitados.' },
      { id: 'not-2', author: 'Atención a Graduados', createdAt: '2026-10-20 16:40', content: 'Asignada a Mesa 24 con solicitud de proximidad a pista.' },
    ],
    auditLogs: [
      { id: 'aud-1', actor: 'Andrea Martínez', action: 'Aceptación de contrato digital', context: 'Contrato v1.2', timestamp: '2026-10-15 14:32', reason: 'Firma electrónica confirmada con OTP' },
      { id: 'aud-2', actor: 'Sistema GR', action: 'Registro de anticipo inicial', context: 'Pago #PAY-1002', timestamp: '2026-10-15 14:35', reason: 'Aprobación bancaria Openpay' },
      { id: 'aud-3', actor: 'Admin Operativo', action: 'Asignación de mesa', context: 'Mesa 24', timestamp: '2026-10-20 16:40', reason: 'Ubicación asignada en croquis' },
    ],
  },
  'grad-fernando-torres': {
    id: 'grad-fernando-torres',
    eventId: 'evt-derecho-2027',
    folio: 'GR-2027-0058',
    fullName: 'Fernando Torres',
    email: 'fernando.torres@ejemplo.com',
    phone: '+52 55 8392 1044',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    membershipStatus: 'ACTIVE',
    contractStatus: 'ACCEPTED',
    contractVersion: 'v1.2',
    contractAcceptedAt: '2026-10-12 11:00 hrs',
    cancellationPolicyVersion: 'POL-CAN-2027-V1',
    ticketCount: 10,
    tableNumber: 12,
    thermoStatus: 'AVAILABLE',
    thermoThreshold: 70,
    thermoCustomName: 'Fernando Torres',
    financialStatus: 'LIQUIDADO',
    totalAmount: '$15,000',
    paidAmount: '$15,000',
    balanceAmount: '$0',
    overdueAmount: '$0',
    hasPendingProof: false,
    guests: [
      { id: 'gst-f1', name: 'Fernando Torres', productType: 'Boleto Adulto (Con cena)', tableNumber: 12, meal: 'Tradicional', status: 'Confirmado' },
    ],
    notes: [],
    auditLogs: [],
  },
  'grad-mariana-lopez': {
    id: 'grad-mariana-lopez',
    eventId: 'evt-derecho-2027',
    folio: 'GR-2027-0091',
    fullName: 'Mariana López',
    email: 'mariana.lopez@ejemplo.com',
    phone: '+52 55 7711 9022',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    membershipStatus: 'ACTIVE',
    contractStatus: 'PENDING_ACCEPTANCE',
    contractVersion: 'v1.2',
    contractAcceptedAt: null,
    cancellationPolicyVersion: 'POL-CAN-2027-V1',
    ticketCount: 6,
    tableNumber: null,
    thermoStatus: 'REQUESTED',
    thermoThreshold: 70,
    thermoCustomName: 'Mariana López',
    financialStatus: 'PROXIMO',
    totalAmount: '$9,000',
    paidAmount: '$6,500',
    balanceAmount: '$2,500',
    overdueAmount: '$0',
    hasPendingProof: true,
    pendingProofDetails: {
      id: 'sub-001',
      amount: '$2,500',
      date: '2026-11-10',
      reference: 'TRANSF-98231',
      status: 'PENDING_REVIEW',
    },
    guests: [
      { id: 'gst-m1', name: 'Mariana López', productType: 'Boleto Adulto (Con cena)', tableNumber: null, meal: 'Vegetariano', status: 'Pendiente mesa' },
    ],
    notes: [
      { id: 'not-m1', author: 'Finanzas GR', createdAt: '2026-11-10 18:00', content: 'Comprobante de transferencia subido por graduada, pendiente de validar con estado de cuenta bancario.' },
    ],
    auditLogs: [],
  },
  'grad-roberto-sanchez': {
    id: 'grad-roberto-sanchez',
    eventId: 'evt-derecho-2027',
    folio: 'GR-2027-0104',
    fullName: 'Roberto Sánchez',
    email: 'roberto.sanchez@ejemplo.com',
    phone: '+52 55 3344 8899',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    membershipStatus: 'ACTIVE',
    contractStatus: 'ACCEPTED',
    contractVersion: 'v1.2',
    contractAcceptedAt: '2026-10-18 09:20 hrs',
    cancellationPolicyVersion: 'POL-CAN-2027-V1',
    ticketCount: 8,
    tableNumber: 18,
    thermoStatus: 'IN_PRODUCTION',
    thermoThreshold: 70,
    thermoCustomName: 'Roberto Sánchez',
    financialStatus: 'VENCIDO',
    totalAmount: '$12,500',
    paidAmount: '$5,000',
    balanceAmount: '$7,500',
    overdueAmount: '$2,500',
    hasPendingProof: false,
    guests: [
      { id: 'gst-r1', name: 'Roberto Sánchez', productType: 'Boleto Adulto (Con cena)', tableNumber: 18, meal: 'Tradicional', status: 'Confirmado' },
    ],
    notes: [],
    auditLogs: [],
  },
};
