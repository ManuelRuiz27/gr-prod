/**
 * mealViewModel.ts
 * Derives typed view-model data from existing fixtures.
 * No values are invented — all data must come from fixtures already defined in the project.
 */

import type { MealOptionMock } from '../../../fixtures/layoutFixtures';
import type { GraduateMock } from '../../../fixtures/graduateFixtures';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CaptureStatus = 'Con información' | 'Sin información';

export interface GuestMealRow {
  id: string;
  name: string;
  /** Meal name from existing fixtures */
  mealName: string;
}

export interface GraduateMealViewModel {
  graduateId: string;
  fullName: string;
  career?: string;
  /** Known guests from fixture */
  knownGuests: GuestMealRow[];
  /** ticketCount from fixture */
  ticketCount: number;
  captureStatus: CaptureStatus;
}

export interface MealOptionCount {
  option: MealOptionMock;
  count: number;
}

/**
 * Counts how many times each meal option name appears across all known guests
 * of all graduates for the given event.
 */
export function buildMealOptionCounts(
  graduates: GraduateMock[],
  options: MealOptionMock[],
  eventId: string
): MealOptionCount[] {
  const filtered = graduates.filter((g) => g.eventId === eventId);

  return options.map((option) => {
    const count = filtered.reduce((acc, grad) => {
      const matchingGuests = grad.guests.filter((g) => g.meal === option.name);
      return acc + matchingGuests.length;
    }, 0);

    return { option, count };
  });
}

/**
 * Total count of known guest meal selections for the event.
 */
export function totalKnownSelections(counts: MealOptionCount[]): number {
  return counts.reduce((acc, c) => acc + c.count, 0);
}

/**
 * Derives CaptureStatus from known guest meal information.
 * - Con información: at least one known guest has a meal recorded
 * - Sin información: no guests exist or none have meal information
 * Does NOT compare guest count against ticketCount or infer full/partial group capture.
 */
export function deriveGraduateCaptureStatus(grad: GraduateMock): CaptureStatus {
  if (!grad.guests || grad.guests.length === 0) return 'Sin información';
  const hasMeal = grad.guests.some((g) => g.meal && g.meal.trim().length > 0);
  return hasMeal ? 'Con información' : 'Sin información';
}

/**
 * Builds the graduate meal view-model list for a given eventId.
 */
export function buildGraduateMealViewModels(
  graduates: GraduateMock[],
  eventId: string
): GraduateMealViewModel[] {
  return graduates
    .filter((g) => g.eventId === eventId)
    .map((g) => ({
      graduateId: g.id,
      fullName: g.fullName,
      career: g.career,
      knownGuests: g.guests.map((guest) => ({
        id: guest.id,
        name: guest.name,
        mealName: guest.meal,
      })),
      ticketCount: g.ticketCount,
      captureStatus: deriveGraduateCaptureStatus(g),
    }));
}

/**
 * Local preview type for an edited meal selection (not persisted).
 */
export interface LocalMealSelectionPreview {
  guestId: string;
  guestName: string;
  graduateId: string;
  newMealOptionId: string;
  newMealName: string;
  overrideReason?: string;
  /** Always true — marks this as a local UI preview, not a persisted change */
  isLocalPreview: true;
}
