import { describe, expect, it, beforeEach } from 'vitest';
import { approvePaymentSubmission, submitPaymentProof } from './actions';
import { getDemoState, resetDemoState } from './store';

describe('interactive mock payment flow', () => {
  beforeEach(() => resetDemoState('NORMAL'));

  it('does not change balance while a proof is pending and creates one transaction on approval', () => {
    const before = getDemoState();
    const pending = submitPaymentProof({ graduateId: before.graduate_membership_id, graduateName: before.payment_plan.graduateName, graduateEmail: 'andrea.martinez@ejemplo.com', career: 'Licenciatura en Derecho', eventId: before.event_id, amount: 2500, method: 'TRANSFER', declaredDate: '2027-03-10', reference: 'SPEI-DEMO', evidenceFileName: 'demo.pdf' });
    expect(pending.payment_plan.totalPaid).toBe(before.payment_plan.totalPaid);
    const id = pending.payment_submissions[0].id;
    const approved = approvePaymentSubmission(id);
    expect(approved.payment_plan.totalPaid).toBe(before.payment_plan.totalPaid + 2500);
    expect(approved.payment_plan.confirmedTransactions.filter((transaction) => transaction.id === `tx-submission-${id}`)).toHaveLength(1);
    const retried = approvePaymentSubmission(id);
    expect(retried.payment_plan.confirmedTransactions.filter((transaction) => transaction.id === `tx-submission-${id}`)).toHaveLength(1);
    expect(retried.audit_logs[0].action).toBe('PROOF_APPROVED');
  });
});
