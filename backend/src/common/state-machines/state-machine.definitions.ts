import {
  EventStatus,
  GraduateMembershipStatus,
  ContractStatus,
  ContractLineItemQuoteStatus,
  PaymentPlanStatus,
  PaymentAttemptStatus,
  PaymentSubmissionStatus,
  CancellationPolicyStatus,
  CancellationQuoteStatus,
  RefundStatus,
  ThermoOperationalStatus,
  ExportJobStatus,
  ReconciliationCaseStatus,
} from '@prisma/client';
import { TransitionDefinition } from './state-machine.types';

// Map of derived states that are strictly prohibited from persistence
export const PROHIBITED_DERIVED_STATES: Record<string, { entity: string; explanation: string }> = {
  PAID: {
    entity: 'Installment',
    explanation: 'PAID se deriva en tiempo de consulta cuando sum(allocations) >= amount. La columna de DB es InstallmentLifecycleStatus (ACTIVE|CANCELLED).',
  },
  OVERDUE: {
    entity: 'Installment',
    explanation: 'OVERDUE se deriva cuando unpaid > 0 y now() > due_date + grace_days.',
  },
  PARTIALLY_PAID: {
    entity: 'Installment',
    explanation: 'PARTIALLY_PAID es un estado proyectado del waterfall ledger.',
  },
  FULL: {
    entity: 'EventTable',
    explanation: 'FULL se deriva cuando count(TableAssignment) >= capacity. La columna de DB es TableStatus (AVAILABLE|BLOCKED).',
  },
  PARTIAL: {
    entity: 'EventTable',
    explanation: 'PARTIAL se deriva cuando count(TableAssignment) < capacity.',
  },
  EMPTY: {
    entity: 'EventTable',
    explanation: 'EMPTY se deriva cuando count(TableAssignment) == 0.',
  },
  LOCKED: {
    entity: 'ThermoRequest',
    explanation: 'LOCKED se deriva cuando financial_progress < thermo_threshold_percent.',
  },
  AVAILABLE: {
    entity: 'ThermoRequest',
    explanation: 'AVAILABLE se deriva cuando financial_progress >= thermo_threshold_percent. No se persiste como status operativo.',
  },
};

// 1. Event Transitions
export const EVENT_TRANSITIONS: TransitionDefinition<'Event'>[] = [
  {
    from: EventStatus.DRAFT,
    to: EventStatus.OPEN,
    command: 'OPEN_EVENT',
    allowedActors: ['ADMIN'],
    preconditions: ['Financial configuration is active', 'At least 1 base product created', 'Capacity > 0'],
    sideEffects: ['Enables access code registration'],
  },
  {
    from: EventStatus.DRAFT,
    to: EventStatus.CANCELLED,
    command: 'CANCEL_EVENT',
    allowedActors: ['ADMIN'],
    preconditions: ['Reason required'],
    sideEffects: ['Audits cancellation'],
  },
  {
    from: EventStatus.OPEN,
    to: EventStatus.CLOSED,
    command: 'CLOSE_EVENT',
    allowedActors: ['ADMIN'],
    preconditions: [],
    sideEffects: ['Blocks graduate mutations; allows read operations'],
  },
  {
    from: EventStatus.OPEN,
    to: EventStatus.CANCELLED,
    command: 'CANCEL_EVENT',
    allowedActors: ['ADMIN'],
    preconditions: ['Reason required'],
    sideEffects: ['Cancels active memberships preserving ledger'],
  },
  {
    from: EventStatus.CLOSED,
    to: EventStatus.OPEN,
    command: 'REOPEN_EVENT',
    allowedActors: ['ADMIN'],
    preconditions: ['Event date has not passed'],
    sideEffects: ['Restores graduate operational capabilities'],
  },
  {
    from: EventStatus.CLOSED,
    to: EventStatus.FINALIZED,
    command: 'FINALIZE_EVENT',
    allowedActors: ['ADMIN'],
    preconditions: ['Event date has passed', 'Balances reconciled'],
    sideEffects: ['Freezes event; enables completed membership transitions'],
  },
  {
    from: EventStatus.CLOSED,
    to: EventStatus.CANCELLED,
    command: 'CANCEL_EVENT',
    allowedActors: ['ADMIN'],
    preconditions: ['Reason required'],
    sideEffects: ['Cancels remaining operations'],
  },
];
export const EVENT_TERMINAL_STATES = [EventStatus.FINALIZED, EventStatus.CANCELLED];

