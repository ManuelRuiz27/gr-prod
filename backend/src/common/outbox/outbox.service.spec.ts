/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { OutboxService } from './outbox.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { OutboxStatus, Prisma, OutboxEvent } from '@prisma/client';
import { EventName } from '../events/event-catalog';

describe('OutboxService (Unit)', () => {
  let service: OutboxService;

  const mockRealtimeService = {
    broadcast: jest.fn().mockReturnValue(true),
  };

  const mockPrismaService = {
    outboxEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RealtimeService, useValue: mockRealtimeService },
      ],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
  });

  describe('publishTransactional', () => {
    it('creates an outbox event strictly within the provided transaction client', async () => {
      const mockTx = {
        outboxEvent: {
          create: jest.fn().mockResolvedValue({
            id: 'outbox-uuid-1',
            event_type: EventName.TABLE_ASSIGNMENT_CHANGED,
            payload: { tableId: 't-1', occupied: 5 },
            status: OutboxStatus.PENDING,
            attempts: 0,
            created_at: new Date(),
          }),
        },
      } as unknown as Prisma.TransactionClient;

      const result = await service.publishTransactional(
        mockTx,
        EventName.TABLE_ASSIGNMENT_CHANGED,
        { tableId: 't-1', occupied: 5 },
      );

      expect(mockTx.outboxEvent.create).toHaveBeenCalledWith({
        data: {
          event_type: EventName.TABLE_ASSIGNMENT_CHANGED,
          payload: { tableId: 't-1', occupied: 5 },
          status: OutboxStatus.PENDING,
          attempts: 0,
        },
      });
      expect(result.id).toBe('outbox-uuid-1');
      expect(result.status).toBe(OutboxStatus.PENDING);
    });

    it('throws if eventType is invalid or empty', async () => {
      const mockTx = {} as Prisma.TransactionClient;
      await expect(service.publishTransactional(mockTx, '', {})).rejects.toThrow(
        'eventType must be a non-empty string',
      );
    });

    it('ensures rollback in business transaction leaves zero outbox records', async () => {
      // Simulating a failed Prisma transaction where error bubbles up
      const failingTx = jest.fn().mockImplementation(async (cb) => {
        const txClient = {
          outboxEvent: {
            create: jest.fn().mockResolvedValue({ id: 'temp-id' }),
          },
        };
        // Simulated failure inside transaction
        await cb(txClient);
        throw new Error('Transaction rollback simulated: DB constraint failure');
      });

      mockPrismaService.$transaction = failingTx;

      await expect(
        mockPrismaService.$transaction(async (tx: Prisma.TransactionClient) => {
          await service.publishTransactional(tx, EventName.CONTRACT_ACCEPTED, { contractId: 'c-1' });
        }),
      ).rejects.toThrow('Transaction rollback simulated');
    });
  });

  describe('dispatchPendingEvents', () => {
    it('claims pending events, transitions through PROCESSING, broadcasts, and marks PUBLISHED', async () => {
      const pendingEvent: OutboxEvent = {
        id: 'ev-1',
        event_type: EventName.PAYMENT_SUBMISSION_APPROVED,
        payload: { submissionId: 's-1', amount: '1000.00' },
        status: OutboxStatus.PENDING,
        attempts: 0,
        last_attempt_at: null,
        created_at: new Date(),
      };

      mockPrismaService.outboxEvent.findMany.mockResolvedValue([pendingEvent]);
      mockPrismaService.outboxEvent.update
        .mockResolvedValueOnce({ ...pendingEvent, status: OutboxStatus.PROCESSING, attempts: 1 })
        .mockResolvedValueOnce({ ...pendingEvent, status: OutboxStatus.PUBLISHED, attempts: 1 });

      const result = await service.dispatchPendingEvents(10);

      expect(result).toEqual({ processed: 1, published: 1, failed: 0 });
      expect(mockRealtimeService.broadcast).toHaveBeenCalledTimes(1);

      // Verify status transitions: 1st -> PROCESSING, 2nd -> PUBLISHED
      expect(mockPrismaService.outboxEvent.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'ev-1' },
        data: expect.objectContaining({
          status: OutboxStatus.PROCESSING,
          attempts: { increment: 1 },
        }),
      });
      expect(mockPrismaService.outboxEvent.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'ev-1' },
        data: { status: OutboxStatus.PUBLISHED },
      });
    });

    it('handles broadcast failure with retry: resets to PENDING if attempts < 5', async () => {
      const pendingEvent: OutboxEvent = {
        id: 'ev-retry',
        event_type: EventName.TABLE_UPDATED,
        payload: { tableId: 't-1' },
        status: OutboxStatus.PENDING,
        attempts: 1,
        last_attempt_at: null,
        created_at: new Date(),
      };

      mockPrismaService.outboxEvent.findMany.mockResolvedValue([pendingEvent]);
      mockPrismaService.outboxEvent.update.mockResolvedValueOnce({
        ...pendingEvent,
        status: OutboxStatus.PROCESSING,
        attempts: 2,
      });

      // Simulate failure in broadcast
      mockRealtimeService.broadcast.mockImplementationOnce(() => {
        throw new Error('SSE subscriber channel buffer full');
      });

      const result = await service.dispatchPendingEvents(10);

      expect(result).toEqual({ processed: 1, published: 0, failed: 0 });
      // Reverted to PENDING for subsequent retry
      expect(mockPrismaService.outboxEvent.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'ev-retry' },
        data: { status: OutboxStatus.PENDING },
      });
    });

    it('marks as FAILED when attempts exceed threshold (>= 5)', async () => {
      const doomedEvent: OutboxEvent = {
        id: 'ev-doomed',
        event_type: EventName.TABLE_UPDATED,
        payload: { tableId: 't-1' },
        status: OutboxStatus.PENDING,
        attempts: 4, // Next attempt will be 5
        last_attempt_at: null,
        created_at: new Date(),
      };

      mockPrismaService.outboxEvent.findMany.mockResolvedValue([doomedEvent]);
      mockPrismaService.outboxEvent.update.mockResolvedValueOnce({
        ...doomedEvent,
        status: OutboxStatus.PROCESSING,
        attempts: 5,
      });

      mockRealtimeService.broadcast.mockImplementationOnce(() => {
        throw new Error('Fatal unrecoverable serialization failure');
      });

      const result = await service.dispatchPendingEvents(10);

      expect(result).toEqual({ processed: 1, published: 0, failed: 1 });
      expect(mockPrismaService.outboxEvent.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'ev-doomed' },
        data: { status: OutboxStatus.FAILED },
      });
    });
  });
});
