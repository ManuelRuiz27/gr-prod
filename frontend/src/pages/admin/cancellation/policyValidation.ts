/**
 * policyValidation.ts
 *
 * Client-side validation logic and natural language preview generator
 * for Cancellation Policy Editor (VS-A-CANPOL-001).
 *
 * Rules:
 * - 0 <= penaltyPercent <= 100
 * - daysBeforeMin >= 0
 * - daysBeforeMax >= daysBeforeMin (when not null)
 * - First range must start at day 0
 * - Gaps detection (uncovered days between ranges)
 * - Overlaps detection (overlapping days between ranges)
 * - Final range should be open-ended (daysBeforeMax === null)
 */

import type { VisualCancellationPolicyRange } from '../../../fixtures/cancellationReportsAuditVisualFixtures';

export interface RangeValidationError {
  rangeId: string;
  field?: 'daysBeforeMin' | 'daysBeforeMax' | 'penaltyPercent';
  message: string;
}

export interface PolicyValidationResult {
  isValid: boolean;
  errors: RangeValidationError[];
  generalErrors: string[];
}

export function validateCancellationRanges(
  ranges: VisualCancellationPolicyRange[]
): PolicyValidationResult {
  const errors: RangeValidationError[] = [];
  const generalErrors: string[] = [];

  if (!ranges || ranges.length === 0) {
    return {
      isValid: false,
      errors: [],
      generalErrors: ['La política debe contener al menos un rango de penalización.'],
    };
  }

  // 1. Individual field validations
  ranges.forEach((range) => {
    if (range.penaltyPercent < 0 || range.penaltyPercent > 100 || isNaN(range.penaltyPercent)) {
      errors.push({
        rangeId: range.id,
        field: 'penaltyPercent',
        message: 'El porcentaje de penalización debe estar entre 0% y 100%.',
      });
    }

    if (range.daysBeforeMin < 0 || isNaN(range.daysBeforeMin)) {
      errors.push({
        rangeId: range.id,
        field: 'daysBeforeMin',
        message: 'El día mínimo no puede ser negativo.',
      });
    }

    if (range.daysBeforeMax !== null) {
      if (range.daysBeforeMax < range.daysBeforeMin) {
        errors.push({
          rangeId: range.id,
          field: 'daysBeforeMax',
          message: 'El límite superior no puede ser menor que el límite inferior.',
        });
      }
    }
  });

  // Sort ranges by sortOrder / daysBeforeMin for continuity analysis
  const sorted = [...ranges].sort((a, b) => a.daysBeforeMin - b.daysBeforeMin);

  // 2. First range must start at day 0
  if (sorted[0].daysBeforeMin !== 0) {
    generalErrors.push('El primer rango debe comenzar en el día 0.');
    errors.push({
      rangeId: sorted[0].id,
      field: 'daysBeforeMin',
      message: 'El primer rango debe comenzar en el día 0.',
    });
  }

  // 3. Continuity checks (gaps and overlaps)
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (current.daysBeforeMax === null) {
      generalErrors.push('Solo el último rango de la política puede ser "Sin límite".');
      errors.push({
        rangeId: current.id,
        field: 'daysBeforeMax',
        message: 'Un rango intermedio no puede ser abierto (sin límite).',
      });
      break;
    }

    // Overlap: next.min <= current.max
    if (next.daysBeforeMin <= current.daysBeforeMax) {
      const msg = 'Estos rangos se traslapan.';
      generalErrors.push('Estos rangos se traslapan.');
      errors.push({ rangeId: current.id, message: msg });
      errors.push({ rangeId: next.id, message: msg });
    }
    // Gap: next.min > current.max + 1
    else if (next.daysBeforeMin > current.daysBeforeMax + 1) {
      const msg = 'Existe un periodo sin cobertura entre estos rangos.';
      generalErrors.push('Existe un periodo sin cobertura entre estos rangos.');
      errors.push({ rangeId: current.id, message: msg });
      errors.push({ rangeId: next.id, message: msg });
    }
  }

  // 4. Final range open-ended check
  const last = sorted[sorted.length - 1];
  if (last.daysBeforeMax !== null && sorted.length > 0) {
    generalErrors.push('El último rango debe quedar "Sin límite" para garantizar cobertura total de días previos.');
  }

  return {
    isValid: errors.length === 0 && generalErrors.length === 0,
    errors,
    generalErrors,
  };
}

/**
 * Generates natural language textual preview of the cancellation policy rules.
 */
export function generatePolicyTextualPreview(
  ranges: VisualCancellationPolicyRange[]
): string[] {
  if (!ranges || ranges.length === 0) {
    return ['No hay reglas de penalización configuradas en esta versión.'];
  }

  const sorted = [...ranges].sort((a, b) => a.daysBeforeMin - b.daysBeforeMin);

  return sorted.map((range) => {
    if (range.daysBeforeMax === null) {
      return `Desde ${range.daysBeforeMin} días antes del evento en adelante: penalización configurada de ${range.penaltyPercent}%.`;
    }
    return `De ${range.daysBeforeMin} a ${range.daysBeforeMax} días antes del evento: penalización configurada de ${range.penaltyPercent}%.`;
  });
}
