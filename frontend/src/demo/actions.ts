import type { VisualPaymentSubmission } from '../fixtures/paymentVisualFixtures';
import { getDemoState, updateDemoState } from './store';
import type { DemoPaymentAttempt, DemoState } from './types';

const eventName = 'Graduación Facultad de Derecho 2027';
const now = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

function audit(draft: DemoState, item: DemoState['audit_logs'][number]) {
  draft.audit_logs.unshift(item);
}

export function submitPaymentProof(input: Omit<VisualPaymentSubmission, 'id' | 'folio' | 'status'>) {
  return updateDemoState((draft) => {
    const sequence = draft.payment_submissions.length + 1;
    draft.payment_submissions.unshift({
      ...input,
      id: `sub-demo-${crypto.randomUUID()}`,
      folio: `SUB-DEMO-${String(sequence).padStart(4, '0')}`,
      status: 'PENDING_REVIEW',
    });
  });
}

/** The mock layer owns confirmation effects, mirroring the future backend boundary. */
export function approvePaymentSubmission(submissionId: string) {
  return updateDemoState((draft) => {
    const submission = draft.payment_submissions.find((item) => item.id === submissionId);
    if (!submission || submission.status !== 'PENDING_REVIEW') return;

    submission.status = 'APPROVED';
    submission.reviewedAt = now();
    submission.reviewedBy = 'Admin Demo GR';

    // Idempotency invariant: one submission may generate at most one transaction.
    const transactionId = `tx-submission-${submission.id}`;
    if (!draft.payment_plan.confirmedTransactions.some((item) => item.id === transactionId)) {
      draft.payment_plan.confirmedTransactions.unshift({
        id: transactionId,
        concept: 'Pago aprobado por comprobante',
        amount: submission.amount,
        method: submission.method,
        paidAt: now(),
        reference: submission.reference,
      });
      draft.payment_plan.totalPaid += submission.amount;
      draft.payment_plan.totalPending = Math.max(0, draft.payment_plan.totalContracted - draft.payment_plan.totalPaid);
      draft.payment_plan.progressPercentage = Math.min(100, Math.round((draft.payment_plan.totalPaid / draft.payment_plan.totalContracted) * 100));
      const installment = draft.payment_plan.installments.find((item) => item.status !== 'PAID');
      if (installment && submission.amount >= installment.amount) {
        installment.status = 'PAID';
        installment.paidAt = now();
        const next = draft.payment_plan.installments.find((item) => ['UPCOMING', 'DUE', 'OVERDUE'].includes(item.status));
        draft.payment_plan.nextPayment = next
          ? { concept: next.concept, amount: next.amount, dueDate: next.dueDate, status: next.status as 'UPCOMING' | 'DUE' | 'OVERDUE' }
          : undefined;
      }
    }
    audit(draft, {
      id: `aud-demo-${crypto.randomUUID()}`, eventId: draft.event_id, eventName, timestamp: now(),
      actor: 'Admin Demo GR', actorOrigin: 'ADMIN', action: 'PROOF_APPROVED', actionLabel: 'Aprobó comprobante de pago',
      entityType: 'PROOF', entityLabel: 'Comprobante', entityId: submission.folio,
      description: `Aprobación de comprobante bancario por $${submission.amount.toLocaleString('es-MX')} de ${submission.graduateName}.`,
      diff: [
        { field: 'Estado de revisión', before: 'Pendiente de revisión', after: 'Aprobado' },
        { field: 'Saldo pendiente del plan', before: 'Pendiente', after: `$${draft.payment_plan.totalPending.toLocaleString('es-MX')}` },
      ],
      reason: 'Referencia bancaria validada en la demo.',
    });
  });
}

export function rejectPaymentSubmission(submissionId: string, reason: string) {
  return updateDemoState((draft) => {
    const submission = draft.payment_submissions.find((item) => item.id === submissionId);
    if (!submission || submission.status !== 'PENDING_REVIEW') return;
    submission.status = 'REJECTED'; submission.reviewedAt = now(); submission.reviewedBy = 'Admin Demo GR'; submission.rejectionReason = reason;
    audit(draft, { id: `aud-demo-${crypto.randomUUID()}`, eventId: draft.event_id, eventName, timestamp: now(), actor: 'Admin Demo GR', actorOrigin: 'ADMIN', action: 'PROOF_REJECTED', actionLabel: 'Rechazó comprobante de pago', entityType: 'PROOF', entityLabel: 'Comprobante', entityId: submission.folio, description: `Rechazo del comprobante ${submission.folio}.`, diff: [{ field: 'Estado de revisión', before: 'Pendiente de revisión', after: 'Rechazado' }], reason });
  });
}

export function createElectronicPaymentAttempt(provider: DemoPaymentAttempt['provider']) {
  return updateDemoState((draft) => {
    draft.payment_attempts.unshift({ payment_attempt_id: `attempt-${crypto.randomUUID()}`, provider, status: 'PENDING', checkout_url: `/demo/checkout/${provider.toLowerCase()}` });
  });
}

export function getCancellationQuote() { return getDemoState().cancellation_quote; }
