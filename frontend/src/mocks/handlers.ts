import { http, HttpResponse } from 'msw';
import { acceptDemoContract, addDemoGroupMember, approvePaymentSubmission, assignDemoTable, cancelDemoMembership, createElectronicPaymentAttempt, getCancellationQuote, rejectPaymentSubmission, selectDemoMeal, submitPaymentProof, transitionDemoThermo } from '../demo/actions';
import { getDemoState } from '../demo/store';

const json = (body: unknown, status = 200) => HttpResponse.json(body as never, { status });

/**
 * Browser-only substitute for NestJS. It exposes API_CONTRACTS routes, while all
 * rules and mutations stay in the mock domain layer rather than React components.
 */
export const handlers = [
  http.get('*/api/v1/me/events/:eventId/payment-plan', () => json(getDemoState().payment_plan)),
  http.get('*/api/v1/me/events/:eventId/payment-submissions', () => json(getDemoState().payment_submissions)),
  http.post('*/api/v1/me/events/:eventId/payment-submissions', async ({ request }) => {
    const body = await request.json() as Record<string, string>;
    const state = getDemoState();
    const next = submitPaymentProof({ graduateId: state.graduate_membership_id, graduateName: state.payment_plan.graduateName, graduateEmail: 'andrea.martinez@ejemplo.com', career: 'Licenciatura en Derecho', eventId: state.event_id, amount: Number(body.reported_amount), method: body.method as 'TRANSFER' | 'DEPOSIT', declaredDate: body.reported_paid_at, reference: body.reference, notes: body.notes || undefined, evidenceFileName: body.evidence_file_id || 'comprobante_demo.pdf' });
    return json(next.payment_submissions[0], 201);
  }),
  http.get('*/api/v1/admin/events/:eventId/payment-submissions', () => json(getDemoState().payment_submissions)),
  http.post('*/api/v1/admin/payment-submissions/:submissionId/approve', ({ params }) => json(approvePaymentSubmission(String(params.submissionId)))),
  http.post('*/api/v1/admin/payment-submissions/:submissionId/reject', async ({ params, request }) => {
    const body = await request.json() as { reason: string };
    return json(rejectPaymentSubmission(String(params.submissionId), body.reason));
  }),
  http.post('*/api/v1/me/events/:eventId/payment-attempts', async ({ request }) => {
    const body = await request.json() as { provider?: 'MERCADO_PAGO' | 'OPENPAY' };
    const state = createElectronicPaymentAttempt(body.provider || 'MERCADO_PAGO');
    return json(state.payment_attempts[0], 201);
  }),
  http.get('*/api/v1/me/events/:eventId/contract', () => json({ status: getDemoState().contract_status, products: getDemoState().products })),
  http.post('*/api/v1/me/events/:eventId/contract/accept', () => json(acceptDemoContract())),
  http.post('*/api/v1/me/events/:eventId/contract-line-items', async ({ request }) => { const body = await request.json() as { full_name?: string; product_type?: 'ADULT' | 'CHILD' | 'NO_DINNER' }; return json(addDemoGroupMember(body.full_name || 'Integrante demo', body.product_type), 201); }),
  http.get('*/api/v1/me/events/:eventId/group-members', () => json(getDemoState().group_members)),
  http.get('*/api/v1/me/events/:eventId/thermo', () => json(getDemoState().thermo)),
  http.post('*/api/v1/me/events/:eventId/thermo/request', () => json(transitionDemoThermo('REQUESTED'))),
  http.patch('*/api/v1/me/events/:eventId/thermo', async ({ request }) => { const body = await request.json() as { status: 'AVAILABLE' | 'REQUESTED' | 'IN_PRODUCTION' | 'DELIVERED' }; return json(transitionDemoThermo(body.status)); }),
  http.get('*/api/v1/me/events/:eventId/meals', () => json(getDemoState().meals)),
  http.put('*/api/v1/me/events/:eventId/group-members/:memberId/meal-selection', async ({ params, request }) => { const body = await request.json() as { meal_option_id: string }; return json(selectDemoMeal(String(params.memberId), body.meal_option_id)); }),
  http.get('*/api/v1/me/events/:eventId/seating-map', () => json(getDemoState().seating)),
  http.get('*/api/v1/me/events/:eventId/table-assignments', () => json(getDemoState().seating.assigned_member_ids)),
  http.put('*/api/v1/me/events/:eventId/table-assignments', async ({ request }) => { const body = await request.json() as { assignments: Array<{ group_member_id: string; table_id: string }> }; let state = getDemoState(); for (const assignment of body.assignments) state = assignDemoTable(assignment.group_member_id, assignment.table_id); return json(state.seating); }),
  http.post('*/api/v1/admin/events/:eventId/graduates/:membershipId/cancellation-quote', () => json(getCancellationQuote())),
  http.post('*/api/v1/admin/events/:eventId/graduates/:membershipId/cancellation', async ({ request }) => { const body = await request.json() as { reason: string }; return json(cancelDemoMembership(body.reason)); }),
  http.get('*/api/v1/admin/events/:eventId/reports/:report', () => { const state = getDemoState(); return json({ report: 'DEMO', membership_status: state.membership_status, payments: state.payment_plan, allocations: state.payment_allocations, seating: state.seating, meals: state.meals, thermo: state.thermo }); }),
  http.get('*/api/v1/admin/events/:eventId/audit', () => json(getDemoState().audit_logs)),
];
