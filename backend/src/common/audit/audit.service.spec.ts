import { AuditService, sanitizeAuditData } from './audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditActorType, Prisma } from '@prisma/client';

describe('AuditService & Zero-Leakage Sanitizer (Unit)', () => {
  let auditService: AuditService;
  let mockPrismaService: {
    auditLog: {
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    mockPrismaService = {
      auditLog: {
        create: jest.fn().mockImplementation((args: { data: unknown }) =>
          Promise.resolve({
            id: 'audit-uuid-1',
            ...(args.data as Record<string, unknown>),
            created_at: new Date(),
          }),
        ),
      },
    };

    auditService = new AuditService(mockPrismaService as unknown as PrismaService);
  });

  describe('1. Zero-Leakage Sanitizer (sanitizeAuditData)', () => {
    it('redacts passwords, password hashes, and tokens', () => {
      const input = {
        name: 'Carlos Ruiz',
        email: 'carlos@ejemplo.com',
        password: 'PlainTextPassword123!',
        password_hash: '$2b$10$e8B9...secret',
        token: 'eyJh...token',
        access_token: 'auth-token',
        refresh_token: 'refresh-token',
        reset_token: 'reset-12345',
      };

      const result = sanitizeAuditData(input) as Record<string, unknown>;

      expect(result.name).toBe('Carlos Ruiz');
      expect(result.email).toBe('carlos@ejemplo.com');
      expect(result.password).toBe('[REDACTED]');
      expect(result.password_hash).toBe('[REDACTED]');
      expect(result.token).toBe('[REDACTED]');
      expect(result.access_token).toBe('[REDACTED]');
      expect(result.refresh_token).toBe('[REDACTED]');
      expect(result.reset_token).toBe('[REDACTED]');
    });

    it('redacts access codes, card numbers (PAN/CVV), and provider secrets', () => {
      const input = {
        event_code: 'EVT-1234',
        code_hash: 'hash-abc',
        card_number: '4111222233334444',
        cvv: '123',
        webhook_secret: 'whsec_99999',
        private_key: '-----BEGIN RSA PRIVATE KEY-----',
        signed_url: 'https://r2.storage.com/voucher.pdf?exp=123&sig=abcdef',
      };

      const result = sanitizeAuditData(input) as Record<string, unknown>;

      expect(result.code_hash).toBe('[REDACTED]');
      expect(result.card_number).toBe('[REDACTED]');
      expect(result.cvv).toBe('[REDACTED]');
      expect(result.webhook_secret).toBe('[REDACTED]');
      expect(result.private_key).toBe('[REDACTED]');
      expect(result.signed_url).toBe('[REDACTED]');
    });

    it('recursively sanitizes deeply nested objects and arrays', () => {
      const input = {
        user: {
          profile: {
            auth: {
              password: 'nested-secret',
            },
          },
        },
        items: [
          { id: 1, secret: 'item-secret' },
          { id: 2, name: 'public item' },
        ],
      };

      const result = sanitizeAuditData(input) as any;

      expect(result.user.profile.auth.password).toBe('[REDACTED]');
      expect(result.items[0].secret).toBe('[REDACTED]');
      expect(result.items[0].id).toBe(1);
      expect(result.items[1].name).toBe('public item');
    });
  });

  describe('2. AuditService.logTransactional (ACID Integration)', () => {
    it('creates audit log record on tx client with sanitized diff and valid actor', async () => {
      const mockTx = {
        auditLog: {
          create: jest.fn().mockResolvedValue({ id: 'tx-audit-log-1' }),
        },
      } as unknown as Prisma.TransactionClient;

      await auditService.logTransactional(mockTx, {
        eventId: 'event-uuid-1',
        actorId: 'account-uuid-1',
        actorName: 'Administrador Principal',
        action: 'event.updated',
        entityType: 'Event',
        entityId: 'event-uuid-1',
        before: { name: 'Graduación Antigua', secret_key: 'sec-1' },
        after: { name: 'Graduación 2026', secret_key: 'sec-2' },
        reason: 'Actualización de nombre oficial',
        requestId: '11111111-2222-3333-4444-555555555555',
      });

      expect(mockTx.auditLog.create).toHaveBeenCalledWith({
        data: {
          event_id: 'event-uuid-1',
          actor_id: 'account-uuid-1',
          actor_type: AuditActorType.ACCOUNT,
          actor_name: 'Administrador Principal',
          action: 'event.updated',
          entity_type: 'Event',
          entity_id: 'event-uuid-1',
          description: 'Acción event.updated ejecutada en Event',
          diff: {
            before: { name: 'Graduación Antigua', secret_key: '[REDACTED]' },
            after: { name: 'Graduación 2026', secret_key: '[REDACTED]' },
          },
          reason: 'Actualización de nombre oficial',
          request_id: '11111111-2222-3333-4444-555555555555',
        },
      });
    });

    it('sets actor_type to SYSTEM when no actorId is provided', async () => {
      const mockTx = {
        auditLog: {
          create: jest.fn().mockResolvedValue({ id: 'tx-audit-log-2' }),
        },
      } as unknown as Prisma.TransactionClient;

      await auditService.logTransactional(mockTx, {
        action: 'cron.purged',
        entityType: 'SystemJob',
        entityId: 'JOB-99',
      });

      expect(mockTx.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actor_id: null,
            actor_type: AuditActorType.SYSTEM,
            actor_name: 'Sistema',
          }),
        }),
      );
    });

    it('converts non-UUID request_id to null to prevent postgres uuid cast errors', async () => {
      const mockTx = {
        auditLog: {
          create: jest.fn().mockResolvedValue({ id: 'tx-audit-log-3' }),
        },
      } as unknown as Prisma.TransactionClient;

      await auditService.logTransactional(mockTx, {
        action: 'test.action',
        entityType: 'Test',
        entityId: '1',
        requestId: 'invalid-non-uuid-request-id',
      });

      expect(mockTx.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            request_id: null,
          }),
        }),
      );
    });
  });

  describe('3. AuditService.log (Delegation)', () => {
    it('delegates to tx client when tx is passed', async () => {
      const mockTx = {
        auditLog: {
          create: jest.fn().mockResolvedValue({ id: 'delegated-log' }),
        },
      } as unknown as Prisma.TransactionClient;

      await auditService.log(
        {
          action: 'delegated.action',
          entityType: 'Delegated',
          entityId: 'del-1',
        },
        mockTx,
      );

      expect(mockTx.auditLog.create).toHaveBeenCalled();
      expect(mockPrismaService.auditLog.create).not.toHaveBeenCalled();
    });

    it('uses this.prisma when no tx is provided', async () => {
      await auditService.log({
        action: 'standalone.action',
        entityType: 'Standalone',
        entityId: 'std-1',
      });

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });
});