// 2. GraduateMembership Transitions
export const MEMBERSHIP_TRANSITIONS: TransitionDefinition<'GraduateMembership'>[] = [
  {
    from: GraduateMembershipStatus.ACTIVE,
    to: GraduateMembershipStatus.CANCELLED,
    command: 'CANCEL_MEMBERSHIP',
    allowedActors: ['ADMIN', 'SYSTEM'],
    preconditions: ['Cancellation quote generated or automatic default policy met', 'Reason required'],
    sideEffects: ['Releases table assignments', 'Cancels future obligations', 'Creates internal note'],
  },
  {
    from: GraduateMembershipStatus.ACTIVE,
    to: GraduateMembershipStatus.COMPLETED,
    command: 'COMPLETE_MEMBERSHIP',
    allowedActors: ['ADMIN', 'SYSTEM'],
    preconditions: ['Event is FINALIZED', 'PaymentPlan is SETTLED'],
    sideEffects: ['Closes graduate record'],
  },
];
export const MEMBERSHIP_TERMINAL_STATES = [
  GraduateMembershipStatus.CANCELLED,
  GraduateMembershipStatus.COMPLETED,
];

// 3. GraduateContract Transitions
export const CONTRACT_TRANSITIONS: TransitionDefinition<'GraduateContract'>[] = [
  {
    from: ContractStatus.PENDING_ACCEPTANCE,
    to: ContractStatus.ACCEPTED,
    command: 'ACCEPT_CONTRACT',
    allowedActors: ['GRADUATE'],
    preconditions: ['Explicit acceptance by graduate', 'Terms snapshot and hash verified'],
    sideEffects: ['Records acceptance timestamp, account ID and IP hash'],
  },
  {
    from: ContractStatus.PENDING_ACCEPTANCE,
    to: ContractStatus.CANCELLED,
    command: 'CANCEL_CONTRACT',
    allowedActors: ['ADMIN', 'SYSTEM'],
    preconditions: ['Membership cancelled before contract acceptance'],
    sideEffects: ['Invalidates folio'],
  },
  {
    from: ContractStatus.ACCEPTED,
    to: ContractStatus.SUPERSEDED,
    command: 'SUPERSEDE_CONTRACT',
    allowedActors: ['ADMIN', 'SYSTEM'],
    preconditions: ['New contract version issued by substantive amendment'],
    sideEffects: ['Preserves historical contract immutable'],
  },
  {
    from: ContractStatus.ACCEPTED,
    to: ContractStatus.CANCELLED,
    command: 'CANCEL_CONTRACT',
    allowedActors: ['ADMIN', 'SYSTEM'],
    preconditions: ['Membership cancelled'],
    sideEffects: ['Marks rights cancelled'],
  },
];
export const CONTRACT_TERMINAL_STATES = [ContractStatus.SUPERSEDED, ContractStatus.CANCELLED];

// 4. ContractLineItemQuote Transitions
export const CONTRACT_QUOTE_TRANSITIONS: TransitionDefinition<'ContractLineItemQuote'>[] = [
  {
    from: ContractLineItemQuoteStatus.VALID,
    to: ContractLineItemQuoteStatus.USED,
    command: 'APPLY_QUOTE',
    allowedActors: ['GRADUATE', 'ADMIN'],
    preconditions: ['Capacity confirmed under lock', 'Catch-up paid if applicable'],
    sideEffects: ['Adds line item to contract and recalculates plan'],
  },
  {
    from: ContractLineItemQuoteStatus.VALID,
    to: ContractLineItemQuoteStatus.EXPIRED,
    command: 'EXPIRE_QUOTE',
    allowedActors: ['SYSTEM'],
    preconditions: ['Quote TTL has expired'],
    sideEffects: ['Invalidates quoted prices'],
  },
  {
    from: ContractLineItemQuoteStatus.VALID,
    to: ContractLineItemQuoteStatus.CANCELLED,
    command: 'CANCEL_QUOTE',
    allowedActors: ['GRADUATE', 'ADMIN'],
    preconditions: ['Quote not yet applied'],
    sideEffects: ['Dismisses quote'],
  },
];
export const CONTRACT_QUOTE_TERMINAL_STATES = [
  ContractLineItemQuoteStatus.USED,
  ContractLineItemQuoteStatus.EXPIRED,
  ContractLineItemQuoteStatus.CANCELLED,
];

