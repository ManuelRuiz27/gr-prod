/**
 * Fixtures para pruebas visuales de Croquis y Asignación de Mesas (ADMIN y GRADUATE).
 *
 * NOTA TÉCNICA:
 * - VISUAL_QA_ONLY
 * - NON_NORMATIVE
 * Estos datos se utilizan exclusivamente para validar la renderización, jerarquía visual,
 * asignaciones por persona (GroupMember -> EventTable), estados operativos, aislamiento
 * de privacidad y alternativas accesibles sin simular persistencia en backend.
 */

export interface VisualTableAssignment {
  id: string;
  groupMemberId: string;
  memberName: string;
  graduateMembershipId: string;
  graduateName: string;
  tableId: string;
  isLocalPreview?: boolean;
}

export interface VisualTable {
  id: string;
  eventId: string;
  number: number;
  name?: string;
  shape: 'SQUARE' | 'ROUND';
  capacity: number;
  occupied: number;
  available: number;
  status: 'AVAILABLE' | 'BLOCKED';
  x: number;
  y: number;
  assignments: VisualTableAssignment[];
}

export interface VisualGraduateMemberSeating {
  id: string;
  name: string;
  isPrimary: boolean;
  productType: string;
  assignedTableNumber?: number;
  tableId?: string;
}

export interface VisualGraduateSeatingState {
  graduateId: string;
  graduateName: string;
  eventId: string;
  eventName: string;
  isFinanciallyEligible: boolean;
  lockedReason?: string;
  isDeadlineClosed?: boolean;
  hasConcurrencyConflict?: boolean;
  members: VisualGraduateMemberSeating[];
}

// ---------------------------------------------------------------------------
// Baseline Tables Fixture
// ---------------------------------------------------------------------------

