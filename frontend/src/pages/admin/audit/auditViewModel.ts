/**
 * auditViewModel.ts
 *
 * Types, operations, and helpers for Admin Audit History.
 * Complies with BR-AUD-001..004 and DATA_MODEL AuditLog.
 */

import type { BadgeVariant } from '../../../design-system';

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
  | 'THERMO_STATUS_TRANSITION';

export type AuditEntityType =
  | 'GRADUATE'
  | 'TABLE'
  | 'MEAL'
  | 'PAYMENT'
  | 'THERMO'
  | 'EVENT';

export interface AuditLogItem {
  id: string;
  actor: string;
  timestamp: string;
  action: AuditActionType;
  actionLabel: string;
  entityType: AuditEntityType;
  entityLabel: string;
  entityId: string;
  description: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  reason?: string | null;
}

export function getAuditActionLabel(action: AuditActionType): string {
  switch (action) {
    case 'PLACES_CHANGED':
      return 'Cambio de lugares';
    case 'TABLE_CHANGED':
      return 'Cambio de mesa';
    case 'MEAL_OVERRIDE':
      return 'Modificación de platillo';
    case 'MANUAL_PAYMENT':
      return 'Pago manual';
    case 'FINANCIAL_ADJUSTMENT':
      return 'Ajuste financiero';
    case 'REFUND':
      return 'Reembolso';
    case 'GRADUATE_CANCELLED':
      return 'Baja de graduado';
    case 'EVENT_CANCELLED':
      return 'Cancelación de evento';
    case 'EVENT_STATUS_TRANSITION':
      return 'Transición de evento';
    case 'THERMO_STATUS_TRANSITION':
      return 'Transición de termo';
    default:
      return action;
  }
}

export function getAuditEntityLabel(entity: AuditEntityType): string {
  switch (entity) {
    case 'GRADUATE':
      return 'Graduado';
    case 'TABLE':
      return 'Mesa';
    case 'MEAL':
      return 'Platillo';
    case 'PAYMENT':
      return 'Pago';
    case 'THERMO':
      return 'Termo';
    case 'EVENT':
      return 'Evento';
    default:
      return entity;
  }
}

export function getAuditActionBadgeVariant(action: AuditActionType): BadgeVariant {
  switch (action) {
    case 'MANUAL_PAYMENT':
    case 'THERMO_STATUS_TRANSITION':
      return 'success';
    case 'PLACES_CHANGED':
    case 'TABLE_CHANGED':
    case 'MEAL_OVERRIDE':
      return 'info';
    case 'FINANCIAL_ADJUSTMENT':
    case 'EVENT_STATUS_TRANSITION':
      return 'warning';
    case 'REFUND':
    case 'GRADUATE_CANCELLED':
    case 'EVENT_CANCELLED':
      return 'error';
    default:
      return 'neutral';
  }
}
