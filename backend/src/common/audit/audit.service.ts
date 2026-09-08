import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditActorType, Prisma, AuditLog } from '@prisma/client';

export interface AuditLogParams {
  eventId?: string | null;
  actorAccountId?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  actorType?: AuditActorType;
  action: string;
  resourceType?: string;
  entityType?: string;
  resourceId?: string;
  entityId?: string;
  description?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  diff?: unknown;
  reason?: string | null;
  requestId?: string | null;
}

export type AuditLogInput = AuditLogParams;

const SENSITIVE_KEY_PATTERNS = [
  'password',
  'password_hash',
  'passwordhash',
  'salt',
  'pin',
  'token',
  'access_token',
  'accesstoken',
  'refresh_token',
  'refreshtoken',
  'reset_token',
  'resettoken',
  'jwt',
  'secret',
  'webhook_secret',
  'webhooksecret',
  'api_key',
  'apikey',
  'client_secret',
  'private_key',
  'privatekey',
  'code_hash',
  'codehash',
  'pan',
  'cvv',
  'card_number',
  'cardnumber',
  'security_code',
  'signed_url',
  'signedurl',
];

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Recursively sanitizes data to prevent leaking secrets, credentials, or PII into audit trails.
 */
export function sanitizeAuditData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeAuditData(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
    const isSensitive = SENSITIVE_KEY_PATTERNS.some(
      (pattern) => normalizedKey === pattern.replace(/[-_]/g, '') || normalizedKey.includes(pattern.replace(/[-_]/g, '')),
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAuditData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persists an audit log entry atomically within an existing database transaction.
   * INVARIANT: If the transaction rolls back, this audit log also rolls back.
   */
  async logTransactional(
    tx: Prisma.TransactionClient,
    params: AuditLogInput,
  ): Promise<AuditLog> {
    const actorId = params.actorId || params.actorAccountId || null;
    const actorType =
      params.actorType || (actorId ? AuditActorType.ACCOUNT : AuditActorType.SYSTEM);
    const actorName =
      params.actorName || (actorId ? 'Usuario' : 'Sistema');

    const entityType = params.entityType || params.resourceType || 'UNKNOWN';
    const entityId = params.entityId || params.resourceId || 'GLOBAL';

    let formattedDiff: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput = Prisma.JsonNull;
    if (params.before !== undefined || params.after !== undefined) {
      formattedDiff = {
        before: sanitizeAuditData(params.before ?? null),
        after: sanitizeAuditData(params.after ?? null),
      } as Prisma.InputJsonValue;
    } else if (params.diff !== undefined && params.diff !== null) {
      formattedDiff = sanitizeAuditData(params.diff) as Prisma.InputJsonValue;
    }

    const validRequestId =
      params.requestId && UUID_REGEX.test(params.requestId) ? params.requestId : null;

    const description =
      params.description || `Acción ${params.action} ejecutada en ${entityType}`;

    return tx.auditLog.create({
      data: {
        event_id: params.eventId || null,
        actor_id: actorId,
        actor_type: actorType,
        actor_name: actorName,
        action: params.action,
        entity_type: entityType,
        entity_id: entityId,
        description,
        diff: formattedDiff,
        reason: params.reason || null,
        request_id: validRequestId,
      },
    });
  }

  /**
   * Records an audit log entry.
   * If a transaction client `tx` is provided, executes atomically within it.
   */
  async log(params: AuditLogInput, tx?: Prisma.TransactionClient): Promise<AuditLog | null> {
    if (tx) {
      return this.logTransactional(tx, params);
    }

    try {
      return await this.logTransactional(this.prisma, params);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to record audit log: ${errMsg}`);
      return null;
    }
  }
}

