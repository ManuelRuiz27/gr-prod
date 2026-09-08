import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import {
  CreateEventWizardDto,
  UpdateEventDto,
  TransitionEventDto,
  RotateAccessCodeDto,
  CreateProductDto,
  UpdateProductDto,
  CreateFinancialConfigurationDto,
  CreateFinancialMilestoneDto,
  UpdateLatePaymentPolicyDto,
  CreateMealOptionDto,
  UpdateMealOptionDto,
  CreateCancellationPolicyDto,
  AddCancellationPolicyRangeDto,
  CreateThermoConfigurationDto,
} from './dto/admin-events.dto';
import {
  EventStatus,
  ConfigurationStatus,
  CancellationPolicyStatus,
  EventAccessCodeStatus,
  Prisma,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminEventsService {
  private readonly logger = new Logger(AdminEventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listEvents() {
    const events = await this.prisma.event.findMany({
      include: {
        settings: true,
        _count: {
          select: {
            memberships: true,
            event_tables: true,
            products: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return events.map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date,
      venue: e.venue,
      capacity: e.capacity,
      timezone: e.timezone,
      status: e.status,
      settings: e.settings,
      stats: {
        graduatesCount: e._count.memberships,
        tablesCount: e._count.event_tables,
        productsCount: e._count.products,
      },
      createdAt: e.created_at,
    }));
  }

  async createEvent(dto: CreateEventWizardDto, actorId?: string) {
    const rawCode = dto.access_code?.trim() || `EVT-${Date.now().toString().slice(-4)}`;
    const codeHash = await bcrypt.hash(rawCode, 10);

    const event = await this.prisma.$transaction(async (tx) => {
      const createdEvent = await tx.event.create({
        data: {
          name: dto.name.trim(),
          date: new Date(dto.date),
          venue: dto.venue.trim(),
          capacity: dto.capacity,
          timezone: dto.timezone || 'America/Mexico_City',
          status: EventStatus.DRAFT,
          settings: {
            create: {
              thermo_threshold: new Prisma.Decimal(dto.thermo_threshold || 70.00),
              seating_deadline: dto.seating_deadline ? new Date(dto.seating_deadline) : null,
              meals_deadline: dto.meals_deadline ? new Date(dto.meals_deadline) : null,
            },
          },
        },
      });

      await tx.eventAccessCode.create({
        data: {
          event_id: createdEvent.id,
          code_hash: codeHash,
          status: EventAccessCodeStatus.ACTIVE,
        },
      });

      if (dto.products && dto.products.length > 0) {
        let order = 1;
        for (const p of dto.products) {
          await tx.eventProduct.create({
            data: {
              event_id: createdEvent.id,
              code: p.code.trim().toUpperCase(),
              name: p.name.trim(),
              kind: p.kind,
              unit_price: new Prisma.Decimal(p.unit_price),
              display_order: order++,
            },
          });
        }
      }

      return createdEvent;
    });

    await this.auditService.log({
      eventId: event.id,
      actorAccountId: actorId,
      action: 'event.created',
      resourceType: 'Event',
      resourceId: event.id,
      description: `Evento creado: ${event.name}`,
    });

    return {
      event,
      accessCode: rawCode,
    };
  }

  async getEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        settings: true,
        products: { orderBy: { display_order: 'asc' } },
        access_codes: { where: { status: EventAccessCodeStatus.ACTIVE } },
        meal_options: { orderBy: { display_order: 'asc' } },
        cancellation_policies: { include: { ranges: true } },
      },
    });

    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'Evento no encontrado.',
      });
    }

    return event;
  }

  async updateEvent(eventId: string, dto: UpdateEventDto, actorId?: string) {
    const current = await this.getEvent(eventId);

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        date: dto.date !== undefined ? new Date(dto.date) : undefined,
        venue: dto.venue !== undefined ? dto.venue.trim() : undefined,
        capacity: dto.capacity !== undefined ? dto.capacity : undefined,
        timezone: dto.timezone !== undefined ? dto.timezone.trim() : undefined,
      },
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'event.updated',
      resourceType: 'Event',
      resourceId: eventId,
      diff: { before: { name: current.name }, after: { name: updated.name } },
    });

    return updated;
  }

  async deleteEvent(eventId: string, actorId?: string) {
    await this.getEvent(eventId);

    const membersCount = await this.prisma.graduateMembership.count({
      where: { event_id: eventId },
    });

    if (membersCount > 0) {
      throw new ConflictException({
        code: 'EVENT_HAS_MEMBERS',
        message: 'No es posible eliminar un evento con graduados registrados. Cambia su estado a CANCELLED o CLOSED.',
      });
    }

    await this.prisma.event.delete({ where: { id: eventId } });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'event.deleted',
      resourceType: 'Event',
      resourceId: eventId,
    });

    return { success: true };
  }

  async getEventSummary(eventId: string) {
    const event = await this.getEvent(eventId);

    const [memberships, plans, tables, tableAssignments] = await Promise.all([
      this.prisma.graduateMembership.findMany({
        where: { event_id: eventId },
        select: { status: true },
      }),
      this.prisma.paymentPlan.findMany({
        where: { event_id: eventId },
        include: {
          installments: { include: { allocations: true } },
        },
      }),
      this.prisma.eventTable.findMany({
        where: { event_id: eventId },
        select: { capacity: true },
      }),
      this.prisma.tableAssignment.count({
        where: { table: { event_id: eventId } },
      }),
    ]);

    let totalContracted = new Prisma.Decimal(0);
    let totalCollected = new Prisma.Decimal(0);

    for (const plan of plans) {
      totalContracted = totalContracted.add(plan.contracted_total);
      for (const inst of plan.installments) {
        for (const alloc of inst.allocations) {
          totalCollected = totalCollected.add(alloc.amount);
        }
      }
    }

    const totalTableCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);

    return {
      eventId: event.id,
      name: event.name,
      status: event.status,
      date: event.date,
      venue: event.venue,
      capacity: event.capacity,
      stats: {
        graduatesTotal: memberships.length,
        graduatesActive: memberships.filter((m) => m.status === 'ACTIVE').length,
        financial: {
          contracted: totalContracted.toFixed(2),
          collected: totalCollected.toFixed(2),
          pending: totalContracted.minus(totalCollected).toFixed(2),
          collectionRate: totalContracted.gt(0)
            ? totalCollected.mul(100).div(totalContracted).toFixed(2)
            : '0.00',
        },
        seating: {
          tablesCount: tables.length,
          totalSeatsCapacity: totalTableCapacity,
          assignedSeats: tableAssignments,
          occupancyRate: totalTableCapacity > 0
            ? ((tableAssignments / totalTableCapacity) * 100).toFixed(2)
            : '0.00',
        },
      },
    };
  }

  async transitionEvent(eventId: string, dto: TransitionEventDto, actorId?: string) {
    const event = await this.getEvent(eventId);

    const validTransitions: Record<EventStatus, EventStatus[]> = {
      [EventStatus.DRAFT]: [EventStatus.OPEN, EventStatus.CANCELLED],
      [EventStatus.OPEN]: [EventStatus.CLOSED, EventStatus.CANCELLED],
      [EventStatus.CLOSED]: [EventStatus.FINALIZED, EventStatus.CANCELLED],
      [EventStatus.FINALIZED]: [],
      [EventStatus.CANCELLED]: [],
    };

    const allowed = validTransitions[event.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException({
        code: 'INVALID_EVENT_TRANSITION',
        message: `No se puede cambiar el estado de ${event.status} a ${dto.status}.`,
      });
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: { status: dto.status },
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'event.transitioned',
      resourceType: 'Event',
      resourceId: eventId,
      diff: { before: event.status, after: updated.status },
      reason: dto.reason,
    });

    return updated;
  }

  // Access Code
  async getAccessCode(eventId: string) {
    const code = await this.prisma.eventAccessCode.findFirst({
      where: { event_id: eventId, status: EventAccessCodeStatus.ACTIVE },
      orderBy: { created_at: 'desc' },
    });

    if (!code) {
      throw new NotFoundException({
        code: 'NO_ACTIVE_ACCESS_CODE',
        message: 'No existe código de acceso activo para este evento.',
      });
    }

    return {
      id: code.id,
      eventId: code.event_id,
      status: code.status,
      expiresAt: code.expires_at,
      rotatedAt: code.rotated_at,
    };
  }

  async rotateAccessCode(eventId: string, dto: RotateAccessCodeDto, actorId?: string) {
    const newRawCode = dto.new_code?.trim() || `EVT-${Date.now().toString().slice(-4)}`;
    const newHash = await bcrypt.hash(newRawCode, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.eventAccessCode.updateMany({
        where: { event_id: eventId, status: EventAccessCodeStatus.ACTIVE },
        data: { status: EventAccessCodeStatus.REVOKED, rotated_at: new Date() },
      });

      const created = await tx.eventAccessCode.create({
        data: {
          event_id: eventId,
          code_hash: newHash,
          status: EventAccessCodeStatus.ACTIVE,
        },
      });

      return created;
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'access_code.rotated',
      resourceType: 'EventAccessCode',
      resourceId: result.id,
    });

    return {
      id: result.id,
      newAccessCode: newRawCode,
      status: result.status,
    };
  }

  // Products
  async listProducts(eventId: string) {
    return this.prisma.eventProduct.findMany({
      where: { event_id: eventId },
      orderBy: { display_order: 'asc' },
    });
  }

  async createProduct(eventId: string, dto: CreateProductDto) {
    return this.prisma.eventProduct.create({
      data: {
        event_id: eventId,
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        kind: dto.kind,
        unit_price: new Prisma.Decimal(dto.unit_price),
        display_order: dto.display_order || 1,
      },
    });
  }

  async updateProduct(eventId: string, productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.eventProduct.findFirst({
      where: { id: productId, event_id: eventId },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado.',
      });
    }

    return this.prisma.eventProduct.update({
      where: { id: productId },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        unit_price: dto.unit_price !== undefined ? new Prisma.Decimal(dto.unit_price) : undefined,
        is_active: dto.is_active !== undefined ? dto.is_active : undefined,
        display_order: dto.display_order !== undefined ? dto.display_order : undefined,
      },
    });
  }

  async deleteProduct(eventId: string, productId: string) {
    const product = await this.prisma.eventProduct.findFirst({
      where: { id: productId, event_id: eventId },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Producto no encontrado.',
      });
    }

    await this.prisma.eventProduct.update({
      where: { id: productId },
      data: { is_active: false },
    });

    return { success: true };
  }

  // Financial Configurations
  async listFinancialConfigurations(eventId: string) {
    return this.prisma.eventFinancialConfiguration.findMany({
      where: { event_id: eventId },
      include: { templates: { orderBy: { sequence: 'asc' } } },
      orderBy: { version: 'desc' },
    });
  }

  async createFinancialConfigurationDraft(eventId: string, dto: CreateFinancialConfigurationDto) {
    const maxVersion = await this.prisma.eventFinancialConfiguration.aggregate({
      where: { event_id: eventId },
      _max: { version: true },
    });
    const nextVersion = (maxVersion._max.version || 0) + 1;

    return this.prisma.eventFinancialConfiguration.create({
      data: {
        event_id: eventId,
        version: nextVersion,
        status: ConfigurationStatus.DRAFT,
        description: dto.name.trim(),
      },
    });
  }

  async updateFinancialConfigurationDraft(configurationId: string, dto: Partial<CreateFinancialConfigurationDto>) {
    const config = await this.prisma.eventFinancialConfiguration.findUnique({
      where: { id: configurationId },
    });

    if (!config) {
      throw new NotFoundException({
        code: 'CONFIGURATION_NOT_FOUND',
        message: 'Configuración financiera no encontrada.',
      });
    }

    if (config.status === ConfigurationStatus.ACTIVE) {
      throw new ConflictException({
        code: 'CANNOT_EDIT_ACTIVE_CONFIGURATION',
        message: 'No es posible editar una configuración ya activa.',
      });
    }

    return this.prisma.eventFinancialConfiguration.update({
      where: { id: configurationId },
      data: {
        description: dto.name !== undefined ? dto.name.trim() : undefined,
      },
    });
  }

  async publishFinancialConfiguration(configurationId: string) {
    const config = await this.prisma.eventFinancialConfiguration.findUnique({
      where: { id: configurationId },
    });

    if (!config) {
      throw new NotFoundException({
        code: 'CONFIGURATION_NOT_FOUND',
        message: 'Configuración no encontrada.',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.eventFinancialConfiguration.updateMany({
        where: { event_id: config.event_id, status: ConfigurationStatus.ACTIVE },
        data: { status: ConfigurationStatus.ARCHIVED },
      });

      return tx.eventFinancialConfiguration.update({
        where: { id: configurationId },
        data: { status: ConfigurationStatus.ACTIVE },
      });
    });
  }

  // Milestones
  async listFinancialMilestones(eventId: string) {
    return this.prisma.financialMilestone.findMany({
      where: { event_id: eventId },
      orderBy: { due_date: 'asc' },
    });
  }

  async createFinancialMilestone(eventId: string, dto: CreateFinancialMilestoneDto) {
    return this.prisma.financialMilestone.create({
      data: {
        event_id: eventId,
        name: dto.title.trim(),
        due_date: new Date(dto.due_date),
        target_percentage: new Prisma.Decimal(dto.target_amount),
      },
    });
  }

  // Late Payment Policy
  async getLatePaymentPolicy(eventId: string) {
    const settings = await this.prisma.eventSettings.findUnique({
      where: { event_id: eventId },
    });

    if (!settings) {
      throw new NotFoundException({
        code: 'SETTINGS_NOT_FOUND',
        message: 'Configuración del evento no encontrada.',
      });
    }

    return {
      lateGraceDays: settings.late_grace_days,
      lateFeeAmount: settings.late_fee_amount.toString(),
    };
  }

  async updateLatePaymentPolicy(eventId: string, dto: UpdateLatePaymentPolicyDto) {
    return this.prisma.eventSettings.update({
      where: { event_id: eventId },
      data: {
        late_grace_days: dto.late_grace_days,
        late_fee_amount: new Prisma.Decimal(dto.late_fee_amount),
      },
    });
  }

  // Meal Options
  async listMealOptions(eventId: string) {
    return this.prisma.mealOption.findMany({
      where: { event_id: eventId },
      orderBy: { display_order: 'asc' },
    });
  }

  async createMealOption(eventId: string, dto: CreateMealOptionDto) {
    const type = dto.type || (dto.is_vegan ? 'VEGAN' : dto.is_vegetarian ? 'VEGETARIAN' : 'STANDARD');
    return this.prisma.mealOption.create({
      data: {
        event_id: eventId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        type,
        is_vegetarian: dto.is_vegetarian ?? (type === 'VEGETARIAN' || type === 'VEGAN'),
        is_vegan: dto.is_vegan ?? (type === 'VEGAN'),
        display_order: dto.display_order || 1,
      },
    });
  }

  async updateMealOption(eventId: string, mealOptionId: string, dto: UpdateMealOptionDto) {
    const option = await this.prisma.mealOption.findFirst({
      where: { id: mealOptionId, event_id: eventId },
    });

    if (!option) {
      throw new NotFoundException({
        code: 'OPTION_NOT_FOUND',
        message: 'Opción de platillo no encontrada.',
      });
    }

    let nextType = dto.type;
    if (!nextType && (dto.is_vegan !== undefined || dto.is_vegetarian !== undefined)) {
      const isVegan = dto.is_vegan ?? option.is_vegan;
      const isVeg = dto.is_vegetarian ?? option.is_vegetarian;
      nextType = isVegan ? 'VEGAN' : isVeg ? 'VEGETARIAN' : 'STANDARD';
    }

    return this.prisma.mealOption.update({
      where: { id: mealOptionId },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        description: dto.description !== undefined ? dto.description.trim() : undefined,
        type: nextType !== undefined ? nextType : undefined,
        is_vegetarian: dto.is_vegetarian !== undefined ? dto.is_vegetarian : (nextType ? (nextType === 'VEGETARIAN' || nextType === 'VEGAN') : undefined),
        is_vegan: dto.is_vegan !== undefined ? dto.is_vegan : (nextType ? (nextType === 'VEGAN') : undefined),
        is_active: dto.is_active !== undefined ? dto.is_active : undefined,
        display_order: dto.display_order !== undefined ? dto.display_order : undefined,
      },
    });
  }

  async deleteMealOption(eventId: string, mealOptionId: string) {
    const option = await this.prisma.mealOption.findFirst({
      where: { id: mealOptionId, event_id: eventId },
    });

    if (!option) {
      throw new NotFoundException({
        code: 'OPTION_NOT_FOUND',
        message: 'Opción no encontrada.',
      });
    }

    await this.prisma.mealOption.update({
      where: { id: mealOptionId },
      data: { is_active: false },
    });

    return { success: true };
  }

  // Cancellation Policies
  async listCancellationPolicies(eventId: string) {
    return this.prisma.cancellationPolicy.findMany({
      where: { event_id: eventId },
      include: { ranges: { orderBy: { days_before_min: 'asc' } } },
    });
  }

  async createCancellationPolicyDraft(eventId: string, dto: CreateCancellationPolicyDto) {
    const maxVersion = await this.prisma.cancellationPolicy.aggregate({
      where: { event_id: eventId },
      _max: { version: true },
    });
    const nextVersion = (maxVersion._max.version || 0) + 1;

    return this.prisma.cancellationPolicy.create({
      data: {
        event_id: eventId,
        version: nextVersion,
        status: CancellationPolicyStatus.DRAFT,
      },
    });
  }

  async addCancellationPolicyRange(policyId: string, dto: AddCancellationPolicyRangeDto) {
    const policy = await this.prisma.cancellationPolicy.findUnique({
      where: { id: policyId },
    });

    if (!policy) {
      throw new NotFoundException({
        code: 'POLICY_NOT_FOUND',
        message: 'Política de cancelación no encontrada.',
      });
    }

    if (policy.status === CancellationPolicyStatus.ACTIVE) {
      throw new ConflictException({
        code: 'POLICY_ALREADY_ACTIVE',
        message: 'No es posible modificar una política activa.',
      });
    }

    return this.prisma.cancellationPolicyRange.create({
      data: {
        policy_id: policyId,
        days_before_min: dto.days_before_event_min,
        days_before_max: dto.days_before_event_max,
        penalty_percent: new Prisma.Decimal(dto.penalty_percentage),
      },
    });
  }

  async validateCancellationPolicyDraft(policyId: string) {
    const policy = await this.prisma.cancellationPolicy.findUnique({
      where: { id: policyId },
      include: { ranges: true },
    });

    if (!policy) {
      throw new NotFoundException({
        code: 'POLICY_NOT_FOUND',
        message: 'Política no encontrada.',
      });
    }

    if (policy.ranges.length === 0) {
      return {
        valid: false,
        message: 'La política debe tener al menos un rango de fechas.',
      };
    }

    return { valid: true, message: 'La política es coherente y válida para activación.' };
  }

  async publishCancellationPolicy(policyId: string) {
    const policy = await this.prisma.cancellationPolicy.findUnique({
      where: { id: policyId },
    });

    if (!policy) {
      throw new NotFoundException({
        code: 'POLICY_NOT_FOUND',
        message: 'Política no encontrada.',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.cancellationPolicy.updateMany({
        where: { event_id: policy.event_id, status: CancellationPolicyStatus.ACTIVE },
        data: { status: CancellationPolicyStatus.ARCHIVED },
      });

      return tx.cancellationPolicy.update({
        where: { id: policyId },
        data: { status: CancellationPolicyStatus.ACTIVE },
      });
    });
  }

  // Thermo Configurations
  async listThermoConfigurations(eventId: string) {
    return this.prisma.thermoConfiguration.findMany({
      where: { event_id: eventId },
      include: { fields: { include: { options: true } } },
    });
  }

  async createThermoConfigurationDraft(eventId: string, dto: CreateThermoConfigurationDto) {
    const maxVersion = await this.prisma.thermoConfiguration.aggregate({
      where: { event_id: eventId },
      _max: { version: true },
    });
    const nextVersion = (maxVersion._max.version || 0) + 1;

    return this.prisma.thermoConfiguration.create({
      data: {
        event_id: eventId,
        version: nextVersion,
        status: ConfigurationStatus.DRAFT,
      },
    });
  }

  async updateThermoConfigurationDraft(configurationId: string, dto: Partial<CreateThermoConfigurationDto>) {
    const config = await this.prisma.thermoConfiguration.findUnique({
      where: { id: configurationId },
    });

    if (!config) {
      throw new NotFoundException({
        code: 'CONFIG_NOT_FOUND',
        message: 'Configuración de termo no encontrada.',
      });
    }

    if (config.status === ConfigurationStatus.ACTIVE) {
      throw new ConflictException({
        code: 'CANNOT_EDIT_ACTIVE_CONFIG',
        message: 'No es posible editar una configuración de termo activa.',
      });
    }

    return config;
  }

  async publishThermoConfiguration(configurationId: string) {
    const config = await this.prisma.thermoConfiguration.findUnique({
      where: { id: configurationId },
    });

    if (!config) {
      throw new NotFoundException({
        code: 'CONFIG_NOT_FOUND',
        message: 'Configuración no encontrada.',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.thermoConfiguration.updateMany({
        where: { event_id: config.event_id, status: ConfigurationStatus.ACTIVE },
        data: { status: ConfigurationStatus.ARCHIVED },
      });

      return tx.thermoConfiguration.update({
        where: { id: configurationId },
        data: { status: ConfigurationStatus.ACTIVE },
      });
    });
  }
}
