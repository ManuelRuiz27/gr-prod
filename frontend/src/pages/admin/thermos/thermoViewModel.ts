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

// ── Types ─────────────────────────────────────────────────────────────────────

export type ThermoStatusFilter = 'ALL' | ThermoStatus;

export interface GraduateThermoViewModel {
  graduateId: string;
  fullName: string;
  career?: string;
  contractFolio: string;
  tableSummary: string;
  /** Effective status taking into account local preview if any */
  thermoStatus: ThermoStatus;
  /** Base fixture status before any local preview */
  baseStatus: ThermoStatus;
  /** Custom name for thermo ONLY from thermoCustomName, null if not present */
  customName: string | null;
  /** Progress percentage strictly from mockPaymentPlansMap matching graduateId and eventId */
  progressPercentage: number | null;
  totalAmount: number | null;
  paidAmount: number | null;
  /** True when a local preview transition has been applied */
  hasLocalPreview: boolean;
  /** Action performed in local preview */
  previewAction?: 'START_PRODUCTION' | 'MARK_DELIVERED';
  deliveryStatus: 'Pendiente' | 'Entregado';
  deliveredAt?: string;
}

export interface ThermoStatusCount {
  locked: number;
  available: number;
  requested: number;
  inProduction: number;
  delivered: number;
  total: number;
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
 * START_PRODUCTION is allowed only when status is REQUESTED and no local preview is pending.
 */
export function canStartProduction(vm: GraduateThermoViewModel): boolean {
  return vm.baseStatus === 'REQUESTED' && !vm.hasLocalPreview;
}

/**
 * MARK_DELIVERED is allowed only when status is IN_PRODUCTION and no local preview is pending.
 */
export function canMarkDelivered(vm: GraduateThermoViewModel): boolean {
  return vm.baseStatus === 'IN_PRODUCTION' && !vm.hasLocalPreview;
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

      const contractFolio =
        g.id === 'grad-andrea-martinez'
          ? 'CT-2027-0042'
          : g.id === 'grad-mariana-lopez'
          ? 'CT-2027-0018'
          : g.id === 'grad-roberto-sanchez'
          ? 'CT-2027-0055'
          : g.id === 'grad-fernando-torres'
          ? 'CT-2027-0089'
          : '—';

      const tableSummary = g.tableNumber ? `Mesa ${g.tableNumber}` : 'Sin mesa';

      const isDelivered = effectiveStatus === 'DELIVERED';

      return {
        graduateId: g.id,
        fullName: g.fullName,
        career: g.career,
        contractFolio,
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
        deliveredAt: isDelivered ? '12/05/2027' : undefined,
      };
    });
}

/**
 * Builds KPI counts by status from the view models.
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
