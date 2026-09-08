import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import {
  ReducePlacesDto,
  CreateInternalNoteDto,
  CancelMembershipDto,
  RecordManualPaymentDto,
  AdminUpdateMealSelectionDto,
  UpdateThermoStatusDto,
} from './dto/admin-graduates.dto';
import {
  GraduateMembershipStatus,
  ContractStatus,
  CancellationQuoteStatus,
  RefundStatus,
  PaymentPlanStatus,
  PaymentTransactionStatus,
  PaymentSource,
  ThermoOperationalStatus,
  InstallmentLifecycleStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class AdminGraduatesService {
  private readonly logger = new Logger(AdminGraduatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listGraduates(eventId: string) {
    const memberships = await this.prisma.graduateMembership.findMany({
      where: { event_id: eventId },
      include: {
        account: true,
        group_members: true,
        payment_plans: {
          include: {
            installments: { include: { allocations: true } },
          },
        },
        contracts: { orderBy: { created_at: 'desc' }, take: 1 },
      },
      orderBy: { created_at: 'desc' },
    });

    return memberships.map((m) => {
      const plan = m.payment_plans[0] || null;
      let totalPaid = new Prisma.Decimal(0);
      if (plan) {
        for (const inst of plan.installments) {
          for (const alloc of inst.allocations) {
            totalPaid = totalPaid.add(alloc.amount);
          }
        }
      }

      const contracted = plan?.contracted_total || new Prisma.Decimal(0);
      const balance = contracted.minus(totalPaid);

      return {
        membershipId: m.id,
        accountId: m.account_id,
        fullName: m.account.full_name,
        email: m.account.email,
        phone: m.account.phone_e164,
        status: m.status,
        activePlaces: m.active_places,
        guestsCount: m.group_members.length,
        contractStatus: m.contracts[0]?.status || 'NONE',
        contractedTotal: contracted.toString(),
        totalPaid: totalPaid.toString(),
        balanceRemaining: Prisma.Decimal.max(0, balance).toString(),
        createdAt: m.created_at,
      };
    });
  }

  async getGraduate(eventId: string, membershipId: string) {
    const membership = await this.prisma.graduateMembership.findFirst({
      where: { id: membershipId, event_id: eventId },
      include: {
        account: true,
        group_members: {
          include: {
            meal_selection: { include: { meal_option: true } },
            table_assignment: { include: { table: true } },
          },
        },
        payment_plans: {
          include: {
            installments: {
              include: { allocations: true },
              orderBy: { sequence: 'asc' },
            },
            submissions: { orderBy: { created_at: 'desc' } },
            transactions: { orderBy: { created_at: 'desc' } },
          },
        },
        contracts: {
          include: { line_items: { include: { product: true } } },
          orderBy: { created_at: 'desc' },
        },
        thermo_request: { include: { values: true, delivery: true } },
      },
    });

    if (!membership) {
      throw new NotFoundException({
        code: 'GRADUATE_NOT_FOUND',
        message: 'Graduado no encontrado en este evento.',
      });
    }

    return membership;
  }

  async getGraduateContract(eventId: string, membershipId: string) {
    const contract = await this.prisma.graduateContract.findFirst({
      where: {
        membership_id: membershipId,
        membership: { event_id: eventId },
      },
      include: { line_items: { include: { product: true } } },
      orderBy: { created_at: 'desc' },
    });

    if (!contract) {
      throw new NotFoundException({
        code: 'CONTRACT_NOT_FOUND',
        message: 'Contrato no encontrado.',
      });
    }

    return contract;
  }

  async reducePlaces(
    eventId: string,
    membershipId: string,
    dto: ReducePlacesDto,
    actorId?: string,
  ) {
    const graduate = await this.getGraduate(eventId, membershipId);

    const nonPrimaryMembers = graduate.group_members.filter((m) => !m.is_primary && m.is_active);
    if (nonPrimaryMembers.length < dto.places_to_remove) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_PLACES',
        message: `Solo es posible reducir hasta ${nonPrimaryMembers.length} lugares adicionales.`,
      });
    }

    const membersToDelete = nonPrimaryMembers.slice(-dto.places_to_remove);
    const memberIds = membersToDelete.map((m) => m.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.tableAssignment.deleteMany({
        where: { group_member_id: { in: memberIds } },
      });

      await tx.mealSelection.deleteMany({
        where: { group_member_id: { in: memberIds } },
      });

      await tx.groupMember.updateMany({
        where: { id: { in: memberIds } },
        data: { is_active: false },
      });

      await tx.graduateMembership.update({
        where: { id: membershipId },
        data: { active_places: { decrement: dto.places_to_remove } },
      });

      await tx.internalNote.create({
        data: {
          membership_id: membershipId,
          author_id: actorId || null,
          author_name: 'Administrador',
          note: `Reducción de ${dto.places_to_remove} lugar(es). Motivo: ${dto.reason}`,
        },
      });
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'places.reduced',
      resourceType: 'GraduateMembership',
      resourceId: membershipId,
      description: `Se redujeron ${dto.places_to_remove} lugares. Motivo: ${dto.reason}`,
    });

    return { success: true, removedCount: dto.places_to_remove };
  }

  async listInternalNotes(membershipId: string) {
    return this.prisma.internalNote.findMany({
      where: { membership_id: membershipId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createInternalNote(
    eventId: string,
    membershipId: string,
    dto: CreateInternalNoteDto,
    authorId: string,
  ) {
    await this.getGraduate(eventId, membershipId);

    const note = await this.prisma.internalNote.create({
      data: {
        membership_id: membershipId,
        author_id: authorId,
        author_name: 'Administrador',
        note: dto.content.trim(),
      },
    });

    return note;
  }

  async getCancellationQuote(eventId: string, membershipId: string) {
    const graduate = await this.getGraduate(eventId, membershipId);
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        cancellation_policies: {
          where: { status: 'ACTIVE' },
          include: { ranges: { orderBy: { days_before_min: 'asc' } } },
        },
      },
    });

    const now = new Date();
    const eventDate = new Date(event?.date || now);
    const daysRemaining = Math.max(0, Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));

    const plan = graduate.payment_plans[0] || null;
    let totalPaid = new Prisma.Decimal(0);
    if (plan) {
      for (const inst of plan.installments) {
        for (const alloc of inst.allocations) {
          totalPaid = totalPaid.add(alloc.amount);
        }
      }
    }

    const policy = event?.cancellation_policies[0] || null;
    let penaltyPercent = new Prisma.Decimal(50.00);

    if (policy && policy.ranges.length > 0) {
      const match = policy.ranges.find((r) => {
        if (r.days_before_max !== null) {
          return daysRemaining >= r.days_before_min && daysRemaining <= r.days_before_max;
        }
        return daysRemaining >= r.days_before_min;
      });
      if (match) {
        penaltyPercent = match.penalty_percent;
      }
    }

    const refundPercent = new Prisma.Decimal(100).minus(penaltyPercent);
    const penaltyAmount = totalPaid.mul(penaltyPercent).div(100);
    const refundableAmount = totalPaid.mul(refundPercent).div(100);

    return {
      membershipId,
      daysRemaining,
      paidAmount: totalPaid.toFixed(2),
      penaltyPercentage: penaltyPercent.toString(),
      penaltyAmount: penaltyAmount.toFixed(2),
      refundPercentage: refundPercent.toString(),
      refundableAmount: refundableAmount.toFixed(2),
    };
  }

  async cancelGraduateMembership(
    eventId: string,
    membershipId: string,
    dto: CancelMembershipDto,
    actorId?: string,
  ) {
    const graduate = await this.getGraduate(eventId, membershipId);
    const quote = await this.getCancellationQuote(eventId, membershipId);

    const refundAmount = dto.custom_refund_amount !== undefined
      ? new Prisma.Decimal(dto.custom_refund_amount)
      : new Prisma.Decimal(quote.refundableAmount);

    await this.prisma.$transaction(async (tx) => {
      const memberIds = graduate.group_members.map((m) => m.id);
      await tx.tableAssignment.deleteMany({
        where: { group_member_id: { in: memberIds } },
      });

      await tx.graduateMembership.update({
        where: { id: membershipId },
        data: { status: GraduateMembershipStatus.CANCELLED },
      });

      await tx.graduateContract.updateMany({
        where: { membership_id: membershipId },
        data: { status: ContractStatus.CANCELLED },
      });

      const plan = graduate.payment_plans[0] || null;
      if (plan) {
        await tx.paymentPlan.update({
          where: { id: plan.id },
          data: { status: PaymentPlanStatus.CANCELLED },
        });

        if (refundAmount.gt(0)) {
          await tx.refund.create({
            data: {
              payment_plan_id: plan.id,
              amount: refundAmount,
              reason: `Cancelación de membresía: ${dto.reason}`,
              status: RefundStatus.CONFIRMED,
              method: 'MANUAL',
            },
          });
        }
      }

      await tx.internalNote.create({
        data: {
          membership_id: membershipId,
          author_id: actorId || null,
          author_name: 'Administrador',
          note: `Membresía cancelada. Motivo: ${dto.reason}. Reembolso: $${refundAmount.toFixed(2)}.`,
        },
      });
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'membership.cancelled',
      resourceType: 'GraduateMembership',
      resourceId: membershipId,
      description: `Membresía cancelada: ${dto.reason}`,
    });

    return {
      success: true,
      membershipId,
      status: 'CANCELLED',
      refundAmount: refundAmount.toString(),
    };
  }

  async getGraduatePaymentPlan(eventId: string, membershipId: string) {
    const plan = await this.prisma.paymentPlan.findFirst({
      where: {
        membership_id: membershipId,
        event_id: eventId,
      },
      include: {
        installments: {
          orderBy: { sequence: 'asc' },
          include: { allocations: true },
        },
        transactions: { orderBy: { created_at: 'desc' } },
        submissions: { orderBy: { created_at: 'desc' } },
      },
    });

    if (!plan) {
      throw new NotFoundException({
        code: 'PLAN_NOT_FOUND',
        message: 'Plan de pagos no encontrado.',
      });
    }

    return plan;
  }

  async recordManualPayment(
    eventId: string,
    membershipId: string,
    dto: RecordManualPaymentDto,
    actorId: string,
  ) {
    const graduate = await this.getGraduate(eventId, membershipId);
    const plan = graduate.payment_plans[0] || null;

    if (!plan) {
      throw new NotFoundException({
        code: 'PLAN_NOT_FOUND',
        message: 'No existe plan de pagos para registrar abonos.',
      });
    }

    const amountDecimal = new Prisma.Decimal(dto.amount);

    const result = await this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.paymentTransaction.create({
        data: {
          payment_plan_id: plan.id,
          amount: amountDecimal,
          source: dto.payment_method as PaymentSource,
          reference: dto.reference,
          status: PaymentTransactionStatus.CONFIRMED,
          paid_at: new Date(),
        },
      });

      const installments = await tx.installment.findMany({
        where: {
          payment_plan_id: plan.id,
          status: InstallmentLifecycleStatus.ACTIVE,
        },
        include: { allocations: true },
        orderBy: { sequence: 'asc' },
      });

      let remainingToAllocate = amountDecimal;

      for (const inst of installments) {
        if (remainingToAllocate.lte(0)) break;

        let instPaid = new Prisma.Decimal(0);
        for (const alloc of inst.allocations) {
          instPaid = instPaid.add(alloc.amount);
        }

        const unpaidOnInst = inst.amount.minus(instPaid);
        if (unpaidOnInst.lte(0)) continue;

        const allocationAmount = Prisma.Decimal.min(remainingToAllocate, unpaidOnInst);

        await tx.paymentAllocation.create({
          data: {
            transaction_id: txRecord.id,
            installment_id: inst.id,
            amount: allocationAmount,
          },
        });

        remainingToAllocate = remainingToAllocate.minus(allocationAmount);
      }

      return { transactionId: txRecord.id, allocatedAmount: amountDecimal };
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'payment.manual_recorded',
      resourceType: 'PaymentTransaction',
      resourceId: result.transactionId,
      description: `Abono manual registrado: $${dto.amount} (${dto.payment_method}) Ref: ${dto.reference}`,
    });

    return {
      success: true,
      transactionId: result.transactionId,
      allocatedAmount: result.allocatedAmount.toString(),
    };
  }

  async getGraduateMeals(eventId: string, membershipId: string) {
    const graduate = await this.getGraduate(eventId, membershipId);
    return graduate.group_members.map((m) => ({
      memberId: m.id,
      fullName: m.full_name,
      isPrimary: m.is_primary,
      mealSelection: m.meal_selection,
    }));
  }

  async updateMemberMealSelection(
    eventId: string,
    memberId: string,
    dto: AdminUpdateMealSelectionDto,
    actorId?: string,
  ) {
    const member = await this.prisma.groupMember.findUnique({
      where: { id: memberId },
      include: { membership: true },
    });

    if (!member || member.membership.event_id !== eventId) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: 'Integrante no encontrado en este evento.',
      });
    }

    const updated = await this.prisma.mealSelection.upsert({
      where: { group_member_id: memberId },
      create: {
        group_member_id: memberId,
        meal_option_id: dto.meal_option_id,
      },
      update: {
        meal_option_id: dto.meal_option_id,
      },
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'meal_selection.admin_updated',
      resourceType: 'MealSelection',
      resourceId: updated.id,
    });

    return updated;
  }

  async getGraduateThermo(eventId: string, membershipId: string) {
    await this.getGraduate(eventId, membershipId);
    return this.prisma.thermoRequest.findUnique({
      where: { membership_id: membershipId },
      include: {
        values: { include: { field: true } },
        delivery: true,
      },
    });
  }

  async updateGraduateThermoStatus(
    eventId: string,
    membershipId: string,
    dto: UpdateThermoStatusDto,
    actorId?: string,
  ) {
    const thermo = await this.prisma.thermoRequest.findUnique({
      where: { membership_id: membershipId },
    });

    if (!thermo) {
      throw new NotFoundException({
        code: 'THERMO_NOT_FOUND',
        message: 'No existe solicitud de termo para este graduado.',
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.thermoRequest.update({
        where: { id: thermo.id },
        data: {
          status: dto.status as ThermoOperationalStatus,
          delivered_at: dto.status === ThermoOperationalStatus.DELIVERED ? new Date() : undefined,
          production_at: dto.status === ThermoOperationalStatus.IN_PRODUCTION ? new Date() : undefined,
        },
      });

      if (dto.status === ThermoOperationalStatus.DELIVERED) {
        await tx.thermoDelivery.upsert({
          where: { request_id: thermo.id },
          create: {
            request_id: thermo.id,
            recipient_name: 'Graduado Titular',
            delivered_by_account_id: actorId,
            delivered_at: new Date(),
            notes: dto.delivery_notes?.trim() || null,
          },
          update: {
            delivered_by_account_id: actorId,
            delivered_at: new Date(),
            notes: dto.delivery_notes?.trim() || null,
          },
        });
      }

      return res;
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'thermo.status_updated',
      resourceType: 'ThermoRequest',
      resourceId: thermo.id,
      description: `Estado de termo actualizado a: ${dto.status}`,
    });

    return updated;
  }
}
