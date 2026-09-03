import { http, HttpResponse } from 'msw';
import { approvePaymentSubmission, createElectronicPaymentAttempt, getCancellationQuote, rejectPaymentSubmission, submitPaymentProof } from '../demo/actions';
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
  http.get('*/api/v1/me/events/:eventId/contract', () => json({ status: getDemoState().contract_status })),
  http.get('*/api/v1/me/events/:eventId/thermo', () => json(getDemoState().thermo)),
  http.get('*/api/v1/me/events/:eventId/meals', () => json(getDemoState().meals)),
  http.get('*/api/v1/me/events/:eventId/seating-map', () => json(getDemoState().seating)),
  http.post('*/api/v1/admin/events/:eventId/graduates/:membershipId/cancellation-quote', () => json(getCancellationQuote())),
  http.get('*/api/v1/admin/events/:eventId/audit', () => json(getDemoState().audit_logs)),
];
