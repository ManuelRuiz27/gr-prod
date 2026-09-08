import { Test, TestingModule } from '@nestjs/testing';
import {
  DomainStateGuardService,
  InvalidStateTransitionException,
  UnauthorizedTransitionActorException,
  TerminalStateException,
  DerivedStatePersistAttemptException,
  ReturnUrlCannotConfirmPaymentException,
} from './index';
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

describe('DomainStateGuardService — Comprehensive State Machine Suite', () => {
  let guard: DomainStateGuardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DomainStateGuardService],
    }).compile();

    guard = module.get<DomainStateGuardService>(DomainStateGuardService);
  });

  describe('1. Event Lifecycle (DRAFT, OPEN, CLOSED, FINALIZED, CANCELLED)', () => {
    it('allows valid forward and reopen transitions by ADMIN', () => {
      // DRAFT -> OPEN
      const r1 = guard.assertTransition({
        entity: 'Event',
        currentState: EventStatus.DRAFT,
        targetState: EventStatus.OPEN,
        actor: 'ADMIN',
      });
      expect(r1.success).toBe(true);
      expect(r1.command).toBe('OPEN_EVENT');

      // OPEN -> CLOSED
      const r2 = guard.assertTransition({
        entity: 'Event',
        currentState: EventStatus.OPEN,
        targetState: EventStatus.CLOSED,
        actor: 'ADMIN',
      });
      expect(r2.success).toBe(true);
      expect(r2.command).toBe('CLOSE_EVENT');

      // CLOSED -> OPEN (Reopen supported by BR-EVT-004)
      const r3 = guard.assertTransition({
        entity: 'Event',
        currentState: EventStatus.CLOSED,
        targetState: EventStatus.OPEN,
        actor: 'ADMIN',
      });
      expect(r3.success).toBe(true);
      expect(r3.command).toBe('REOPEN_EVENT');

      // CLOSED -> FINALIZED
      const r4 = guard.assertTransition({
        entity: 'Event',
        currentState: EventStatus.CLOSED,
        targetState: EventStatus.FINALIZED,
        actor: 'ADMIN',
      });
      expect(r4.success).toBe(true);
      expect(r4.command).toBe('FINALIZE_EVENT');
    });

    it('rejects invalid jump transitions (DRAFT -> FINALIZED)', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'Event',
          currentState: EventStatus.DRAFT,
          targetState: EventStatus.FINALIZED,
          actor: 'ADMIN',
        }),
      ).toThrow(InvalidStateTransitionException);
    });

    it('rejects transitions out of terminal states (FINALIZED, CANCELLED)', () => {
      expect(guard.isTerminalState('Event', EventStatus.FINALIZED)).toBe(true);
      expect(guard.isTerminalState('Event', EventStatus.CANCELLED)).toBe(true);

      expect(() =>
        guard.assertTransition({
          entity: 'Event',
          currentState: EventStatus.FINALIZED,
          targetState: EventStatus.OPEN,
          actor: 'ADMIN',
        }),
      ).toThrow(TerminalStateException);

      expect(() =>
        guard.assertTransition({
          entity: 'Event',
          currentState: EventStatus.CANCELLED,
          targetState: EventStatus.OPEN,
          actor: 'ADMIN',
        }),
      ).toThrow(TerminalStateException);
    });

    it('rejects GRADUATE attempting to transition Event', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'Event',
          currentState: EventStatus.DRAFT,
          targetState: EventStatus.OPEN,
          actor: 'GRADUATE',
        }),
      ).toThrow(UnauthorizedTransitionActorException);
    });
  });

  describe('2. GraduateMembership Lifecycle (ACTIVE, CANCELLED, COMPLETED)', () => {
    it('allows ACTIVE -> CANCELLED by ADMIN or SYSTEM', () => {
      const res = guard.assertTransition({
        entity: 'GraduateMembership',
        currentState: GraduateMembershipStatus.ACTIVE,
        targetState: GraduateMembershipStatus.CANCELLED,
        actor: 'ADMIN',
        reason: 'Baja voluntaria con retención',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('CANCEL_MEMBERSHIP');
    });

    it('allows ACTIVE -> COMPLETED by SYSTEM', () => {
      const res = guard.assertTransition({
        entity: 'GraduateMembership',
        currentState: GraduateMembershipStatus.ACTIVE,
        targetState: GraduateMembershipStatus.COMPLETED,
        actor: 'SYSTEM',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('COMPLETE_MEMBERSHIP');
    });

    it('blocks transitions out of CANCELLED or COMPLETED', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'GraduateMembership',
          currentState: GraduateMembershipStatus.CANCELLED,
          targetState: GraduateMembershipStatus.ACTIVE,
          actor: 'ADMIN',
        }),
      ).toThrow(TerminalStateException);
    });
  });

  describe('3. GraduateContract Lifecycle (PENDING_ACCEPTANCE, ACCEPTED, SUPERSEDED, CANCELLED)', () => {
    it('allows GRADUATE to accept PENDING_ACCEPTANCE contract', () => {
      const res = guard.assertTransition({
        entity: 'GraduateContract',
        currentState: ContractStatus.PENDING_ACCEPTANCE,
        targetState: ContractStatus.ACCEPTED,
        actor: 'GRADUATE',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('ACCEPT_CONTRACT');
    });

    it('is idempotent when re-accepting an already ACCEPTED contract', () => {
      const res = guard.assertTransition({
        entity: 'GraduateContract',
        currentState: ContractStatus.ACCEPTED,
        targetState: ContractStatus.ACCEPTED,
        actor: 'GRADUATE',
      });
      expect(res.success).toBe(true);
      expect(res.isIdempotent).toBe(true);
    });

    it('allows superseding ACCEPTED contract with a new version', () => {
      const res = guard.assertTransition({
        entity: 'GraduateContract',
        currentState: ContractStatus.ACCEPTED,
        targetState: ContractStatus.SUPERSEDED,
        actor: 'ADMIN',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('SUPERSEDE_CONTRACT');
    });

    it('prohibits reverting ACCEPTED contract to PENDING_ACCEPTANCE', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'GraduateContract',
          currentState: ContractStatus.ACCEPTED,
          targetState: ContractStatus.PENDING_ACCEPTANCE,
          actor: 'ADMIN',
        }),
      ).toThrow(InvalidStateTransitionException);
    });
  });

  describe('4. ContractLineItemQuote Lifecycle (VALID, EXPIRED, APPLIED/USED, CANCELLED)', () => {
    it('allows quote confirmation with canonical USED or APPLIED alias', () => {
      const r1 = guard.assertTransition({
        entity: 'ContractLineItemQuote',
        currentState: ContractLineItemQuoteStatus.VALID,
        targetState: ContractLineItemQuoteStatus.USED,
        actor: 'GRADUATE',
      });
      expect(r1.success).toBe(true);
      expect(r1.command).toBe('APPLY_QUOTE');

      // Test APPLIED alias
      const r2 = guard.assertTransition({
        entity: 'ContractLineItemQuote',
        currentState: ContractLineItemQuoteStatus.VALID,
        targetState: 'APPLIED',
        actor: 'GRADUATE',
      });
      expect(r2.success).toBe(true);
      expect(r2.toState).toBe(ContractLineItemQuoteStatus.USED);
    });

    it('allows system TTL expiration', () => {
      const res = guard.assertTransition({
        entity: 'ContractLineItemQuote',
        currentState: ContractLineItemQuoteStatus.VALID,
        targetState: ContractLineItemQuoteStatus.EXPIRED,
        actor: 'SYSTEM',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('EXPIRE_QUOTE');
    });

    it('blocks modifications once USED or EXPIRED', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'ContractLineItemQuote',
          currentState: ContractLineItemQuoteStatus.USED,
          targetState: ContractLineItemQuoteStatus.VALID,
          actor: 'ADMIN',
        }),
      ).toThrow(TerminalStateException);
    });
  });

  describe('5. PaymentPlan Lifecycle (ACTIVE, SETTLED/COMPLETED, CANCELLED)', () => {
    it('allows settling plan and handles COMPLETED alias', () => {
      const r1 = guard.assertTransition({
        entity: 'PaymentPlan',
        currentState: PaymentPlanStatus.ACTIVE,
        targetState: PaymentPlanStatus.SETTLED,
        actor: 'SYSTEM',
      });
      expect(r1.success).toBe(true);
      expect(r1.command).toBe('SETTLE_PLAN');

      const r2 = guard.assertTransition({
        entity: 'PaymentPlan',
        currentState: PaymentPlanStatus.ACTIVE,
        targetState: 'COMPLETED',
        actor: 'ADMIN',
      });
      expect(r2.success).toBe(true);
      expect(r2.toState).toBe(PaymentPlanStatus.SETTLED);
    });

    it('allows reopening SETTLED plan to ACTIVE upon additional purchase', () => {
      const res = guard.assertTransition({
        entity: 'PaymentPlan',
        currentState: PaymentPlanStatus.SETTLED,
        targetState: PaymentPlanStatus.ACTIVE,
        actor: 'ADMIN',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('REOPEN_PLAN');
    });

    it('blocks transitions out of CANCELLED', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'PaymentPlan',
          currentState: PaymentPlanStatus.CANCELLED,
          targetState: PaymentPlanStatus.ACTIVE,
          actor: 'ADMIN',
        }),
      ).toThrow(TerminalStateException);
    });
  });

  describe('6. PaymentAttempt Lifecycle (CREATED, REDIRECTED, PENDING, CONFIRMED, FAILED, EXPIRED, CANCELLED)', () => {
    it('strictly prohibits FRONTEND_RETURN_URL from confirming PaymentAttempt (BR-PAY-004)', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'PaymentAttempt',
          currentState: PaymentAttemptStatus.REDIRECTED,
          targetState: PaymentAttemptStatus.CONFIRMED,
          actor: 'SYSTEM',
          callerSource: 'FRONTEND_RETURN_URL',
        }),
      ).toThrow(ReturnUrlCannotConfirmPaymentException);
    });

    it('allows GATEWAY_WEBHOOK to confirm PaymentAttempt from REDIRECTED or PENDING', () => {
      const r1 = guard.assertTransition({
        entity: 'PaymentAttempt',
        currentState: PaymentAttemptStatus.REDIRECTED,
        targetState: PaymentAttemptStatus.CONFIRMED,
        actor: 'GATEWAY_WEBHOOK',
        callerSource: 'WEBHOOK',
      });
      expect(r1.success).toBe(true);
      expect(r1.command).toBe('CONFIRM_ATTEMPT');

      const r2 = guard.assertTransition({
        entity: 'PaymentAttempt',
        currentState: PaymentAttemptStatus.PENDING,
        targetState: PaymentAttemptStatus.CONFIRMED,
        actor: 'GATEWAY_WEBHOOK',
        callerSource: 'WEBHOOK',
      });
      expect(r2.success).toBe(true);
      expect(r2.command).toBe('CONFIRM_ATTEMPT');
    });

    it('rejects transitions out of CONFIRMED terminal state', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'PaymentAttempt',
          currentState: PaymentAttemptStatus.CONFIRMED,
          targetState: PaymentAttemptStatus.FAILED,
          actor: 'GATEWAY_WEBHOOK',
        }),
      ).toThrow(TerminalStateException);
    });
  });

  describe('7. PaymentSubmission Lifecycle (PENDING_REVIEW, APPROVED, REJECTED, CANCELLED)', () => {
    it('allows ADMIN to approve submission and handles idempotency', () => {
      const r1 = guard.assertTransition({
        entity: 'PaymentSubmission',
        currentState: PaymentSubmissionStatus.PENDING_REVIEW,
        targetState: PaymentSubmissionStatus.APPROVED,
        actor: 'ADMIN',
      });
      expect(r1.success).toBe(true);
      expect(r1.isIdempotent).toBe(false);
      expect(r1.command).toBe('APPROVE_SUBMISSION');

      // Idempotent re-approval returns success without error
      const r2 = guard.assertTransition({
        entity: 'PaymentSubmission',
        currentState: PaymentSubmissionStatus.APPROVED,
        targetState: PaymentSubmissionStatus.APPROVED,
        actor: 'ADMIN',
      });
      expect(r2.success).toBe(true);
      expect(r2.isIdempotent).toBe(true);
    });

    it('allows ADMIN to reject with reason', () => {
      const res = guard.assertTransition({
        entity: 'PaymentSubmission',
        currentState: PaymentSubmissionStatus.PENDING_REVIEW,
        targetState: PaymentSubmissionStatus.REJECTED,
        actor: 'ADMIN',
        reason: 'Comprobante ilegible',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('REJECT_SUBMISSION');
    });

    it('rejects GRADUATE attempting to approve submission', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'PaymentSubmission',
          currentState: PaymentSubmissionStatus.PENDING_REVIEW,
          targetState: PaymentSubmissionStatus.APPROVED,
          actor: 'GRADUATE',
        }),
      ).toThrow(UnauthorizedTransitionActorException);
    });

    it('blocks modifying an already APPROVED or REJECTED submission', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'PaymentSubmission',
          currentState: PaymentSubmissionStatus.APPROVED,
          targetState: PaymentSubmissionStatus.REJECTED,
          actor: 'ADMIN',
        }),
      ).toThrow(TerminalStateException);
    });
  });

  describe('8. CancellationPolicy Lifecycle (DRAFT, ACTIVE, ARCHIVED)', () => {
    it('allows ADMIN to publish DRAFT -> ACTIVE', () => {
      const res = guard.assertTransition({
        entity: 'CancellationPolicy',
        currentState: CancellationPolicyStatus.DRAFT,
        targetState: CancellationPolicyStatus.ACTIVE,
        actor: 'ADMIN',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('PUBLISH_POLICY');
    });

    it('allows ACTIVE -> ARCHIVED when replaced by new version', () => {
      const res = guard.assertTransition({
        entity: 'CancellationPolicy',
        currentState: CancellationPolicyStatus.ACTIVE,
        targetState: CancellationPolicyStatus.ARCHIVED,
        actor: 'ADMIN',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('ARCHIVE_POLICY');
    });

    it('blocks reverting ACTIVE back to DRAFT', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'CancellationPolicy',
          currentState: CancellationPolicyStatus.ACTIVE,
          targetState: CancellationPolicyStatus.DRAFT,
          actor: 'ADMIN',
        }),
      ).toThrow(InvalidStateTransitionException);
    });
  });

  describe('9. CancellationQuote Lifecycle (VALID, EXPIRED, USED, CANCELLED)', () => {
    it('allows consuming quote during cancellation', () => {
      const res = guard.assertTransition({
        entity: 'CancellationQuote',
        currentState: CancellationQuoteStatus.VALID,
        targetState: CancellationQuoteStatus.USED,
        actor: 'ADMIN',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('CONSUME_QUOTE');
    });

    it('blocks reusing or altering a USED quote', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'CancellationQuote',
          currentState: CancellationQuoteStatus.USED,
          targetState: CancellationQuoteStatus.VALID,
          actor: 'ADMIN',
        }),
      ).toThrow(TerminalStateException);
    });
  });

  describe('10. Refund Lifecycle (REQUESTED, PENDING, CONFIRMED, FAILED, CANCELLED)', () => {
    it('allows manual cash/transfer direct confirmation by ADMIN', () => {
      const res = guard.assertTransition({
        entity: 'Refund',
        currentState: RefundStatus.REQUESTED,
        targetState: RefundStatus.CONFIRMED,
        actor: 'ADMIN',
        reason: 'Devolución en efectivo acordada',
      });
      expect(res.success).toBe(true);
      expect(res.command).toBe('CONFIRM_REFUND');
    });

    it('allows electronic refund flow (REQUESTED -> PENDING -> CONFIRMED)', () => {
      const r1 = guard.assertTransition({
        entity: 'Refund',
        currentState: RefundStatus.REQUESTED,
        targetState: RefundStatus.PENDING,
        actor: 'ADMIN',
      });
      expect(r1.success).toBe(true);

      const r2 = guard.assertTransition({
        entity: 'Refund',
        currentState: RefundStatus.PENDING,
        targetState: RefundStatus.CONFIRMED,
        actor: 'GATEWAY_WEBHOOK',
      });
      expect(r2.success).toBe(true);
    });

    it('blocks modifying CONFIRMED refund (append-only ledger)', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'Refund',
          currentState: RefundStatus.CONFIRMED,
          targetState: RefundStatus.CANCELLED,
          actor: 'ADMIN',
        }),
      ).toThrow(TerminalStateException);
    });
  });

  describe('11. ThermoRequest Lifecycle (REQUESTED, IN_PRODUCTION, DELIVERED)', () => {
    it('allows ADMIN to move REQUESTED -> IN_PRODUCTION -> DELIVERED', () => {
      const r1 = guard.assertTransition({
        entity: 'ThermoRequest',
        currentState: ThermoOperationalStatus.REQUESTED,
        targetState: ThermoOperationalStatus.IN_PRODUCTION,
        actor: 'ADMIN',
      });
      expect(r1.success).toBe(true);
      expect(r1.command).toBe('SEND_TO_PRODUCTION');

      const r2 = guard.assertTransition({
        entity: 'ThermoRequest',
        currentState: ThermoOperationalStatus.IN_PRODUCTION,
        targetState: ThermoOperationalStatus.DELIVERED,
        actor: 'ADMIN',
      });
      expect(r2.success).toBe(true);
      expect(r2.command).toBe('DELIVER_THERMO');
    });

    it('rejects GRADUATE attempting to change operational status', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'ThermoRequest',
          currentState: ThermoOperationalStatus.REQUESTED,
          targetState: ThermoOperationalStatus.IN_PRODUCTION,
          actor: 'GRADUATE',
        }),
      ).toThrow(UnauthorizedTransitionActorException);
    });

    it('blocks reverting DELIVERED status', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'ThermoRequest',
          currentState: ThermoOperationalStatus.DELIVERED,
          targetState: ThermoOperationalStatus.REQUESTED,
          actor: 'ADMIN',
        }),
      ).toThrow(TerminalStateException);
    });
  });

  describe('12. ExportJob Lifecycle (PENDING, RUNNING, COMPLETED, FAILED)', () => {
    it('allows SYSTEM worker to complete job', () => {
      const r1 = guard.assertTransition({
        entity: 'ExportJob',
        currentState: ExportJobStatus.PENDING,
        targetState: ExportJobStatus.RUNNING,
        actor: 'SYSTEM',
      });
      expect(r1.success).toBe(true);

      const r2 = guard.assertTransition({
        entity: 'ExportJob',
        currentState: ExportJobStatus.RUNNING,
        targetState: ExportJobStatus.COMPLETED,
        actor: 'SYSTEM',
      });
      expect(r2.success).toBe(true);
    });

    it('blocks modifications once COMPLETED', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'ExportJob',
          currentState: ExportJobStatus.COMPLETED,
          targetState: ExportJobStatus.PENDING,
          actor: 'SYSTEM',
        }),
      ).toThrow(TerminalStateException);
    });
  });

  describe('13. ReconciliationCase Lifecycle (OPEN, INVESTIGATING, RESOLVED, DISMISSED)', () => {
    it('allows full resolution flow with reopen capability', () => {
      const r1 = guard.assertTransition({
        entity: 'ReconciliationCase',
        currentState: ReconciliationCaseStatus.OPEN,
        targetState: 'INVESTIGATING',
        actor: 'ADMIN',
      });
      expect(r1.success).toBe(true);
      expect(r1.command).toBe('INVESTIGATE_CASE');

      const r2 = guard.assertTransition({
        entity: 'ReconciliationCase',
        currentState: 'INVESTIGATING' as unknown as ReconciliationCaseStatus,
        targetState: ReconciliationCaseStatus.RESOLVED,
        actor: 'ADMIN',
      });
      expect(r2.success).toBe(true);
      expect(r2.command).toBe('RESOLVE_CASE');

      // Reopening RESOLVED case to OPEN when new discrepancy is found
      const r3 = guard.assertTransition({
        entity: 'ReconciliationCase',
        currentState: ReconciliationCaseStatus.RESOLVED,
        targetState: ReconciliationCaseStatus.OPEN,
        actor: 'ADMIN',
        reason: 'Nueva inconsistencia detectada en auditoría',
      });
      expect(r3.success).toBe(true);
      expect(r3.command).toBe('REOPEN_CASE');
    });

    it('prohibits non-admin from modifying reconciliation case', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'ReconciliationCase',
          currentState: ReconciliationCaseStatus.OPEN,
          targetState: ReconciliationCaseStatus.RESOLVED,
          actor: 'GRADUATE',
        }),
      ).toThrow(UnauthorizedTransitionActorException);
    });
  });

  describe('Prohibited Derived States Enforcement', () => {
    it('strictly rejects attempting to persist Installment derived states (PAID, OVERDUE, PARTIALLY_PAID)', () => {
      expect(() => guard.assertNotDerivedState('PAID', 'Installment')).toThrow(
        DerivedStatePersistAttemptException,
      );
      expect(() => guard.assertNotDerivedState('OVERDUE', 'Installment')).toThrow(
        DerivedStatePersistAttemptException,
      );
      expect(() => guard.assertNotDerivedState('PARTIALLY_PAID', 'Installment')).toThrow(
        DerivedStatePersistAttemptException,
      );
    });

    it('strictly rejects attempting to persist EventTable derived states (FULL, PARTIAL, EMPTY)', () => {
      expect(() => guard.assertNotDerivedState('FULL', 'EventTable')).toThrow(
        DerivedStatePersistAttemptException,
      );
      expect(() => guard.assertNotDerivedState('PARTIAL', 'EventTable')).toThrow(
        DerivedStatePersistAttemptException,
      );
      expect(() => guard.assertNotDerivedState('EMPTY', 'EventTable')).toThrow(
        DerivedStatePersistAttemptException,
      );
    });

    it('strictly rejects attempting to persist ThermoRequest derived states (LOCKED, AVAILABLE)', () => {
      expect(() => guard.assertNotDerivedState('LOCKED', 'ThermoRequest')).toThrow(
        DerivedStatePersistAttemptException,
      );
      expect(() => guard.assertNotDerivedState('AVAILABLE', 'ThermoRequest')).toThrow(
        DerivedStatePersistAttemptException,
      );
    });

    it('throws DerivedStatePersistAttemptException when targetState in assertTransition is derived', () => {
      expect(() =>
        guard.assertTransition({
          entity: 'ThermoRequest',
          currentState: ThermoOperationalStatus.REQUESTED,
          targetState: 'LOCKED',
          actor: 'ADMIN',
        }),
      ).toThrow(DerivedStatePersistAttemptException);
    });
  });
});
