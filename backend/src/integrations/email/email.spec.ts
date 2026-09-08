import { FakeEmailAdapter } from './fake-email.adapter';
import { EmailService } from './email.service';
import { OutboxService } from '../../common/outbox/outbox.service';
import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('Email Service Contract (Unit)', () => {
  let fakeAdapter: FakeEmailAdapter;
  let emailService: EmailService;
  let mockOutboxService: { publishTransactional: jest.Mock };

  beforeEach(() => {
    fakeAdapter = new FakeEmailAdapter();
    mockOutboxService = {
      publishTransactional: jest.fn().mockResolvedValue({ id: 'outbox-email-1' }),
    };
    emailService = new EmailService(fakeAdapter, mockOutboxService as unknown as OutboxService);
  });

  describe('1. FakeEmailAdapter & Zero-Leakage Token Masking', () => {
    it('dispatches regular email and records it in memory', async () => {
      const result = await fakeAdapter.sendEmail({
        to: 'test@ejemplo.com',
        subject: 'Prueba',
        html: '<p>Hola</p>',
      });

      expect(result.accepted).toBe(true);
      expect(result.messageId).toBeDefined();

      const sent = fakeAdapter.getSentEmails();
      expect(sent).toHaveLength(1);
      expect(sent[0].to).toBe('test@ejemplo.com');
      expect(sent[0].subject).toBe('Prueba');
    });

    it('sends password reset email and STRICTLY MASKS reset token in logger (Zero-Leakage)', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      const secretToken = 'super-secret-jwt-token-never-log-this-999';

      await fakeAdapter.sendPasswordResetEmail({
        to: 'estudiante@universidad.edu',
        name: 'Carlos Ruiz',
        resetToken: secretToken,
        resetUrl: `https://app.plataformagr.com/reset-password?token=${secretToken}`,
      });

      // Verify that the secret token is NEVER logged in cleartext
      const loggedMessages = loggerSpy.mock.calls.map((call) => call[0] as string);
      const leakedLog = loggedMessages.find((msg) => typeof msg === 'string' && msg.includes(secretToken));
      expect(leakedLog).toBeUndefined();

      // Verify that the masked token was logged instead
      const maskedLog = loggedMessages.find(
        (msg) => typeof msg === 'string' && msg.includes('***MASKED***'),
      );
      expect(maskedLog).toBeDefined();

      // Verify email was actually recorded
      const sent = fakeAdapter.getSentEmails();
      expect(sent).toHaveLength(1);
      expect(sent[0].to).toBe('estudiante@universidad.edu');
      expect(sent[0].html).toContain(secretToken); // Email recipient gets token link

      loggerSpy.mockRestore();
    });

    it('dispatches transactional notification', async () => {
      await fakeAdapter.sendTransactionalNotification({
        to: 'graduado@ejemplo.com',
        recipientName: 'Mariana Gomez',
        notificationType: 'PAYMENT_APPROVED',
        title: 'Comprobante de Pago Aprobado',
        body: 'Tu comprobante de $2,500.00 MXN ha sido validado exitosamente.',
      });

      const sent = fakeAdapter.getSentEmails();
      expect(sent).toHaveLength(1);
      expect(sent[0].subject).toContain('Comprobante de Pago Aprobado');
      expect(sent[0].html).toContain('Mariana Gomez');
    });
  });

  describe('2. EmailService & Transactional Outbox Integration', () => {
    it('emits OutboxEvent when transactional client is provided', async () => {
      const mockTx = {} as Prisma.TransactionClient;

      await emailService.sendPasswordResetEmail(
        {
          to: 'alumna@ejemplo.com',
          name: 'Sofia Torres',
          resetToken: 'token-abc',
          resetUrl: 'https://app.plataformagr.com/reset?token=token-abc',
        },
        mockTx,
      );

      expect(mockOutboxService.publishTransactional).toHaveBeenCalledWith(
        mockTx,
        'email.password_reset.v1',
        expect.objectContaining({
          to: 'alumna@ejemplo.com',
          name: 'Sofia Torres',
        }),
      );
    });
  });
});
