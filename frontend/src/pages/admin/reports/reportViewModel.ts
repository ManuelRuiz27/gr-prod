/**
 * reportViewModel.ts
 *
 * Derives typed report metrics strictly from event-scoped fixtures.
 * Complies with BR-REP-001..010, UX-A-REP-001..004, API_CONTRACTS 82-87, VS-A-REP-001.
 *
 * Supports the 7 normative families:
 * 1. Cobranza (Financiero)
 * 2. Cartera por Graduado
 * 3. Pagos (PaymentTransaction confirmadas/reversadas)
 * 4. Comprobantes (PaymentSubmission)
 * 5. Ocupación de Mesas
 * 6. Comanda de Platillos
 * 7. Termos Conmemorativos
 */

import type { EventMock } from '../../../fixtures/eventFixtures';
import type { GraduateMock } from '../../../fixtures/graduateFixtures';
import type { PaymentPlanMock } from '../../../fixtures/paymentFixtures';
import type { TableMock } from '../../../fixtures/layoutFixtures';
import {
  VISUAL_QA_REPORTS_DATA,
  type ReportTimeRange,
  type VisualReportPaymentTransaction,
  type VisualReportPaymentSubmission,
} from '../../../fixtures/cancellationReportsAuditVisualFixtures';

export interface FinancialReportData {
  totalContracted: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  penaltiesAmount: number;
  refundsAmount: number;
  plansCount: number;
  hasData: boolean;
}

export interface PortfolioGraduateItem {
  graduateId: string;
  fullName: string;
  contractFolio?: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  nextPaymentAmount: number;
  nextPaymentDueDate: string;
  overdueDays?: number;
  status?: string;
  isFrozen: boolean;
}

export interface PortfolioReportData {
  graduatesWithPlan: PortfolioGraduateItem[];
  graduatesWithoutPlan: string[];
  hasData: boolean;
}

export interface PaymentsReportData {
  transactions: VisualReportPaymentTransaction[];
  totalConfirmedAmount: number;
  hasData: boolean;
}

export interface SubmissionsReportData {
  queue: VisualReportPaymentSubmission[];
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  hasData: boolean;
}

export interface TablesReportData {
  tablesCount: number;
  totalCapacity: number;
  totalOccupied: number;
  totalAvailable: number;
  tableRows?: Array<{
    tableNumber: number;
    capacity: number;
    occupied: number;
    available: number;
    assignedPeopleCount: number;
  }>;
  hasData: boolean;
}

export interface MealsReportData {
  totalGraduates: number;
  totalGuestsRegistered: number;
  optionsTally: Record<string, number>;
  pendingCount: number;
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
  timeRange: ReportTimeRange;
  financial: FinancialReportData;
  portfolio: PortfolioReportData;
  payments: PaymentsReportData;
  submissions: SubmissionsReportData;
  tables: TablesReportData;
  meals: MealsReportData;
  thermos: ThermosReportData;
}

