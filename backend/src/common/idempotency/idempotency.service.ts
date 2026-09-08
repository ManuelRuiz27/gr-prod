import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IdempotencyState, Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  computePayloadHash(body: any): string {
    const serialized = JSON.stringify(body || {});
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  async acquireLock(
    key: string,
    scope: string,
    requestHash: string,
    ttlSeconds = 86400,
  ) {
    const existing = await this.prisma.idempotencyRecord.findUnique({
      where: {
        scope_key: {
          scope,
          key,
        },
      },
    });

    if (existing) {
      if (existing.state === IdempotencyState.COMPLETED) {
        return {
          status: 'CACHED',
          statusCode: existing.response_status || 200,
          body: existing.response_body,
        };
      }

      if (existing.state === IdempotencyState.PROCESSING) {
        throw new ConflictException({
          code: 'IDEMPOTENCY_IN_PROGRESS',
          message: 'Una solicitud idéntica está siendo procesada concurrentemente.',
        });
      }
    }

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const record = await this.prisma.idempotencyRecord.upsert({
      where: {
        scope_key: {
          scope,
          key,
        },
      },
      create: {
        scope,
        key,
        request_hash: requestHash,
        state: IdempotencyState.PROCESSING,
        expires_at: expiresAt,
      },
      update: {
        state: IdempotencyState.PROCESSING,
        request_hash: requestHash,
        expires_at: expiresAt,
      },
    });

    return { status: 'NEW', recordId: record.id };
  }

  async saveResponse(
    key: string,
    scope: string,
    statusCode: number,
    responseBody: any,
  ): Promise<void> {
    await this.prisma.idempotencyRecord.update({
      where: {
        scope_key: {
          scope,
          key,
        },
      },
      data: {
        state: IdempotencyState.COMPLETED,
        response_status: statusCode,
        response_body: responseBody !== undefined ? (responseBody as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }

  async markFailed(key: string, scope: string): Promise<void> {
    try {
      await this.prisma.idempotencyRecord.delete({
        where: {
          scope_key: {
            scope,
            key,
          },
        },
      });
    } catch {
      // Ignore cleanup error
    }
  }
}
