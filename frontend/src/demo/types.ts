import type { VisualContractStatus } from '../fixtures/contractGroupVisualFixtures';
import type {
  VisualPaymentSubmission,
  VisualGraduatePaymentState,
} from '../fixtures/paymentVisualFixtures';
import type { ThermoStatus } from '../fixtures/graduateFixtures';
import type { VisualAuditLogItem } from '../fixtures/cancellationReportsAuditVisualFixtures';

export const DEMO_SCENARIOS = [
  'NORMAL',
  'CONTRACT_PENDING',
  'PROOF_PENDING',
  'PROOF_REJECTED',
  'PAYMENT_OVERDUE',
  'SEATING_LOCKED',
  'SEATING_READY',
  'MEALS_PENDING',
  'THERMO_AVAILABLE',
  'CANCELLATION_REFUND',
  'CANCELLATION_DEBT',
  'CANCELLED',
] as const;

export type DemoScenario = (typeof DEMO_SCENARIOS)[number];

export interface DemoCancellationQuote {
  quote_id: string;
  status: 'VALID';
  days_before_event: number;
  policy: { version: number; range_id: string };
  contracted_total: string;
  eligible_paid: string;
  penalty_percent: number;
  penalty_amount: string;
  non_refundable_minimum: string;
  retained_amount: string;
  refund_due: string;
  remaining_due: string;
  expires_at: string;
}

export interface DemoPaymentAttempt {
  payment_attempt_id: string;
  provider: 'MERCADO_PAGO' | 'OPENPAY';
  status: 'PENDING';
  checkout_url: string;
}

export interface DemoState {
  schema_version: 1;
  scenario: DemoScenario;
  event_id: string;
  graduate_membership_id: string;
  membership_status: 'ACTIVE' | 'CANCELLED';
  contract_status: VisualContractStatus;
  payment_plan: VisualGraduatePaymentState;
  payment_submissions: VisualPaymentSubmission[];
  audit_logs: VisualAuditLogItem[];
  seating: {
    financially_eligible: boolean;
    deadline_open: boolean;
    assigned_member_ids: string[];
  };
  meals: { pending_count: number; deadline_open: boolean };
  thermo: {
    status: ThermoStatus;
    threshold_percent: number;
  };
  cancellation_quote: DemoCancellationQuote;
  payment_attempts: DemoPaymentAttempt[];
  idempotency_keys: string[];
}