export const VISUAL_QA_TABLES: VisualTable[] = [
  {
    id: 'tbl-1',
    eventId: 'evt-derecho-2027',
    number: 1,
    shape: 'ROUND',
    capacity: 10,
    occupied: 0,
    available: 10,
    status: 'AVAILABLE',
    x: 0.18,
    y: 0.28,
    assignments: [],
  },
  {
    id: 'tbl-2',
    eventId: 'evt-derecho-2027',
    number: 2,
    shape: 'ROUND',
    capacity: 10,
    occupied: 0,
    available: 10,
    status: 'AVAILABLE',
    x: 0.38,
    y: 0.28,
    assignments: [],
  },
  {
    id: 'tbl-12',
    eventId: 'evt-derecho-2027',
    number: 12,
    shape: 'ROUND',
    capacity: 10,
    occupied: 10,
    available: 0,
    status: 'AVAILABLE',
    x: 0.78,
    y: 0.28,
    assignments: [
      { id: 'asgn-1', groupMemberId: 'gm-m1', memberName: 'Mariana López', graduateMembershipId: 'grad-mariana-lopez', graduateName: 'Mariana López', tableId: 'tbl-12' },
      { id: 'asgn-2', groupMemberId: 'gm-m2', memberName: 'Jorge López', graduateMembershipId: 'grad-mariana-lopez', graduateName: 'Mariana López', tableId: 'tbl-12' },
      { id: 'asgn-3', groupMemberId: 'gm-m3', memberName: 'Patricia Morales', graduateMembershipId: 'grad-mariana-lopez', graduateName: 'Mariana López', tableId: 'tbl-12' },
      { id: 'asgn-4', groupMemberId: 'gm-o1', memberName: 'Alejandro Ruiz', graduateMembershipId: 'grad-otro-1', graduateName: 'Alejandro Ruiz', tableId: 'tbl-12' },
      { id: 'asgn-5', groupMemberId: 'gm-o2', memberName: 'Camila Ruiz', graduateMembershipId: 'grad-otro-1', graduateName: 'Alejandro Ruiz', tableId: 'tbl-12' },
      { id: 'asgn-6', groupMemberId: 'gm-o3', memberName: 'Esteban Ruiz', graduateMembershipId: 'grad-otro-1', graduateName: 'Alejandro Ruiz', tableId: 'tbl-12' },
      { id: 'asgn-7', groupMemberId: 'gm-o4', memberName: 'Paola Díaz', graduateMembershipId: 'grad-otro-2', graduateName: 'Paola Díaz', tableId: 'tbl-12' },
      { id: 'asgn-8', groupMemberId: 'gm-o5', memberName: 'David Díaz', graduateMembershipId: 'grad-otro-2', graduateName: 'Paola Díaz', tableId: 'tbl-12' },
      { id: 'asgn-9', groupMemberId: 'gm-o6', memberName: 'Héctor Gómez', graduateMembershipId: 'grad-otro-3', graduateName: 'Héctor Gómez', tableId: 'tbl-12' },
      { id: 'asgn-10', groupMemberId: 'gm-o7', memberName: 'Rosa Gómez', graduateMembershipId: 'grad-otro-3', graduateName: 'Héctor Gómez', tableId: 'tbl-12' },
    ],
  },
  {
    id: 'tbl-17',
    eventId: 'evt-derecho-2027',
    number: 17,
    shape: 'SQUARE',
    capacity: 10,
    occupied: 4,
    available: 6,
    status: 'AVAILABLE',
    x: 0.18,
    y: 0.65,
    assignments: [
      { id: 'asgn-17-1', groupMemberId: 'gm-g1', memberName: 'Gabriel Solís', graduateMembershipId: 'grad-gabriel', graduateName: 'Gabriel Solís', tableId: 'tbl-17' },
      { id: 'asgn-17-2', groupMemberId: 'gm-g2', memberName: 'Adriana Solís', graduateMembershipId: 'grad-gabriel', graduateName: 'Gabriel Solís', tableId: 'tbl-17' },
      { id: 'asgn-17-3', groupMemberId: 'gm-g3', memberName: 'Raúl Solís', graduateMembershipId: 'grad-gabriel', graduateName: 'Gabriel Solís', tableId: 'tbl-17' },
      { id: 'asgn-17-4', groupMemberId: 'gm-g4', memberName: 'Mónica Solís', graduateMembershipId: 'grad-gabriel', graduateName: 'Gabriel Solís', tableId: 'tbl-17' },
    ],
  },
  {
    id: 'tbl-24',
    eventId: 'evt-derecho-2027',
    number: 24,
    shape: 'SQUARE',
    capacity: 10,
    occupied: 2,
    available: 8,
    status: 'AVAILABLE',
    x: 0.58,
    y: 0.65,
    assignments: [
      { id: 'asgn-24-1', groupMemberId: 'gm-1', memberName: 'Andrea Martínez', graduateMembershipId: 'grad-andrea-martinez', graduateName: 'Andrea Martínez', tableId: 'tbl-24' },
      { id: 'asgn-24-2', groupMemberId: 'gm-2', memberName: 'Laura González', graduateMembershipId: 'grad-andrea-martinez', graduateName: 'Andrea Martínez', tableId: 'tbl-24' },
    ],
  },
  {
    id: 'tbl-25',
    eventId: 'evt-derecho-2027',
    number: 25,
    shape: 'SQUARE',
    capacity: 10,
    occupied: 0,
    available: 10,
    status: 'AVAILABLE',
    x: 0.78,
    y: 0.65,
    assignments: [],
  },
  {
    id: 'tbl-26',
    eventId: 'evt-derecho-2027',
    number: 26,
    shape: 'ROUND',
    capacity: 8,
    occupied: 0,
    available: 8,
    status: 'BLOCKED',
    x: 0.58,
    y: 0.28,
    assignments: [],
  },
];

// ---------------------------------------------------------------------------
// Graduate Seating Scenarios
// ---------------------------------------------------------------------------