// 5. PaymentPlan Transitions
export const PAYMENT_PLAN_TRANSITIONS: TransitionDefinition<'PaymentPlan'>[] = [
  {
    from: PaymentPlanStatus.ACTIVE,
    to: PaymentPlanStatus.SETTLED,
    command: 'SETTLE_PLAN',
    allowedActors: ['SYSTEM', 'ADMIN'],
    preconditions: ['Net applied >= contracted total'],
    sideEffects: ['Enables final settlement milestone'],
  },
  {
    from: PaymentPlanStatus.ACTIVE,
    to: PaymentPlanStatus.CANCELLED,
    command: 'CANCEL_PLAN',
    allowedActors: ['ADMIN', 'SYSTEM'],
    preconditions: ['Membership cancelled'],
    sideEffects: ['Cancels unpaid installments'],
  },
  {
    from: PaymentPlanStatus.SETTLED,
    to: PaymentPlanStatus.ACTIVE,
    command: 'REOPEN_PLAN',
    allowedActors: ['ADMIN', 'SYSTEM'],
    preconditions: ['Contract amended with additional amount'],
    sideEffects: ['Generates new payable installments'],
  },
];
export const PAYMENT_PLAN_TERMINAL_STATES = [PaymentPlanStatus.CANCELLED];

// 6. PaymentAttempt Transitions
export const PAYMENT_ATTEMPT_TRANSITIONS: TransitionDefinition<'PaymentAttempt'>[] = [
  {
    from: PaymentAttemptStatus.CREATED,
    to: PaymentAttemptStatus.REDIRECTED,
    command: 'REDIRECT_ATTEMPT',
    allowedActors: ['GRADUATE'],
    preconditions: ['Checkout preference exists'],
    sideEffects: ['Marks client redirected to gateway'],
  },
  {
    from: PaymentAttemptStatus.CREATED,
    to: PaymentAttemptStatus.CANCELLED,
    command: 'CANCEL_ATTEMPT',
    allowedActors: ['GRADUATE', 'ADMIN'],
    preconditions: ['Attempt not processed'],
    sideEffects: ['Closes attempt'],
  },
  {
    from: PaymentAttemptStatus.CREATED,
    to: PaymentAttemptStatus.EXPIRED,
    command: 'EXPIRE_ATTEMPT',
    allowedActors: ['SYSTEM'],
    preconditions: ['TTL expired'],
    sideEffects: ['Invalidates checkout URL'],
  },
  {
    from: PaymentAttemptStatus.REDIRECTED,
    to: PaymentAttemptStatus.PENDING,
    command: 'MARK_PENDING',
    allowedActors: ['GATEWAY_WEBHOOK', 'SYSTEM'],
    preconditions: ['Gateway notification in_process'],
    sideEffects: ['Records external reference'],
  },
  {
    from: PaymentAttemptStatus.REDIRECTED,
    to: PaymentAttemptStatus.CONFIRMED,
    command: 'CONFIRM_ATTEMPT',
    allowedActors: ['GATEWAY_WEBHOOK', 'SYSTEM'],
    preconditions: ['Signed s2s verification. Return URL strictly forbidden.'],
    sideEffects: ['Creates PaymentTransaction and runs waterfall allocation'],
  },
  {
    from: PaymentAttemptStatus.REDIRECTED,
    to: PaymentAttemptStatus.FAILED,
    command: 'FAIL_ATTEMPT',
    allowedActors: ['GATEWAY_WEBHOOK', 'SYSTEM'],
    preconditions: ['Gateway payment rejection'],
    sideEffects: ['Records failure reason'],
  },
  {
    from: PaymentAttemptStatus.REDIRECTED,
    to: PaymentAttemptStatus.EXPIRED,
    command: 'EXPIRE_ATTEMPT',
    allowedActors: ['SYSTEM'],
    preconditions: ['TTL expired without confirmation'],
    sideEffects: ['Closes attempt'],
  },
  {
    from: PaymentAttemptStatus.PENDING,
    to: PaymentAttemptStatus.CONFIRMED,
    command: 'CONFIRM_ATTEMPT',
    allowedActors: ['GATEWAY_WEBHOOK', 'SYSTEM'],
    preconditions: ['Signed s2s verification. Return URL strictly forbidden.'],
    sideEffects: ['Creates PaymentTransaction and runs waterfall allocation'],
  },
  {
    from: PaymentAttemptStatus.PENDING,
    to: PaymentAttemptStatus.FAILED,
    command: 'FAIL_ATTEMPT',
    allowedActors: ['GATEWAY_WEBHOOK', 'SYSTEM'],
    preconditions: ['Gateway final failure'],
    sideEffects: ['Records failure reason'],
  },
  {
    from: PaymentAttemptStatus.PENDING,
    to: PaymentAttemptStatus.EXPIRED,
    command: 'EXPIRE_ATTEMPT',
    allowedActors: ['SYSTEM'],
    preconditions: ['TTL expired'],
    sideEffects: ['Closes attempt'],
  },
];
export const PAYMENT_ATTEMPT_TERMINAL_STATES = [
  PaymentAttemptStatus.CONFIRMED,
  PaymentAttemptStatus.FAILED,
  PaymentAttemptStatus.EXPIRED,
  PaymentAttemptStatus.CANCELLED,
];

