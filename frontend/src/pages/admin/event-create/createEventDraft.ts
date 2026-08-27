export interface CreateEventDraft {
  name: string;
  eventDate: string;
  venue: string;
  capacity: string;

  baseAmount: string;
  initialPaymentRequired: boolean;
  initialPaymentAmount: string;
  installmentCount: string;
  firstDueDate: string;
  gracePeriodDays: string;

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

export const INITIAL_CREATE_EVENT_DRAFT: CreateEventDraft = {
  name: '',
  eventDate: '',
  venue: '',
  capacity: '',

  baseAmount: '',
  initialPaymentRequired: false,
  initialPaymentAmount: '',
  installmentCount: '',
  firstDueDate: '',
  gracePeriodDays: '0',

  placesDeadline: '',
  tableChangeDeadline: '',
  mealsDeadline: '',

  thermoThresholdPercent: '70',
};
