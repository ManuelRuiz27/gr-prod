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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const requestId =
      request.requestId ||
      (request.headers['x-request-id'] as string) ||
      randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Ha ocurrido un error inesperado.';
    let details: any = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorCode = this.mapStatusToErrorCode(status);
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, any>;
        errorCode = resp.error_code || resp.code || this.mapStatusToErrorCode(status);
        message = resp.message || exception.message;

        if (Array.isArray(resp.message)) {
          // ValidationPipe errors
          errorCode = 'VALIDATION_ERROR';
          message = 'Error de validación en la solicitud';
          details = { validation_errors: resp.message };
        } else if (resp.details) {
          details = resp.details;
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

    const errorPayload = {
      request_id: requestId,
      error: {
        code: errorCode,
        message: Array.isArray(message) ? message.join('; ') : message,
        details: details || {},
        request_id: requestId,
      },
    };

    response.status(status).json(errorPayload);
  }

  private mapStatusToErrorCode(status: number): string {
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