// 7. PaymentSubmission Transitions
export const PAYMENT_SUBMISSION_TRANSITIONS: TransitionDefinition<'PaymentSubmission'>[] = [
  {
    from: PaymentSubmissionStatus.PENDING_REVIEW,
    to: PaymentSubmissionStatus.APPROVED,
    command: 'APPROVE_SUBMISSION',
    allowedActors: ['ADMIN'],
    preconditions: ['Evidence verified by admin', 'Idempotent transaction boundary'],
    sideEffects: ['Atomically creates exactly 1 PaymentTransaction and allocates waterfall'],
  },
  {
    from: PaymentSubmissionStatus.PENDING_REVIEW,
    to: PaymentSubmissionStatus.REJECTED,
    command: 'REJECT_SUBMISSION',
    allowedActors: ['ADMIN'],
    preconditions: ['Rejection reason mandatory'],
    sideEffects: ['Records reviewer account, timestamp and rejection reason'],
  },
  {
    from: PaymentSubmissionStatus.PENDING_REVIEW,
    to: PaymentSubmissionStatus.CANCELLED,
    command: 'CANCEL_SUBMISSION',
    allowedActors: ['GRADUATE', 'ADMIN'],
    preconditions: ['Submission is still pending review'],
    sideEffects: ['Dismisses submission'],
  },
];
export const PAYMENT_SUBMISSION_TERMINAL_STATES = [
  PaymentSubmissionStatus.APPROVED,
  PaymentSubmissionStatus.REJECTED,
  PaymentSubmissionStatus.CANCELLED,
];

// 8. CancellationPolicy Transitions
export const CANCELLATION_POLICY_TRANSITIONS: TransitionDefinition<'CancellationPolicy'>[] = [
  {
    from: CancellationPolicyStatus.DRAFT,
    to: CancellationPolicyStatus.ACTIVE,
    command: 'PUBLISH_POLICY',
    allowedActors: ['ADMIN'],
    preconditions: ['Ranges cover from day 0, no gaps, no overlaps, 0<=penalty<=100'],
    sideEffects: ['Archives previous active version for the event'],
  },
  {
    from: CancellationPolicyStatus.DRAFT,
    to: CancellationPolicyStatus.ARCHIVED,
    command: 'ARCHIVE_POLICY',
    allowedActors: ['ADMIN'],
    preconditions: ['Discarding draft'],
    sideEffects: ['Marks draft archived'],
  },
  {
    from: CancellationPolicyStatus.ACTIVE,
    to: CancellationPolicyStatus.ARCHIVED,
    command: 'ARCHIVE_POLICY',
    allowedActors: ['ADMIN', 'SYSTEM'],
    preconditions: ['Superseded by new version'],
    sideEffects: ['Preserves history for existing contracts'],
  },
];
export const CANCELLATION_POLICY_TERMINAL_STATES = [CancellationPolicyStatus.ARCHIVED];

