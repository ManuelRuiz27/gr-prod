import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorCodeType } from './error-codes';

export interface DomainExceptionPayload {
  code: ErrorCodeType;
  message: string;
  details?: Record<string, unknown>;
}

export class BaseDomainException extends HttpException {
  constructor(payload: DomainExceptionPayload, status: HttpStatus) {
    super(
      {
        code: payload.code,
        message: payload.message,
        details: payload.details || {},
      },
      status,
    );
  }
}

// 400 Bad Request
export class InvalidRequestException extends BaseDomainException {
  constructor(message = 'Los datos de la solicitud no son válidos.', details?: Record<string, unknown>) {
    super({ code: ErrorCode.INVALID_REQUEST, message, details }, HttpStatus.BAD_REQUEST);
  }
}

export class IdempotencyKeyRequiredException extends BaseDomainException {
  constructor() {
    super(
      {
        code: ErrorCode.IDEMPOTENCY_KEY_REQUIRED,
        message: "Se requiere el encabezado 'Idempotency-Key' para esta operación.",
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

// 401 Unauthorized
export class UnauthenticatedException extends BaseDomainException {
  constructor(message = 'Acceso no autenticado. Inicie sesión para continuar.') {
    super({ code: ErrorCode.UNAUTHENTICATED, message }, HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidCredentialsException extends BaseDomainException {
  constructor(message = 'Credenciales de acceso incorrectas.') {
    super({ code: ErrorCode.INVALID_CREDENTIALS, message }, HttpStatus.UNAUTHORIZED);
  }
}

// 403 Forbidden
export class ForbiddenResourceException extends BaseDomainException {
  constructor(message = 'No cuenta con los privilegios requeridos para esta operación.') {
    super({ code: ErrorCode.FORBIDDEN, message }, HttpStatus.FORBIDDEN);
  }
}

export class AccountDisabledException extends BaseDomainException {
  constructor(message = 'Esta cuenta ha sido deshabilitada. Contacte a soporte.') {
    super({ code: ErrorCode.ACCOUNT_DISABLED, message }, HttpStatus.FORBIDDEN);
  }
}

export class OwnershipMismatchException extends BaseDomainException {
  constructor(message = 'No cuenta con acceso a los recursos de este evento.') {
    super({ code: ErrorCode.OWNERSHIP_MISMATCH, message }, HttpStatus.FORBIDDEN);
  }
}

// 404 Not Found
export class ResourceNotFoundException extends BaseDomainException {
  constructor(message = 'El recurso solicitado no fue encontrado.') {
    super({ code: ErrorCode.RESOURCE_NOT_FOUND, message }, HttpStatus.NOT_FOUND);
  }
}

export class EventNotFoundException extends BaseDomainException {
  constructor(message = 'El evento especificado no fue encontrado.') {
    super({ code: ErrorCode.EVENT_NOT_FOUND, message }, HttpStatus.NOT_FOUND);
  }
}

export class ContractNotFoundException extends BaseDomainException {
  constructor(message = 'No existe contrato asociado a la membresía.') {
    super({ code: ErrorCode.CONTRACT_NOT_FOUND, message }, HttpStatus.NOT_FOUND);
  }
}

// 409 Conflict
export class ConcurrentModificationException extends BaseDomainException {
  constructor(
    message = 'El registro fue modificado concurrentemente por otra operación. Reintente.',
    details?: Record<string, unknown>,
  ) {
    super({ code: ErrorCode.CONCURRENT_MODIFICATION, message, details }, HttpStatus.CONFLICT);
  }
}

export class TableCapacityChangedException extends BaseDomainException {
  constructor(
    message = 'La disponibilidad de la mesa cambió. Actualiza el croquis e intenta nuevamente.',
    details?: Record<string, unknown>,
  ) {
    super({ code: ErrorCode.TABLE_CAPACITY_CHANGED, message, details }, HttpStatus.CONFLICT);
  }
}

export class IdempotencyKeyReusedException extends BaseDomainException {
  constructor(
    message = 'La clave de idempotencia ya fue utilizada con una solicitud distinta.',
    details?: Record<string, unknown>,
  ) {
    super({ code: ErrorCode.IDEMPOTENCY_KEY_REUSED, message, details }, HttpStatus.CONFLICT);
  }
}

export class ContractAlreadyAcceptedException extends BaseDomainException {
  constructor(message = 'El contrato ya ha sido aceptado y no admite modificaciones.') {
    super({ code: ErrorCode.CONTRACT_ALREADY_ACCEPTED, message }, HttpStatus.CONFLICT);
  }
}

// 422 Unprocessable Entity
export class BusinessInvariantViolationException extends BaseDomainException {
  constructor(
    message = 'La operación no cumple con las políticas de negocio del evento.',
    details?: Record<string, unknown>,
  ) {
    super({ code: ErrorCode.BUSINESS_INVARIANT_VIOLATION, message, details }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class EventNotOperableException extends BaseDomainException {
  constructor(
    message = 'El evento no se encuentra en un estado operable para esta acción.',
    details?: Record<string, unknown>,
  ) {
    super({ code: ErrorCode.EVENT_NOT_OPERABLE, message, details }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class QuoteExpiredException extends BaseDomainException {
  constructor(message = 'La cotización de compra ha expirado. Por favor cotice nuevamente.') {
    super({ code: ErrorCode.QUOTE_EXPIRED, message }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class QuoteAlreadyUsedException extends BaseDomainException {
  constructor(message = 'La cotización ya fue consumida previamente.') {
    super({ code: ErrorCode.QUOTE_ALREADY_USED, message }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class PaymentSubmissionAlreadyReviewedException extends BaseDomainException {
  constructor(message = 'El comprobante de pago ya fue revisado con anterioridad.') {
    super({ code: ErrorCode.PAYMENT_SUBMISSION_ALREADY_REVIEWED, message }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class RefundNotAllowedException extends BaseDomainException {
  constructor(message = 'El reembolso solicitado excede el monto elegible disponible.') {
    super({ code: ErrorCode.REFUND_NOT_ALLOWED, message }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class MealOptionClassificationImmutableException extends BaseDomainException {
  constructor(message = 'No es posible eliminar ni cambiar drásticamente una opción de platillo ya seleccionada.') {
    super({ code: ErrorCode.MEAL_OPTION_CLASSIFICATION_IMMUTABLE, message }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

// 429 Rate Limited
export class RateLimitedException extends BaseDomainException {
  constructor(message = 'Límite de solicitudes alcanzado. Por favor intente más tarde.') {
    super({ code: ErrorCode.RATE_LIMITED, message }, HttpStatus.TOO_MANY_REQUESTS);
  }
}

// 503 Service Unavailable
export class DependencyUnavailableException extends BaseDomainException {
  constructor(message = 'Servicio temporalmente no disponible. Intente nuevamente en unos minutos.') {
    super({ code: ErrorCode.DEPENDENCY_UNAVAILABLE, message }, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
