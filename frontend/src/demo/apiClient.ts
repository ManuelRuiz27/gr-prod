import api from '../services/api';

const base = (eventId: string) => `/me/events/${eventId}`;
const adminBase = (eventId: string) => `/admin/events/${eventId}`;

export const demoApi = {
  acceptContract: (eventId: string) => api.post(`${base(eventId)}/contract/accept`, { confirmation: true }),
  addGroupMember: (eventId: string, fullName: string) => api.post(`${base(eventId)}/group-members`, { full_name: fullName }),
  quoteProduct: (eventId: string, eventProductId: string) => api.post(`${base(eventId)}/contract-line-items/quote`, { event_product_id: eventProductId, quantity: 1 }),
  confirmProduct: (eventId: string, quoteId: string) => api.post(`${base(eventId)}/contract-line-items`, { quote_id: quoteId }),
  assignTables: (eventId: string, assignments: Array<{ group_member_id: string; table_id: string }>) => api.put(`${base(eventId)}/table-assignments`, { assignments }),
  selectMeal: (eventId: string, memberId: string, mealOptionId: string) => api.put(`${base(eventId)}/group-members/${memberId}/meal-selection`, { meal_option_id: mealOptionId }),
  requestThermo: (eventId: string) => api.post(`${base(eventId)}/thermo/request`),
  updateThermo: (eventId: string, payload: Record<string, unknown>) => api.patch(`${base(eventId)}/thermo`, payload),
  cancelMembership: (eventId: string, membershipId: string, quoteId: string, reason: string) => api.post(`${adminBase(eventId)}/graduates/${membershipId}/cancel`, { quote_id: quoteId, reason }),
  createPaymentAttempt: (eventId: string, provider: 'MERCADO_PAGO' | 'OPENPAY', installmentId?: string) => api.post(`${base(eventId)}/payment-attempts`, { provider, installment_id: installmentId }),
  submitPayment: (eventId: string, payload: Record<string, unknown>) => api.post(`${base(eventId)}/payment-submissions`, payload),
  approveSubmission: (submissionId: string) => api.post(`/admin/payment-submissions/${submissionId}/approve`),
  rejectSubmission: (submissionId: string, reason: string) => api.post(`/admin/payment-submissions/${submissionId}/reject`, { reason }),
};