// 9. CancellationQuote Transitions
export const CANCELLATION_QUOTE_TRANSITIONS: TransitionDefinition<'CancellationQuote'>[] = [
  {
    from: CancellationQuoteStatus.VALID,
    to: CancellationQuoteStatus.USED,
    command: 'CONSUME_QUOTE',
    allowedActors: ['ADMIN'],
    preconditions: ['Applied in membership cancellation command'],
    sideEffects: ['Fixes cancellation numbers'],
  },
  {
    from: CancellationQuoteStatus.VALID,
    to: CancellationQuoteStatus.EXPIRED,
    command: 'EXPIRE_QUOTE',
    allowedActors: ['SYSTEM'],
    preconditions: ['TTL expired or event-day boundary crossed'],
    sideEffects: ['Invalidates quote'],
  },
  {
    from: CancellationQuoteStatus.VALID,
    to: CancellationQuoteStatus.CANCELLED,
    command: 'CANCEL_QUOTE',
    allowedActors: ['ADMIN', 'GRADUATE'],
    preconditions: ['Quote not applied'],
    sideEffects: ['Dismisses quote'],
  },
];
export const CANCELLATION_QUOTE_TERMINAL_STATES = [
  CancellationQuoteStatus.USED,
  CancellationQuoteStatus.EXPIRED,
  CancellationQuoteStatus.CANCELLED,
];

// 10. Refund Transitions
export const REFUND_TRANSITIONS: TransitionDefinition<'Refund'>[] = [
  {
    from: RefundStatus.REQUESTED,
    to: RefundStatus.PENDING,
    command: 'SUBMIT_REFUND',
    allowedActors: ['ADMIN', 'SYSTEM'],
    preconditions: ['Submitted to electronic gateway'],
    sideEffects: ['Records gateway refund id'],
  },
  {
    from: RefundStatus.REQUESTED,
    to: RefundStatus.CONFIRMED,
    command: 'CONFIRM_REFUND',
    allowedActors: ['ADMIN'],
    preconditions: ['Manual refund executed. Amount <= refundable net.'],
    sideEffects: ['Creates compensating ledger movement; NEVER modifies original transactions'],
  },
  {
    from: RefundStatus.REQUESTED,
    to: RefundStatus.CANCELLED,
    command: 'CANCEL_REFUND',
    allowedActors: ['ADMIN'],
    preconditions: ['Reason required'],
    sideEffects: ['Cancels refund request'],
  },
  {
    from: RefundStatus.PENDING,
    to: RefundStatus.CONFIRMED,
    command: 'CONFIRM_REFUND',
    allowedActors: ['GATEWAY_WEBHOOK', 'SYSTEM'],
    preconditions: ['Gateway confirms refund execution'],
    sideEffects: ['Assembles compensating entry'],
  },
  {
    from: RefundStatus.PENDING,
    to: RefundStatus.FAILED,
    command: 'FAIL_REFUND',
    allowedActors: ['GATEWAY_WEBHOOK', 'SYSTEM'],
    preconditions: ['Gateway reports rejection'],
    sideEffects: ['Records failure reason'],
  },
  {
    from: RefundStatus.PENDING,
    to: RefundStatus.CANCELLED,
    command: 'CANCEL_REFUND',
    allowedActors: ['ADMIN'],
    preconditions: ['Manual cancellation override'],
    sideEffects: ['Cancels pending process'],
  },
];
export const REFUND_TERMINAL_STATES = [
  RefundStatus.CONFIRMED,
  RefundStatus.FAILED,
  RefundStatus.CANCELLED,
];

// 11. ThermoRequest Transitions
export const THERMO_TRANSITIONS: TransitionDefinition<'ThermoRequest'>[] = [
  {
    from: ThermoOperationalStatus.REQUESTED,
    to: ThermoOperationalStatus.IN_PRODUCTION,
    command: 'SEND_TO_PRODUCTION',
    allowedActors: ['ADMIN'],
    preconditions: ['Batch sent to workshop'],
    sideEffects: ['Locks personalization fields against graduate edits', 'Sets production_at'],
  },
  {
    from: ThermoOperationalStatus.IN_PRODUCTION,
    to: ThermoOperationalStatus.DELIVERED,
    command: 'DELIVER_THERMO',
    allowedActors: ['ADMIN'],
    preconditions: ['Physical handover confirmed'],
    sideEffects: ['Records ThermoDelivery record with timestamp, notes, handler'],
  },
];
export const THERMO_TERMINAL_STATES = [ThermoOperationalStatus.DELIVERED];

