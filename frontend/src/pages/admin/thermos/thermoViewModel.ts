/**
 * thermoViewModel.ts
 *
 * Derives typed view-model data from event-scoped fixtures and payment plans.
 * Normative rules enforced:
 * - Strictly event-scoped: g.eventId === eventId.
 * - No client-side recalculation of ThermoStatus from payment progress.
 * - Financial progress resolved exclusively from mockPaymentPlansMap (matching graduateId + eventId).
 * - Personalization strictly from thermoCustomName (never falling back to fullName).
 * - Local preview transitions are tracked and prevent chained transitions.
 */

import type { GraduateMock, ThermoStatus } from '../../../fixtures/graduateFixtures';
import type { PaymentPlanMock } from '../../../fixtures/paymentFixtures';
import { VISUAL_QA_GRADUATE_RECORDS } from '../../../fixtures/adminGraduateVisualFixtures';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ThermoStatusFilter = 'ALL' | ThermoStatus;
export type ThermoOperationalFilter =
  | 'ALL'
  | 'AVAILABLE'
  | 'REQUESTED'
  | 'IN_PRODUCTION'
  | 'DELIVERED'
  | 'LOCKED';

export interface GraduateThermoViewModel {
  graduateId: string;
  fullName: string;
  career?: string;
  email?: string;
  contractFolio: string;
  tableNumber: number | null;
  tableSummary: string;
  /** Effective status taking into account session transition if any */
  thermoStatus: ThermoStatus;
  /** Base fixture status before session transition */
  baseStatus: ThermoStatus;
  /** Custom name for thermo ONLY from thermoCustomName, null if not present */
  customName: string | null;
  /** Progress percentage strictly from mockPaymentPlansMap matching graduateId and eventId */
  progressPercentage: number | null;
  totalAmount: number | null;
  paidAmount: number | null;
  /** True when a session transition has been applied */
  hasLocalPreview: boolean;
  /** Action performed in session transition */
  previewAction?: 'START_PRODUCTION' | 'MARK_DELIVERED';
  deliveryStatus: 'Pendiente' | 'Entregado';
  deliveredAt?: string;
  /** Registered information summary for delivery list */
  registrationInfo: string;
}

export interface ThermoStatusCount {
  locked: number;
  available: number;
  requested: number;
  inProduction: number;
  delivered: number;
  total: number;
}

export interface ThermoFilterCounts {
  total: number;
  disponibles: number;
  solicitados: number;
  enProduccion: number;
  entregados: number;
  bloqueados: number;
}

// ── Presentation Helpers ──────────────────────────────────────────────────────

export function getThermoStatusLabel(status: ThermoStatus): string {
  switch (status) {
    case 'LOCKED':
      return 'Bloqueado';
    case 'AVAILABLE':
      return 'Disponible';
    case 'REQUESTED':
      return 'Solicitado';
    case 'IN_PRODUCTION':
      return 'En producción';
    case 'DELIVERED':
      return 'Entregado';
  }
}

export function getThermoBadgeVariant(
  status: ThermoStatus
): 'neutral' | 'gold' | 'primary' | 'warning' | 'success' {
  switch (status) {
    case 'LOCKED':
      return 'neutral';
    case 'AVAILABLE':
      return 'gold';
    case 'REQUESTED':
      return 'primary';
    case 'IN_PRODUCTION':
      return 'warning';
    case 'DELIVERED':
      return 'success';
  }
}

// ── Transition Guards ─────────────────────────────────────────────────────────

/**
 * START_PRODUCTION is allowed only when status is REQUESTED.
 */
export function canStartProduction(vm: GraduateThermoViewModel): boolean {
  return vm.thermoStatus === 'REQUESTED';
}

/**
 * MARK_DELIVERED is allowed only when status is IN_PRODUCTION.
 */
export function canMarkDelivered(vm: GraduateThermoViewModel): boolean {
  return vm.thermoStatus === 'IN_PRODUCTION';
}

// ── View Model Builders ───────────────────────────────────────────────────────

/**
 * Builds the list of GraduateThermoViewModels for a given eventId.
 * Reutilizes mockPaymentPlansMap strictly with graduateId + eventId matching.
 */
