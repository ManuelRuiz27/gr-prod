import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithId } from '../middleware/request-id.middleware';
import { randomUUID } from 'crypto';

interface StandardErrorEnvelope {
  request_id: string;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
    request_id: string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const rawHeader = request?.headers ? request.headers['x-request-id'] : undefined;
    const headerRequestId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    const requestId =
      request?.requestId ||
      (typeof headerRequestId === 'string' && headerRequestId.trim().length > 0
        ? headerRequestId
        : randomUUID());

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Ha ocurrido un error inesperado.';
    let details: Record<string, unknown> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorCode = this.mapStatusToErrorCode(status);
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        const rawCode =
          typeof resp.error_code === 'string'
            ? resp.error_code
            : typeof resp.code === 'string'
              ? resp.code
              : undefined;
        errorCode = rawCode || this.mapStatusToErrorCode(status);

        if (typeof resp.message === 'string') {
          message = resp.message;
        } else if (Array.isArray(resp.message)) {
          errorCode = 'VALIDATION_ERROR';
          message = 'Error de validación en la solicitud';
          details = { validation_errors: resp.message };
        } else {
          message = exception.message;
        }

        if (
          typeof resp.details === 'object' &&
          resp.details !== null &&
          !Array.isArray(resp.details)
        ) {
          details = resp.details as Record<string, unknown>;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception [${requestId}]: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(`Unknown Exception [${requestId}]: ${JSON.stringify(exception)}`);
    }

    const errorPayload: StandardErrorEnvelope = {
      request_id: requestId,
      error: {
        code: errorCode,
        message,
        details,
        request_id: requestId,
      },
    };

    response.status(status).json(errorPayload);
  }

  private mapStatusToErrorCode(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_EXCEEDED';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
