import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditActorType, Prisma } from '@prisma/client';

export interface AuditLogParams {
  eventId?: string;
  actorAccountId?: string;
  actorName?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  description?: string;
  diff?: any;
  reason?: string;
  requestId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          event_id: params.eventId || null,
          actor_id: params.actorAccountId || null,
          actor_type: params.actorAccountId ? AuditActorType.ACCOUNT : AuditActorType.SYSTEM,
          actor_name: params.actorName || (params.actorAccountId ? 'Usuario' : 'Sistema'),
          action: params.action,
          entity_type: params.resourceType,
          entity_id: params.resourceId || 'GLOBAL',
          description: params.description || `Acción ${params.action} ejecutada en ${params.resourceType}`,
          diff: params.diff ? (params.diff as Prisma.InputJsonValue) : Prisma.JsonNull,
          reason: params.reason || null,
          request_id: params.requestId || null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to record audit log: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
