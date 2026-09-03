import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DemoControls } from './DemoControls';
import { approvePaymentSubmission, assignDemoTable, cancelDemoMembership, rejectPaymentSubmission, selectDemoMeal, submitPaymentProof, transitionDemoThermo } from './actions';
import { getDemoState, resetDemoState, updateDemoState } from './store';

describe('DEMO-01-R1 flows', () => {
  beforeEach(() => resetDemoState('NORMAL'));

  it('resets and changes scenario from a persisted shared state', () => {
    assignDemoTable('gm-andrea-01', 'tbl-25');
    expect(getDemoState().seating.assigned_member_ids).toContain('gm-andrea-01@tbl-25');
    resetDemoState('SEATING_LOCKED');
    expect(getDemoState().scenario).toBe('SEATING_LOCKED');
    expect(getDemoState().seating.financially_eligible).toBe(false);
  });

  it('rejects a proof without changing financial state and records audit', () => {
    const state = submitPaymentProof({ graduateId: 'grad-andrea-martinez', graduateName: 'Andrea Martínez', graduateEmail: 'andrea@demo.mx', career: 'Derecho', eventId: 'evt-derecho-2027', amount: 500, method: 'TRANSFER', declaredDate: '2027-03-01', reference: 'R1', evidenceFileName: 'r1.pdf' });
    const before = state.payment_plan.totalPaid;
    const rejected = rejectPaymentSubmission(state.payment_submissions[0].id, 'Referencia inválida');
    expect(rejected.payment_plan.totalPaid).toBe(before);
    expect(rejected.payment_submissions[0].status).toBe('REJECTED');
    expect(rejected.audit_logs[0].action).toBe('PROOF_REJECTED');
  });

  it('creates one allocation with an approved proof, even after retry', () => {
    const pending = submitPaymentProof({ graduateId: 'grad-andrea-martinez', graduateName: 'Andrea Martínez', graduateEmail: 'andrea@demo.mx', career: 'Derecho', eventId: 'evt-derecho-2027', amount: 2500, method: 'TRANSFER', declaredDate: '2027-03-01', reference: 'A1', evidenceFileName: 'a1.pdf' });
    const id = pending.payment_submissions[0].id;
    approvePaymentSubmission(id); const retried = approvePaymentSubmission(id);
    expect(retried.payment_allocations.filter((allocation) => allocation.payment_submission_id === id)).toHaveLength(1);
  });

  it('enforces table capacity and finance/deadline conflicts', () => {
    assignDemoTable('gm-andrea-01', 'tbl-25');
    assignDemoTable('gm-andrea-02', 'tbl-25');
    expect(() => assignDemoTable('gm-demo-extra', 'tbl-25')).toThrow('TABLE_CAPACITY_CHANGED');
    resetDemoState('SEATING_LOCKED');
    expect(() => assignDemoTable('gm-andrea-01', 'tbl-25')).toThrow('SEATING_NOT_FINANCIALLY_ELIGIBLE');
  });

  it('enforces meal deadline and thermo transitions', () => {
    selectDemoMeal('gm-andrea-02', 'meal-vegetarian');
    expect(getDemoState().meals.pending_count).toBe(0);
    updateDemoState((draft) => { draft.meals.deadline_open = false; });
    expect(() => selectDemoMeal('gm-andrea-01', 'meal-vegetarian')).toThrow('MEAL_DEADLINE_CLOSED');
    transitionDemoThermo('AVAILABLE');
    transitionDemoThermo('REQUESTED');
    expect(getDemoState().thermo.status).toBe('REQUESTED');
  });

  it('uses generated quote and cancellation releases table assignments', () => {
    const quote = getDemoState().cancellation_quote;
    expect(quote.status).toBe('VALID');
    const cancelled = cancelDemoMembership('Cambio de planes');
    expect(cancelled.membership_status).toBe('CANCELLED');
    expect(cancelled.seating.assigned_member_ids).toHaveLength(0);
  });

  it('keeps DemoControls hidden outside demo mode', () => {
    render(<DemoControls />);
    expect(screen.queryByTestId('demo-controls')).not.toBeInTheDocument();
  });
});
