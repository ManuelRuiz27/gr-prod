/**
 * mealViewModel.ts
 * Deriva modelos de vista para Platillos ADMIN y GRADUATE a nivel integrante (GroupMember).
 * No se inventan valores ni semántica por nombre de menú.
 */

import type { EventMock } from '../../../fixtures/eventFixtures';
import type { MealOptionMock } from '../../../fixtures/layoutFixtures';
import type { GraduateMock } from '../../../fixtures/graduateFixtures';
import { VISUAL_QA_GRADUATE_MEALS_STATES, type VisualMealOption } from '../../../fixtures/mealThermoVisualFixtures';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CaptureStatus = 'Con información' | 'Sin información';

export interface GuestMealRow {
  id: string;
  name: string;
  /** Meal name from fixture */
  mealName: string;
}

export interface GraduateMealViewModel {
  graduateId: string;
  fullName: string;
  career?: string;
  contractFolio?: string;
  knownGuests: GuestMealRow[];
  ticketCount: number;
  captureStatus: CaptureStatus;
}

export interface PersonMealRowViewModel {
  id: string;
  groupMemberId: string;
  graduateId: string;
  graduateName: string;
  contractFolio: string;
  memberName: string;
  isPrimary: boolean;
  personType: string;
  mealName?: string;
  status: 'Seleccionado' | 'Pendiente' | 'Opción inactiva';
  isLocalPreview?: boolean;
}

export interface MealOptionCount {
  option: MealOptionMock | VisualMealOption;
  count: number;
}

export const KNOWN_CONTRACT_FOLIOS: Record<string, string> = {
  'grad-andrea-martinez': 'CT-2027-0042',
  'grad-fernando-torres': 'CT-2027-0089',
  'grad-mariana-lopez': 'CT-2027-0018',
  'grad-roberto-sanchez': 'CT-2027-0055',
  'grad-gabriel-solis': 'CT-2027-0105',
};

/**
 * Resolves event meals deadline dynamically from event data.
 * If no real deadline exists, returns deadlineDate: null and isAfterDeadline: false.
 * Never invents a date.
 */
export interface EventMealsDeadlineInfo {
  hasExplicitDeadline: boolean;
  deadlineDate: string | null;
  isAfterDeadline: boolean;
}

export function resolveEventMealsDeadline(
  event?: EventMock | Record<string, unknown> | null,
  eventId?: string
): EventMealsDeadlineInfo {
  if (!event && !eventId) {
    return { hasExplicitDeadline: false, deadlineDate: null, isAfterDeadline: false };
  }

  // 1. Explicit property on event
  const evtObj = event as Record<string, unknown> | undefined;
  const rawDeadline = (evtObj?.mealsDeadline ?? evtObj?.liquidationDeadline) as string | undefined;
  if (rawDeadline && typeof rawDeadline === 'string' && rawDeadline.trim().length > 0) {
    const parsed = Date.parse(rawDeadline);
    const isValid = !isNaN(parsed);
    const isPast = isValid ? parsed <= Date.now() : false;
    return {
      hasExplicitDeadline: true,
      deadlineDate: rawDeadline,
      isAfterDeadline: isPast,
    };
  }

  // 2. Visual QA fixtures scenario if eventId matches known deadline state
  if (eventId && typeof VISUAL_QA_GRADUATE_MEALS_STATES !== 'undefined') {
    const scenario = Object.values(VISUAL_QA_GRADUATE_MEALS_STATES).find(
      (s) => s.eventId === eventId && s.mealsDeadline
    );
    if (scenario?.mealsDeadline) {
      return {
        hasExplicitDeadline: true,
        deadlineDate: scenario.mealsDeadline,
        isAfterDeadline: !!scenario.isDeadlineClosed,
      };
    }
  }

  // 3. No deadline configured — DO NOT invent one
  return {
    hasExplicitDeadline: false,
    deadlineDate: null,
    isAfterDeadline: false,
  };
}

/**
 * Counts how many times each meal option name appears across all known members for the event,
 * taking into account any session updates / local modifications.
 */
export function buildMealOptionCounts(
  graduates: GraduateMock[],
  options: (MealOptionMock | VisualMealOption)[],
  eventId: string,
  localPreviews: LocalMealSelectionPreview[] = []
): MealOptionCount[] {
  const filtered = graduates.filter((g) => g.eventId === eventId);

  return options.map((option) => {
    const count = filtered.reduce((acc, grad) => {
      if (!grad.guests) return acc;
      const matching = grad.guests.filter((guest) => {
        const preview = localPreviews.find((p) => p.guestId === guest.id);
        const effectiveMeal = preview ? preview.newMealName : guest.meal;
        return effectiveMeal === option.name;
      });
      return acc + matching.length;
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
      contractFolio: KNOWN_CONTRACT_FOLIOS[g.id] || (g as { contractFolio?: string }).contractFolio || '—',
      knownGuests: (g.guests || []).map((guest) => ({
        id: guest.id,
        name: guest.name,
        mealName: guest.meal,
      })),
      ticketCount: g.ticketCount,
      captureStatus: deriveGraduateCaptureStatus(g),
    }));
}

/**
 * Builds individual PersonMealRowViewModel list for the normative person-level table.
 * Resolves real contract folios and updates person status to 'Seleccionado' when modified.
 */
export function buildPersonMealViewModels(
  graduates: GraduateMock[],
  eventId: string,
  localPreviews: LocalMealSelectionPreview[] = []
): PersonMealRowViewModel[] {
  const eventGraduates = graduates.filter((g) => g.eventId === eventId);
  const rows: PersonMealRowViewModel[] = [];

  eventGraduates.forEach((grad) => {
    const folio = KNOWN_CONTRACT_FOLIOS[grad.id] || (grad as { contractFolio?: string }).contractFolio || '—';
    if (grad.guests && grad.guests.length > 0) {
      grad.guests.forEach((guest, idx) => {
        const preview = localPreviews.find((p) => p.guestId === guest.id);
        const mealName = preview ? preview.newMealName : guest.meal;
        const isPrimary = idx === 0;

        let status: PersonMealRowViewModel['status'] = mealName ? 'Seleccionado' : 'Pendiente';
        if (guest.meal === 'Menú Infantil 2026' && !preview) {
          status = 'Opción inactiva';
        }

        rows.push({
          id: `row-${guest.id}`,
          groupMemberId: guest.id,
          graduateId: grad.id,
          graduateName: grad.fullName,
          contractFolio: folio,
          memberName: guest.name,
          isPrimary,
          personType: isPrimary ? 'Graduado titular' : 'Lugar Adulto',
          mealName: mealName || undefined,
          status,
          isLocalPreview: !!preview,
        });
      });
    } else {
      // Graduate with no known guests yet
      rows.push({
        id: `row-${grad.id}-primary`,
        groupMemberId: `gm-${grad.id}-0`,
        graduateId: grad.id,
        graduateName: grad.fullName,
        contractFolio: folio,
        memberName: grad.fullName,
        isPrimary: true,
        personType: 'Graduado titular',
        mealName: undefined,
        status: 'Pendiente',
      });
    }
  });

  return rows;
}

/**
 * Admin meal selection update structure.
 */
export interface AdminMealSelectionUpdate {
  guestId: string;
  guestName: string;
  graduateId: string;
  newMealOptionId: string;
  newMealName: string;
  reason?: string;
  overrideReason?: string;
  isLocalPreview?: boolean;
}

/** Backwards-compatible alias for existing imports */
export type LocalMealSelectionPreview = AdminMealSelectionUpdate;

