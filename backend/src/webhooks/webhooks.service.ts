import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { OutboxService } from '../common/outbox/outbox.service';
import { MercadoPagoAdapter } from '../integrations/payments/mercado-pago.adapter';
import { OpenPayAdapter } from '../integrations/payments/openpay.adapter';
import { EventName } from '../common/events/event-catalog';
import {
  UnauthenticatedException,
  BaseDomainException,
} from '../common/errors/domain-exceptions';
import { ErrorCode } from '../common/errors/error-codes';
import {
  PaymentProvider,
  ProviderEventProcessingStatus,
  PaymentTransactionStatus,
  PaymentSource,
  InstallmentLifecycleStatus,
  PaymentAttemptStatus,
  ReconciliationCaseType,
  ReconciliationCaseStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly outboxService: OutboxService,
    private readonly mpAdapter: MercadoPagoAdapter,
    private readonly openPayAdapter: OpenPayAdapter,
  ) {}

  public async handleMercadoPago(payload: Record<string, unknown>, headers: Record<string, string | string[] | undefined> = {}) {
    // 1. RECEIVE & 2. VERIFY AUTHENTICITY
    const verification = await this.mpAdapter.verifyWebhook({
      rawPayload: payload,
      headers,
    });

    if (!verification.isValid) {
      this.logger.warn(`Mercado Pago webhook rejected: ${verification.errorMessage}`);
      throw new UnauthenticatedException(verification.errorMessage || 'Firma de webhook Mercado Pago no válida.');
    }

    const externalEventId = verification.externalEventId || `MP-${Date.now()}`;
    const action = verification.eventType || 'payment.updated';

    this.logger.log(`Handling verified Mercado Pago webhook event ${externalEventId} action: ${action}`);

    // 3. DEDUPLICATE PROVIDER EVENT
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

    // 4. SERVER-TO-SERVER LOOKUP & 5. NORMALIZE RESULT
    if (verification.providerPaymentId) {
      const details = await this.mpAdapter.getPayment(verification.providerPaymentId);

      const dataObj = payload?.data as Record<string, unknown> | undefined;
      const metadataObj = dataObj?.metadata as Record<string, unknown> | undefined;
      const metaAttemptId = metadataObj?.attempt_id;
      const extRef = payload?.external_reference;

      const attemptId =
        (typeof metaAttemptId === 'string' || typeof metaAttemptId === 'number' ? String(metaAttemptId) : undefined) ||
        (typeof extRef === 'string' || typeof extRef === 'number' ? String(extRef) : undefined) ||
        details.externalReference;

      // 6. APPLICATION LAYER DISPATCH
      if (attemptId && details.normalizedStatus === 'CONFIRMED') {
        await this.reconcilePaymentAttempt(
          attemptId,
          PaymentSource.MERCADO_PAGO,
          details.providerPaymentId,
          new Prisma.Decimal(details.amount),
          providerEvent.id,
        );
      }
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

  public async handleOpenPay(payload: Record<string, unknown>, headers: Record<string, string | string[] | undefined> = {}) {
    // 1. RECEIVE & 2. VERIFY AUTHENTICITY
    const verification = await this.openPayAdapter.verifyWebhook({
      rawPayload: payload,
      headers,
    });

    if (!verification.isValid) {
      this.logger.warn(`OpenPay webhook rejected: ${verification.errorMessage}`);
      throw new UnauthenticatedException(verification.errorMessage || 'Firma o autenticación de webhook OpenPay no válida.');
    }

    const externalEventId = verification.externalEventId || `OP-${Date.now()}`;
    const eventType = verification.eventType || 'charge.succeeded';

    this.logger.log(`Handling verified OpenPay webhook event ${externalEventId} type: ${eventType}`);

    // 3. DEDUPLICATE PROVIDER EVENT
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

    // 4. SERVER-TO-SERVER LOOKUP & 5. NORMALIZE RESULT
    if (verification.providerPaymentId) {
      const details = await this.openPayAdapter.getPayment(verification.providerPaymentId);

      const txObj = payload?.transaction as Record<string, unknown> | undefined;
      const txOrderId = txObj?.order_id;
      const payloadOrderId = payload?.order_id;

      const attemptId =
        (typeof txOrderId === 'string' || typeof txOrderId === 'number' ? String(txOrderId) : undefined) ||
        (typeof payloadOrderId === 'string' || typeof payloadOrderId === 'number' ? String(payloadOrderId) : undefined) ||
        details.externalReference;

      // 6. APPLICATION LAYER DISPATCH
      if (attemptId && details.normalizedStatus === 'CONFIRMED') {
        await this.reconcilePaymentAttempt(
          attemptId,
          PaymentSource.OPENPAY,
          details.providerPaymentId,
          new Prisma.Decimal(details.amount),
          providerEvent.id,
        );
      }
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

  /**
   * Reconciles a confirmed payment attempt.
   * INVARIANT: Confirmed money is strictly preserved even if capacity is exceeded.
   */
  private async reconcilePaymentAttempt(
    attemptId: string,
    source: PaymentSource,
    externalIdentifier: string,
    confirmedAmount: Prisma.Decimal,
    _providerEventId: string,
  ): Promise<void> {
    try {
      if (!attemptId || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(attemptId)) {
        this.logger.debug(`Skipping reconcilePaymentAttempt: "${attemptId}" is not a valid attempt UUID.`);
        return;
      }

      const attempt = await this.prisma.paymentAttempt.findUnique({
        where: { id: attemptId },
        include: {
          payment_plan: {
            include: {
              event: true,
            },
          },
        },
      });

      if (!attempt || attempt.status === PaymentAttemptStatus.CONFIRMED) {
        return;
      }

      const event = attempt.payment_plan.event;

      await this.prisma.$transaction(async (tx) => {
        // 1. CAPACITY INVARIANT CHECK
        // Check if event capacity is exceeded
        const totalActiveMemberships = await tx.graduateMembership.count({
          where: {
            event_id: event.id,
            status: 'ACTIVE',
          },
        });

        const isCapacityExceeded = totalActiveMemberships > event.capacity;

        if (isCapacityExceeded) {
          // RULE: Conserve money confirmed in ledger, but record ReconciliationCase
          this.logger.warn(
            `Payment confirmed for attempt ${attemptId}, but event capacity exceeded (${totalActiveMemberships} > ${event.capacity}). Creating ReconciliationCase.`,
          );

          await tx.reconciliationCase.create({
            data: {
              event_id: event.id,
              case_type: ReconciliationCaseType.PAYMENT_CONFIRMED_CAPACITY_CONFLICT,
              status: ReconciliationCaseStatus.OPEN,
              details: {
                paymentAttemptId: attemptId,
                paymentPlanId: attempt.payment_plan_id,
                amount: confirmedAmount.toString(),
                reason: 'EVENT_CAPACITY_CONFLICT',
              },
            },
          });
        }

        // 2. CONFIRM PAYMENT ATTEMPT
        await tx.paymentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: PaymentAttemptStatus.CONFIRMED,
            external_reference: externalIdentifier,
          },
        });

        // 3. CREATE CONFIRMED PAYMENT TRANSACTION
        const txRecord = await tx.paymentTransaction.create({
          data: {
            payment_plan_id: attempt.payment_plan_id,
            amount: confirmedAmount,
            source,
            external_identifier: externalIdentifier,
            reference: attempt.id,
            status: PaymentTransactionStatus.CONFIRMED,
            paid_at: new Date(),
          },
        });

        // 4. ALLOCATE TO ACTIVE INSTALLMENTS
        const installments = await tx.installment.findMany({
          where: {
            payment_plan_id: attempt.payment_plan_id,
            status: InstallmentLifecycleStatus.ACTIVE,
          },
          include: { allocations: true },
          orderBy: { sequence: 'asc' },
        });

        let remaining = confirmedAmount;

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

        // 5. EMIT OUTBOX EVENT (Transactional Outbox Pattern)
        await this.outboxService.publishTransactional(
          tx,
          EventName.PAYMENT_TRANSACTION_CONFIRMED,
          {
            transactionId: txRecord.id,
            paymentPlanId: attempt.payment_plan_id,
            amount: confirmedAmount.toString(),
            source,
            eventId: event.id,
            occurredAt: new Date().toISOString(),
          },
        );
      });

      this.logger.log(`Successfully processed payment reconciliation for attempt ${attemptId}`);
    } catch (error) {
      this.logger.error(
        `Error reconciling payment attempt ${attemptId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Enforces that Return URL NEVER confirms payment.
   */
  public assertReturnUrlCannotConfirm(): void {
    throw new BaseDomainException(
      {
        code: ErrorCode.RETURN_URL_CANNOT_CONFIRM_PAYMENT,
        message: 'La URL de retorno no puede confirmar pagos. La confirmación es exclusiva vía webhook verificado.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