export const VISUAL_QA_GRADUATE_SEATING_STATES: Record<string, VisualGraduateSeatingState> = {
  // Scenario 1: Partial assignment (Andrea: Andrea & Laura in Mesa 24, Carlos pending)
  'seating-andrea-partial': {
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    isFinanciallyEligible: true,
    isDeadlineClosed: false,
    members: [
      {
        id: 'gm-1',
        name: 'Andrea Martínez',
        isPrimary: true,
        productType: 'Graduado Titular',
        assignedTableNumber: 24,
        tableId: 'tbl-24',
      },
      {
        id: 'gm-2',
        name: 'Laura González',
        isPrimary: false,
        productType: 'Lugar Adulto',
        assignedTableNumber: 24,
        tableId: 'tbl-24',
      },
      {
        id: 'gm-3',
        name: 'Carlos Martínez',
        isPrimary: false,
        productType: 'Lugar Adulto',
        assignedTableNumber: undefined,
        tableId: undefined,
      },
    ],
  },

  // Scenario 2: Distributed group across multiple tables (Andrea & Laura in Mesa 24, Carlos in Mesa 17)
  'seating-andrea-distributed': {
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    isFinanciallyEligible: true,
    isDeadlineClosed: false,
    members: [
      {
        id: 'gm-1',
        name: 'Andrea Martínez',
        isPrimary: true,
        productType: 'Graduado Titular',
        assignedTableNumber: 24,
        tableId: 'tbl-24',
      },
      {
        id: 'gm-2',
        name: 'Laura González',
        isPrimary: false,
        productType: 'Lugar Adulto',
        assignedTableNumber: 24,
        tableId: 'tbl-24',
      },
      {
        id: 'gm-3',
        name: 'Carlos Martínez',
        isPrimary: false,
        productType: 'Lugar Adulto',
        assignedTableNumber: 17,
        tableId: 'tbl-17',
      },
    ],
  },

  // Scenario 3: Financially Locked
  'seating-locked-financial': {
    graduateId: 'grad-fernando-torres',
    graduateName: 'Fernando Torres',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    isFinanciallyEligible: false,
    lockedReason: 'La selección de mesa aún no está disponible. Completa el pago requerido para continuar.',
    isDeadlineClosed: false,
    members: [
      {
        id: 'gm-f1',
        name: 'Fernando Torres',
        isPrimary: true,
        productType: 'Graduado Titular',
        assignedTableNumber: undefined,
        tableId: undefined,
      },
      {
        id: 'gm-f2',
        name: 'Sofía Torres',
        isPrimary: false,
        productType: 'Lugar Adulto',
        assignedTableNumber: undefined,
        tableId: undefined,
      },
    ],
  },

  // Scenario 4: Deadline Closed
  'seating-deadline-closed': {
    graduateId: 'grad-roberto-sanchez',
    graduateName: 'Roberto Sánchez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    isFinanciallyEligible: true,
    isDeadlineClosed: true,
    members: [
      {
        id: 'gm-r1',
        name: 'Roberto Sánchez',
        isPrimary: true,
        productType: 'Graduado Titular',
        assignedTableNumber: 17,
        tableId: 'tbl-17',
      },
      {
        id: 'gm-r2',
        name: 'Elena Ramos',
        isPrimary: false,
        productType: 'Lugar Adulto',
        assignedTableNumber: 17,
        tableId: 'tbl-17',
      },
    ],
  },

  // Scenario 5: Concurrency Conflict
  'seating-concurrency-conflict': {
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    isFinanciallyEligible: true,
    isDeadlineClosed: false,
    hasConcurrencyConflict: true,
    members: [
      {
        id: 'gm-1',
        name: 'Andrea Martínez',
        isPrimary: true,
        productType: 'Graduado Titular',
        assignedTableNumber: 24,
        tableId: 'tbl-24',
      },
      {
        id: 'gm-3',
        name: 'Carlos Martínez',
        isPrimary: false,
        productType: 'Lugar Adulto',
        assignedTableNumber: undefined,
        tableId: undefined,
      },
    ],
  },
};
