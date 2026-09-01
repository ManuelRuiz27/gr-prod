export interface CreateEventInstallmentDraft {
  sequence: number;
  label: string;
  amount: string;
  dueDate: string;
}

export interface CreateEventProductDraft {
  id: string;
  name: string;
  price: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateEventMealOptionDraft {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface CreateEventDraft {
  // 1. Información general e institucional
  name: string;
  eventDate: string;
  venue: string;
  capacity: string;
  institution: string;
  career: string;
  generation: string;

  // 2. Productos y precios
  products: CreateEventProductDraft[];

  // 3. Plan financiero, pago inicial, hitos y mora
  baseAmount: string;
  initialPaymentRequired: boolean;
  initialPaymentAmount: string;
  gracePeriodDays: string;
  lateFeeAmount: string;
  financialMilestonesNote: string;
  installments: CreateEventInstallmentDraft[];

  // 4. Fechas límite, platillos y termo
  placesDeadline: string;
  tableChangeDeadline: string;
  mealsDeadline: string;
  mealOptions: CreateEventMealOptionDraft[];
  thermoThresholdPercent: string;

  // 5. Política de cancelación
  cancellationPolicySummary: string;
}

export type CreateEventStep = 1 | 2 | 3 | 4 | 5 | 6;

export type UpdateCreateEventDraft = <K extends keyof CreateEventDraft>(
  field: K,
  value: CreateEventDraft[K]
) => void;

export function createInstallmentDraft(sequence: number): CreateEventInstallmentDraft {
  return {
    sequence,
    label: `Mensualidad ${sequence}`,
    amount: '',
    dueDate: '',
  };
}

export function resizeInstallments(
  current: CreateEventInstallmentDraft[],
  count: number
): CreateEventInstallmentDraft[] {
  if (count <= 0) return [];
  const result: CreateEventInstallmentDraft[] = [];
  for (let i = 0; i < count; i++) {
    const existing = current[i];
    if (existing) {
      result.push({
        ...existing,
        sequence: i + 1,
        label: `Mensualidad ${i + 1}`,
      });
    } else {
      result.push(createInstallmentDraft(i + 1));
    }
  }
  return result;
}

// Demo data strictly for showcase / QA purposes
export const DEMO_EVENT_PRODUCTS: CreateEventProductDraft[] = [
  {
    id: 'prod-adulto',
    name: 'Boleto Adulto',
    price: '1500',
    description: 'Lugar con servicio de banquete.',
    status: 'ACTIVE',
  },
  {
    id: 'prod-nino',
    name: 'Boleto Infantil',
    price: '900',
    description: 'Menú infantil y lugar en mesa.',
    status: 'ACTIVE',
  },
  {
    id: 'prod-sin-cena',
    name: 'Boleto Sin Cena',
    price: '700',
    description: 'Acceso a ceremonia y gala.',
    status: 'ACTIVE',
  },
];

export const DEMO_MEAL_OPTIONS: CreateEventMealOptionDraft[] = [
  {
    id: 'meal-1',
    name: 'Opción 1',
    type: 'Banquete formal',
  },
  {
    id: 'meal-2',
    name: 'Opción 2',
    type: 'Menú vegetal',
  },
];

// Initial Draft without hardcoded commercial prices, menus, or policy percentages
export const INITIAL_CREATE_EVENT_DRAFT: CreateEventDraft = {
  name: '',
  eventDate: '',
  venue: '',
  capacity: '',
  institution: '',
  career: '',
  generation: '',

  products: [],

  baseAmount: '',
  initialPaymentRequired: false,
  initialPaymentAmount: '',
  gracePeriodDays: '',
  lateFeeAmount: '',
  financialMilestonesNote: '',
  installments: [],

  placesDeadline: '',
  tableChangeDeadline: '',
  mealsDeadline: '',
  mealOptions: [],
  thermoThresholdPercent: '',

  cancellationPolicySummary: '',
};
