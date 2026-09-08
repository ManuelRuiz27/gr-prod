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
import { HttpException, HttpStatus } from '@nestjs/common';

export type EntityType =
  | 'Event'
  | 'GraduateMembership'
  | 'GraduateContract'
  | 'ContractLineItemQuote'
  | 'PaymentPlan'
  | 'PaymentAttempt'
  | 'PaymentSubmission'
  | 'CancellationPolicy'
  | 'CancellationQuote'
  | 'Refund'
  | 'ThermoRequest'
  | 'ExportJob'
  | 'ReconciliationCase';

export type TransitionActor =
  | 'ADMIN'
  | 'GRADUATE'
  | 'SYSTEM'
  | 'GATEWAY_WEBHOOK';

export type EntityStatusMap = {
  Event: EventStatus;
  GraduateMembership: GraduateMembershipStatus;
  GraduateContract: ContractStatus;
  ContractLineItemQuote: ContractLineItemQuoteStatus | 'APPLIED';
  PaymentPlan: PaymentPlanStatus | 'COMPLETED';
  PaymentAttempt: PaymentAttemptStatus;
  PaymentSubmission: PaymentSubmissionStatus;
  CancellationPolicy: CancellationPolicyStatus;
  CancellationQuote: CancellationQuoteStatus;
  Refund: RefundStatus;
  ThermoRequest: ThermoOperationalStatus;
  ExportJob: ExportJobStatus;
  ReconciliationCase: ReconciliationCaseStatus | 'INVESTIGATING';
};

export interface TransitionDefinition<E extends EntityType> {
  from: EntityStatusMap[E] | '*';
  to: EntityStatusMap[E];
  command: string;
  allowedActors: TransitionActor[];
  isTerminal?: boolean;
  description?: string;
  preconditions?: string[];
  sideEffects?: string[];
}

export interface TransitionRequest<E extends EntityType> {
  entity: E;
  entityId?: string;
  currentState: EntityStatusMap[E];
  targetState: EntityStatusMap[E] | string;
  actor: TransitionActor;
  reason?: string;
  metadata?: Record<string, unknown>;
  callerSource?: 'WEBHOOK' | 'FRONTEND_RETURN_URL' | 'INTERNAL_COMMAND' | 'DIRECT_API';
}

export interface TransitionResult<E extends EntityType> {
  success: boolean;
  entity: E;
  fromState: EntityStatusMap[E];
  toState: EntityStatusMap[E];
  isIdempotent: boolean;
  command?: string;
}

// -------------------------------------------------------------
// Specialized State Machine Exceptions
// -------------------------------------------------------------

export class InvalidStateTransitionException extends HttpException {
  constructor(
    public readonly entity: EntityType,
    public readonly fromState: string,
    public readonly toState: string,
    public readonly reason?: string,
  ) {
    super(
      {
        code: 'INVALID_STATE_TRANSITION',
        message: `Transición no permitida para ${entity} de '${fromState}' hacia '${toState}'.`,
        details: { entity, fromState, toState, reason },
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class UnauthorizedTransitionActorException extends HttpException {
  constructor(
    public readonly entity: EntityType,
    public readonly actor: TransitionActor,
    public readonly allowedActors: TransitionActor[],
    public readonly targetState: string,
  ) {
    super(
      {
        code: 'UNAUTHORIZED_TRANSITION_ACTOR',
        message: `El actor '${actor}' no tiene autorización para transicionar ${entity} hacia '${targetState}'. Permitidos: ${allowedActors.join(', ')}.`,
        details: { entity, actor, allowedActors, targetState },
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class TerminalStateException extends HttpException {
  constructor(
    public readonly entity: EntityType,
    public readonly state: string,
    public readonly attemptedTarget: string,
  ) {
    super(
      {
        code: 'TERMINAL_STATE_VIOLATION',
        message: `No es posible modificar ${entity} en estado terminal '${state}'. No admite transición hacia '${attemptedTarget}'.`,
        details: { entity, terminalState: state, attemptedTarget },
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class DerivedStatePersistAttemptException extends HttpException {
  constructor(
    public readonly stateName: string,
    public readonly entity: string,
    public readonly explanation: string,
  ) {
    super(
      {
        code: 'CANNOT_PERSIST_DERIVED_STATE',
        message: `Violación de consistencia: '${stateName}' es un estado derivado de ${entity} y NUNCA debe persistirse en base de datos.`,
        details: { stateName, entity, explanation },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ReturnUrlCannotConfirmPaymentException extends HttpException {
  constructor(public readonly attemptId?: string) {
    super(
      {
        code: 'RETURN_URL_CANNOT_CONFIRM_PAYMENT',
        message: 'El return URL del cliente no tiene autoridad para confirmar pagos. La confirmación requiere verificación directa server-to-server o webhook firmado (BR-PAY-004).',
        details: { attemptId },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
