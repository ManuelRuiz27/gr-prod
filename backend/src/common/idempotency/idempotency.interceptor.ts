import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IdempotencyService } from './idempotency.service';
import { IDEMPOTENT_KEY } from './idempotent.decorator';
import { Response } from 'express';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const meta = this.reflector.get<{ required: boolean }>(
      IDEMPOTENT_KEY,
      context.getHandler(),
    );

    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse<Response>();

    const rawKey = req.headers['idempotency-key'];
    const idempotencyKey = Array.isArray(rawKey) ? rawKey[0] : rawKey;

    if (!idempotencyKey) {
      if (meta?.required) {
        throw new BadRequestException({
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'El encabezado Idempotency-Key es obligatorio para esta operación.',
        });
      }
      return next.handle();
    }

    const accountId = req.user?.id || req.user?.account_id || null;
    const scope = accountId ? `account:${accountId}` : 'anonymous';
    const requestHash = this.idempotencyService.computePayloadHash(req.body);

    const check = await this.idempotencyService.acquireLock(
      idempotencyKey,
      scope,
      requestHash,
    );

    if (check.status === 'CACHED') {
      res.status(check.statusCode);
      return of(check.body);
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        const statusCode = res.statusCode || 200;
        await this.idempotencyService.saveResponse(
          idempotencyKey,
          scope,
          statusCode,
          responseBody,
        );
      }),
      catchError((err) => {
        this.idempotencyService.markFailed(idempotencyKey, scope).catch(() => {});
        return throwError(() => err);
      }),
    );
  }
}
