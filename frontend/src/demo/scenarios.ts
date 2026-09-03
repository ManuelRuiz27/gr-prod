import {
  VISUAL_QA_AUDIT_LOGS,
  VISUAL_QA_GRADUATE_PAYMENT_STATES,
} from '../fixtures';
import type { DemoCancellationQuote, DemoScenario, DemoState } from './types';

const EVENT_ID = 'evt-derecho-2027';
const MEMBERSHIP_ID = 'grad-andrea-martinez';

const refundQuote: DemoCancellationQuote = {
  quote_id: 'quote-demo-refund',
  status: 'VALID',
  days_before_event: 120,
  policy: { version: 2, range_id: 'range-demo-120' },
  contracted_total: '12500.00',
  eligible_paid: '10000.00',
  penalty_percent: 40,
  penalty_amount: '5000.00',
  non_refundable_minimum: '2500.00',
  retained_amount: '5000.00',
  refund_due: '5000.00',
  remaining_due: '0.00',
  expires_at: '2027-04-30T23:59:59Z',
};

const debtQuote: DemoCancellationQuote = {
  ...refundQuote,
  quote_id: 'quote-demo-debt',
  days_before_event: 25,
  policy: { version: 2, range_id: 'range-demo-25' },
  eligible_paid: '2500.00',
  penalty_percent: 60,
  penalty_amount: '7500.00',
  retained_amount: '7500.00',
  refund_due: '0.00',
  remaining_due: '5000.00',
};

export function createDemoScenario(scenario: DemoScenario): DemoState {
  const paymentPlan = structuredClone(
    VISUAL_QA_GRADUATE_PAYMENT_STATES[MEMBERSHIP_ID],
  );

  const state: DemoState = {
    schema_version: 1,
    scenario,
    event_id: EVENT_ID,
    graduate_membership_id: MEMBERSHIP_ID,
    membership_status: 'ACTIVE',
    contract_status: 'ACCEPTED',
    payment_plan: paymentPlan,
    payment_submissions: paymentPlan.submissions.map((item) => structuredClone(item)),
    audit_logs: structuredClone(VISUAL_QA_AUDIT_LOGS[EVENT_ID] ?? []),
    seating: {
      financially_eligible: true,
      deadline_open: true,
      assigned_member_ids: ['gm-andrea-01', 'gm-andrea-02'],
    },
    meals: { pending_count: 0, deadline_open: true },
    thermo: { status: 'LOCKED', threshold_percent: 70 },
    cancellation_quote: refundQuote,
    payment_attempts: [],
    idempotency_keys: [],
  };

  if (scenario === 'CONTRACT_PENDING') state.contract_status = 'PENDING_ACCEPTANCE';
  if (scenario === 'PROOF_PENDING') {
    state.payment_submissions.unshift({
      id: 'sub-demo-pending',
      folio: 'SUB-DEMO-0001',
      graduateId: MEMBERSHIP_ID,
      graduateName: paymentPlan.graduateName,
      graduateEmail: 'andrea.martinez@ejemplo.com',
      career: 'Licenciatura en Derecho',
      eventId: EVENT_ID,
      amount: 2500,
      method: 'TRANSFER',
      declaredDate: '02 Sep 2026',
      reference: 'SPEI-DEMO-PENDIENTE',
      evidenceFileName: 'comprobante_demo.pdf',
      status: 'PENDING_REVIEW',
    });
  }
  if (scenario === 'PROOF_REJECTED') {
    state.payment_submissions.unshift({
      id: 'sub-demo-rejected',
      folio: 'SUB-DEMO-0002',
      graduateId: MEMBERSHIP_ID,
      graduateName: paymentPlan.graduateName,
      graduateEmail: 'andrea.martinez@ejemplo.com',
      career: 'Licenciatura en Derecho',
      eventId: EVENT_ID,
      amount: 2500,
      method: 'DEPOSIT',
      declaredDate: '01 Sep 2026',
      reference: 'DEP-DEMO-RECHAZADO',
      evidenceFileName: 'deposito_demo.jpg',
      status: 'REJECTED',
      reviewedAt: '02 Sep 2026',
      reviewedBy: 'Admin Demo GR',
      rejectionReason: 'La referencia no coincide con el movimiento bancario.',
    });
  }
  if (scenario === 'PAYMENT_OVERDUE') {
    state.payment_plan.totalOverdue = state.payment_plan.nextPayment?.amount ?? 0;
    if (state.payment_plan.nextPayment) state.payment_plan.nextPayment.status = 'OVERDUE';
    const next = state.payment_plan.installments.find((item) => item.status === 'UPCOMING');
    if (next) next.status = 'OVERDUE';
  }
  if (scenario === 'SEATING_LOCKED') state.seating.financially_eligible = false;
  if (scenario === 'SEATING_READY') state.seating.assigned_member_ids = [];
  if (scenario === 'MEALS_PENDING') state.meals.pending_count = 3;
  if (scenario === 'THERMO_AVAILABLE') {
    state.thermo.status = 'AVAILABLE';
    state.payment_plan.totalPaid = 10000;
    state.payment_plan.totalPending = 2500;
    state.payment_plan.progressPercentage = 80;
  }
  if (scenario === 'CANCELLATION_REFUND') state.cancellation_quote = refundQuote;
  if (scenario === 'CANCELLATION_DEBT') state.cancellation_quote = debtQuote;
  if (scenario === 'CANCELLED') {
    state.membership_status = 'CANCELLED';
    state.contract_status = 'CANCELLED';
    state.seating.assigned_member_ids = [];
  }

  state.payment_plan.submissions = state.payment_submissions;
  return structuredClone(state);
}

