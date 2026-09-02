/**
 * Fixtures para pruebas visuales de Contrato y Grupo (GRADUATE).
 *
 * NOTA TÉCNICA:
 * - VISUAL_QA_ONLY
 * - NON_NORMATIVE
 * Estos datos se utilizan exclusivamente para validar la renderización, jerarquía visual,
 * estados contractuales, quotes de productos y flujos de interfaz sin simular persistencia
 * ni actuar como contratos legales reales o defaults universales.
 */

export type VisualContractStatus =
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'SUPERSEDED'
  | 'CANCELLED';

export type VisualProductType =
  | 'BASE_PACKAGE'
  | 'ADULT'
  | 'CHILD'
  | 'NO_DINNER'
  | 'EXTRA_THERMO'
  | 'OTHER';

export interface VisualContractLineItem {
  id: string;
  concept: string;
  productType: VisualProductType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface VisualContract {
  id: string;
  folio: string;
  graduateId: string;
  graduateName: string;
  eventId: string;
  eventName: string;
  institution: string;
  career: string;
  generation: string;
  status: VisualContractStatus;
  acceptedAt?: string;
  acceptedBy?: string;
  termsVersion: string;
  policyVersion: string;
  totalPlaces: number;
  totalAmount: number;
  lineItems: VisualContractLineItem[];
  paymentScheme: {
    initialPayment?: number;
    installmentsCount: number;
    installmentAmount: number;
    dueDatesSummary: string;
  };
  cancellationPolicySummary: string;
  termsSections: Array<{
    title: string;
    paragraphs: string[];
  }>;
}

export interface VisualGroupMember {
  id: string;
  name: string;
  isPrimary: boolean;
  productType: string;
  tableLabel?: string;
  mealSummary?: string;
  status: 'CONFIRMED' | 'PENDING_INFO';
}

export interface VisualProductOption {
  id: string;
  name: string;
  productType: 'ADULT' | 'CHILD' | 'NO_DINNER';
  price: number;
  description: string;
}

export interface VisualAdditionalProductQuote {
  productId: string;
  productName: string;
  productPrice: number;
  currentContractedTotal: number;
  newContractedTotal: number;
  requiredNow: number;
  futureBalance: number;
}

export interface VisualGroupState {
  graduateId: string;
  graduateName: string;
  eventId: string;
  totalPlaces: number;
  namedMembersCount: number;
  availableSlots: number;
  isDeadlineClosed?: boolean;
  isEventOpen?: boolean;
  contractLineItemsSummary: string;
  members: VisualGroupMember[];
  availableProductOptions: VisualProductOption[];
  precalculatedQuote?: VisualAdditionalProductQuote;
}

// ---------------------------------------------------------------------------
// Contratos QA Scenarios
// ---------------------------------------------------------------------------

export const VISUAL_QA_CONTRACTS: Record<string, VisualContract> = {
  // Scenario 1: Pending acceptance (Andrea Martínez baseline)
  'contract-andrea-pending': {
    id: 'contract-andrea-pending',
    folio: 'CT-2027-0042',
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    institution: 'Universidad Autónoma de Nuevo León',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    status: 'PENDING_ACCEPTANCE',
    termsVersion: 'v2027.1',
    policyVersion: 'POL-2027-A',
    totalPlaces: 5,
    totalAmount: 12500,
    lineItems: [
      {
        id: 'li-1',
        concept: 'Paquete de Graduación (Graduado Titular + Termo)',
        productType: 'BASE_PACKAGE',
        quantity: 1,
        unitPrice: 4500,
        totalPrice: 4500,
      },
      {
        id: 'li-2',
        concept: 'Lugar Adulto (Cena formal 3 tiempos)',
        productType: 'ADULT',
        quantity: 4,
        unitPrice: 2000,
        totalPrice: 8000,
      },
    ],
    paymentScheme: {
      initialPayment: 2500,
      installmentsCount: 5,
      installmentAmount: 2500,
      dueDatesSummary: 'Pagos mensuales del 15 de noviembre de 2026 al 15 de marzo de 2027.',
    },
    cancellationPolicySummary:
      'Cancelaciones solicitadas con más de 90 días naturales previo al evento aplican penalización administrativa según tabulador vigente del evento. No hay cancelaciones unilaterales extemporáneas.',
    termsSections: [
      {
        title: '1. Objeto del Contrato de Membresía',
        paragraphs: [
          'El presente contrato formaliza la participación del Graduado Titular en el evento de graduación especificado, así como los lugares, accesos y productos contratados para su grupo acompañante.',
          'Las condiciones financieras y de logística descritas representan los compromisos vinculantes entre el Comité Organizador y el Graduado.',
        ],
      },
      {
        title: '2. Compromiso de Pago y Calendario',
        paragraphs: [
          'El Graduado se compromete a cubrir las cuotas programadas en las fechas límite establecidas. Los pagos fuera de plazo estarán sujetos a la política de recargos configurada para el evento.',
          'La asignación definitiva de mesas y la entrega de productos conmemorativos están sujetas a los umbrales de cobertura financiera establecidos.',
        ],
      },
      {
        title: '3. Asignación de Mesas y Menús',
        paragraphs: [
          'La distribución de lugares en mesas y la selección de tiempos de menú deberán completarse dentro de las fechas de corte anunciadas por el equipo organizador.',
        ],
      },
    ],
  },

  // Scenario 2: Accepted contract
  'contract-andrea-accepted': {
    id: 'contract-andrea-accepted',
    folio: 'CT-2027-0042',
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    institution: 'Universidad Autónoma de Nuevo León',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    status: 'ACCEPTED',
    acceptedAt: '12 Oct 2026, 14:35 hrs',
    acceptedBy: 'Andrea Martínez (andrea.martinez@ejemplo.com)',
    termsVersion: 'v2027.1',
    policyVersion: 'POL-2027-A',
    totalPlaces: 5,
    totalAmount: 12500,
    lineItems: [
      {
        id: 'li-1',
        concept: 'Paquete de Graduación (Graduado Titular + Termo)',
        productType: 'BASE_PACKAGE',
        quantity: 1,
        unitPrice: 4500,
        totalPrice: 4500,
      },
      {
        id: 'li-2',
        concept: 'Lugar Adulto (Cena formal 3 tiempos)',
        productType: 'ADULT',
        quantity: 4,
        unitPrice: 2000,
        totalPrice: 8000,
      },
    ],
    paymentScheme: {
      initialPayment: 2500,
      installmentsCount: 5,
      installmentAmount: 2500,
      dueDatesSummary: 'Pagos mensuales del 15 de noviembre de 2026 al 15 de marzo de 2027.',
    },
    cancellationPolicySummary:
      'Cancelaciones solicitadas con más de 90 días naturales previo al evento aplican penalización administrativa según tabulador vigente del evento.',
    termsSections: [
      {
        title: '1. Objeto del Contrato de Membresía',
        paragraphs: [
          'El presente contrato formaliza la participación del Graduado Titular en el evento de graduación especificado, así como los lugares, accesos y productos contratados para su grupo acompañante.',
        ],
      },
      {
        title: '2. Compromiso de Pago y Calendario',
        paragraphs: [
          'El Graduado se compromete a cubrir las cuotas programadas en las fechas límite establecidas.',
        ],
      },
    ],
  },

  // Scenario 3: Superseded contract
  'contract-superseded': {
    id: 'contract-superseded',
    folio: 'CT-2027-0010-OLD',
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    institution: 'Universidad Autónoma de Nuevo León',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    status: 'SUPERSEDED',
    acceptedAt: '01 Sep 2026, 10:15 hrs',
    acceptedBy: 'Andrea Martínez',
    termsVersion: 'v2027.0',
    policyVersion: 'POL-2027-A',
    totalPlaces: 4,
    totalAmount: 10500,
    lineItems: [
      {
        id: 'li-old-1',
        concept: 'Paquete de Graduación',
        productType: 'BASE_PACKAGE',
        quantity: 1,
        unitPrice: 4500,
        totalPrice: 4500,
      },
      {
        id: 'li-old-2',
        concept: 'Lugar Adulto',
        productType: 'ADULT',
        quantity: 3,
        unitPrice: 2000,
        totalPrice: 6000,
      },
    ],
    paymentScheme: {
      installmentsCount: 5,
      installmentAmount: 2100,
      dueDatesSummary: 'Esquema sustituido por compra adicional.',
    },
    cancellationPolicySummary: 'Versión histórica superseded.',
    termsSections: [
      {
        title: 'Contrato Histórico Sustituido',
        paragraphs: ['Este contrato ha sido sustituido por una versión posterior y permanece únicamente como registro de auditoría.'],
      },
    ],
  },

  // Scenario 4: Cancelled contract
  'contract-cancelled': {
    id: 'contract-cancelled',
    folio: 'CT-2027-0099',
    graduateId: 'grad-cancelado',
    graduateName: 'Rodrigo Valdés',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    institution: 'Universidad Autónoma de Nuevo León',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    status: 'CANCELLED',
    termsVersion: 'v2027.1',
    policyVersion: 'POL-2027-A',
    totalPlaces: 0,
    totalAmount: 0,
    lineItems: [],
    paymentScheme: {
      installmentsCount: 0,
      installmentAmount: 0,
      dueDatesSummary: 'Membresía y contrato cancelados conforme a la política.',
    },
    cancellationPolicySummary: 'Cancelado.',
    termsSections: [
      {
        title: 'Membresía Cancelada',
        paragraphs: ['El contrato y la membresía han sido cancelados en la plataforma.'],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Grupo QA Scenarios
// ---------------------------------------------------------------------------

export const VISUAL_QA_GROUP_STATES: Record<string, VisualGroupState> = {
  // Scenario 1: Group with available slots (Andrea baseline: 5 total, 3 named, 2 available)
  'group-andrea-available': {
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    totalPlaces: 5,
    namedMembersCount: 3,
    availableSlots: 2,
    isDeadlineClosed: false,
    isEventOpen: true,
    contractLineItemsSummary: '1 Paquete Titular + 4 Lugares Adulto',
    members: [
      {
        id: 'gm-1',
        name: 'Andrea Martínez',
        isPrimary: true,
        productType: 'Graduado Titular',
        tableLabel: 'Mesa 24',
        mealSummary: 'Menú Tradicional',
        status: 'CONFIRMED',
      },
      {
        id: 'gm-2',
        name: 'Laura González',
        isPrimary: false,
        productType: 'Lugar Adulto',
        tableLabel: 'Mesa 24',
        mealSummary: 'Menú Vegetariano',
        status: 'CONFIRMED',
      },
      {
        id: 'gm-3',
        name: 'Carlos Martínez',
        isPrimary: false,
        productType: 'Lugar Adulto',
        tableLabel: 'Mesa 24',
        mealSummary: 'Pendiente de selección',
        status: 'CONFIRMED',
      },
    ],
    availableProductOptions: [
      {
        id: 'prod-adult',
        name: 'Lugar Adulto Adicional',
        productType: 'ADULT',
        price: 2000,
        description: 'Acceso completo y cena formal de 3 tiempos para acompañante adulto.',
      },
      {
        id: 'prod-child',
        name: 'Lugar Infantil',
        productType: 'CHILD',
        price: 1000,
        description: 'Menú infantil especial para menores de 12 años.',
      },
      {
        id: 'prod-nodinner',
        name: 'Lugar Sin Cena',
        productType: 'NO_DINNER',
        price: 800,
        description: 'Acceso para brindis y baile después del banquete.',
      },
    ],
    precalculatedQuote: {
      productId: 'prod-adult',
      productName: 'Lugar Adulto Adicional',
      productPrice: 2000,
      currentContractedTotal: 12500,
      newContractedTotal: 14500,
      requiredNow: 1200,
      futureBalance: 5800,
    },
  },

  // Scenario 2: Full Group (all places named)
  'group-full': {
    graduateId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    eventId: 'evt-derecho-2027',
    totalPlaces: 3,
    namedMembersCount: 3,
    availableSlots: 0,
    isDeadlineClosed: false,
    isEventOpen: true,
    contractLineItemsSummary: '1 Paquete Titular + 2 Lugares Adulto',
    members: [
      {
        id: 'gm-m1',
        name: 'Mariana López',
        isPrimary: true,
        productType: 'Graduado Titular',
        tableLabel: 'Mesa 12',
        mealSummary: 'Menú Tradicional',
        status: 'CONFIRMED',
      },
      {
        id: 'gm-m2',
        name: 'Jorge López',
        isPrimary: false,
        productType: 'Lugar Adulto',
        tableLabel: 'Mesa 12',
        mealSummary: 'Menú Tradicional',
        status: 'CONFIRMED',
      },
      {
        id: 'gm-m3',
        name: 'Patricia Morales',
        isPrimary: false,
        productType: 'Lugar Adulto',
        tableLabel: 'Mesa 14',
        mealSummary: 'Menú Vegetariano',
        status: 'CONFIRMED',
      },
    ],
    availableProductOptions: [
      {
        id: 'prod-adult',
        name: 'Lugar Adulto Adicional',
        productType: 'ADULT',
        price: 2000,
        description: 'Acceso completo y cena formal para acompañante.',
      },
    ],
    precalculatedQuote: {
      productId: 'prod-adult',
      productName: 'Lugar Adulto Adicional',
      productPrice: 2000,
      currentContractedTotal: 9000,
      newContractedTotal: 11000,
      requiredNow: 1440,
      futureBalance: 3060,
    },
  },

  // Scenario 3: Deadline closed for naming members
  'group-deadline-closed': {
    graduateId: 'grad-fernando-torres',
    graduateName: 'Fernando Torres',
    eventId: 'evt-derecho-2027',
    totalPlaces: 4,
    namedMembersCount: 2,
    availableSlots: 2,
    isDeadlineClosed: true,
    isEventOpen: true,
    contractLineItemsSummary: '1 Paquete Titular + 3 Lugares Adulto',
    members: [
      {
        id: 'gm-f1',
        name: 'Fernando Torres',
        isPrimary: true,
        productType: 'Graduado Titular',
        tableLabel: 'Mesa 08',
        mealSummary: 'Menú Tradicional',
        status: 'CONFIRMED',
      },
      {
        id: 'gm-f2',
        name: 'Sofía Torres',
        isPrimary: false,
        productType: 'Lugar Adulto',
        tableLabel: 'Mesa 08',
        mealSummary: 'Menú Tradicional',
        status: 'CONFIRMED',
      },
    ],
    availableProductOptions: [],
  },

  // Scenario 4: Event closed
  'group-event-closed': {
    graduateId: 'grad-roberto-sanchez',
    graduateName: 'Roberto Sánchez',
    eventId: 'evt-derecho-2027',
    totalPlaces: 4,
    namedMembersCount: 4,
    availableSlots: 0,
    isDeadlineClosed: true,
    isEventOpen: false,
    contractLineItemsSummary: '1 Paquete Titular + 3 Lugares Adulto',
    members: [
      {
        id: 'gm-r1',
        name: 'Roberto Sánchez',
        isPrimary: true,
        productType: 'Graduado Titular',
        tableLabel: 'Mesa 18',
        mealSummary: 'Menú Tradicional',
        status: 'CONFIRMED',
      },
      {
        id: 'gm-r2',
        name: 'Elena Ramos',
        isPrimary: false,
        productType: 'Lugar Adulto',
        tableLabel: 'Mesa 18',
        mealSummary: 'Menú Vegetariano',
        status: 'CONFIRMED',
      },
    ],
    availableProductOptions: [],
  },
};
