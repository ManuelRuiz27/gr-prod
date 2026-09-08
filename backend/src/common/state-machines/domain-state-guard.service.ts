import { Injectable, Logger } from '@nestjs/common';
import {
  EntityType,
  TransitionRequest,
  TransitionResult,
  EntityStatusMap,
  InvalidStateTransitionException,
  UnauthorizedTransitionActorException,
  TerminalStateException,
  DerivedStatePersistAttemptException,
  ReturnUrlCannotConfirmPaymentException,
  TransitionDefinition,
} from './state-machine.types';
import {
  PROHIBITED_DERIVED_STATES,
  EVENT_TRANSITIONS,
  EVENT_TERMINAL_STATES,
  MEMBERSHIP_TRANSITIONS,
  MEMBERSHIP_TERMINAL_STATES,
  CONTRACT_TRANSITIONS,
  CONTRACT_TERMINAL_STATES,
  CONTRACT_QUOTE_TRANSITIONS,
  CONTRACT_QUOTE_TERMINAL_STATES,
  PAYMENT_PLAN_TRANSITIONS,
  PAYMENT_PLAN_TERMINAL_STATES,
  PAYMENT_ATTEMPT_TRANSITIONS,
  PAYMENT_ATTEMPT_TERMINAL_STATES,
  PAYMENT_SUBMISSION_TRANSITIONS,
  PAYMENT_SUBMISSION_TERMINAL_STATES,
  CANCELLATION_POLICY_TRANSITIONS,
  CANCELLATION_POLICY_TERMINAL_STATES,
  CANCELLATION_QUOTE_TRANSITIONS,
  CANCELLATION_QUOTE_TERMINAL_STATES,
  REFUND_TRANSITIONS,
  REFUND_TERMINAL_STATES,
  THERMO_TRANSITIONS,
  THERMO_TERMINAL_STATES,
  EXPORT_JOB_TRANSITIONS,
  EXPORT_JOB_TERMINAL_STATES,
  RECONCILIATION_TRANSITIONS,
  RECONCILIATION_TERMINAL_STATES,
} from './state-machine.definitions';

@Injectable()
export class DomainStateGuardService {
  private readonly logger = new Logger(DomainStateGuardService.name);

  /**
   * Asserts that a requested state is not a prohibited derived state.
   * Throws DerivedStatePersistAttemptException if an invalid derived state is detected.
   */
  public assertNotDerivedState(stateName: string, _entityHint?: string): void {
    const upper = stateName.toUpperCase();
    if (PROHIBITED_DERIVED_STATES[upper]) {
      const info = PROHIBITED_DERIVED_STATES[upper];
      throw new DerivedStatePersistAttemptException(upper, info.entity, info.explanation);
    }
  }

  /**
   * Asserts that payment return URL is not attempting to confirm a payment attempt.
   */
  public assertReturnUrlCannotConfirm(callerSource?: string, attemptId?: string): void {
    if (callerSource === 'FRONTEND_RETURN_URL') {
      throw new ReturnUrlCannotConfirmPaymentException(attemptId);
    }
  }

