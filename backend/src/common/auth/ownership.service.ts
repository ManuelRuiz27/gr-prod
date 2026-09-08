import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActorContext } from './actor-context.interface';
import { AccountRole, GraduateMembershipStatus } from '@prisma/client';

@Injectable()
export class OwnershipService {
  constructor(private readonly prisma: PrismaService) {}

  async assertEventMembership(actor: ActorContext, eventId: string) {
    if (!actor?.accountId) {
      throw new ForbiddenException({
        code: 'UNAUTHENTICATED',
        message: 'Acceso no autenticado.',
      });
    }

    if (actor.role === AccountRole.ADMIN) {
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: { settings: true },
      });
      if (!event) {
        throw new NotFoundException({
          code: 'EVENT_NOT_FOUND',
          message: 'El evento especificado no existe.',
        });
      }
      return { event, isAdmin: true, membership: null };
    }

    const membership = await this.prisma.graduateMembership.findUnique({
      where: {
        event_id_account_id: {
          event_id: eventId,
          account_id: actor.accountId,
        },
      },
      include: {
        event: {
          include: { settings: true },
        },
      },
    });

    if (!membership || membership.status !== GraduateMembershipStatus.ACTIVE) {
      throw new ForbiddenException({
        code: 'OWNERSHIP_MISMATCH',
        message: 'No cuentas con una membresía activa para este evento.',
      });
    }

    return { event: membership.event, isAdmin: false, membership };
  }

  async assertMembershipOwnership(actor: ActorContext, membershipId: string) {
    if (!actor?.accountId) {
      throw new ForbiddenException({
        code: 'UNAUTHENTICATED',
        message: 'Acceso no autenticado.',
      });
    }

    if (actor.role === AccountRole.ADMIN) {
      const membership = await this.prisma.graduateMembership.findUnique({
        where: { id: membershipId },
        include: { event: true },
      });
      if (!membership) {
        throw new NotFoundException({
          code: 'MEMBERSHIP_NOT_FOUND',
          message: 'La membresía especificada no existe.',
        });
      }
      return membership;
    }

    const membership = await this.prisma.graduateMembership.findFirst({
      where: {
        id: membershipId,
        account_id: actor.accountId,
        status: GraduateMembershipStatus.ACTIVE,
      },
      include: { event: true },
    });

    if (!membership) {
      throw new ForbiddenException({
        code: 'OWNERSHIP_MISMATCH',
        message: 'No tienes permisos para acceder o modificar esta membresía.',
      });
    }

    return membership;
  }

  async assertGroupMemberOwnership(actor: ActorContext, memberId: string) {
    if (!actor?.accountId) {
      throw new ForbiddenException({
        code: 'UNAUTHENTICATED',
        message: 'Acceso no autenticado.',
      });
    }

    if (actor.role === AccountRole.ADMIN) {
      const member = await this.prisma.groupMember.findUnique({
        where: { id: memberId },
        include: { membership: true },
      });
      if (!member) {
        throw new NotFoundException({
          code: 'MEMBER_NOT_FOUND',
          message: 'El integrante especificado no existe.',
        });
      }
      return member;
    }

    const member = await this.prisma.groupMember.findFirst({
      where: {
        id: memberId,
        membership: {
          account_id: actor.accountId,
          status: GraduateMembershipStatus.ACTIVE,
        },
      },
      include: { membership: true },
    });

    if (!member) {
      throw new ForbiddenException({
        code: 'OWNERSHIP_MISMATCH',
        message: 'No tienes permisos sobre este integrante del grupo.',
      });
    }

    return member;
  }
}
