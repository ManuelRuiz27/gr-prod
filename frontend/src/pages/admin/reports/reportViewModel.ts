/**
 * reportViewModel.ts
 *
 * Derives typed report metrics strictly from event-scoped fixtures.
 * Complies with BR-REP-001..007, UX-A-REP-001..004, API_CONTRACTS 82-87.
 */

import type { EventMock } from '../../../fixtures/eventFixtures';
import type { GraduateMock } from '../../../fixtures/graduateFixtures';
import type { PaymentPlanMock } from '../../../fixtures/paymentFixtures';
import type { TableMock } from '../../../fixtures/layoutFixtures';

export interface FinancialReportData {
  totalContracted: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  plansCount: number;
  hasData: boolean;
}

export interface PortfolioGraduateItem {
  graduateId: string;
  fullName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  nextPaymentAmount: number;
  nextPaymentDueDate: string;
  isFrozen: boolean;
}

export interface PortfolioReportData {
  graduatesWithPlan: PortfolioGraduateItem[];
  graduatesWithoutPlan: string[];
  hasData: boolean;
}

export interface TablesReportData {
  tablesCount: number;
  totalCapacity: number;
  totalOccupied: number;
  totalAvailable: number;
  hasData: boolean;
}

export interface MealsReportData {
  totalGraduates: number;
  totalGuestsRegistered: number;
  optionsTally: Record<string, number>;
  hasData: boolean;
}

export interface ThermosReportData {
  locked: number;
  available: number;
  requested: number;
  inProduction: number;
  delivered: number;
  total: number;
  hasData: boolean;
}

export interface EventReportsViewModel {
  eventId: string;
  eventName: string;
  financial: FinancialReportData;
  portfolio: PortfolioReportData;
  tables: TablesReportData;
  meals: MealsReportData;
  thermos: ThermosReportData;
}

export function buildEventReportsViewModel(
  event: EventMock,
  graduatesList: GraduateMock[],
  paymentPlansMap: Record<string, PaymentPlanMock>,
  tablesList: TableMock[]
): EventReportsViewModel {
  const eventId = event.id;

  // 1. Filter event-scoped data
  const eventGraduates = graduatesList.filter((g) => g.eventId === eventId);
  const eventTables = tablesList.filter((t) => t.eventId === eventId);

  // Financial plans matching graduateId in event AND plan.eventId === eventId
  const eventPlans: PaymentPlanMock[] = [];
  const graduatesWithPlan: PortfolioGraduateItem[] = [];
  const graduatesWithoutPlan: string[] = [];

  for (const g of eventGraduates) {
    const plan = paymentPlansMap[g.id];
    if (plan && plan.eventId === eventId) {
      eventPlans.push(plan);
      graduatesWithPlan.push({
        graduateId: g.id,
        fullName: g.fullName,
        totalAmount: plan.totalAmount,
        paidAmount: plan.paidAmount,
        pendingAmount: plan.pendingAmount,
        overdueAmount: plan.overdueAmount ?? 0,
        nextPaymentAmount: plan.nextPaymentAmount,
        nextPaymentDueDate: plan.nextPaymentDueDate,
        isFrozen: plan.isFrozen,
      });
    } else {
      graduatesWithoutPlan.push(g.fullName);
    }
  }

  // 2. Financial Metrics
  const financialHasData = eventPlans.length > 0;
  const totalContracted = eventPlans.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalCollected = eventPlans.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPending = eventPlans.reduce((sum, p) => sum + p.pendingAmount, 0);
  const totalOverdue = eventPlans.reduce((sum, p) => sum + (p.overdueAmount ?? 0), 0);

  const financial: FinancialReportData = {
    totalContracted,
    totalCollected,
    totalPending,
    totalOverdue,
    plansCount: eventPlans.length,
    hasData: financialHasData,
  };

  const portfolio: PortfolioReportData = {
    graduatesWithPlan,
    graduatesWithoutPlan,
    hasData: graduatesWithPlan.length > 0,
  };

  // 3. Tables Metrics
  const tablesHasData = eventTables.length > 0;
  const totalCapacity = eventTables.reduce((sum, t) => sum + t.capacity, 0);
  const totalOccupied = eventTables.reduce((sum, t) => sum + t.occupied, 0);
  const totalAvailable = eventTables.reduce((sum, t) => sum + t.available, 0);

  const tables: TablesReportData = {
    tablesCount: eventTables.length,
    totalCapacity,
    totalOccupied,
    totalAvailable,
    hasData: tablesHasData,
  };

  // 4. Meals Metrics (derive dynamically from guest selections without hardcoding fixed menu names)
  const optionsTally: Record<string, number> = {};
  let totalGuestsRegistered = 0;

  for (const g of eventGraduates) {
    if (g.guests && g.guests.length > 0) {
      for (const guest of g.guests) {
        totalGuestsRegistered++;
        if (guest.meal) {
          optionsTally[guest.meal] = (optionsTally[guest.meal] || 0) + 1;
        }
      }
    }
  }

  const meals: MealsReportData = {
    totalGraduates: eventGraduates.length,
    totalGuestsRegistered,
    optionsTally,
    hasData: totalGuestsRegistered > 0,
  };

  // 5. Thermos Metrics (strictly counting baseStatus)
  const lockedCount = eventGraduates.filter((g) => g.thermoStatus === 'LOCKED').length;
  const availableCount = eventGraduates.filter((g) => g.thermoStatus === 'AVAILABLE').length;
  const requestedCount = eventGraduates.filter((g) => g.thermoStatus === 'REQUESTED').length;
  const inProductionCount = eventGraduates.filter((g) => g.thermoStatus === 'IN_PRODUCTION').length;
  const deliveredCount = eventGraduates.filter((g) => g.thermoStatus === 'DELIVERED').length;

  const thermos: ThermosReportData = {
    locked: lockedCount,
    available: availableCount,
    requested: requestedCount,
    inProduction: inProductionCount,
    delivered: deliveredCount,
    total: eventGraduates.length,
    hasData: eventGraduates.length > 0,
  };

  return {
    eventId,
    eventName: event.name,
    financial,
    portfolio,
    tables,
    meals,
    thermos,
  };
}
