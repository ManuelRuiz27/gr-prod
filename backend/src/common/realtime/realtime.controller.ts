import {
  Controller,
  Sse,
  Query,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RealtimeService } from './realtime.service';
import { SseMessageEvent } from './realtime.types';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { CurrentUser } from '../guards/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountRole } from '@prisma/client';

@Controller('realtime')
@UseGuards(RolesGuard)
@Roles(AccountRole.ADMIN, AccountRole.GRADUATE)
export class RealtimeController {
  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly prisma: PrismaService,
  ) {}

  @Sse('stream')
  async stream(
    @CurrentUser('id') accountId: string,
    @CurrentUser('role') role: string,
    @Query('eventId') eventId?: string,
  ): Promise<Observable<SseMessageEvent>> {
    if (eventId) {
      // Validate event existence
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true },
      });
      if (!event) {
        throw new NotFoundException('El evento solicitado no fue encontrado.');
      }

      // If actor is GRADUATE, verify ownership: must belong to event
      if (role === AccountRole.GRADUATE) {
        const membership = await this.prisma.graduateMembership.findFirst({
          where: {
            event_id: eventId,
            account_id: accountId,
          },
          select: { id: true, status: true },
        });

        if (!membership) {
          // IDOR-safe 404: do not disclose whether event has external memberships
          throw new NotFoundException('El evento solicitado no fue encontrado.');
        }

        if (membership.status !== 'ACTIVE') {
          throw new ForbiddenException('La membresía en este evento no se encuentra activa.');
        }
      }
    }

    return this.realtimeService.getStreamForActor({
      id: accountId,
      role,
      eventId,
    });
  }
}
