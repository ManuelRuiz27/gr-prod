import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithId } from '../middleware/request-id.middleware';
import { randomUUID } from 'crypto';
import { ErrorSanitizer } from '../errors/error-sanitizer.util';

export interface CanonicalErrorEnvelope {
  error: {
    code: string;
    message: string;
    request_id: string;
    details: Record<string, unknown>;
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

    const sanitized = ErrorSanitizer.sanitize(exception);

    if (sanitized.statusCode >= 500) {
      if (exception instanceof Error) {
        this.logger.error(
          `[${requestId}] Internal Server Error: ${exception.message}`,
          exception.stack,
        );
      } else {
        this.logger.error(`[${requestId}] Unknown Exception: ${JSON.stringify(exception)}`);
      }
    } else if (exception instanceof HttpException) {
      this.logger.debug(
        `[${requestId}] HttpException [${sanitized.statusCode}] ${sanitized.code}: ${sanitized.message}`,
      );
    }

    if (response?.setHeader) {
      response.setHeader('X-Request-Id', requestId);
    }

    const envelope: CanonicalErrorEnvelope = {
      error: {
        code: sanitized.code,
        message: sanitized.message,
        request_id: requestId,
        details: sanitized.details,
      },
    };

    response.status(sanitized.statusCode).json(envelope);
  }
}