export function buildGraduateThermoViewModels(
  graduates: GraduateMock[],
  paymentPlansMap: Record<string, PaymentPlanMock>,
  eventId: string,
  localPreviews: Record<string, 'IN_PRODUCTION' | 'DELIVERED'> = {}
): GraduateThermoViewModel[] {
  return graduates
    .filter((g) => g.eventId === eventId)
    .map((g) => {
      const plan = paymentPlansMap[g.id];
      const validPlan = plan && plan.eventId === eventId ? plan : null;
      const previewToStatus = localPreviews[g.id];
      const hasLocalPreview = Boolean(previewToStatus);
      const effectiveStatus: ThermoStatus = previewToStatus ?? g.thermoStatus;

      // Real contractual source mapping if exists; otherwise empty string
      const contractualRecord = VISUAL_QA_GRADUATE_RECORDS[g.id];
      const contractFolio = contractualRecord?.contractFolio ? contractualRecord.contractFolio.trim() : '';

      const tableSummary = g.tableNumber ? `Mesa ${g.tableNumber}` : '—';
      const isDelivered = effectiveStatus === 'DELIVERED';
      const registrationInfo = [g.email, g.career].filter(Boolean).join(' • ') || '—';

      return {
        graduateId: g.id,
        fullName: g.fullName,
        career: g.career,
        email: g.email,
        contractFolio,
        tableNumber: g.tableNumber,
        tableSummary,
        thermoStatus: effectiveStatus,
        baseStatus: g.thermoStatus,
        // Personalization: strictly from thermoCustomName. Never fallback to fullName.
        customName: g.thermoCustomName ? g.thermoCustomName.trim() : null,
        progressPercentage: validPlan ? validPlan.progressPercentage : null,
        totalAmount: validPlan ? validPlan.totalAmount : null,
        paidAmount: validPlan ? validPlan.paidAmount : null,
        hasLocalPreview,
        previewAction:
          previewToStatus === 'IN_PRODUCTION'
            ? 'START_PRODUCTION'
            : previewToStatus === 'DELIVERED'
            ? 'MARK_DELIVERED'
            : undefined,
        deliveryStatus: isDelivered ? 'Entregado' : 'Pendiente',
        deliveredAt: undefined,
        registrationInfo,
      };
    });
}

/**
 * Builds KPI counts by status from the view models (kept for backward compatibility).
 */
export function buildThermoStatusCounts(
  viewModels: GraduateThermoViewModel[]
): ThermoStatusCount {
  return {
    locked: viewModels.filter((vm) => vm.baseStatus === 'LOCKED').length,
    available: viewModels.filter((vm) => vm.baseStatus === 'AVAILABLE').length,
    requested: viewModels.filter((vm) => vm.baseStatus === 'REQUESTED').length,
    inProduction: viewModels.filter((vm) => vm.baseStatus === 'IN_PRODUCTION').length,
    delivered: viewModels.filter((vm) => vm.baseStatus === 'DELIVERED').length,
    total: viewModels.length,
  };
}

/**
 * Builds filter counts for operational filters in first layer.
 */
export function buildThermoFilterCounts(
  viewModels: GraduateThermoViewModel[]
): ThermoFilterCounts {
  return {
    total: viewModels.length,
    disponibles: viewModels.filter((vm) => vm.thermoStatus === 'AVAILABLE').length,
    solicitados: viewModels.filter((vm) => vm.thermoStatus === 'REQUESTED').length,
    enProduccion: viewModels.filter((vm) => vm.thermoStatus === 'IN_PRODUCTION').length,
    entregados: viewModels.filter((vm) => vm.thermoStatus === 'DELIVERED').length,
    bloqueados: viewModels.filter((vm) => vm.thermoStatus === 'LOCKED').length,
  };
}

/**
 * Sorts graduates for delivery list: ordered by mesa (tableNumber) and then by fullName.
 */
export function sortGraduatesForDelivery(
  graduates: GraduateThermoViewModel[]
): GraduateThermoViewModel[] {
  return [...graduates].sort((a, b) => {
    const tableA = a.tableNumber ?? 999999;
    const tableB = b.tableNumber ?? 999999;
    if (tableA !== tableB) return tableA - tableB;
    return a.fullName.localeCompare(b.fullName, 'es');
  });
}
