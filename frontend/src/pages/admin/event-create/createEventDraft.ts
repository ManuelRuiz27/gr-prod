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

export const DEFAULT_EVENT_PRODUCTS: CreateEventProductDraft[] = [
  {
    id: 'prod-adulto',
    name: 'Boleto Adulto (Con cena)',
    price: '1500',
    description: 'Incluye banquete formal de 3 tiempos, mesa asignada y amenidades.',
    status: 'ACTIVE',
  },
  {
    id: 'prod-nino',
    name: 'Boleto Infantil',
    price: '900',
    description: 'Menú infantil y lugar en mesa asignada.',
    status: 'ACTIVE',
  },
  {
    id: 'prod-sin-cena',
    name: 'Boleto Sin Cena',
    price: '700',
    description: 'Acceso a ceremonia y gala con derecho a lugar sin servicio de banquete.',
    status: 'ACTIVE',
  },
  {
    id: 'prod-termo-extra',
    name: 'Termo Conmemorativo Extra',
    price: '350',
    description: 'Pieza conmemorativa grabada adicional.',
    status: 'ACTIVE',
  },
];

export const DEFAULT_MEAL_OPTIONS: CreateEventMealOptionDraft[] = [
  {
    id: 'meal-tradicional',
    name: 'Menú Tradicional',
    type: 'Banquete de 3 tiempos con corte de carne y guarnición de la casa.',
  },
  {
    id: 'meal-vegano',
    name: 'Menú Vegano',
    type: 'Entrada vegetal, plato fuerte a base de legumbres y postre libre de lácteos.',
  },
  {
    id: 'meal-vegetariano',
    name: 'Menú Vegetariano',
    type: 'Pasta artesanal con salsa de quesos finos y vegetales salteados.',
  },
  {
    id: 'meal-infantil',
    name: 'Menú Infantil',
    type: 'Platillo diseñado para menores con postre temático.',
  },
];

export const INITIAL_CREATE_EVENT_DRAFT: CreateEventDraft = {
  name: '',
  eventDate: '',
  venue: '',
  capacity: '',
  institution: '',
  career: '',
  generation: '',

  products: DEFAULT_EVENT_PRODUCTS,

  baseAmount: '',
  initialPaymentRequired: false,
  initialPaymentAmount: '',
  gracePeriodDays: '0',
  lateFeeAmount: '',
  financialMilestonesNote: 'Hitos financieros vinculados a porcentajes de cuotas y fechas del contrato.',
  installments: [],

  placesDeadline: '',
  tableChangeDeadline: '',
  mealsDeadline: '',
  mealOptions: DEFAULT_MEAL_OPTIONS,
  thermoThresholdPercent: '70',

  cancellationPolicySummary: 'Política estándar de retención escalonada según tiempo previo al evento.',
};
