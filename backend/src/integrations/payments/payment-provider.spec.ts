import { MercadoPagoAdapter } from './mercado-pago.adapter';
import { OpenPayAdapter } from './openpay.adapter';
import * as crypto from 'crypto';
import { DependencyUnavailableException } from '../../common/errors/domain-exceptions';

describe('Payment Providers Contract (Unit)', () => {
  let mpAdapter: MercadoPagoAdapter;
  let openPayAdapter: OpenPayAdapter;

  beforeEach(() => {
    mpAdapter = new MercadoPagoAdapter();
    openPayAdapter = new OpenPayAdapter();
  });

  describe('1. Mercado Pago Adapter', () => {
    it('normalizes status correctly across raw provider responses', () => {
      expect(mpAdapter.normalizeStatus('approved')).toBe('CONFIRMED');
      expect(mpAdapter.normalizeStatus('in_process')).toBe('PENDING');
      expect(mpAdapter.normalizeStatus('pending')).toBe('PENDING');
      expect(mpAdapter.normalizeStatus('authorized')).toBe('PENDING');
      expect(mpAdapter.normalizeStatus('rejected')).toBe('FAILED');
      expect(mpAdapter.normalizeStatus('cancelled')).toBe('CANCELLED');
      expect(mpAdapter.normalizeStatus('refunded')).toBe('REFUNDED');
      expect(mpAdapter.normalizeStatus('charged_back')).toBe('REFUNDED');
      expect(mpAdapter.normalizeStatus('unknown_status')).toBe('PENDING');
    });

    it('rejects webhook when x-signature header is missing', async () => {
      const result = await mpAdapter.verifyWebhook({
        rawPayload: { id: 'mp-123' },
        headers: {},
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Missing x-signature header');
    });

    it('rejects webhook when x-signature header is malformed', async () => {
      const result = await mpAdapter.verifyWebhook({
        rawPayload: { id: 'mp-123' },
        headers: { 'x-signature': 'not-a-valid-ts-v1-header' },
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Malformed x-signature header parts');
    });

    it('rejects webhook when timestamp has expired (> 5 min drift)', async () => {
      const oldTs = Math.floor(Date.now() / 1000) - 400; // 400 seconds ago
      const result = await mpAdapter.verifyWebhook({
        rawPayload: { id: 'mp-123' },
        headers: { 'x-signature': `ts=${oldTs},v1=fakehash` },
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Webhook timestamp expired');
    });

    it('validates authentic webhook with matching HMAC signature', async () => {
      const ts = Math.floor(Date.now() / 1000);
      const dataId = '9876543210';
      const xRequestId = 'req-mp-123';
      const secret = 'default-mp-webhook-secret-min32chars';

      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
      const validHash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

      const result = await mpAdapter.verifyWebhook({
        rawPayload: { id: 'evt-1', data: { id: dataId }, action: 'payment.created' },
        headers: {
          'x-signature': `ts=${ts},v1=${validHash}`,
          'x-request-id': xRequestId,
        },
      });

      expect(result.isValid).toBe(true);
      expect(result.providerPaymentId).toBe(dataId);
      expect(result.eventType).toBe('payment.created');
    });

    it('maps network timeout or service error to DEPENDENCY_UNAVAILABLE (503)', async () => {
      await expect(mpAdapter.getPayment('timeout-simulated-payment')).rejects.toThrow(
        DependencyUnavailableException,
      );
    });

    it('creates preference payment and normalizes output', async () => {
      const result = await mpAdapter.createPayment({
        attemptId: 'att-uuid-1',
        amount: '1500.00',
        description: 'Boleto Graduación',
        payerEmail: 'graduado@ejemplo.com',
      });

      expect(result.providerPaymentId).toBeDefined();
      expect(result.checkoutUrl).toContain('mercadopago.com');
      expect(result.normalizedStatus).toBe('PENDING');
    });
  });

  describe('2. OpenPay Adapter', () => {
    it('normalizes status correctly across raw OpenPay charge responses', () => {
      expect(openPayAdapter.normalizeStatus('completed')).toBe('CONFIRMED');
      expect(openPayAdapter.normalizeStatus('in_progress')).toBe('PENDING');
      expect(openPayAdapter.normalizeStatus('charge_pending')).toBe('PENDING');
      expect(openPayAdapter.normalizeStatus('failed')).toBe('FAILED');
      expect(openPayAdapter.normalizeStatus('cancelled')).toBe('CANCELLED');
      expect(openPayAdapter.normalizeStatus('refunded')).toBe('REFUNDED');
      expect(openPayAdapter.normalizeStatus('unknown')).toBe('PENDING');
    });

    it('rejects webhook when authorization and signature headers are missing', async () => {
      const result = await openPayAdapter.verifyWebhook({
        rawPayload: { id: 'op-123' },
        headers: {},
      });

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Missing signature or authorization header');
    });

    it('validates authentic webhook with matching Basic Auth credentials', async () => {
      const merchantId = 'm-sandbox-default';
      const secret = 'default-openpay-webhook-secret';
      const token = Buffer.from(`${merchantId}:${secret}`).toString('base64');

      const result = await openPayAdapter.verifyWebhook({
        rawPayload: {
          id: 'op-ev-1',
          type: 'charge.succeeded',
          transaction: { id: 'tr-9988' },
        },
        headers: {
          authorization: `Basic ${token}`,
        },
      });

      expect(result.isValid).toBe(true);
      expect(result.providerPaymentId).toBe('tr-9988');
      expect(result.eventType).toBe('charge.succeeded');
    });

    it('validates authentic webhook with matching HMAC signature header', async () => {
      const secret = 'default-openpay-webhook-secret';
      const payload = { id: 'op-ev-hmac', type: 'charge.succeeded' };
      const computed = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

      const result = await openPayAdapter.verifyWebhook({
        rawPayload: payload,
        headers: {
          'x-openpay-signature': computed,
        },
      });

      expect(result.isValid).toBe(true);
      expect(result.externalEventId).toBe('op-ev-hmac');
    });

    it('maps network timeout or service error to DEPENDENCY_UNAVAILABLE (503)', async () => {
      await expect(openPayAdapter.getPayment('timeout-simulated-payment')).rejects.toThrow(
        DependencyUnavailableException,
      );
    });

    it('creates payment charge intent and normalizes output', async () => {
      const result = await openPayAdapter.createPayment({
        attemptId: 'att-uuid-2',
        amount: '2000.00',
        description: 'Paquete Cena Adulto',
        payerEmail: 'graduado2@ejemplo.com',
      });

      expect(result.providerPaymentId).toBeDefined();
      expect(result.checkoutUrl).toContain('openpay.mx');
      expect(result.normalizedStatus).toBe('PENDING');
    });
  });
});
