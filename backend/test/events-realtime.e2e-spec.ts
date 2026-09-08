import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as http from 'http';
import { AddressInfo } from 'net';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { OutboxService } from '../src/common/outbox/outbox.service';
import { RealtimeService } from '../src/common/realtime/realtime.service';
import { EventName } from '../src/common/events/event-catalog';
import { OutboxStatus } from '@prisma/client';
import { firstValueFrom, take, toArray } from 'rxjs';

jest.setTimeout(60000);

describe('Events & Realtime SSE Engine (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let outboxService: OutboxService;
  let realtimeService: RealtimeService;

  let adminToken: string;
  let graduateToken: string;
  let baseUrl: string;

  const canonicalEventId = 'e0000000-0000-0000-0000-000000000001';
  const alienEventId = 'e0000000-0000-0000-0000-999999999999';

  const cleanupOutboxIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    outboxService = moduleFixture.get<OutboxService>(OutboxService);
    realtimeService = moduleFixture.get<RealtimeService>(RealtimeService);

    // Login admin
    const adminLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@plataformagr.com',
        password: 'AdminPass123!',
      });
    adminToken = adminLoginRes.body?.accessToken;

    // Login graduate
    const gradLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'andrea.martinez@ejemplo.com',
        password: 'GraduatePass123!',
      });
    graduateToken = gradLoginRes.body?.accessToken;
  }, 60000);

  afterAll(async () => {
    if (cleanupOutboxIds.length > 0) {
      await prisma.outboxEvent.deleteMany({
        where: { id: { in: cleanupOutboxIds } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  // =========================================================================
  // 1. SSE Connection & Authorization Tests
  // =========================================================================
  describe('1. SSE Endpoint Authorization & Access Control', () => {
    it('rejects unauthenticated request to /realtime/stream with 401 UNAUTHENTICATED', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/realtime/stream')
        .expect(401);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('rejects graduate requesting alien/non-belonging eventId with IDOR-safe 404', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/realtime/stream?eventId=${alienEventId}`)
        .set('Authorization', `Bearer ${graduateToken}`)
        .expect(404);

      expect(res.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('allows graduate requesting their valid eventId', async () => {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(
          `${baseUrl}/api/v1/realtime/stream?eventId=${canonicalEventId}`,
          {
            headers: {
              Authorization: `Bearer ${graduateToken}`,
            },
          },
          (res) => {
            try {
              expect(res.statusCode).toBe(200);
              expect(res.headers['content-type']).toContain('text/event-stream');
              res.destroy();
              resolve();
            } catch (err) {
              res.destroy();
              reject(err);
            }
          },
        );
        req.on('error', (err: any) => {
          if (err.code === 'ECONNRESET' || req.destroyed) {
            resolve();
          } else {
            reject(err);
          }
        });
      });
    });

    it('allows admin requesting any valid eventId', async () => {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(
          `${baseUrl}/api/v1/realtime/stream?eventId=${canonicalEventId}`,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          },
          (res) => {
            try {
              expect(res.statusCode).toBe(200);
              expect(res.headers['content-type']).toContain('text/event-stream');
              res.destroy();
              resolve();
            } catch (err) {
              res.destroy();
              reject(err);
            }
          },
        );
        req.on('error', (err: any) => {
          if (err.code === 'ECONNRESET' || req.destroyed) {
            resolve();
          } else {
            reject(err);
          }
        });
      });
    });
  });

  // =========================================================================
  // 2. Transactional Outbox Pattern Tests
  // =========================================================================
  describe('2. Transactional Outbox Integrity', () => {
    it('persists OutboxEvent atomically inside a successful Prisma transaction', async () => {
      let createdEventId = '';

      await prisma.$transaction(async (tx) => {
        const outbox = await outboxService.publishTransactional(
          tx,
          EventName.EVENT_UPDATED,
          {
            eventId: canonicalEventId,
            newStatus: 'OPEN',
          },
        );
        createdEventId = outbox.id;
        cleanupOutboxIds.push(outbox.id);
      });

      expect(createdEventId).toBeDefined();

      const found = await prisma.outboxEvent.findUnique({
        where: { id: createdEventId },
      });

      expect(found).not.toBeNull();
      expect(found?.status).toBe(OutboxStatus.PENDING);
      expect(found?.event_type).toBe(EventName.EVENT_UPDATED);
      expect(found?.attempts).toBe(0);
    });

    it('ensures rollback in business transaction completely removes OutboxEvent', async () => {
      const fakeEventId = 'temp-ev-should-not-exist';

      try {
        await prisma.$transaction(async (tx) => {
          await outboxService.publishTransactional(
            tx,
            EventName.CONTRACT_CANCELLED,
            { fakeId: fakeEventId },
          );
          // Force transaction abort
          throw new Error('Forced transaction rollback simulation');
        });
      } catch (err: any) {
        expect(err.message).toBe('Forced transaction rollback simulation');
      }

      // Query database to ensure no outbox record was written
      const found = await prisma.outboxEvent.findFirst({
        where: {
          payload: {
            path: ['fakeId'],
            equals: fakeEventId,
          },
        },
      });

      expect(found).toBeNull();
    });

    it('dispatches pending events and transitions status to PUBLISHED', async () => {
      let eventId = '';

      await prisma.$transaction(async (tx) => {
        const ev = await outboxService.publishTransactional(
          tx,
          EventName.THERMO_UPDATED,
          {
            eventId: canonicalEventId,
            status: 'DELIVERED',
          },
        );
        eventId = ev.id;
        cleanupOutboxIds.push(ev.id);
      });

      // Dispatch pending events
      const result = await outboxService.dispatchPendingEvents(50);
      expect(result.processed).toBeGreaterThanOrEqual(1);
      expect(result.published).toBeGreaterThanOrEqual(1);

      // Verify DB status is PUBLISHED
      const updated = await prisma.outboxEvent.findUnique({
        where: { id: eventId },
      });
      expect(updated?.status).toBe(OutboxStatus.PUBLISHED);
      expect(updated?.attempts).toBe(1);

      // Idempotent re-dispatch: executing dispatch again does not re-process the PUBLISHED event
      const secondDispatch = await outboxService.dispatchPendingEvents(50);
      expect(secondDispatch.processed).toBe(0);
      const reChecked = await prisma.outboxEvent.findUnique({
        where: { id: eventId },
      });
      expect(reChecked?.attempts).toBe(1); // Attempts did not increment
    });
  });

  // =========================================================================
  // 3. Realtime Stream Delivery, Authorization & Privacy Tests
  // =========================================================================
  describe('3. Realtime Stream Delivery, Cross-User Isolation & Privacy', () => {
    it('streams events to authorized graduate and blocks third-party private events', async () => {
      const graduateAccountId = 'a0000000-0000-0000-0000-000000000002'; // Andrea
      const alienAccountId = 'a0000000-0000-0000-0000-999999999999';

      const gradStream$ = realtimeService.getStreamForActor({
        id: graduateAccountId,
        role: 'GRADUATE',
        eventId: canonicalEventId,
      });

      const receivedPromise = firstValueFrom(gradStream$.pipe(take(2), toArray()));

      // 1. Broadcast event for Andrea (Authorized)
      realtimeService.broadcast({
        id: 'outbox-andrea-1',
        event_type: EventName.PAYMENT_SUBMISSION_APPROVED,
        payload: {
          eventId: canonicalEventId,
          accountId: graduateAccountId,
          submissionId: 'sub-andrea-1',
          amount: '3000.00',
        },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
        last_attempt_at: new Date(),
        created_at: new Date(),
      });

      // 2. Broadcast event for Alien User (MUST BE FILTERED OUT!)
      realtimeService.broadcast({
        id: 'outbox-alien-1',
        event_type: EventName.PAYMENT_SUBMISSION_APPROVED,
        payload: {
          eventId: canonicalEventId,
          accountId: alienAccountId,
          submissionId: 'sub-alien-private',
          amount: '99999.00',
        },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
        last_attempt_at: new Date(),
        created_at: new Date(),
      });

      // 3. Broadcast public seating occupancy change (Authorized for all in event)
      realtimeService.broadcast({
        id: 'outbox-seating-public',
        event_type: EventName.TABLE_ASSIGNMENT_CHANGED,
        payload: {
          eventId: canonicalEventId,
          tableId: 'tbl-12',
          occupied: 5,
          available: 5,
          status: 'AVAILABLE',
          // Maliciously injected PII that MUST BE STRIPPED
          graduateName: 'Juan Carlos',
          password_hash: 'secretHash123',
        },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
        last_attempt_at: new Date(),
        created_at: new Date(),
      });

      const events = await receivedPromise;
      expect(events).toHaveLength(2);

      // Event 1: Andrea payment
      expect(events[0].type).toBe(EventName.PAYMENT_SUBMISSION_APPROVED);
      const data0 = JSON.parse(events[0].data);
      expect(data0.submissionId).toBe('sub-andrea-1');

      // Event 2: Public seating (with stripped PII)
      expect(events[1].type).toBe(EventName.TABLE_ASSIGNMENT_CHANGED);
      const data1 = JSON.parse(events[1].data);
      expect(data1.tableId).toBe('tbl-12');
      expect(data1.occupied).toBe(5);
      expect(data1.available).toBe(5);
      expect(data1).not.toHaveProperty('graduateName');
      expect(data1).not.toHaveProperty('password_hash');

      // Absolute assurance that alien submission was NEVER received
      const allSerialized = JSON.stringify(events);
      expect(allSerialized).not.toContain('sub-alien-private');
      expect(allSerialized).not.toContain('99999.00');
    });
  });
});
