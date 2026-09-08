import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import {
  ApproveSubmissionDto,
  RejectSubmissionDto,
  CreateAdjustmentDto,
  CreateRefundDto,
  ResolveReconciliationCaseDto,
} from './dto/admin-finance.dto';
import {
  PaymentSubmissionStatus,
  PaymentTransactionStatus,
  InstallmentLifecycleStatus,
  RefundStatus,
  ReconciliationCaseStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class AdminFinanceService {
  private readonly logger = new Logger(AdminFinanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getPortfolioSummary(eventId: string) {
    const plans = await this.prisma.paymentPlan.findMany({
      where: { event_id: eventId },
      include: {
        installments: { include: { allocations: true } },
      },
    });

    let totalContracted = new Prisma.Decimal(0);
    let totalCollected = new Prisma.Decimal(0);
    let totalOverdue = new Prisma.Decimal(0);
    let paidInstallmentsCount = 0;
    let totalInstallmentsCount = 0;

    const now = new Date();

    for (const plan of plans) {
      totalContracted = totalContracted.add(plan.contracted_total);

      for (const inst of plan.installments) {
        totalInstallmentsCount++;
        let instPaid = new Prisma.Decimal(0);
        for (const alloc of inst.allocations) {
          instPaid = instPaid.add(alloc.amount);
        }

        totalCollected = totalCollected.add(instPaid);

        if (instPaid.gte(inst.amount)) {
          paidInstallmentsCount++;
        } else if (inst.due_date < now) {
          const unpaid = inst.amount.minus(instPaid);
          totalOverdue = totalOverdue.add(unpaid);
        }
      }
    }

    const totalBalanceRemaining = totalContracted.minus(totalCollected);
    const collectionPercentage = totalContracted.gt(0)
      ? totalCollected.mul(100).div(totalContracted).toFixed(2)
      : '0.00';

    return {
      eventId,
      totalContracted: totalContracted.toFixed(2),
      totalCollected: totalCollected.toFixed(2),
      totalBalanceRemaining: Prisma.Decimal.max(0, totalBalanceRemaining).toFixed(2),
      totalOverdue: totalOverdue.toFixed(2),
      collectionPercentage,
      installmentsStats: {
        total: totalInstallmentsCount,
        paid: paidInstallmentsCount,
        pending: totalInstallmentsCount - paidInstallmentsCount,
      },
    };
  }

  async listPaymentTransactions(eventId: string) {
    return this.prisma.paymentTransaction.findMany({
      where: {
        payment_plan: { event_id: eventId },
      },
      include: {
        payment_plan: {
          include: {
            membership: {
              include: { account: true },
            },
          },
        },
        allocations: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async listPaymentSubmissions(status?: string, eventId?: string) {
    const where: Prisma.PaymentSubmissionWhereInput = {};
    if (status) {
      where.status = status as PaymentSubmissionStatus;
    }
    if (eventId) {
      where.payment_plan = { event_id: eventId };
    }

    return this.prisma.paymentSubmission.findMany({
      where,
      include: {
        evidence_file: true,
        payment_plan: {
          include: {
            membership: {
              include: {
                account: true,
                event: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getPaymentSubmission(submissionId: string) {
    const submission = await this.prisma.paymentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        evidence_file: true,
        payment_plan: {
          include: {
            membership: {
              include: { account: true, event: true },
            },
            installments: {
              include: { allocations: true },
              orderBy: { sequence: 'asc' },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException({
        code: 'SUBMISSION_NOT_FOUND',
        message: 'Comprobante de pago no encontrado.',
      });
    }

    return submission;
  }

  async approvePaymentSubmission(
    submissionId: string,
    dto: ApproveSubmissionDto,
    actorId: string,
  ) {
    const submission = await this.getPaymentSubmission(submissionId);

    if (submission.status !== PaymentSubmissionStatus.PENDING_REVIEW) {
      throw new ConflictException({
        code: 'SUBMISSION_ALREADY_PROCESSED',
        message: `El comprobante ya fue procesado con estado: ${submission.status}.`,
      });
    }

    const plan = submission.payment_plan;
    const amountDecimal = submission.amount;

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedSubmission = await tx.paymentSubmission.update({
        where: { id: submissionId },
        data: {
          status: PaymentSubmissionStatus.APPROVED,
          reviewed_by_account_id: actorId,
          reviewed_at: new Date(),
        },
      });

      const txRecord = await tx.paymentTransaction.create({
        data: {
          payment_plan_id: plan.id,
          submission_id: submission.id,
          amount: amountDecimal,
          source: submission.method,
          reference: submission.reference,
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

      return { updatedSubmission, transactionId: txRecord.id };
    });

    await this.auditService.log({
      eventId: plan.event_id,
      actorAccountId: actorId,
      action: 'payment_submission.approved',
      resourceType: 'PaymentSubmission',
      resourceId: submissionId,
      description: `Comprobante aprobado: $${amountDecimal.toString()} Ref: ${submission.reference}`,
    });

    return {
      success: true,
      submissionId,
      transactionId: result.transactionId,
    };
  }

  async rejectPaymentSubmission(
    submissionId: string,
    dto: RejectSubmissionDto,
    actorId: string,
  ) {
    const submission = await this.getPaymentSubmission(submissionId);

    if (submission.status !== PaymentSubmissionStatus.PENDING_REVIEW) {
      throw new ConflictException({
        code: 'SUBMISSION_ALREADY_PROCESSED',
        message: `El comprobante ya fue procesado con estado: ${submission.status}.`,
      });
    }

    const updated = await this.prisma.paymentSubmission.update({
      where: { id: submissionId },
      data: {
        status: PaymentSubmissionStatus.REJECTED,
        rejection_reason: dto.rejection_reason.trim(),
        reviewed_by_account_id: actorId,
        reviewed_at: new Date(),
      },
    });

    await this.auditService.log({
      eventId: submission.payment_plan.event_id,
      actorAccountId: actorId,
      action: 'payment_submission.rejected',
      resourceType: 'PaymentSubmission',
      resourceId: submissionId,
      description: `Comprobante rechazado: ${dto.rejection_reason}`,
    });

    return updated;
  }

  async createPaymentPlanAdjustment(planId: string, dto: CreateAdjustmentDto, actorId: string) {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException({
        code: 'PLAN_NOT_FOUND',
        message: 'Plan de pagos no encontrado.',
      });
    }

    const amountDecimal = new Prisma.Decimal(dto.amount);

    const adjustment = await this.prisma.adjustment.create({
      data: {
        payment_plan_id: planId,
        type: dto.type,
        amount: amountDecimal,
        reason: dto.reason.trim(),
        created_by_account_id: actorId,
      },
    });

    await this.auditService.log({
      eventId: plan.event_id,
      actorAccountId: actorId,
      action: 'payment_plan.adjusted',
      resourceType: 'Adjustment',
      resourceId: adjustment.id,
      description: `Ajuste ${dto.type}: $${dto.amount} (${dto.reason})`,
    });

    return adjustment;
  }

  async createPaymentPlanRefund(planId: string, dto: CreateRefundDto, actorId: string) {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException({
        code: 'PLAN_NOT_FOUND',
        message: 'Plan de pagos no encontrado.',
      });
    }

    const refund = await this.prisma.refund.create({
      data: {
        payment_plan_id: planId,
        amount: new Prisma.Decimal(dto.amount),
        reason: dto.reason.trim(),
        method: 'MANUAL',
        status: RefundStatus.CONFIRMED,
      },
    });

    await this.auditService.log({
      eventId: plan.event_id,
      actorAccountId: actorId,
      action: 'payment_plan.refunded',
      resourceType: 'Refund',
      resourceId: refund.id,
      description: `Reembolso registrado: $${dto.amount} (${dto.reason})`,
    });

    return refund;
  }

  async listEventRefunds(eventId: string) {
    return this.prisma.refund.findMany({
      where: {
        payment_plan: { event_id: eventId },
      },
      include: {
        payment_plan: {
          include: {
            membership: { include: { account: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async listReconciliationCases(eventId?: string) {
    const where: Prisma.ReconciliationCaseWhereInput = {};
    if (eventId) {
      where.event_id = eventId;
    }

    return this.prisma.reconciliationCase.findMany({
      where,
      include: {
        event: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async resolveReconciliationCase(
    caseId: string,
    dto: ResolveReconciliationCaseDto,
    actorId: string,
  ) {
    const rCase = await this.prisma.reconciliationCase.findUnique({
      where: { id: caseId },
    });

    if (!rCase) {
      throw new NotFoundException({
        code: 'CASE_NOT_FOUND',
        message: 'Caso de conciliación no encontrado.',
      });
    }

    const updated = await this.prisma.reconciliationCase.update({
      where: { id: caseId },
      data: {
        status: ReconciliationCaseStatus.RESOLVED,
        resolved_by_account_id: actorId,
        resolved_at: new Date(),
        resolution_note: dto.resolution_notes.trim(),
      },
    });

    await this.auditService.log({
      eventId: rCase.event_id,
      actorAccountId: actorId,
      action: 'reconciliation_case.resolved',
      resourceType: 'ReconciliationCase',
      resourceId: caseId,
      description: `Caso resuelto: ${dto.resolution_notes}`,
    });

    return updated;
  }
}
