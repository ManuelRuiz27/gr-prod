export interface CreateEventInstallmentDraft {
  sequence: number;
  label: string;
  amount: string;
  dueDate: string;
}

export interface CreateEventDraft {
  name: string;
  eventDate: string;
  venue: string;
  capacity: string;

  baseAmount: string;
  initialPaymentRequired: boolean;
  initialPaymentAmount: string;
  gracePeriodDays: string;
  installments: CreateEventInstallmentDraft[];

  placesDeadline: string;
  tableChangeDeadline: string;
  mealsDeadline: string;

  thermoThresholdPercent: string;
}

export type CreateEventStep = 1 | 2 | 3 | 4 | 5;

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

export const INITIAL_CREATE_EVENT_DRAFT: CreateEventDraft = {
  name: '',
  eventDate: '',
  venue: '',
  capacity: '',

  baseAmount: '',
  initialPaymentRequired: false,
  initialPaymentAmount: '',
  gracePeriodDays: '0',
  installments: [],

  placesDeadline: '',
  tableChangeDeadline: '',
  mealsDeadline: '',

  thermoThresholdPercent: '70',
};
