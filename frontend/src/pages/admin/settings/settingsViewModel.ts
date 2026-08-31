/**
 * settingsViewModel.ts
 *
 * Types and helper functions for Event Settings and Lifecycle management.
 * Strictly derived from event-scoped fixtures according to BR-EVT-* and DATA_MODEL.
 */

import type { EventMock, EventStatus } from '../../../fixtures/eventFixtures';
import type { MealOptionMock } from '../../../fixtures/layoutFixtures';
import type { GraduateMock } from '../../../fixtures/graduateFixtures';
import type { PaymentPlanMock } from '../../../fixtures/paymentFixtures';

export type EventLifecycleAction =
  | 'OPEN'
  | 'CLOSE'
  | 'REOPEN'
  | 'FINALIZE'
  | 'CANCEL';

export interface EventSettingsViewModel {
  eventId: string;
  name: string;
  institution: string;
  career: string;
  generation: string;
  date: string;
  venue: string;
  baseStatus: EventStatus;
  effectiveStatus: EventStatus;
  hasLocalPreview: boolean;
  
  // Financial config
  frozenPlansCount: number;
  
  // Deadlines
  placesDeadline: string | null;
  tableChangeDeadline: string | null;
  mealsDeadline: string | null;
  
  // Thermo
  thermoThreshold: number | null;
  
  // Meals
  mealOptions: MealOptionMock[];
  
  // Cancellation policy
  cancellationPolicy: string | null;
}

export function buildEventSettingsViewModel(
  event: EventMock,
  mealOptionsList: MealOptionMock[],
  _graduatesList: GraduateMock[],
  paymentPlansMap: Record<string, PaymentPlanMock>,
  previewStatus: EventStatus | null
): EventSettingsViewModel {
  const eventId = event.id;
  const eventMealOptions = mealOptionsList.filter((m) => m.eventId === eventId);
  
  // Count only plans that are explicitly frozen
  const frozenPlansCount = Object.values(paymentPlansMap).filter(
    (p) => p.eventId === eventId && p.isFrozen === true
  ).length;

  // While no EventSettings fixture exists, thermoThreshold must be null (UI shows Configuración no disponible)
  const thermoThreshold = null;

  return {
    eventId,
    name: event.name,
    institution: event.institution,
    career: event.career,
    generation: event.generation,
    date: event.date,
    venue: event.venue,
    baseStatus: event.status,
    effectiveStatus: previewStatus ?? event.status,
    hasLocalPreview: previewStatus !== null && previewStatus !== event.status,
    frozenPlansCount,
    placesDeadline: null, // No explicit deadline fixture exists -> "Configuración no disponible"
    tableChangeDeadline: null,
    mealsDeadline: null,
    thermoThreshold,
    mealOptions: eventMealOptions,
    cancellationPolicy: null, // No cancellation fixture exists -> "Configuración no disponible"
  };
}

export function getAvailableLifecycleActions(status: EventStatus): EventLifecycleAction[] {
  switch (status) {
    case 'DRAFT':
      return ['OPEN', 'CANCEL'];
    case 'OPEN':
      return ['CLOSE', 'CANCEL'];
    case 'CLOSED':
      return ['REOPEN', 'FINALIZE', 'CANCEL'];
    case 'FINALIZED':
    case 'CANCELLED':
      return [];
    default:
      return [];
  }
}

export function getLifecycleActionLabel(action: EventLifecycleAction): string {
  switch (action) {
    case 'OPEN':
      return 'Abrir evento';
    case 'CLOSE':
      return 'Cerrar evento';
    case 'REOPEN':
      return 'Reabrir evento';
    case 'FINALIZE':
      return 'Finalizar evento';
    case 'CANCEL':
      return 'Cancelar evento';
  }
}
