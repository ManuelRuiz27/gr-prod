import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { OutboxEvent, OutboxStatus, Prisma } from '@prisma/client';

export interface DispatchResult {
  processed: number;
  published: number;
  failed: number;
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  /**
   * Persists an OutboxEvent strictly within an existing Prisma transaction.
   * Ensures atomicity: if business transaction aborts, OutboxEvent does not exist.
   */
  public async publishTransactional(
    tx: Prisma.TransactionClient,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<OutboxEvent> {
    if (!eventType || typeof eventType !== 'string') {
      throw new Error('eventType must be a non-empty string');
    }

    const event = await tx.outboxEvent.create({
      data: {
        event_type: eventType,
        payload: payload as Prisma.InputJsonValue,
        status: OutboxStatus.PENDING,
        attempts: 0,
      },
    });

    this.logger.debug(`Transactional outbox event created: ${eventType} (${event.id})`);
    return event;
  }

  /**
   * Claims and dispatches pending outbox events sequentially.
   * Applies at-least-once delivery semantics and retry backoff.
   */
  public async dispatchPendingEvents(batchSize = 20): Promise<DispatchResult> {
    const result: DispatchResult = {
      processed: 0,
      published: 0,
      failed: 0,
    };

    // Find pending events ordered by creation timestamp
    const pendingEvents = await this.prisma.outboxEvent.findMany({
      where: {
        status: OutboxStatus.PENDING,
      },
      orderBy: { created_at: 'asc' },
      take: batchSize,
    });

    if (pendingEvents.length === 0) {
      return result;
    }

    for (const event of pendingEvents) {
      result.processed++;

      // 1. Mark PROCESSING and increment attempts
      const updatedEvent = await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: OutboxStatus.PROCESSING,
          last_attempt_at: new Date(),
          attempts: { increment: 1 },
        },
      });

      try {
        // 2. Dispatch to subscribers / Realtime SSE bus
        this.realtimeService.broadcast(updatedEvent);

        // 3. Mark PUBLISHED on success
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: OutboxStatus.PUBLISHED,
          },
        });

        result.published++;
        this.logger.debug(`Outbox event published: ${event.event_type} (${event.id})`);
      } catch (err) {
        this.logger.error(`Failed to dispatch outbox event ${event.id}: ${String(err)}`);

        // If maximum retry threshold exceeded (>= 5), mark FAILED (dead-letter)
        if (updatedEvent.attempts >= 5) {
          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: { status: OutboxStatus.FAILED },
          });
          result.failed++;
        } else {
          // Revert to PENDING for subsequent retry
          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: { status: OutboxStatus.PENDING },
          });
        }
      }
    }

    return result;
  }

  /**
   * Returns count of currently pending events.
   */
  public async getPendingCount(): Promise<number> {
    return this.prisma.outboxEvent.count({
      where: { status: OutboxStatus.PENDING },
    });
  }

  /**
   * Retrieves an event by its unique ID.
   */
  public async getEventById(id: string): Promise<OutboxEvent | null> {
    return this.prisma.outboxEvent.findUnique({
      where: { id },
    });
  }
}