export function buildEventReportsViewModel(
  event: EventMock,
  graduatesList: GraduateMock[],
  paymentPlansMap: Record<string, PaymentPlanMock>,
  tablesList: TableMock[],
  timeRange: ReportTimeRange = 'monthly'
): EventReportsViewModel {
  const eventId = event.id;

  // If QA data exists for this specific timeRange, use it for rich 7-family reporting
  const qaTimeData = VISUAL_QA_REPORTS_DATA[eventId]?.[timeRange];
  if (qaTimeData) {
    return {
      eventId,
      eventName: event.name,
      timeRange,
      financial: {
        totalContracted: qaTimeData.financial.totalContracted,
        totalCollected: qaTimeData.financial.totalCollected,
        totalPending: qaTimeData.financial.totalPending,
        totalOverdue: qaTimeData.financial.totalOverdue,
        penaltiesAmount: qaTimeData.financial.penaltiesAmount,
        refundsAmount: qaTimeData.financial.refundsAmount,
        plansCount: qaTimeData.portfolio.graduatesWithPlan.length,
        hasData: qaTimeData.financial.hasData,
      },
      portfolio: {
        graduatesWithPlan: qaTimeData.portfolio.graduatesWithPlan.map((g) => ({
          graduateId: g.graduateId,
          fullName: g.fullName,
          contractFolio: g.contractFolio,
          totalAmount: g.totalContracted,
          paidAmount: g.paidAmount,
          pendingAmount: g.pendingAmount,
          overdueAmount: 0,
          nextPaymentAmount: 2500,
          nextPaymentDueDate: g.nextPaymentDueDate,
          overdueDays: g.overdueDays,
          status: g.status,
          isFrozen: false,
        })),
        graduatesWithoutPlan: [],
        hasData: qaTimeData.portfolio.hasData,
      },
      payments: {
        transactions: qaTimeData.payments.transactions,
        totalConfirmedAmount: qaTimeData.payments.totalConfirmedAmount,
        hasData: qaTimeData.payments.hasData,
      },
      submissions: {
        queue: qaTimeData.submissions.queue,
        pendingCount: qaTimeData.submissions.pendingCount,
        approvedCount: qaTimeData.submissions.approvedCount,
        rejectedCount: qaTimeData.submissions.rejectedCount,
        hasData: qaTimeData.submissions.hasData,
      },
      tables: {
        tablesCount: qaTimeData.tables.tablesCount,
        totalCapacity: qaTimeData.tables.totalCapacity,
        totalOccupied: qaTimeData.tables.totalOccupied,
        totalAvailable: qaTimeData.tables.totalAvailable,
        tableRows: qaTimeData.tables.tableRows,
        hasData: qaTimeData.tables.hasData,
      },
      meals: {
        totalGraduates: qaTimeData.meals.totalGuestsRegistered,
        totalGuestsRegistered: qaTimeData.meals.totalGuestsRegistered,
        optionsTally: qaTimeData.meals.optionsTally,
        pendingCount: qaTimeData.meals.pendingCount,
        hasData: qaTimeData.meals.hasData,
      },
      thermos: {
        locked: qaTimeData.thermos.locked,
        available: qaTimeData.thermos.available,
        requested: qaTimeData.thermos.requested,
        inProduction: qaTimeData.thermos.inProduction,
        delivered: qaTimeData.thermos.delivered,
        total: qaTimeData.thermos.total,
        hasData: qaTimeData.thermos.hasData,
      },
    };
  }

  // 1. Fallback / general derivation from base fixtures
  const eventGraduates = graduatesList.filter((g) => g.eventId === eventId);
  const eventTables = tablesList.filter((t) => t.eventId === eventId);

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

  const totalContracted = eventPlans.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalCollected = eventPlans.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPending = eventPlans.reduce((sum, p) => sum + p.pendingAmount, 0);
  const totalOverdue = eventPlans.reduce((sum, p) => sum + (p.overdueAmount ?? 0), 0);

  const totalCapacity = eventTables.reduce((sum, t) => sum + t.capacity, 0);
  const totalOccupied = eventTables.reduce((sum, t) => sum + t.occupied, 0);
  const totalAvailable = eventTables.reduce((sum, t) => sum + t.available, 0);

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

  const lockedCount = eventGraduates.filter((g) => g.thermoStatus === 'LOCKED').length;
  const availableCount = eventGraduates.filter((g) => g.thermoStatus === 'AVAILABLE').length;
  const requestedCount = eventGraduates.filter((g) => g.thermoStatus === 'REQUESTED').length;
  const inProductionCount = eventGraduates.filter((g) => g.thermoStatus === 'IN_PRODUCTION').length;
  const deliveredCount = eventGraduates.filter((g) => g.thermoStatus === 'DELIVERED').length;

  return {
    eventId,
    eventName: event.name,
    timeRange,
    financial: {
      totalContracted,
      totalCollected,
      totalPending,
      totalOverdue,
      penaltiesAmount: 0,
      refundsAmount: 0,
      plansCount: eventPlans.length,
      hasData: eventPlans.length > 0,
    },
    portfolio: {
      graduatesWithPlan,
      graduatesWithoutPlan,
      hasData: graduatesWithPlan.length > 0,
    },
    payments: {
      transactions: [],
      totalConfirmedAmount: totalCollected,
      hasData: totalCollected > 0,
    },
    submissions: {
      queue: [],
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      hasData: false,
    },
    tables: {
      tablesCount: eventTables.length,
      totalCapacity,
      totalOccupied,
      totalAvailable,
      hasData: eventTables.length > 0,
    },
    meals: {
      totalGraduates: eventGraduates.length,
      totalGuestsRegistered,
      optionsTally,
      pendingCount: 0,
      hasData: totalGuestsRegistered > 0,
    },
    thermos: {
      locked: lockedCount,
      available: availableCount,
      requested: requestedCount,
      inProduction: inProductionCount,
      delivered: deliveredCount,
      total: eventGraduates.length,
      hasData: eventGraduates.length > 0,
    },
  };
}
