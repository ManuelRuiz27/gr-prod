/**
 * auditViewModel.ts
 *
 * Types, operations, and helpers for Admin Audit History.
 * Complies with BR-AUD-001..004, DATA_MODEL AuditLog, VS-A-AUD-001.
 */

import type { BadgeVariant } from '../../../design-system';
import type { AuditActorOrigin, VisualAuditDiffRow } from '../../../fixtures/cancellationReportsAuditVisualFixtures';

export type AuditActionType =
  | 'PLACES_CHANGED'
  | 'TABLE_CHANGED'
  | 'MEAL_OVERRIDE'
  | 'MANUAL_PAYMENT'
  | 'FINANCIAL_ADJUSTMENT'
  | 'REFUND'
  | 'GRADUATE_CANCELLED'
  | 'EVENT_CANCELLED'
  | 'EVENT_STATUS_TRANSITION'
  | 'THERMO_STATUS_TRANSITION'
  | 'THERMO_UNLOCKED'
  | 'POLICY_PUBLISHED'
  | 'PROOF_APPROVED'
  | 'PROOF_REJECTED';

export type AuditEntityType =
  | 'GRADUATE'
  | 'TABLE'
  | 'MEAL'
  | 'PAYMENT'
  | 'PROOF'
  | 'THERMO'
  | 'POLICY'
  | 'EVENT';

export interface AuditLogItem {
  id: string;
  actor: string;
  actorOrigin?: AuditActorOrigin;
  timestamp: string;
  action: string;
  actionLabel: string;
  entityType: string;
  entityLabel: string;
  entityId: string;
  description: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  diff?: VisualAuditDiffRow[];
  reason?: string | null;
}

export function getAuditActionLabel(action: string): string {
  switch (action) {
    case 'PLACES_CHANGED':
      return 'Cambio de lugares';
    case 'TABLE_CHANGED':
      return 'Reasignó una mesa';
    case 'MEAL_OVERRIDE':
      return 'Modificó opción de platillo';
    case 'MANUAL_PAYMENT':
      return 'Registró un pago manual';
    case 'FINANCIAL_ADJUSTMENT':
      return 'Ajuste financiero';
    case 'REFUND':
      return 'Registro de reembolso';
    case 'GRADUATE_CANCELLED':
      return 'Cancelación de membresía';
    case 'EVENT_CANCELLED':
      return 'Cancelación de evento';
    case 'EVENT_STATUS_TRANSITION':
      return 'Transición de estado del evento';
    case 'THERMO_STATUS_TRANSITION':
      return 'Transición de termo';
    case 'THERMO_UNLOCKED':
      return 'Desbloqueó termo conmemorativo';
    case 'POLICY_PUBLISHED':
      return 'Publicó política de cancelación';
    case 'PROOF_APPROVED':
      return 'Aprobó comprobante de pago';
    case 'PROOF_REJECTED':
      return 'Rechazó comprobante de pago';
    default:
      return action;
  }
}

export function getAuditEntityLabel(entity: string): string {
  switch (entity) {
    case 'GRADUATE':
      return 'Graduado';
    case 'TABLE':
      return 'Mesa';
    case 'MEAL':
      return 'Platillo';
    case 'PAYMENT':
      return 'Pago';
    case 'PROOF':
      return 'Comprobante';
    case 'THERMO':
      return 'Termo';
    case 'POLICY':
      return 'Política';
    case 'EVENT':
      return 'Evento';
    default:
      return entity;
  }
}

export function getAuditActionBadgeVariant(action: string): BadgeVariant {
  switch (action) {
    case 'MANUAL_PAYMENT':
    case 'THERMO_STATUS_TRANSITION':
    case 'THERMO_UNLOCKED':
    case 'POLICY_PUBLISHED':
    case 'PROOF_APPROVED':
      return 'success';
    case 'PLACES_CHANGED':
    case 'TABLE_CHANGED':
    case 'MEAL_OVERRIDE':
      return 'neutral';
    case 'FINANCIAL_ADJUSTMENT':
    case 'EVENT_STATUS_TRANSITION':
      return 'warning';
    case 'REFUND':
    case 'GRADUATE_CANCELLED':
    case 'EVENT_CANCELLED':
    case 'PROOF_REJECTED':
      return 'error';
    default:
      return 'neutral';
  }
}

export function formatHumanDiff(
  beforeData?: Record<string, unknown> | null,
  afterData?: Record<string, unknown> | null,
  existingDiff?: VisualAuditDiffRow[]
): VisualAuditDiffRow[] {
  if (existingDiff && existingDiff.length > 0) {
    return existingDiff;
  }

  const rows: VisualAuditDiffRow[] = [];
  if (!beforeData && !afterData) return rows;

  const allKeys = Array.from(
    new Set([...Object.keys(beforeData || {}), ...Object.keys(afterData || {})])
  );

  for (const key of allKeys) {
    const bVal = beforeData ? beforeData[key] : undefined;
    const aVal = afterData ? afterData[key] : undefined;

    let fieldName = key;
    if (key === 'tableNumber') fieldName = 'Número de mesa';
    else if (key === 'pendingAmount') fieldName = 'Saldo pendiente';
    else if (key === 'status') fieldName = 'Estado';
    else if (key === 'paidAmount') fieldName = 'Monto pagado';
    else if (key === 'mealOption') fieldName = 'Platillo';
    else if (key === 'seatsCount') fieldName = 'Lugares contratados';

    const formatVal = (v: unknown): string => {
      if (v === undefined || v === null) return '—';
      if (typeof v === 'number' && key.toLowerCase().includes('amount')) {
        return `$${v.toLocaleString()}`;
      }
      if (typeof v === 'object') {
        return Object.entries(v)
          .map(([k, val]) => `${k}: ${val}`)
          .join(', ');
      }
      return String(v);
    };

    rows.push({
      field: fieldName,
      before: formatVal(bVal),
      after: formatVal(aVal),
    });
  }

  return rows;
}
