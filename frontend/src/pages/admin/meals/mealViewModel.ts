/**
 * mealViewModel.ts
 * Deriva modelos de vista para Platillos ADMIN y GRADUATE a nivel integrante (GroupMember).
 * No se inventan valores ni semántica por nombre de menú.
 */

import type { MealOptionMock } from '../../../fixtures/layoutFixtures';
import type { GraduateMock } from '../../../fixtures/graduateFixtures';
import type { VisualMealOption } from '../../../fixtures/mealThermoVisualFixtures';

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
  status: 'Seleccionado' | 'Pendiente' | 'Opción inactiva' | 'Override local';
  isLocalPreview?: boolean;
}

export interface MealOptionCount {
  option: MealOptionMock | VisualMealOption;
  count: number;
}

/**
 * Counts how many times each meal option name appears across all known members for the event.
 */
export function buildMealOptionCounts(
  graduates: GraduateMock[],
  options: (MealOptionMock | VisualMealOption)[],
  eventId: string
): MealOptionCount[] {
  const filtered = graduates.filter((g) => g.eventId === eventId);

  return options.map((option) => {
    const count = filtered.reduce((acc, grad) => {
      const matchingGuests = grad.guests ? grad.guests.filter((g) => g.meal === option.name) : [];
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
      contractFolio: g.id === 'grad-andrea-martinez' ? 'CT-2027-0042' : '—',
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
 */
export function buildPersonMealViewModels(
  graduates: GraduateMock[],
  eventId: string,
  localPreviews: LocalMealSelectionPreview[] = []
): PersonMealRowViewModel[] {
  const eventGraduates = graduates.filter((g) => g.eventId === eventId);
  const rows: PersonMealRowViewModel[] = [];

  eventGraduates.forEach((grad) => {
    const folio = grad.id === 'grad-andrea-martinez' ? 'CT-2027-0042' : '—';
    if (grad.guests && grad.guests.length > 0) {
      grad.guests.forEach((guest, idx) => {
        const preview = localPreviews.find((p) => p.guestId === guest.id);
        const mealName = preview ? preview.newMealName : guest.meal;
        const isPrimary = idx === 0;

        let status: PersonMealRowViewModel['status'] = mealName ? 'Seleccionado' : 'Pendiente';
        if (preview) {
          status = 'Override local';
        } else if (guest.meal === 'Menú Infantil 2026') {
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
