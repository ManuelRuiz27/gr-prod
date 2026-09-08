import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import {
  PaymentProvider,
  ProviderEventProcessingStatus,
  PaymentTransactionStatus,
  PaymentSource,
  InstallmentLifecycleStatus,
  PaymentAttemptStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async handleMercadoPago(payload: any, headers?: any) {
    const externalEventId = payload?.id?.toString() || payload?.data?.id?.toString() || `MP-${Date.now()}`;
    const action = payload?.action || payload?.type || 'payment.updated';

    this.logger.log(`Handling Mercado Pago webhook event ${externalEventId} action: ${action}`);

    const existing = await this.prisma.paymentProviderEvent.findUnique({
      where: {
        provider_external_event_id: {
          provider: PaymentProvider.MERCADO_PAGO,
          external_event_id: externalEventId,
        },
      },
    });

    if (existing) {
      this.logger.log(`Duplicate Mercado Pago event ${externalEventId} already processed.`);
      return { status: 'ALREADY_PROCESSED', externalEventId };
    }

    const providerEvent = await this.prisma.paymentProviderEvent.create({
      data: {
        provider: PaymentProvider.MERCADO_PAGO,
        external_event_id: externalEventId,
        event_type: action,
        payload: payload as Prisma.InputJsonValue,
        processing_status: ProviderEventProcessingStatus.RECEIVED,
      },
    });

    const attemptId = payload?.data?.metadata?.attempt_id || payload?.external_reference;
    if (attemptId) {
      await this.reconcilePaymentAttempt(attemptId, PaymentSource.MERCADO_PAGO, payload, providerEvent.id);
    }

    await this.prisma.paymentProviderEvent.update({
      where: { id: providerEvent.id },
      data: {
        processing_status: ProviderEventProcessingStatus.PROCESSED,
        processed_at: new Date(),
      },
    });

    return { received: true, externalEventId };
  }

  async handleOpenPay(payload: any, headers?: any) {
    const externalEventId = payload?.id || `OP-${Date.now()}`;
    const eventType = payload?.type || 'charge.succeeded';

    this.logger.log(`Handling OpenPay webhook event ${externalEventId} type: ${eventType}`);

    const existing = await this.prisma.paymentProviderEvent.findUnique({
      where: {
        provider_external_event_id: {
          provider: PaymentProvider.OPENPAY,
          external_event_id: externalEventId,
        },
      },
    });

    if (existing) {
      this.logger.log(`Duplicate OpenPay event ${externalEventId} already processed.`);
      return { status: 'ALREADY_PROCESSED', externalEventId };
    }

    const providerEvent = await this.prisma.paymentProviderEvent.create({
      data: {
        provider: PaymentProvider.OPENPAY,
        external_event_id: externalEventId,
        event_type: eventType,
        payload: payload as Prisma.InputJsonValue,
        processing_status: ProviderEventProcessingStatus.RECEIVED,
      },
    });

    const attemptId = payload?.transaction?.order_id || payload?.order_id;
    if (attemptId) {
      await this.reconcilePaymentAttempt(attemptId, PaymentSource.OPENPAY, payload, providerEvent.id);
    }

    await this.prisma.paymentProviderEvent.update({
      where: { id: providerEvent.id },
      data: {
        processing_status: ProviderEventProcessingStatus.PROCESSED,
        processed_at: new Date(),
      },
    });

    return { received: true, externalEventId };
  }

  private async reconcilePaymentAttempt(
    attemptId: string,
    source: PaymentSource,
    rawPayload: any,
    providerEventId: string,
  ) {
    try {
      const attempt = await this.prisma.paymentAttempt.findUnique({
        where: { id: attemptId },
        include: { payment_plan: true },
      });

      if (!attempt || attempt.status === PaymentAttemptStatus.CONFIRMED) {
        return;
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.paymentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: PaymentAttemptStatus.CONFIRMED,
            external_reference: rawPayload.id?.toString(),
          },
        });

        const txRecord = await tx.paymentTransaction.create({
          data: {
            payment_plan_id: attempt.payment_plan_id,
            amount: attempt.requested_amount,
            source,
            external_identifier: rawPayload.id?.toString() || `WEBHOOK-${Date.now()}`,
            reference: attempt.id,
            status: PaymentTransactionStatus.CONFIRMED,
            paid_at: new Date(),
          },
        });

        const installments = await tx.installment.findMany({
          where: {
            payment_plan_id: attempt.payment_plan_id,
            status: InstallmentLifecycleStatus.ACTIVE,
          },
          include: { allocations: true },
          orderBy: { sequence: 'asc' },
        });

        let remaining = attempt.requested_amount;

        for (const inst of installments) {
          if (remaining.lte(0)) break;

          let instPaid = new Prisma.Decimal(0);
          for (const alloc of inst.allocations) {
            instPaid = instPaid.add(alloc.amount);
          }

          const unpaid = inst.amount.minus(instPaid);
          if (unpaid.lte(0)) continue;

          const allocAmount = Prisma.Decimal.min(remaining, unpaid);

          await tx.paymentAllocation.create({
            data: {
              transaction_id: txRecord.id,
              installment_id: inst.id,
              amount: allocAmount,
            },
          });

          remaining = remaining.minus(allocAmount);
        }
      });

      this.logger.log(`Successfully reconciled webhook payment for attempt ${attemptId}`);
    } catch (error) {
      this.logger.error(`Error reconciling payment attempt ${attemptId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
