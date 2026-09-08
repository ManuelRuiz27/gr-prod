import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeService } from './realtime.service';
import { EventName } from '../events/event-catalog';
import { OutboxEvent, OutboxStatus } from '@prisma/client';
import { firstValueFrom, take, toArray } from 'rxjs';

describe('RealtimeService (Unit)', () => {
  let service: RealtimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeService],
    }).compile();

    service = module.get<RealtimeService>(RealtimeService);
  });

  describe('broadcast & sanitizePayload', () => {
    it('broadcasts valid realtime event and strips secrets', () => {
      const outboxEvent: OutboxEvent = {
        id: 'oe-1',
        event_type: EventName.CONTRACT_ACCEPTED,
        payload: {
          eventId: 'ev-1',
          accountId: 'acc-1',
          contractId: 'c-1',
          password_hash: '$2b$12$secretHashNotAllowedInStream',
          jwt_token: 'secretTokenValue',
        },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
        last_attempt_at: new Date(),
        created_at: new Date(),
      };

      const result = service.broadcast(outboxEvent);
      expect(result).toBe(true);

      const sanitized = service.sanitizePayload(outboxEvent.event_type, outboxEvent.payload as Record<string, unknown>);
      expect(sanitized).not.toHaveProperty('password_hash');
      expect(sanitized).not.toHaveProperty('jwt_token');
      expect(sanitized).toHaveProperty('contractId', 'c-1');
    });

    it('strictly sanitizes table_assignment.changed.v1 removing all graduate nominal PII', () => {
      const payload = {
        eventId: 'ev-1',
        tableId: 't-12',
        occupied: 7,
        available: 3,
        status: 'AVAILABLE',
        graduateName: 'Juan Perez',
        guestNames: ['Invitado 1', 'Invitado 2'],
        phone: '+525512345678',
      };

      const sanitized = service.sanitizePayload(EventName.TABLE_ASSIGNMENT_CHANGED, payload);

      expect(typeof sanitized.occurredAt).toBe('string');
      delete sanitized.occurredAt;
      expect(sanitized).toEqual({
        eventId: 'ev-1',
        tableId: 't-12',
        occupied: 7,
        available: 3,
        status: 'AVAILABLE',
      });
      expect(sanitized).not.toHaveProperty('graduateName');
      expect(sanitized).not.toHaveProperty('guestNames');
      expect(sanitized).not.toHaveProperty('phone');
    });
  });

  describe('isAuthorized & Stream Filtering', () => {
    const gradA = { id: 'acc-grad-a', role: 'GRADUATE', eventId: 'ev-1' };
    const gradB = { id: 'acc-grad-b', role: 'GRADUATE', eventId: 'ev-1' };
    const admin = { id: 'acc-admin', role: 'ADMIN', eventId: 'ev-1' };

    it('authorizes GRADUATE A to receive their own specific event', () => {
      const envelope = {
        id: 'msg-1',
        type: EventName.PAYMENT_SUBMISSION_APPROVED,
        timestamp: new Date().toISOString(),
        eventId: 'ev-1',
        targetAccountId: 'acc-grad-a',
        data: { submissionId: 'sub-1', amount: '1500.00' },
      };

      expect(service.isAuthorized(gradA, envelope)).toBe(true);
    });

    it('FORBIDS GRADUATE A from receiving GRADUATE B private payment event (cross-user isolation)', () => {
      const envelopeB = {
        id: 'msg-b',
        type: EventName.PAYMENT_SUBMISSION_APPROVED,
        timestamp: new Date().toISOString(),
        eventId: 'ev-1',
        targetAccountId: 'acc-grad-b',
        data: { submissionId: 'sub-b', amount: '9999.00' },
      };

      // Grad A MUST NOT receive Grad B's event
      expect(service.isAuthorized(gradA, envelopeB)).toBe(false);

      // Grad B MUST receive it
      expect(service.isAuthorized(gradB, envelopeB)).toBe(true);
    });

    it('allows both GRADUATE A and GRADUATE B to receive public table assignment events', () => {
      const seatingEnvelope = {
        id: 'msg-seat',
        type: EventName.TABLE_ASSIGNMENT_CHANGED,
        timestamp: new Date().toISOString(),
        eventId: 'ev-1',
        data: { tableId: 't-1', occupied: 4, available: 6 },
      };

      expect(service.isAuthorized(gradA, seatingEnvelope)).toBe(true);
      expect(service.isAuthorized(gradB, seatingEnvelope)).toBe(true);
      expect(service.isAuthorized(admin, seatingEnvelope)).toBe(true);
    });

    it('authorizes ADMIN to receive operational reconciliation events and blocks GRADUATE', () => {
      const reconEnvelope = {
        id: 'msg-recon',
        type: EventName.RECONCILIATION_CASE_CREATED,
        timestamp: new Date().toISOString(),
        eventId: 'ev-1',
        data: { caseId: 'rc-1', caseType: 'PAYMENT_CONFIRMED_CAPACITY_CONFLICT' },
      };

      expect(service.isAuthorized(admin, reconEnvelope)).toBe(true);
      expect(service.isAuthorized(gradA, reconEnvelope)).toBe(false);
      expect(service.isAuthorized(gradB, reconEnvelope)).toBe(false);
    });

    it('filters out events from a different eventId if actor subscribed with eventId filter', () => {
      const otherEventEnvelope = {
        id: 'msg-other',
        type: EventName.EVENT_UPDATED,
        timestamp: new Date().toISOString(),
        eventId: 'ev-DIFFERENT-999',
        data: { status: 'CLOSED' },
      };

      expect(service.isAuthorized(gradA, otherEventEnvelope)).toBe(false);
    });
  });

  describe('getStreamForActor (Reactive SSE stream)', () => {
    it('streams only authorized events to the subscriber', async () => {
      const gradA = { id: 'acc-grad-a', role: 'GRADUATE', eventId: 'ev-1' };
      const stream$ = service.getStreamForActor(gradA);

      // Listen for 2 authorized events and convert to promise
      const receivedPromise = firstValueFrom(stream$.pipe(take(2), toArray()));

      // 1. Emit event for Grad A (Authorized)
      service.broadcast({
        id: 'oe-a1',
        event_type: EventName.PAYMENT_PLAN_UPDATED,
        payload: { eventId: 'ev-1', accountId: 'acc-grad-a', totalAmount: '12000.00' },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
        last_attempt_at: new Date(),
        created_at: new Date(),
      });

      // 2. Emit event for Grad B (Must be filtered out!)
      service.broadcast({
        id: 'oe-b1',
        event_type: EventName.PAYMENT_PLAN_UPDATED,
        payload: { eventId: 'ev-1', accountId: 'acc-grad-b', totalAmount: '8000.00' },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
        last_attempt_at: new Date(),
        created_at: new Date(),
      });

      // 3. Emit public seating event (Authorized for all)
      service.broadcast({
        id: 'oe-seat',
        event_type: EventName.TABLE_ASSIGNMENT_CHANGED,
        payload: { eventId: 'ev-1', tableId: 'tbl-9', occupied: 8, available: 2 },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
        last_attempt_at: new Date(),
        created_at: new Date(),
      });

      const events = await receivedPromise;
      expect(events).toHaveLength(2);
      expect(events[0].type).toBe(EventName.PAYMENT_PLAN_UPDATED);
      expect(JSON.parse(events[0].data)).toMatchObject({ accountId: 'acc-grad-a' });
      expect(events[1].type).toBe(EventName.TABLE_ASSIGNMENT_CHANGED);
      expect(JSON.parse(events[1].data)).toMatchObject({ tableId: 'tbl-9' });
    });
  });
});
