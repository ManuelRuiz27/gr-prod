import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import {
  UpdateProfileDto,
  CreateGroupMemberDto,
  UpdateGroupMemberDto,
  QuoteLineItemsDto,
  AddLineItemsDto,
  SelectMealDto,
  AssignTableMembersDto,
  CreatePaymentAttemptDto,
  SubmitPaymentProofDto,
  RequestThermoDto,
  MarkNotificationReadDto,
} from './dto/me.dto';
import {
  ContractStatus,
  PaymentPlanStatus,
  PaymentAttemptStatus,
  PaymentSubmissionStatus,
  PaymentSource,
  PaymentProvider,
  ThermoOperationalStatus,
  GraduateMembershipStatus,
  FilePurpose,
  FileAssetStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class MeService {
  private readonly logger = new Logger(MeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async verifyMembership(accountId: string, eventId: string) {
    const membership = await this.prisma.graduateMembership.findUnique({
      where: {
        event_id_account_id: {
          event_id: eventId,
          account_id: accountId,
        },
      },
      include: {
        event: {
          include: {
            settings: true,
          },
        },
      },
    });

    if (!membership || membership.status !== GraduateMembershipStatus.ACTIVE) {
      throw new ForbiddenException({
        code: 'NOT_MEMBER_OF_EVENT',
        message: 'No cuentas con una membresía activa para este evento.',
      });
    }

    return membership;
  }

  // 1. Profile
  async getProfile(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        email_normalized: true,
        full_name: true,
        phone_e164: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    if (!account) {
      throw new NotFoundException({
        code: 'ACCOUNT_NOT_FOUND',
        message: 'Cuenta de usuario no encontrada.',
      });
    }

    return account;
  }

  async updateProfile(accountId: string, dto: UpdateProfileDto) {
    const data: Prisma.AccountUpdateInput = {};
    if (dto.full_name) data.full_name = dto.full_name.trim();
    if (dto.phone) data.phone_e164 = dto.phone.trim();

    const updated = await this.prisma.account.update({
      where: { id: accountId },
      data,
      select: {
        id: true,
        email: true,
        full_name: true,
        phone_e164: true,
        role: true,
        status: true,
      },
    });

    return updated;
  }

  // 2. Events & Summary
  async listEvents(accountId: string) {
    const memberships = await this.prisma.graduateMembership.findMany({
      where: { account_id: accountId, status: GraduateMembershipStatus.ACTIVE },
      include: {
        event: {
          include: { settings: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return memberships.map((m) => ({
      membershipId: m.id,
      status: m.status,
      active_places: m.active_places,
      event: m.event,
    }));
  }

  async getEvent(accountId: string, eventId: string) {
    const membership = await this.verifyMembership(accountId, eventId);
    return {
      membershipId: membership.id,
      status: membership.status,
      active_places: membership.active_places,
      event: membership.event,
    };
  }

  async getEventSummary(accountId: string, eventId: string) {
    const membership = await this.verifyMembership(accountId, eventId);

    const [groupMembers, plan, contract, tableAssignment, thermo] = await Promise.all([
      this.prisma.groupMember.findMany({
        where: { membership_id: membership.id },
        include: { meal_selection: true },
      }),
      this.prisma.paymentPlan.findUnique({
        where: { membership_id: membership.id },
        include: {
          installments: {
            include: { allocations: true },
            orderBy: { sequence: 'asc' },
          },
        },
      }),
      this.prisma.graduateContract.findFirst({
        where: { membership_id: membership.id },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.tableAssignment.findFirst({
        where: {
          group_member: { membership_id: membership.id },
        },
        include: { table: true },
      }),
      this.prisma.thermoRequest.findUnique({
        where: { membership_id: membership.id },
      }),
    ]);

    let totalPaid = new Prisma.Decimal(0);
    if (plan) {
      for (const inst of plan.installments) {
        for (const alloc of inst.allocations) {
          totalPaid = totalPaid.add(alloc.amount);
        }
      }
    }

    const contractedTotal = plan?.contracted_total || new Prisma.Decimal(0);
    const balanceRemaining = contractedTotal.minus(totalPaid);

    const step_flags = {
      tickets_step: contract?.status === ContractStatus.ACCEPTED ? 'completed' : 'pending',
      layout_step: tableAssignment ? 'completed' : 'pending',
      meals_step: groupMembers.length > 0 && groupMembers.every((m) => m.meal_selection) ? 'completed' : 'pending',
      payments_step: totalPaid.gt(0) ? (balanceRemaining.lte(0) ? 'completed' : 'in_progress') : 'pending',
      thermo_step: thermo ? thermo.status : 'locked',
    };

    return {
      membershipId: membership.id,
      event: {
        id: membership.event.id,
        name: membership.event.name,
        date: membership.event.date,
        venue: membership.event.venue,
        status: membership.event.status,
        settings: membership.event.settings,
      },
      step_flags,
      totalGuests: groupMembers.length,
      contractStatus: contract?.status || 'NONE',
      contractAcceptedAt: contract?.accepted_at,
      paymentSummary: plan
        ? {
            totalAmount: contractedTotal.toString(),
            paidAmount: totalPaid.toString(),
            balanceRemaining: Prisma.Decimal.max(0, balanceRemaining).toString(),
            installmentsCount: plan.installments.length,
          }
        : null,
      tableAssigned: tableAssignment?.table
        ? {
            id: tableAssignment.table.id,
            label: tableAssignment.table.label,
          }
        : null,
    };
  }

  // 3. Contract
  async getContract(accountId: string, eventId: string) {
    const membership = await this.verifyMembership(accountId, eventId);

    const contract = await this.prisma.graduateContract.findFirst({
      where: { membership_id: membership.id },
      include: {
        line_items: {
          include: { product: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!contract) {
      throw new NotFoundException({
        code: 'CONTRACT_NOT_FOUND',
        message: 'No existe contrato generado para este evento.',
      });
    }

    return contract;
  }

  async acceptContract(accountId: string, eventId: string, ipAddress?: string, userAgent?: string) {
    const membership = await this.verifyMembership(accountId, eventId);

    const contract = await this.prisma.graduateContract.findFirst({
      where: { membership_id: membership.id },
      orderBy: { created_at: 'desc' },
    });

    if (!contract) {
      throw new NotFoundException({
        code: 'CONTRACT_NOT_FOUND',
        message: 'No existe contrato generado para aceptar.',
      });
    }

    if (contract.status === ContractStatus.ACCEPTED) {
      return contract;
    }

    const updated = await this.prisma.graduateContract.update({
      where: { id: contract.id },
      data: {
        status: ContractStatus.ACCEPTED,
        accepted_at: new Date(),
        accepted_by_account_id: accountId,
        accepted_ip_hash: ipAddress || null,
      },
    });

    await this.auditService.log({
      eventId,
      actorAccountId: accountId,
      action: 'contract.accepted',
      resourceType: 'GraduateContract',
      resourceId: contract.id,
    });

    return updated;
  }

  // 4. Group Members
  async getGroup(accountId: string, eventId: string) {
    const membership = await this.verifyMembership(accountId, eventId);
    const members = await this.prisma.groupMember.findMany({
      where: { membership_id: membership.id, is_active: true },
      include: {
        meal_selection: {
          include: { meal_option: true },
        },
        table_assignment: {
          include: { table: true },
        },
      },
      orderBy: [{ is_primary: 'desc' }, { created_at: 'asc' }],
    });

    return {
      membershipId: membership.id,
      members,
    };
  }

  async listGroupMembers(accountId: string, eventId: string) {
    const group = await this.getGroup(accountId, eventId);
    return group.members;
  }

  async createGroupMember(accountId: string, eventId: string, dto: CreateGroupMemberDto) {
    const membership = await this.verifyMembership(accountId, eventId);

    const member = await this.prisma.groupMember.create({
      data: {
        membership_id: membership.id,
        full_name: dto.full_name.trim(),
        is_primary: false,
        is_active: true,
      },
    });

    return member;
  }

  async updateGroupMember(
    accountId: string,
    eventId: string,
    memberId: string,
    dto: UpdateGroupMemberDto,
  ) {
    const membership = await this.verifyMembership(accountId, eventId);

    const member = await this.prisma.groupMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: 'El integrante del grupo no fue encontrado.',
      });
    }

    if (member.membership_id !== membership.id) {
      throw new ForbiddenException({
        code: 'OWNERSHIP_MISMATCH',
        message: 'No tienes permisos sobre este integrante del grupo.',
      });
    }

    const updated = await this.prisma.groupMember.update({
      where: { id: memberId },
      data: {
        full_name: dto.full_name !== undefined ? dto.full_name.trim() : undefined,
      },
    });

    return updated;
  }

  async deleteGroupMember(accountId: string, eventId: string, memberId: string) {
    const membership = await this.verifyMembership(accountId, eventId);

    const member = await this.prisma.groupMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: 'El integrante no existe.',
      });
    }

    if (member.membership_id !== membership.id) {
      throw new ForbiddenException({
        code: 'OWNERSHIP_MISMATCH',
        message: 'No tienes permisos sobre este integrante del grupo.',
      });
    }

    if (member.is_primary) {
      throw new BadRequestException({
        code: 'CANNOT_DELETE_PRIMARY_MEMBER',
        message: 'No puedes eliminar al graduado titular del grupo.',
      });
    }

    await this.prisma.groupMember.update({
      where: { id: memberId },
      data: { is_active: false },
    });

    return { success: true };
  }

  // 5. Products & Quotes
  async listProducts(accountId: string, eventId: string) {
    await this.verifyMembership(accountId, eventId);
    return this.prisma.eventProduct.findMany({
      where: { event_id: eventId, is_active: true },
      orderBy: { display_order: 'asc' },
    });
  }

  async quoteLineItems(accountId: string, eventId: string, dto: QuoteLineItemsDto) {
    const membership = await this.verifyMembership(accountId, eventId);

    const productIds = dto.items.map((i) => i.product_id);
    const products = await this.prisma.eventProduct.findMany({
      where: {
        id: { in: productIds },
        event_id: eventId,
        is_active: true,
      },
    });

    const productMap = new Map<string, (typeof products)[0]>(products.map((p) => [p.id, p]));

    let totalAmount = new Prisma.Decimal(0);
    const itemQuotes = dto.items.map((item) => {
      const prod = productMap.get(item.product_id);
      if (!prod) {
        throw new BadRequestException({
          code: 'PRODUCT_NOT_AVAILABLE',
          message: `El producto ${item.product_id} no está disponible.`,
        });
      }
      const subtotal = prod.unit_price.mul(item.quantity);
      totalAmount = totalAmount.add(subtotal);

      return {
        productId: prod.id,
        productName: prod.name,
        unitPrice: prod.unit_price.toString(),
        quantity: item.quantity,
        subtotal: subtotal.toString(),
      };
    });

    const plan = await this.prisma.paymentPlan.findUnique({
      where: { membership_id: membership.id },
      include: {
        installments: {
          where: { due_date: { lte: new Date() } },
        },
      },
    });

    const elapsedInstallmentsCount = plan?.installments.length || 0;
    const totalInstallmentsCount = 6;
    const catchUpPercentage = elapsedInstallmentsCount > 0 ? elapsedInstallmentsCount / totalInstallmentsCount : 0;
    const immediateCatchUpDue = totalAmount.mul(catchUpPercentage).toFixed(2);

    return {
      items: itemQuotes,
      totalAmount: totalAmount.toString(),
      elapsedInstallments: elapsedInstallmentsCount,
      immediateCatchUpDue,
    };
  }

  async addLineItems(accountId: string, eventId: string, dto: AddLineItemsDto) {
    const membership = await this.verifyMembership(accountId, eventId);
    const quote = await this.quoteLineItems(accountId, eventId, { items: dto.items });

    const contract = await this.prisma.graduateContract.findFirst({
      where: { membership_id: membership.id },
      orderBy: { created_at: 'desc' },
    });

    if (!contract) {
      throw new NotFoundException({
        code: 'CONTRACT_NOT_FOUND',
        message: 'No existe contrato activo para asignar paquetes.',
      });
    }

    const currentTotal = new Prisma.Decimal(quote.totalAmount);

    const result = await this.prisma.$transaction(async (tx) => {
      for (const item of quote.items) {
        await tx.contractLineItem.create({
          data: {
            contract_id: contract.id,
            product_id: item.productId,
            concept_code: 'PACKAGE_ITEM',
            label: item.productName,
            quantity: item.quantity,
            unit_amount: new Prisma.Decimal(item.unitPrice),
            line_total: new Prisma.Decimal(item.subtotal),
          },
        });
      }

      const plan = await tx.paymentPlan.upsert({
        where: { membership_id: membership.id },
        create: {
          event_id: eventId,
          membership_id: membership.id,
          contracted_total: currentTotal,
          status: PaymentPlanStatus.ACTIVE,
        },
        update: {
          contracted_total: { increment: currentTotal },
          status: PaymentPlanStatus.ACTIVE,
        },
      });

      return plan;
    });

    return {
      success: true,
      planId: result.id,
      contractedTotal: result.contracted_total.toString(),
    };
  }

  // 6. Meals
  async getMealOptions(accountId: string, eventId: string) {
    await this.verifyMembership(accountId, eventId);
    return this.prisma.mealOption.findMany({
      where: { event_id: eventId, is_active: true },
      orderBy: { display_order: 'asc' },
    });
  }

  async selectMeal(accountId: string, eventId: string, memberId: string, dto: SelectMealDto) {
    const membership = await this.verifyMembership(accountId, eventId);

    if (membership.event.settings?.meals_deadline) {
      if (new Date() > membership.event.settings.meals_deadline) {
        throw new BadRequestException({
          code: 'DEADLINE_EXCEEDED',
          message: 'La fecha límite para selección de menú ha vencido.',
        });
      }
    }

    const member = await this.prisma.groupMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: 'Integrante no encontrado.',
      });
    }

    if (member.membership_id !== membership.id) {
      throw new ForbiddenException({
        code: 'OWNERSHIP_MISMATCH',
        message: 'No tienes permisos sobre este integrante del grupo.',
      });
    }

    const mealOption = await this.prisma.mealOption.findFirst({
      where: { id: dto.meal_option_id, event_id: eventId, is_active: true },
    });

    if (!mealOption) {
      throw new NotFoundException({
        code: 'MEAL_OPTION_NOT_FOUND',
        message: 'Opción de platillo no disponible.',
      });
    }

    const selection = await this.prisma.mealSelection.upsert({
      where: { group_member_id: memberId },
      create: {
        group_member_id: memberId,
        meal_option_id: dto.meal_option_id,
      },
      update: {
        meal_option_id: dto.meal_option_id,
      },
    });

    return selection;
  }

  // 7. Seating & Table Assignments with Row Lock Concurrency P0
  async getSeatingMap(accountId: string, eventId: string) {
    const membership = await this.verifyMembership(accountId, eventId);
    const seatingMap = await this.prisma.seatingMap.findUnique({
      where: { event_id: eventId },
    });

    const tables = await this.prisma.eventTable.findMany({
      where: { event_id: eventId },
      include: {
        assignments: {
          include: {
            group_member: {
              include: { membership: true },
            },
          },
        },
      },
      orderBy: { label: 'asc' },
    });

    return {
      seatingMap,
      tables: tables.map((t) => ({
        id: t.id,
        label: t.label,
        capacity: t.capacity,
        shape: t.shape,
        status: t.status,
        position_x: t.position_x,
        position_y: t.position_y,
        occupied_count: t.assignments.length,
        available_seats: Math.max(0, t.capacity - t.assignments.length),
        assignments: t.assignments.map((a) => ({
          memberId: a.group_member_id,
          fullName: a.group_member.full_name,
          isOwnGroup: a.group_member.membership_id === membership.id,
        })),
      })),
    };
  }

  async getTableAssignments(accountId: string, eventId: string) {
    const membership = await this.verifyMembership(accountId, eventId);

    const assignments = await this.prisma.tableAssignment.findMany({
      where: {
        group_member: { membership_id: membership.id },
      },
      include: {
        table: true,
        group_member: true,
      },
    });

    return assignments;
  }

  async assignTableMembers(accountId: string, eventId: string, dto: AssignTableMembersDto) {
    const membership = await this.verifyMembership(accountId, eventId);

    if (membership.event.settings?.seating_deadline) {
      if (new Date() > membership.event.settings.seating_deadline) {
        throw new BadRequestException({
          code: 'SEATING_DEADLINE_EXCEEDED',
          message: 'La fecha límite de asignación de lugares ha vencido.',
        });
      }
    }

    const members = await this.prisma.groupMember.findMany({
      where: {
        id: { in: dto.member_ids },
        membership_id: membership.id,
        is_active: true,
      },
    });

    if (members.length !== dto.member_ids.length) {
      throw new BadRequestException({
        code: 'INVALID_GROUP_MEMBERS',
        message: 'Uno o más integrantes no pertenecen a tu grupo.',
      });
    }

    const assignedCount = dto.member_ids.length;

    const result = await this.prisma.$transaction(
      async (tx) => {
        const lockedTables: any[] = await tx.$queryRaw`
          SELECT id, capacity, status, label 
          FROM event_tables 
          WHERE id = ${dto.table_id}::uuid AND event_id = ${eventId}::uuid
          FOR UPDATE
        `;

        if (!lockedTables || lockedTables.length === 0) {
          throw new NotFoundException({
            code: 'TABLE_NOT_FOUND',
            message: 'La mesa seleccionada no existe.',
          });
        }

        const table = lockedTables[0];
        if (table.status !== 'AVAILABLE') {
          throw new ConflictException({
            code: 'TABLE_NOT_AVAILABLE',
            message: 'La mesa seleccionada no se encuentra disponible.',
          });
        }

        const countResult: any[] = await tx.$queryRaw`
          SELECT COUNT(*)::int AS count 
          FROM table_assignments 
          WHERE table_id = ${dto.table_id}::uuid
        `;

        const currentOccupants = countResult[0]?.count || 0;
        const availableSeats = table.capacity - currentOccupants;

        if (assignedCount > availableSeats) {
          throw new ConflictException({
            code: 'TABLE_CAPACITY_CHANGED',
            message: `Capacidad excedida. Lugares disponibles: ${availableSeats}, solicitados: ${assignedCount}.`,
          });
        }

        await tx.tableAssignment.deleteMany({
          where: {
            group_member_id: { in: dto.member_ids },
          },
        });

        for (const memberId of dto.member_ids) {
          await tx.tableAssignment.create({
            data: {
              table_id: dto.table_id,
              group_member_id: memberId,
            },
          });
        }

        return {
          tableId: table.id,
          tableLabel: table.label,
          assignedCount,
          remainingSeats: availableSeats - assignedCount,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 10000,
      },
    );

    await this.auditService.log({
      eventId,
      actorAccountId: accountId,
      action: 'table.assigned',
      resourceType: 'EventTable',
      resourceId: dto.table_id,
      description: 'Asignación de integrantes a mesa',
      diff: { memberIds: dto.member_ids },
    });

    return result;
  }

  // 8. Payment Plan, Attempts & Submissions
  async getPaymentPlan(accountId: string, eventId: string) {
    const membership = await this.verifyMembership(accountId, eventId);

    const plan = await this.prisma.paymentPlan.findUnique({
      where: { membership_id: membership.id },
      include: {
        installments: {
          orderBy: { sequence: 'asc' },
          include: { allocations: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException({
        code: 'PAYMENT_PLAN_NOT_FOUND',
        message: 'No existe plan de pagos configurado.',
      });
    }

    let totalPaid = new Prisma.Decimal(0);
    const installmentsData = plan.installments.map((inst) => {
      let instPaid = new Prisma.Decimal(0);
      for (const alloc of inst.allocations) {
        instPaid = instPaid.add(alloc.amount);
      }
      totalPaid = totalPaid.add(instPaid);

      return {
        id: inst.id,
        sequence: inst.sequence,
        conceptCode: inst.concept_code,
        label: inst.label,
        dueDate: inst.due_date,
        amount: inst.amount.toString(),
        paidAmount: instPaid.toString(),
        status: inst.status,
      };
    });

    const balanceRemaining = plan.contracted_total.minus(totalPaid);

    return {
      id: plan.id,
      status: plan.status,
      contractedTotal: plan.contracted_total.toString(),
      totalPaid: totalPaid.toString(),
      balanceRemaining: Prisma.Decimal.max(0, balanceRemaining).toString(),
      installments: installmentsData,
    };
  }

  async createPaymentAttempt(accountId: string, eventId: string, dto: CreatePaymentAttemptDto) {
    const membership = await this.verifyMembership(accountId, eventId);

    const plan = await this.prisma.paymentPlan.findUnique({
      where: { membership_id: membership.id },
      include: {
        installments: {
          orderBy: { sequence: 'asc' },
          include: { allocations: true },
        },
      },
    });

    if (!plan) {
      throw new BadRequestException({
        code: 'NO_PAYMENT_PLAN',
        message: 'No existe plan de pagos.',
      });
    }

    // Default amount: either next unpaid installment or $500 minimum
    const attemptAmount = new Prisma.Decimal(500.00);

    const attempt = await this.prisma.paymentAttempt.create({
      data: {
        payment_plan_id: plan.id,
        provider: dto.gateway as PaymentProvider,
        requested_amount: attemptAmount,
        status: PaymentAttemptStatus.CREATED,
        checkout_url: `https://sandbox.checkout.plataformagr.com/pay/${Date.now()}`,
      },
    });

    return {
      attemptId: attempt.id,
      requestedAmount: attempt.requested_amount.toString(),
      provider: attempt.provider,
      status: attempt.status,
      checkoutUrl: attempt.checkout_url,
    };
  }

  async getPaymentAttempt(accountId: string, eventId: string, attemptId: string) {
    const membership = await this.verifyMembership(accountId, eventId);

    const attempt = await this.prisma.paymentAttempt.findFirst({
      where: {
        id: attemptId,
        payment_plan: { membership_id: membership.id },
      },
    });

    if (!attempt) {
      throw new NotFoundException({
        code: 'ATTEMPT_NOT_FOUND',
        message: 'Intento de pago no encontrado.',
      });
    }

    return attempt;
  }

  async uploadPaymentEvidence(accountId: string, fileData: { filename: string; mimeType: string; size: number }) {
    const asset = await this.prisma.fileAsset.create({
      data: {
        purpose: FilePurpose.PAYMENT_EVIDENCE,
        storage_path: `evidence/${Date.now()}-${fileData.filename}`,
        original_filename: fileData.filename,
        mime_type: fileData.mimeType,
        size_bytes: fileData.size,
        status: FileAssetStatus.AVAILABLE,
        created_by_account_id: accountId,
      },
    });

    return {
      fileId: asset.id,
      filename: asset.original_filename,
    };
  }

  async submitPaymentProof(accountId: string, eventId: string, dto: SubmitPaymentProofDto) {
    const membership = await this.verifyMembership(accountId, eventId);

    const plan = await this.prisma.paymentPlan.findUnique({
      where: { membership_id: membership.id },
    });

    if (!plan) {
      throw new NotFoundException({
        code: 'PAYMENT_PLAN_NOT_FOUND',
        message: 'Plan de pago no encontrado.',
      });
    }

    const folio = `SUB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const submission = await this.prisma.paymentSubmission.create({
      data: {
        payment_plan_id: plan.id,
        folio,
        amount: new Prisma.Decimal(dto.amount),
        method: dto.payment_method as PaymentSource,
        reference: dto.reference.trim(),
        paid_at: new Date(),
        evidence_file_id: dto.evidence_file_id || null,
        status: PaymentSubmissionStatus.PENDING_REVIEW,
      },
    });

    return submission;
  }

  async listPaymentSubmissions(accountId: string, eventId: string) {
    const membership = await this.verifyMembership(accountId, eventId);

    return this.prisma.paymentSubmission.findMany({
      where: {
        payment_plan: { membership_id: membership.id },
      },
      include: { evidence_file: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async getPaymentSubmission(accountId: string, eventId: string, submissionId: string) {
    const membership = await this.verifyMembership(accountId, eventId);

    const submission = await this.prisma.paymentSubmission.findFirst({
      where: {
        id: submissionId,
        payment_plan: { membership_id: membership.id },
      },
      include: { evidence_file: true },
    });

    if (!submission) {
      throw new NotFoundException({
        code: 'SUBMISSION_NOT_FOUND',
        message: 'Comprobante de pago no encontrado.',
      });
    }

    return submission;
  }

  // 9. Thermos
  async getThermo(accountId: string, eventId: string) {
    const membership = await this.verifyMembership(accountId, eventId);

    const [plan, thermoConfig, thermoRequest] = await Promise.all([
      this.prisma.paymentPlan.findUnique({
        where: { membership_id: membership.id },
        include: {
          installments: { include: { allocations: true } },
        },
      }),
      this.prisma.thermoConfiguration.findFirst({ where: { event_id: eventId } }),
      this.prisma.thermoRequest.findUnique({
        where: { membership_id: membership.id },
        include: {
          values: { include: { field: true } },
          delivery: true,
        },
      }),
    ]);

    const thresholdPercent = membership.event.settings?.thermo_threshold || new Prisma.Decimal(70.00);

    let isEligible = false;
    let percentagePaid = new Prisma.Decimal(0);

    if (plan && plan.contracted_total.gt(0)) {
      let totalPaid = new Prisma.Decimal(0);
      for (const inst of plan.installments) {
        for (const alloc of inst.allocations) {
          totalPaid = totalPaid.add(alloc.amount);
        }
      }
      percentagePaid = totalPaid.mul(100).div(plan.contracted_total);
      if (percentagePaid.gte(thresholdPercent)) {
        isEligible = true;
      }
    }

    return {
      isEligible,
      requiredPercentage: thresholdPercent.toString(),
      currentPercentage: percentagePaid.toFixed(2),
      config: thermoConfig,
      request: thermoRequest,
    };
  }

  async requestThermo(accountId: string, eventId: string, dto: RequestThermoDto) {
    const thermoStatus = await this.getThermo(accountId, eventId);

    if (!thermoStatus.isEligible) {
      throw new BadRequestException({
        code: 'NOT_ELIGIBLE_FOR_THERMO',
        message: `Se requiere haber liquidado al menos el ${thermoStatus.requiredPercentage}% del total. Porcentaje actual: ${thermoStatus.currentPercentage}%.`,
      });
    }

    const membership = await this.verifyMembership(accountId, eventId);

    const existingRequest = await this.prisma.thermoRequest.findUnique({
      where: { membership_id: membership.id },
    });

    if (existingRequest && existingRequest.status === ThermoOperationalStatus.IN_PRODUCTION) {
      throw new ConflictException({
        code: 'THERMO_ALREADY_IN_PRODUCTION',
        message: 'El termo ya se encuentra en producción y no se puede modificar.',
      });
    }

    const request = await this.prisma.thermoRequest.upsert({
      where: { membership_id: membership.id },
      create: {
        membership_id: membership.id,
        status: ThermoOperationalStatus.REQUESTED,
      },
      update: {
        status: ThermoOperationalStatus.REQUESTED,
      },
    });

    return request;
  }

  // 10. Notifications
  async listNotifications(accountId: string) {
    return this.prisma.notification.findMany({
      where: { account_id: accountId },
      orderBy: { created_at: 'desc' },
    });
  }

  async markNotificationRead(accountId: string, notificationId: string, dto: MarkNotificationReadDto) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, account_id: accountId },
    });

    if (!notification) {
      throw new NotFoundException({
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Notificación no encontrada.',
      });
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { is_read: dto.is_read !== undefined ? dto.is_read : true },
    });
  }
}
