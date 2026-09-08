import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as crypto from 'crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PaymentProvider, ProviderEventProcessingStatus } from '@prisma/client';

jest.setTimeout(60000);

describe('Integrations & Webhooks Pipeline (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mpSecret = 'default-mp-webhook-secret-min32chars';
  const openPaySecret = 'default-openpay-webhook-secret';
  const openPayMerchantId = 'm-sandbox-default';

  const cleanupEventIds: string[] = [];

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

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    if (cleanupEventIds.length > 0) {
      await prisma.paymentProviderEvent.deleteMany({
        where: {
          id: { in: cleanupEventIds },
        },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('1. Mercado Pago Webhook Pipeline', () => {
    it('rejects webhook without x-signature header with 401 UNAUTHENTICATED', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/webhooks/mercado-pago')
        .send({
          id: 'mp-test-no-sig',
          action: 'payment.created',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('rejects webhook with invalid or tampered signature with 401 UNAUTHENTICATED', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/webhooks/mercado-pago')
        .set('x-signature', 'ts=1725800000,v1=invalid_tampered_hash_value')
        .send({
          id: 'mp-test-invalid-sig',
          action: 'payment.created',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('accepts and processes webhook with valid HMAC-SHA256 signature', async () => {
      const externalEventId = `mp-e2e-${Date.now()}`;
      const ts = Math.floor(Date.now() / 1000);
      const xRequestId = 'req-mp-e2e-1';

      const manifest = `id:${externalEventId};request-id:${xRequestId};ts:${ts};`;
      const validHash = crypto.createHmac('sha256', mpSecret).update(manifest).digest('hex');

      const res = await request(app.getHttpServer())
        .post('/api/v1/webhooks/mercado-pago')
        .set('x-signature', `ts=${ts},v1=${validHash}`)
        .set('x-request-id', xRequestId)
        .send({
          id: externalEventId,
          action: 'payment.created',
          data: { id: externalEventId },
        })
        .expect(200);

      expect(res.body).toHaveProperty('received', true);
      expect(res.body).toHaveProperty('externalEventId', externalEventId);

      // Verify record exists in database
      const dbRecord = await prisma.paymentProviderEvent.findUnique({
        where: {
          provider_external_event_id: {
            provider: PaymentProvider.MERCADO_PAGO,
            external_event_id: externalEventId,
          },
        },
      });

      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.processing_status).toBe(ProviderEventProcessingStatus.PROCESSED);
      if (dbRecord) cleanupEventIds.push(dbRecord.id);

      // Re-send EXACT SAME webhook (deduplication check)
      const duplicateRes = await request(app.getHttpServer())
        .post('/api/v1/webhooks/mercado-pago')
        .set('x-signature', `ts=${ts},v1=${validHash}`)
        .set('x-request-id', xRequestId)
        .send({
          id: externalEventId,
          action: 'payment.created',
          data: { id: externalEventId },
        })
        .expect(200);

      expect(duplicateRes.body).toHaveProperty('status', 'ALREADY_PROCESSED');
      expect(duplicateRes.body).toHaveProperty('externalEventId', externalEventId);
    });
  });

  describe('2. OpenPay Webhook Pipeline', () => {
    it('rejects webhook without auth header with 401 UNAUTHENTICATED', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/webhooks/openpay')
        .send({
          id: 'op-test-no-auth',
          type: 'charge.succeeded',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('accepts and processes webhook with valid Basic Auth credentials', async () => {
      const externalEventId = `op-e2e-${Date.now()}`;
      const token = Buffer.from(`${openPayMerchantId}:${openPaySecret}`).toString('base64');

      const res = await request(app.getHttpServer())
        .post('/api/v1/webhooks/openpay')
        .set('authorization', `Basic ${token}`)
        .send({
          id: externalEventId,
          type: 'charge.succeeded',
          transaction: { id: externalEventId },
        })
        .expect(200);

      expect(res.body).toHaveProperty('received', true);
      expect(res.body).toHaveProperty('externalEventId', externalEventId);

      const dbRecord = await prisma.paymentProviderEvent.findUnique({
        where: {
          provider_external_event_id: {
            provider: PaymentProvider.OPENPAY,
            external_event_id: externalEventId,
          },
        },
      });

      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.processing_status).toBe(ProviderEventProcessingStatus.PROCESSED);
      if (dbRecord) cleanupEventIds.push(dbRecord.id);

      // Re-send EXACT SAME webhook (deduplication check)
      const duplicateRes = await request(app.getHttpServer())
        .post('/api/v1/webhooks/openpay')
        .set('authorization', `Basic ${token}`)
        .send({
          id: externalEventId,
          type: 'charge.succeeded',
          transaction: { id: externalEventId },
        })
        .expect(200);

      expect(duplicateRes.body).toHaveProperty('status', 'ALREADY_PROCESSED');
    });
  });

  describe('3. Return URL Security Invariant', () => {
    it('rejects payment confirmation attempt via return URL with 400 RETURN_URL_CANNOT_CONFIRM_PAYMENT', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/webhooks/return?collection_status=approved&payment_id=123456')
        .expect(400);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('RETURN_URL_CANNOT_CONFIRM_PAYMENT');
      expect(res.body.error.message).toContain('URL de retorno no puede confirmar pagos');
    });
  });
});
