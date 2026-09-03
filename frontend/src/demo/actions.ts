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
      const installment = draft.payment_plan.installments.find((item) => item.status !== 'PAID');
      if (installment) draft.payment_allocations.push({ id: `alloc-${submission.id}`, payment_submission_id: submission.id, payment_transaction_id: transactionId, installment_id: installment.id, amount: Math.min(submission.amount, installment.amount) });
      draft.payment_plan.totalPaid += submission.amount;
      draft.payment_plan.totalPending = Math.max(0, draft.payment_plan.totalContracted - draft.payment_plan.totalPaid);
      draft.payment_plan.progressPercentage = Math.min(100, Math.round((draft.payment_plan.totalPaid / draft.payment_plan.totalContracted) * 100));
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

export function acceptDemoContract() {
  return updateDemoState((draft) => {
    if (draft.contract_status !== 'PENDING_ACCEPTANCE') return;
    draft.contract_status = 'ACCEPTED';
    audit(draft, { id: `aud-demo-${crypto.randomUUID()}`, eventId: draft.event_id, eventName, timestamp: now(), actor: draft.payment_plan.graduateName, actorOrigin: 'Sistema', action: 'CONTRACT_ACCEPTED', actionLabel: 'Aceptó contrato', entityType: 'GRADUATE', entityLabel: 'Contrato', entityId: draft.graduate_membership_id, description: 'Aceptación explícita de contrato en demo.', diff: [{ field: 'Estado contractual', before: 'Pendiente de aceptación', after: 'Aceptado' }] });
  });
}

export function addDemoGroupMember(fullName: string, productType: 'ADULT' | 'CHILD' | 'NO_DINNER' = 'ADULT') {
  return updateDemoState((draft) => {
    if (draft.membership_status !== 'ACTIVE') return;
    const id = `gm-demo-${crypto.randomUUID()}`;
    draft.group_members.push({ id, full_name: fullName, product_type: productType });
    const product = draft.products.find((item) => item.id === `product-${productType.toLowerCase()}`) || draft.products[0];
    if (product) product.quantity += 1;
  });
}

export function assignDemoTable(memberId: string, tableId: string) {
  return updateDemoState((draft) => {
    if (!draft.seating.financially_eligible) throw new Error('SEATING_NOT_FINANCIALLY_ELIGIBLE');
    if (!draft.seating.deadline_open) throw new Error('SEATING_DEADLINE_CLOSED');
    const table = draft.tables.find((item) => item.id === tableId);
    if (!table) throw new Error('TABLE_NOT_FOUND');
    if (table.status === 'BLOCKED') throw new Error('TABLE_BLOCKED');
    const occupied = draft.seating.assigned_member_ids.filter((entry) => entry.endsWith(`@${tableId}`)).length;
    if (occupied >= table.capacity) throw new Error('TABLE_CAPACITY_CHANGED');
    draft.seating.assigned_member_ids = draft.seating.assigned_member_ids.filter((entry) => !entry.startsWith(`${memberId}@`));
    draft.seating.assigned_member_ids.push(`${memberId}@${tableId}`);
  });
}

export function selectDemoMeal(memberId: string, mealOptionId: string) {
  return updateDemoState((draft) => {
    if (!draft.meals.deadline_open) throw new Error('MEAL_DEADLINE_CLOSED');
    const member = draft.group_members.find((item) => item.id === memberId);
    if (!member) throw new Error('GROUP_MEMBER_NOT_FOUND');
    if (!draft.meal_options.some((item) => item.id === mealOptionId)) throw new Error('MEAL_OPTION_NOT_FOUND');
    member.meal_option_id = mealOptionId;
    draft.meals.pending_count = draft.group_members.filter((item) => !item.meal_option_id).length;
  });
}

const thermoTransitions: Record<DemoState['thermo']['status'], DemoState['thermo']['status'][]> = { LOCKED: ['AVAILABLE'], AVAILABLE: ['REQUESTED'], REQUESTED: ['IN_PRODUCTION'], IN_PRODUCTION: ['DELIVERED'], DELIVERED: [] };
export function transitionDemoThermo(next: DemoState['thermo']['status']) {
  return updateDemoState((draft) => {
    if (!thermoTransitions[draft.thermo.status].includes(next)) throw new Error('THERMO_INVALID_TRANSITION');
    draft.thermo.status = next;
  });
}

export function cancelDemoMembership(reason: string) {
  return updateDemoState((draft) => {
    if (!reason.trim()) throw new Error('CANCELLATION_REASON_REQUIRED');
    if (draft.cancellation_quote.status !== 'VALID') throw new Error('CANCELLATION_QUOTE_STALE');
    draft.membership_status = 'CANCELLED'; draft.contract_status = 'CANCELLED'; draft.seating.assigned_member_ids = [];
    audit(draft, { id: `aud-demo-${crypto.randomUUID()}`, eventId: draft.event_id, eventName, timestamp: now(), actor: 'Admin Demo GR', actorOrigin: 'ADMIN', action: 'MEMBERSHIP_CANCELLED', actionLabel: 'Canceló membresía', entityType: 'GRADUATE', entityLabel: 'Membresía', entityId: draft.graduate_membership_id, description: 'Cancelación confirmada desde cotización generada por la capa mock.', diff: [{ field: 'Estado de membresía', before: 'Activa', after: 'Cancelada' }], reason });
  });
}
