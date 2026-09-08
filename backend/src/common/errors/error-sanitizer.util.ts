import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export interface SanitizedErrorResult {
  statusCode: number;
  code: string;
  message: string;
  details: Record<string, unknown>;
}

export class ErrorSanitizer {
  /**
   * Sanitizes any exception into a contract-compliant, zero-leakage payload.
   */
  public static sanitize(exception: unknown): SanitizedErrorResult {
    // 1. Check for NestJS HttpException
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return {
          statusCode,
          code: this.mapStatusToDefaultCode(statusCode),
          message: response,
          details: {},
        };
      }

      if (typeof response === 'object' && response !== null) {
        const respObj = response as Record<string, unknown>;

        // Resolve code
        let code = typeof respObj.code === 'string'
          ? respObj.code
          : typeof respObj.error_code === 'string'
            ? respObj.error_code
            : this.mapStatusToDefaultCode(statusCode);

        // Resolve message
        let message = 'Operación no completada.';
        let details: Record<string, unknown> = {};

        if (Array.isArray(respObj.message)) {
          // class-validator payload
          code = ErrorCode.VALIDATION_ERROR;
          message = 'Error de validación en la solicitud.';
          details = {
            validation_errors: respObj.message.map((m) => String(m)),
          };
        } else if (typeof respObj.message === 'string') {
          message = respObj.message;
        } else if (typeof exception.message === 'string') {
          message = exception.message;
        }

        if (typeof respObj.details === 'object' && respObj.details !== null && !Array.isArray(respObj.details)) {
          details = { ...details, ...this.sanitizeDetails(respObj.details as Record<string, unknown>) };
        }

        return {
          statusCode,
          code,
          message: this.sanitizePublicMessage(message, statusCode),
          details,
        };
      }
    }

    // 2. Check for Prisma Errors
    if (this.isPrismaError(exception)) {
      return this.sanitizePrismaError(exception as Record<string, unknown>);
    }

    // 3. Fallback: Unexpected / Unhandled Error (HTTP 500)
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Ha ocurrido un error interno en el servidor.',
      details: {},
    };
  }

  /**
   * Maps an HTTP Status to the canonical default error code.
   */
  public static mapStatusToDefaultCode(status: HttpStatus | number): string {
    switch (status as HttpStatus) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.INVALID_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHENTICATED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.RESOURCE_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ErrorCode.BUSINESS_INVARIANT_VIOLATION;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMITED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.DEPENDENCY_UNAVAILABLE;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }

  private static isPrismaError(e: unknown): boolean {
    if (!e || typeof e !== 'object') return false;
    const name = (e as { name?: string }).name || '';
    const constructorName = (e as { constructor?: { name?: string } }).constructor?.name || '';
    const code = (e as { code?: unknown }).code;
    return (
      name.startsWith('PrismaClient') ||
      constructorName.startsWith('PrismaClient') ||
      (typeof code === 'string' && code.startsWith('P'))
    );
  }

  private static sanitizePrismaError(err: Record<string, unknown>): SanitizedErrorResult {
    const prismaCode = typeof err.code === 'string' ? err.code : '';

    switch (prismaCode) {
      case 'P2002':
        // Unique constraint violation
        return {
          statusCode: HttpStatus.CONFLICT,
          code: ErrorCode.CONFLICT,
          message: 'El recurso ya existe o entra en conflicto con un registro existente.',
          details: {},
        };
      case 'P2025':
        // Record not found
        return {
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'El recurso solicitado no fue encontrado.',
          details: {},
        };
      case 'P2034':
        // Transaction failed due to write conflict / deadlock
        return {
          statusCode: HttpStatus.CONFLICT,
          code: ErrorCode.CONCURRENT_MODIFICATION,
          message: 'El registro fue modificado concurrentemente por otra operación. Reintente.',
          details: {},
        };
      case 'P1001':
      case 'P1002':
      case 'P1008':
        // Connection / timeout
        return {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          code: ErrorCode.DEPENDENCY_UNAVAILABLE,
          message: 'El servicio de base de datos no se encuentra disponible temporalmente.',
          details: {},
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Ha ocurrido un error interno en el servidor.',
          details: {},
        };
    }
  }

  /**
   * Cleans sensitive keys from details
   */
  private static sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
    const safe: Record<string, unknown> = {};
    const prohibitedSubstrings = [
      'password',
      'hash',
      'token',
      'secret',
      'key',
      'stack',
      'sql',
      'query',
      'path',
      'filename',
    ];

    for (const [k, v] of Object.entries(details)) {
      const lower = k.toLowerCase();
      if (prohibitedSubstrings.some((sub) => lower.includes(sub))) {
        continue;
      }
      if (typeof v === 'string' && (v.includes('SELECT ') || v.includes('INSERT ') || v.includes('UPDATE ') || v.includes('prisma'))) {
        continue;
      }
      safe[k] = v;
    }

    return safe;
  }

  /**
   * Guarantees that internal errors (500) never leak raw exception messages.
   */
  private static sanitizePublicMessage(msg: string, status: number): string {
    if (status >= 500) {
      return 'Ha ocurrido un error interno en el servidor.';
    }

    if (status === 401 && (!msg || msg === 'Unauthorized')) {
      return 'Autenticación requerida para acceder al recurso.';
    }

    const lower = msg.toLowerCase();
    if (
      lower.includes('prisma') ||
      lower.includes('select ') ||
      lower.includes('where ') ||
      lower.includes('table ') ||
      lower.includes('column ') ||
      lower.includes('at process') ||
      lower.includes('c:\\') ||
      lower.includes('/var/')
    ) {
      return 'Operación rechazada por inconsistencia técnica.';
    }

    return msg;
  }
}
