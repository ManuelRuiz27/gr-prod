/**
 * Fixtures para pruebas visuales de Platillos y Termos (ADMIN y GRADUATE).
 *
 * NOTA TÉCNICA:
 * - VISUAL_QA_ONLY
 * - NON_NORMATIVE
 * Estos datos se utilizan exclusivamente para validar la renderización, jerarquía visual,
 * selección nominal por persona (GroupMember -> MealSelection -> MealOption),
 * estado autoritativo de termo (GraduateMembership -> ThermoRequest), protección contra
 * fallbacks automáticos y ausencia de persistencia ficticia.
 */

// ---------------------------------------------------------------------------
// 1. Types: Meals
// ---------------------------------------------------------------------------

export interface VisualMealOption {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface VisualGroupMemberMeal {
  id: string; // groupMemberId
  graduateMembershipId: string;
  graduateName: string;
  contractFolio?: string;
  name: string;
  isPrimary: boolean;
  productType: string;
  selectedMealOptionId?: string;
  selectedMealName?: string;
  isHistoricalInactive?: boolean;
  isLocalOverride?: boolean;
  overrideReason?: string;
}

export interface VisualGraduateMealsState {
  graduateId: string;
  graduateName: string;
  eventId: string;
  eventName: string;
  contractFolio?: string;
  mealsDeadline?: string;
  isDeadlineClosed: boolean;
  options: VisualMealOption[];
  members: VisualGroupMemberMeal[];
}

// ---------------------------------------------------------------------------
// 2. Types: Thermo
// ---------------------------------------------------------------------------

export type VisualThermoStatus =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'REQUESTED'
  | 'IN_PRODUCTION'
  | 'DELIVERED';

export interface VisualThermoPersonalizationField {
  key: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface VisualThermoDeliveryInfo {
  deliveredAt?: string;
  receivedBy?: string;
  notes?: string;
}

export interface VisualGraduateThermoState {
  graduateId: string;
  graduateName: string;
  eventId: string;
  eventName: string;
  contractFolio?: string;
  tableSummary?: string;
  status: VisualThermoStatus;
  financialProgressPercentage?: number;
  requiredThresholdPercentage?: number; // event-configured threshold
  personalizationFields: VisualThermoPersonalizationField[];
  personalization: Record<string, string>; // actual captured values (no fullName fallback)
  deliveryInfo?: VisualThermoDeliveryInfo;
  hasAdditionalThermo?: boolean;
  additionalThermoCount?: number;
  timeline?: { date: string; status: VisualThermoStatus; note: string }[];
}

// ---------------------------------------------------------------------------
// 3. Baseline Event Meal Options Fixtures
// ---------------------------------------------------------------------------

export const VISUAL_QA_MEAL_OPTIONS: VisualMealOption[] = [
  {
    id: 'meal-opt-1',
    eventId: 'evt-derecho-2027',
    name: 'Tradicional',
    description: 'Corte de res con guarnición de verduras glaseadas y puré rústico.',
    isActive: true,
  },
  {
    id: 'meal-opt-2',
    eventId: 'evt-derecho-2027',
    name: 'Vegetariano',
    description: 'Lasaña de berenjena y setas silvestres con salsa de jitomate deshidratado.',
    isActive: true,
  },
  {
    id: 'meal-opt-3',
    eventId: 'evt-derecho-2027',
    name: 'Vegano',
    description: 'Risotto de hongos y trufa con emulsión de leche de coco y espárragos.',
    isActive: true,
  },
  {
    id: 'meal-opt-inactive',
    eventId: 'evt-derecho-2027',
    name: 'Menú Infantil 2026',
    description: 'Opción descontinuada para el nuevo periodo.',
    isActive: false,
  },
];

// ---------------------------------------------------------------------------
// 4. Admin All Members Meals Baseline (for Admin Event Meals Table)
// ---------------------------------------------------------------------------

export const VISUAL_QA_ADMIN_MEAL_MEMBERS: VisualGroupMemberMeal[] = [
  {
    id: 'gm-andrea-1',
    graduateMembershipId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    contractFolio: 'CT-2027-0042',
    name: 'Andrea Martínez',
    isPrimary: true,
    productType: 'Graduado Titular',
    selectedMealOptionId: 'meal-opt-1',
    selectedMealName: 'Tradicional',
  },
  {
    id: 'gm-andrea-2',
    graduateMembershipId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    contractFolio: 'CT-2027-0042',
    name: 'Laura González',
    isPrimary: false,
    productType: 'Lugar Adulto',
    selectedMealOptionId: 'meal-opt-2',
    selectedMealName: 'Vegetariano',
  },
  {
    id: 'gm-andrea-3',
    graduateMembershipId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    contractFolio: 'CT-2027-0042',
    name: 'Carlos Martínez',
    isPrimary: false,
    productType: 'Lugar Adulto',
    selectedMealOptionId: undefined,
    selectedMealName: undefined, // Pending
  },
  {
    id: 'gm-mariana-1',
    graduateMembershipId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    contractFolio: 'CT-2027-0018',
    name: 'Mariana López',
    isPrimary: true,
    productType: 'Graduado Titular',
    selectedMealOptionId: 'meal-opt-1',
    selectedMealName: 'Tradicional',
  },
  {
    id: 'gm-mariana-2',
    graduateMembershipId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    contractFolio: 'CT-2027-0018',
    name: 'Jorge López',
    isPrimary: false,
    productType: 'Lugar Adulto',
    selectedMealOptionId: 'meal-opt-1',
    selectedMealName: 'Tradicional',
  },
  {
    id: 'gm-mariana-3',
    graduateMembershipId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    contractFolio: 'CT-2027-0018',
    name: 'Patricia Morales',
    isPrimary: false,
    productType: 'Lugar Adulto',
    selectedMealOptionId: 'meal-opt-3',
    selectedMealName: 'Vegano',
  },
  {
    id: 'gm-fernando-1',
    graduateMembershipId: 'grad-fernando-torres',
    graduateName: 'Fernando Torres',
    contractFolio: 'CT-2027-0089',
    name: 'Fernando Torres',
    isPrimary: true,
    productType: 'Graduado Titular',
    selectedMealOptionId: undefined,
    selectedMealName: undefined, // Pending
  },
  {
    id: 'gm-fernando-2',
    graduateMembershipId: 'grad-fernando-torres',
    graduateName: 'Fernando Torres',
    contractFolio: 'CT-2027-0089',
    name: 'Sofía Torres',
    isPrimary: false,
    productType: 'Lugar Adulto',
    selectedMealOptionId: undefined,
    selectedMealName: undefined, // Pending
  },
  {
    id: 'gm-gabriel-1',
    graduateMembershipId: 'grad-gabriel-solis',
    graduateName: 'Gabriel Solís',
    contractFolio: 'CT-2027-0105',
    name: 'Gabriel Solís',
    isPrimary: true,
    productType: 'Graduado Titular',
    selectedMealOptionId: 'meal-opt-inactive',
    selectedMealName: 'Menú Infantil 2026',
    isHistoricalInactive: true,
  },
];

// ---------------------------------------------------------------------------
// 5. Graduate Meals Scenarios
// ---------------------------------------------------------------------------

export const VISUAL_QA_GRADUATE_MEALS_STATES: Record<string, VisualGraduateMealsState> = {
  // Scenario 1: Standard open state (Andrea: Andrea Tradicional, Laura Vegetariano, Carlos pending)
  'meals-andrea-active': {
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0042',
    mealsDeadline: '10 de mayo de 2027',
    isDeadlineClosed: false,
    options: VISUAL_QA_MEAL_OPTIONS.filter((o) => o.isActive),
    members: [
      {
        id: 'gm-andrea-1',
        graduateMembershipId: 'grad-andrea-martinez',
        graduateName: 'Andrea Martínez',
        contractFolio: 'CT-2027-0042',
        name: 'Andrea Martínez',
        isPrimary: true,
        productType: 'Graduado Titular',
        selectedMealOptionId: 'meal-opt-1',
        selectedMealName: 'Tradicional',
      },
      {
        id: 'gm-andrea-2',
        graduateMembershipId: 'grad-andrea-martinez',
        graduateName: 'Andrea Martínez',
        contractFolio: 'CT-2027-0042',
        name: 'Laura González',
        isPrimary: false,
        productType: 'Lugar Adulto',
        selectedMealOptionId: 'meal-opt-2',
        selectedMealName: 'Vegetariano',
      },
      {
        id: 'gm-andrea-3',
        graduateMembershipId: 'grad-andrea-martinez',
        graduateName: 'Andrea Martínez',
        contractFolio: 'CT-2027-0042',
        name: 'Carlos Martínez',
        isPrimary: false,
        productType: 'Lugar Adulto',
        selectedMealOptionId: undefined,
        selectedMealName: undefined,
      },
    ],
  },

  // Scenario 2: Deadline closed (read-only)
  'meals-deadline-closed': {
    graduateId: 'grad-roberto-sanchez',
    graduateName: 'Roberto Sánchez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0055',
    mealsDeadline: '1 de abril de 2027',
    isDeadlineClosed: true,
    options: VISUAL_QA_MEAL_OPTIONS.filter((o) => o.isActive),
    members: [
      {
        id: 'gm-roberto-1',
        graduateMembershipId: 'grad-roberto-sanchez',
        graduateName: 'Roberto Sánchez',
        contractFolio: 'CT-2027-0055',
        name: 'Roberto Sánchez',
        isPrimary: true,
        productType: 'Graduado Titular',
        selectedMealOptionId: 'meal-opt-1',
        selectedMealName: 'Tradicional',
      },
    ],
  },

  // Scenario 3: No meal options configured for event
  'meals-no-options': {
    graduateId: 'grad-empty-event',
    graduateName: 'Graduado Sin Opciones',
    eventId: 'evt-vacio-2027',
    eventName: 'Evento Sin Platillos 2027',
    isDeadlineClosed: false,
    options: [],
    members: [
      {
        id: 'gm-empty-1',
        graduateMembershipId: 'grad-empty-event',
        graduateName: 'Graduado Sin Opciones',
        name: 'Graduado Titular',
        isPrimary: true,
        productType: 'Graduado Titular',
      },
    ],
  },

  // Scenario 4: Historical inactive option selected in past
  'meals-with-inactive': {
    graduateId: 'grad-gabriel-solis',
    graduateName: 'Gabriel Solís',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0105',
    isDeadlineClosed: false,
    options: VISUAL_QA_MEAL_OPTIONS.filter((o) => o.isActive),
    members: [
      {
        id: 'gm-gabriel-1',
        graduateMembershipId: 'grad-gabriel-solis',
        graduateName: 'Gabriel Solís',
        contractFolio: 'CT-2027-0105',
        name: 'Gabriel Solís',
        isPrimary: true,
        productType: 'Graduado Titular',
        selectedMealOptionId: 'meal-opt-inactive',
        selectedMealName: 'Menú Infantil 2026',
        isHistoricalInactive: true,
      },
    ],
  },

  // Scenario 5: Non-standard option names (anti-branching proof)
  'meals-custom-names': {
    graduateId: 'grad-custom-event',
    graduateName: 'Valeria Corona',
    eventId: 'evt-gala-2027',
    eventName: 'Gala Arquitectura 2027',
    contractFolio: 'CT-2027-0777',
    isDeadlineClosed: false,
    options: [
      { id: 'opt-c1', eventId: 'evt-gala-2027', name: 'Cena de Gala 3 Tiempos', isActive: true },
      { id: 'opt-c2', eventId: 'evt-gala-2027', name: 'Menú Chef Signature', isActive: true },
      { id: 'opt-c3', eventId: 'evt-gala-2027', name: 'Menú Especial X', isActive: true },
    ],
    members: [
      {
        id: 'gm-val-1',
        graduateMembershipId: 'grad-custom-event',
        graduateName: 'Valeria Corona',
        name: 'Valeria Corona',
        isPrimary: true,
        productType: 'Graduado Titular',
        selectedMealOptionId: 'opt-c1',
        selectedMealName: 'Cena de Gala 3 Tiempos',
      },
    ],
  },

  // Scenario 6: Titular is NOT index 0 in members array (anti-index-primary proof)
  'meals-non-first-primary': {
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0042',
    isDeadlineClosed: false,
    options: VISUAL_QA_MEAL_OPTIONS.filter((o) => o.isActive),
    members: [
      {
        id: 'gm-laura',
        graduateMembershipId: 'grad-andrea-martinez',
        graduateName: 'Andrea Martínez',
        name: 'Laura González',
        isPrimary: false,
        productType: 'Lugar Adulto',
        selectedMealOptionId: 'meal-opt-2',
        selectedMealName: 'Menú Vegetariano',
      },
      {
        id: 'gm-andrea-titular',
        graduateMembershipId: 'grad-andrea-martinez',
        graduateName: 'Andrea Martínez',
        name: 'Andrea Martínez',
        isPrimary: true,
        productType: 'Graduado Titular',
        selectedMealOptionId: 'meal-opt-1',
        selectedMealName: 'Menú Tradicional',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// 6. Graduate Thermo Scenarios
// ---------------------------------------------------------------------------

export const VISUAL_QA_GRADUATE_THERMO_STATES: Record<string, VisualGraduateThermoState> = {
  // Scenario 0: Default LOCKED (Andrea 60% of 70%)
  'thermo-locked-default': {
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0042',
    tableSummary: 'Mesa 24',
    status: 'LOCKED',
    financialProgressPercentage: 60,
    requiredThresholdPercentage: 70,
    personalizationFields: [
      {
        key: 'display_name',
        label: 'Nombre para grabado del termo',
        type: 'text',
        placeholder: 'Ej. Lic. Andrea Martínez',
        required: true,
      },
    ],
    personalization: {},
  },

  // Scenario 1: LOCKED (below threshold 60%)
  'thermo-locked-below-threshold': {
    graduateId: 'grad-fernando-torres',
    graduateName: 'Fernando Torres',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0089',
    tableSummary: 'Sin mesa asignada',
    status: 'LOCKED',
    financialProgressPercentage: 40,
    requiredThresholdPercentage: 60,
    personalizationFields: [
      {
        key: 'display_name',
        label: 'Nombre para grabado del termo',
        type: 'text',
        placeholder: 'Ej. Fernando T.',
        required: true,
      },
    ],
    personalization: {},
  },

  // Scenario 2: LOCKED inconsistent (progress 90% >= threshold 70%, but status is LOCKED -> UI must stay LOCKED)
  'thermo-locked-inconsistent': {
    graduateId: 'grad-inconsistent-test',
    graduateName: 'Estudiante Prueba',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0999',
    tableSummary: 'Mesa 12',
    status: 'LOCKED',
    financialProgressPercentage: 90,
    requiredThresholdPercentage: 70,
    personalizationFields: [
      {
        key: 'display_name',
        label: 'Nombre para grabado',
        type: 'text',
        required: true,
      },
    ],
    personalization: {},
  },

  // Scenario 3: AVAILABLE (Celebratory, gold CTA, empty personalization -> no fullName fallback)
  'thermo-available': {
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0042',
    tableSummary: 'Mesa 24',
    status: 'AVAILABLE',
    financialProgressPercentage: 75,
    requiredThresholdPercentage: 70,
    personalizationFields: [
      {
        key: 'display_name',
        label: 'Nombre para grabado del termo',
        type: 'text',
        placeholder: 'Ej. Lic. Andrea Martínez',
        required: true,
      },
    ],
    personalization: {}, // Empty! Input must start empty, not with Andrea Martínez
  },

  // Scenario 4: REQUESTED (Solicitado, read-only review)
  'thermo-requested': {
    graduateId: 'grad-mariana-lopez',
    graduateName: 'Mariana López',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0018',
    tableSummary: 'Mesa 12',
    status: 'REQUESTED',
    financialProgressPercentage: 100,
    requiredThresholdPercentage: 70,
    personalizationFields: [
      {
        key: 'display_name',
        label: 'Nombre grabado',
        type: 'text',
      },
    ],
    personalization: {
      display_name: 'Lic. Mariana López M.',
    },
    timeline: [
      { date: '2027-03-15', status: 'AVAILABLE', note: 'Elegibilidad confirmada por avance financiero' },
      { date: '2027-03-18', status: 'REQUESTED', note: 'Solicitud enviada con grabado personalizado' },
    ],
  },

  // Scenario 5: IN_PRODUCTION (Read-only)
  'thermo-in-production': {
    graduateId: 'grad-gabriel-solis',
    graduateName: 'Gabriel Solís',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0105',
    tableSummary: 'Mesa 17',
    status: 'IN_PRODUCTION',
    financialProgressPercentage: 100,
    requiredThresholdPercentage: 70,
    personalizationFields: [
      {
        key: 'display_name',
        label: 'Nombre grabado',
        type: 'text',
      },
    ],
    personalization: {
      display_name: 'Gabriel Solís R.',
    },
    timeline: [
      { date: '2027-02-10', status: 'AVAILABLE', note: 'Elegibilidad confirmada' },
      { date: '2027-02-14', status: 'REQUESTED', note: 'Solicitud enviada' },
      { date: '2027-03-01', status: 'IN_PRODUCTION', note: 'Enviado a taller de grabado' },
    ],
  },

  // Scenario 6: DELIVERED (Read-only with delivery information)
  'thermo-delivered': {
    graduateId: 'grad-roberto-sanchez',
    graduateName: 'Roberto Sánchez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0055',
    tableSummary: 'Mesa 17',
    status: 'DELIVERED',
    financialProgressPercentage: 100,
    requiredThresholdPercentage: 70,
    personalizationFields: [
      {
        key: 'display_name',
        label: 'Nombre grabado',
        type: 'text',
      },
    ],
    personalization: {
      display_name: 'Roberto Sánchez B.',
    },
    deliveryInfo: {
      deliveredAt: '12 de mayo de 2027',
      receivedBy: 'Roberto Sánchez',
      notes: 'Entregado en mesa de acreditación con kit de graduado.',
    },
    timeline: [
      { date: '2027-01-20', status: 'AVAILABLE', note: 'Elegibilidad confirmada' },
      { date: '2027-01-22', status: 'REQUESTED', note: 'Solicitud enviada' },
      { date: '2027-02-10', status: 'IN_PRODUCTION', note: 'En taller' },
      { date: '2027-05-12', status: 'DELIVERED', note: 'Entregado en evento' },
    ],
  },

  // Scenario 7: Dynamic Field B (`custom_text`)
  'thermo-dynamic-field-b': {
    graduateId: 'grad-valeria-corona',
    graduateName: 'Valeria Corona',
    eventId: 'evt-gala-2027',
    eventName: 'Gala Arquitectura 2027',
    contractFolio: 'CT-2027-0777',
    tableSummary: 'Mesa 1',
    status: 'AVAILABLE',
    financialProgressPercentage: 80,
    requiredThresholdPercentage: 80,
    personalizationFields: [
      {
        key: 'custom_text',
        label: 'Frase o dedicatoria',
        type: 'text',
        placeholder: 'Ej. Generación 2027',
        required: true,
      },
    ],
    personalization: {},
  },

  // Scenario 8: Additional Thermo purchased
  'thermo-with-additional': {
    graduateId: 'grad-andrea-martinez',
    graduateName: 'Andrea Martínez',
    eventId: 'evt-derecho-2027',
    eventName: 'Graduación Facultad de Derecho 2027',
    contractFolio: 'CT-2027-0042',
    tableSummary: 'Mesa 24',
    status: 'AVAILABLE',
    financialProgressPercentage: 75,
    requiredThresholdPercentage: 70,
    personalizationFields: [
      {
        key: 'display_name',
        label: 'Nombre para grabado del termo',
        type: 'text',
      },
    ],
    personalization: {},
    hasAdditionalThermo: true,
    additionalThermoCount: 1,
  },

  // Scenario 9: Event A threshold 60%
  'thermo-threshold-60': {
    graduateId: 'grad-test-60',
    graduateName: 'Estudiante 60%',
    eventId: 'evt-60',
    eventName: 'Evento Umbral 60%',
    status: 'LOCKED',
    financialProgressPercentage: 50,
    requiredThresholdPercentage: 60,
    personalizationFields: [{ key: 'name', label: 'Nombre', type: 'text' }],
    personalization: {},
  },

  // Scenario 10: Event B threshold 85%
  'thermo-threshold-85': {
    graduateId: 'grad-test-85',
    graduateName: 'Estudiante 85%',
    eventId: 'evt-85',
    eventName: 'Evento Umbral 85%',
    status: 'LOCKED',
    financialProgressPercentage: 70,
    requiredThresholdPercentage: 85,
    personalizationFields: [{ key: 'name', label: 'Nombre', type: 'text' }],
    personalization: {},
  },
};