// 12. ExportJob Transitions
export const EXPORT_JOB_TRANSITIONS: TransitionDefinition<'ExportJob'>[] = [
  {
    from: ExportJobStatus.PENDING,
    to: ExportJobStatus.RUNNING,
    command: 'START_JOB',
    allowedActors: ['SYSTEM'],
    preconditions: ['Worker acquired lock'],
    sideEffects: ['Sets started_at'],
  },
  {
    from: ExportJobStatus.PENDING,
    to: ExportJobStatus.FAILED,
    command: 'FAIL_JOB',
    allowedActors: ['SYSTEM'],
    preconditions: ['Queue timeout or cancelled'],
    sideEffects: ['Sets error_message'],
  },
  {
    from: ExportJobStatus.RUNNING,
    to: ExportJobStatus.COMPLETED,
    command: 'COMPLETE_JOB',
    allowedActors: ['SYSTEM'],
    preconditions: ['File generated and attached to FileAsset'],
    sideEffects: ['Sets file_asset_id and completed_at'],
  },
  {
    from: ExportJobStatus.RUNNING,
    to: ExportJobStatus.FAILED,
    command: 'FAIL_JOB',
    allowedActors: ['SYSTEM'],
    preconditions: ['Worker exception encountered'],
    sideEffects: ['Sets error_message and completed_at'],
  },
];
export const EXPORT_JOB_TERMINAL_STATES = [ExportJobStatus.COMPLETED, ExportJobStatus.FAILED];

// 13. ReconciliationCase Transitions
export const RECONCILIATION_TRANSITIONS: TransitionDefinition<'ReconciliationCase'>[] = [
  {
    from: ReconciliationCaseStatus.OPEN,
    to: 'INVESTIGATING' as ReconciliationCaseStatus,
    command: 'INVESTIGATE_CASE',
    allowedActors: ['ADMIN'],
    preconditions: ['Triage started by admin'],
    sideEffects: ['Records investigating timestamp'],
  },
  {
    from: ReconciliationCaseStatus.OPEN,
    to: ReconciliationCaseStatus.RESOLVED,
    command: 'RESOLVE_CASE',
    allowedActors: ['ADMIN'],
    preconditions: ['Corrective action verified'],
    sideEffects: ['Sets resolved_at, resolved_by, resolution note'],
  },
  {
    from: ReconciliationCaseStatus.OPEN,
    to: ReconciliationCaseStatus.DISMISSED,
    command: 'DISMISS_CASE',
    allowedActors: ['ADMIN'],
    preconditions: ['False positive justified'],
    sideEffects: ['Sets dismissed_at and reason'],
  },
  {
    from: 'INVESTIGATING' as ReconciliationCaseStatus,
    to: ReconciliationCaseStatus.RESOLVED,
    command: 'RESOLVE_CASE',
    allowedActors: ['ADMIN'],
    preconditions: ['Corrective action verified'],
    sideEffects: ['Sets resolved_at and resolution note'],
  },
  {
    from: 'INVESTIGATING' as ReconciliationCaseStatus,
    to: ReconciliationCaseStatus.DISMISSED,
    command: 'DISMISS_CASE',
    allowedActors: ['ADMIN'],
    preconditions: ['False positive justified'],
    sideEffects: ['Sets dismissed_at and reason'],
  },
  {
    from: ReconciliationCaseStatus.RESOLVED,
    to: ReconciliationCaseStatus.OPEN,
    command: 'REOPEN_CASE',
    allowedActors: ['ADMIN'],
    preconditions: ['New discrepancy detected or audit failed. Reason mandatory.'],
    sideEffects: ['Reactivates operational alert'],
  },
  {
    from: ReconciliationCaseStatus.DISMISSED,
    to: ReconciliationCaseStatus.OPEN,
    command: 'REOPEN_CASE',
    allowedActors: ['ADMIN'],
    preconditions: ['New evidence refuting dismissal. Reason mandatory.'],
    sideEffects: ['Reactivates operational alert'],
  },
];
export const RECONCILIATION_TERMINAL_STATES: ReconciliationCaseStatus[] = []; // None, can always be reopened by ADMIN
