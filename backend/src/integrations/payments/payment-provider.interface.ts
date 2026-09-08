import { PaymentProvider } from '@prisma/client';

export type NormalizedPaymentStatus =
  | 'CONFIRMED'
  | 'PENDING'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface CreatePaymentInput {
  attemptId: string;
  amount: string | number;
  currency?: string;
  description: string;
  payerEmail: string;
  payerName?: string;
  returnUrl?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResult {
  providerPaymentId: string;
  checkoutUrl?: string;
  rawStatus: string;
  normalizedStatus: NormalizedPaymentStatus;
  metadata?: Record<string, unknown>;
}

export interface ProviderPaymentDetails {
  providerPaymentId: string;
  externalReference?: string;
  amount: string;
  currency: string;
  rawStatus: string;
  normalizedStatus: NormalizedPaymentStatus;
  paidAt?: Date;
  rawPayload: Record<string, unknown>;
}

export interface VerifyWebhookInput {
  rawPayload: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
  queryParams?: Record<string, string | string[] | undefined>;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  providerPaymentId?: string;
  externalEventId?: string;
  eventType?: string;
  errorMessage?: string;
}

export interface RefundInput {
  providerPaymentId: string;
  amount?: string | number;
  reason?: string;
  idempotencyKey?: string;
}

export interface RefundResult {
  refundId: string;
  amount: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  rawPayload: Record<string, unknown>;
}

export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider;

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPayment(providerPaymentId: string): Promise<ProviderPaymentDetails>;
  verifyWebhook(input: VerifyWebhookInput): Promise<WebhookVerificationResult>;
  refund(input: RefundInput): Promise<RefundResult>;
}
