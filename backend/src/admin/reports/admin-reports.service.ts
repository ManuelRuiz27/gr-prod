import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateExportJobDto } from './dto/admin-reports.dto';
import { ExportJobStatus, ExportFormat, Prisma } from '@prisma/client';

@Injectable()
export class AdminReportsService {
  private readonly logger = new Logger(AdminReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  sanitizeCsvCell(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
      return `'${str}`;
    }
    return str;
  }

  async getOperationsReport(eventId: string) {
    const memberships = await this.prisma.graduateMembership.findMany({
      where: { event_id: eventId },
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
            installments: { include: { allocations: true } },
          },
        },
        contracts: { orderBy: { created_at: 'desc' }, take: 1 },
        thermo_request: true,
      },
      orderBy: { created_at: 'asc' },
    });

    return memberships.map((m) => {
      const assignedTable = m.group_members.find((gm) => gm.table_assignment?.table)?.table_assignment?.table;
      const mealsSelectedCount = m.group_members.filter((gm) => gm.meal_selection).length;
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
        fullName: this.sanitizeCsvCell(m.account.full_name),
        email: this.sanitizeCsvCell(m.account.email),
        phone: this.sanitizeCsvCell(m.account.phone_e164),
        status: m.status,
        placesCount: m.group_members.length,
        contractStatus: m.contracts[0]?.status || 'NONE',
        totalAmount: contracted.toString(),
        totalPaid: totalPaid.toString(),
        balanceRemaining: Prisma.Decimal.max(0, balance).toString(),
        mealsSelectedCount,
        mealsTotalRequired: m.group_members.length,
        tableAssigned: assignedTable ? assignedTable.label : 'SIN ASIGNAR',
        thermoStatus: m.thermo_request?.status || 'NOT_REQUESTED',
        createdAt: m.created_at,
      };
    });
  }

  async getFinancialReport(eventId: string) {
    const plans = await this.prisma.paymentPlan.findMany({
      where: { event_id: eventId },
      include: {
        membership: { include: { account: true } },
        installments: {
          include: { allocations: true },
          orderBy: { sequence: 'asc' },
        },
        transactions: true,
      },
    });

    let totalContracted = new Prisma.Decimal(0);
    let totalCollected = new Prisma.Decimal(0);

    const planRows = plans.map((p) => {
      totalContracted = totalContracted.add(p.contracted_total);

      let planPaid = new Prisma.Decimal(0);
      let installmentsPaidCount = 0;

      for (const inst of p.installments) {
        let instPaid = new Prisma.Decimal(0);
        for (const alloc of inst.allocations) {
          instPaid = instPaid.add(alloc.amount);
        }
        planPaid = planPaid.add(instPaid);
        if (instPaid.gte(inst.amount)) {
          installmentsPaidCount++;
        }
      }

      totalCollected = totalCollected.add(planPaid);
      const balance = p.contracted_total.minus(planPaid);

      return {
        planId: p.id,
        graduateName: this.sanitizeCsvCell(p.membership.account.full_name),
        email: this.sanitizeCsvCell(p.membership.account.email),
        totalAmount: p.contracted_total.toString(),
        paidAmount: planPaid.toString(),
        balanceRemaining: Prisma.Decimal.max(0, balance).toString(),
        status: p.status,
        installmentsPaid: installmentsPaidCount,
        installmentsTotal: p.installments.length,
      };
    });

    return {
      summary: {
        totalContracted: totalContracted.toFixed(2),
        totalCollected: totalCollected.toFixed(2),
        totalBalanceRemaining: Prisma.Decimal.max(0, totalContracted.minus(totalCollected)).toFixed(2),
      },
      plans: planRows,
    };
  }

  async getMealsReport(eventId: string) {
    const options = await this.prisma.mealOption.findMany({
      where: { event_id: eventId },
      include: {
        _count: { select: { selections: true } },
      },
      orderBy: { display_order: 'asc' },
    });

    return {
      tallies: options.map((opt) => ({
        optionId: opt.id,
        name: opt.name,
        description: opt.description,
        isVegetarian: opt.is_vegetarian,
        isVegan: opt.is_vegan,
        count: opt._count.selections,
      })),
    };
  }

  async getSeatingReport(eventId: string) {
    const tables = await this.prisma.eventTable.findMany({
      where: { event_id: eventId },
      include: {
        assignments: {
          include: {
            group_member: {
              include: { membership: { include: { account: true } } },
            },
          },
        },
      },
      orderBy: { label: 'asc' },
    });

    return tables.map((t) => ({
      tableId: t.id,
      label: t.label,
      capacity: t.capacity,
      occupied: t.assignments.length,
      available: Math.max(0, t.capacity - t.assignments.length),
      status: t.status,
      occupants: t.assignments.map((a) => ({
        memberName: this.sanitizeCsvCell(a.group_member.full_name),
        graduateName: this.sanitizeCsvCell(a.group_member.membership.account.full_name),
      })),
    }));
  }

  async getThermosReport(eventId: string) {
    const requests = await this.prisma.thermoRequest.findMany({
      where: { membership: { event_id: eventId } },
      include: {
        membership: { include: { account: true } },
        values: { include: { field: true } },
        delivery: true,
      },
      orderBy: { requested_at: 'desc' },
    });

    return requests.map((r) => ({
      requestId: r.id,
      graduateName: this.sanitizeCsvCell(r.membership.account.full_name),
      status: r.status,
      requestedAt: r.requested_at,
      deliveryStatus: r.delivery ? 'DELIVERED' : 'PENDING',
      deliveredAt: r.delivery?.delivered_at || null,
    }));
  }

  async getAuditReport(eventId: string) {
    return this.prisma.auditLog.findMany({
      where: { event_id: eventId },
      include: {
        actor: { select: { id: true, full_name: true, email: true, role: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }

  async listAuditLogs(eventId: string) {
    return this.getAuditReport(eventId);
  }

  async createExportJob(eventId: string, dto: CreateExportJobDto, actorId: string) {
    const format = dto.file_format === 'XLSX' ? ExportFormat.XLSX : ExportFormat.CSV;

    const job = await this.prisma.exportJob.create({
      data: {
        event_id: eventId,
        report_type: dto.job_type,
        format,
        filters: dto.filters ? (dto.filters as Prisma.InputJsonValue) : Prisma.JsonNull,
        status: ExportJobStatus.COMPLETED,
        created_by_account_id: actorId,
        completed_at: new Date(),
      },
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'export_job.created',
      resourceType: 'ExportJob',
      resourceId: job.id,
      description: `Reporte exportado: ${dto.job_type} (${format})`,
    });

    return {
      jobId: job.id,
      jobType: job.report_type,
      status: job.status,
      downloadUrl: `/api/admin/events/${eventId}/export-jobs/${job.id}/download`,
    };
  }

  async listExportJobs(eventId: string) {
    return this.prisma.exportJob.findMany({
      where: { event_id: eventId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getExportJob(eventId: string, jobId: string) {
    const job = await this.prisma.exportJob.findFirst({
      where: { id: jobId, event_id: eventId },
    });

    if (!job) {
      throw new NotFoundException({
        code: 'JOB_NOT_FOUND',
        message: 'Trabajo de exportación no encontrado.',
      });
    }

    return job;
  }
}