  /**
   * Validates and asserts a transition across any of the 13 domain state machines.
   * Handles idempotency, actor authorization, terminal states and invariants.
   */
  public assertTransition<E extends EntityType>(
    request: TransitionRequest<E>,
  ): TransitionResult<E> {
    const { entity, currentState, targetState, actor, callerSource } = request;

    const rawTargetStr = String(targetState);
    const rawCurrentStr = String(currentState);

    // 1. Prohibit derived state persistence
    this.assertNotDerivedState(rawTargetStr, entity);

    // Canonical normalization for alias states
    let normalizedTarget = rawTargetStr;
    if (entity === 'PaymentPlan' && normalizedTarget === 'COMPLETED') {
      normalizedTarget = 'SETTLED';
    }
    if (entity === 'ContractLineItemQuote' && normalizedTarget === 'APPLIED') {
      normalizedTarget = 'USED';
    }

    let normalizedCurrent = rawCurrentStr;
    if (entity === 'PaymentPlan' && normalizedCurrent === 'COMPLETED') {
      normalizedCurrent = 'SETTLED';
    }
    if (entity === 'ContractLineItemQuote' && normalizedCurrent === 'APPLIED') {
      normalizedCurrent = 'USED';
    }

    // 2. Critical Invariant: Return URL NEVER confirms PaymentAttempt
    if (entity === 'PaymentAttempt' && normalizedTarget === 'CONFIRMED') {
      this.assertReturnUrlCannotConfirm(callerSource, request.entityId);
    }

    // 3. Idempotent check: same state requested
    if (normalizedCurrent === normalizedTarget) {
      return {
        success: true,
        entity,
        fromState: currentState,
        toState: currentState,
        isIdempotent: true,
      };
    }

    // 4. Terminal state enforcement
    if (this.isTerminalState(entity, normalizedCurrent)) {
      throw new TerminalStateException(entity, normalizedCurrent, normalizedTarget);
    }

    // 5. Look up valid transition definition
    const transitions = this.getTransitionsForEntity(entity);
    const validDef = transitions.find(
      (t) => (t.from === normalizedCurrent || t.from === '*') && t.to === normalizedTarget,
    );

    if (!validDef) {
      throw new InvalidStateTransitionException(
        entity,
        normalizedCurrent,
        normalizedTarget,
        request.reason,
      );
    }

    // 6. Actor authorization check
    if (!validDef.allowedActors.includes(actor)) {
      throw new UnauthorizedTransitionActorException(
        entity,
        actor,
        validDef.allowedActors,
        normalizedTarget,
      );
    }

    return {
      success: true,
      entity,
      fromState: currentState,
      toState: normalizedTarget as unknown as EntityStatusMap[E],
      isIdempotent: false,
      command: validDef.command,
    };
  }

  /**
   * Checks whether a state is terminal for a given entity.
   */
  public isTerminalState(entity: EntityType, state: string): boolean {
    const terminals = this.getTerminalStatesForEntity(entity);
    return terminals.includes(state);
  }

  /**
   * Retrieves all allowable transitions from a current state.
   */
  public getAllowedTransitions(entity: EntityType, currentState: string): TransitionDefinition<EntityType>[] {
    const transitions = this.getTransitionsForEntity(entity);
    return transitions.filter((t) => t.from === currentState || t.from === '*');
  }

  private getTransitionsForEntity(entity: EntityType): TransitionDefinition<EntityType>[] {
    switch (entity) {
      case 'Event':
        return EVENT_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'GraduateMembership':
        return MEMBERSHIP_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'GraduateContract':
        return CONTRACT_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'ContractLineItemQuote':
        return CONTRACT_QUOTE_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'PaymentPlan':
        return PAYMENT_PLAN_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'PaymentAttempt':
        return PAYMENT_ATTEMPT_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'PaymentSubmission':
        return PAYMENT_SUBMISSION_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'CancellationPolicy':
        return CANCELLATION_POLICY_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'CancellationQuote':
        return CANCELLATION_QUOTE_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'Refund':
        return REFUND_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'ThermoRequest':
        return THERMO_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'ExportJob':
        return EXPORT_JOB_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      case 'ReconciliationCase':
        return RECONCILIATION_TRANSITIONS as unknown as TransitionDefinition<EntityType>[];
      default:
        return [];
    }
  }

  private getTerminalStatesForEntity(entity: EntityType): string[] {
    switch (entity) {
      case 'Event':
        return EVENT_TERMINAL_STATES as string[];
      case 'GraduateMembership':
        return MEMBERSHIP_TERMINAL_STATES as string[];
      case 'GraduateContract':
        return CONTRACT_TERMINAL_STATES as string[];
      case 'ContractLineItemQuote':
        return CONTRACT_QUOTE_TERMINAL_STATES as string[];
      case 'PaymentPlan':
        return PAYMENT_PLAN_TERMINAL_STATES as string[];
      case 'PaymentAttempt':
        return PAYMENT_ATTEMPT_TERMINAL_STATES as string[];
      case 'PaymentSubmission':
        return PAYMENT_SUBMISSION_TERMINAL_STATES as string[];
      case 'CancellationPolicy':
        return CANCELLATION_POLICY_TERMINAL_STATES as string[];
      case 'CancellationQuote':
        return CANCELLATION_QUOTE_TERMINAL_STATES as string[];
      case 'Refund':
        return REFUND_TERMINAL_STATES as string[];
      case 'ThermoRequest':
        return THERMO_TERMINAL_STATES as string[];
      case 'ExportJob':
        return EXPORT_JOB_TERMINAL_STATES as string[];
      case 'ReconciliationCase':
        return RECONCILIATION_TERMINAL_STATES as string[];
      default:
        return [];
    }
  }
}
