import apiClient from './apiClient';

export const meApi = {
  getProfile: async () => {
    const res = await apiClient.get('/me/profile');
    return res.data;
  },

  updateProfile: async (data: { full_name?: string; phone?: string }) => {
    const res = await apiClient.patch('/me/profile', data);
    return res.data;
  },

  listEvents: async () => {
    const res = await apiClient.get('/me/events');
    return res.data;
  },

  getEventDetail: async (eventId: string) => {
    const res = await apiClient.get(`/me/events/${eventId}`);
    return res.data;
  },

  getContract: async (eventId: string) => {
    const res = await apiClient.get(`/me/events/${eventId}/contract`);
    return res.data;
  },

  acceptContract: async (eventId: string, termsVersion = '1.0') => {
    const res = await apiClient.post(`/me/events/${eventId}/contract/accept`, {
      terms_version: termsVersion,
      accepted: true,
    });
    return res.data;
  },

  listGroupMembers: async (eventId: string) => {
    const res = await apiClient.get(`/me/events/${eventId}/group-members`);
    return res.data;
  },

  createGroupMember: async (eventId: string, data: { full_name: string }) => {
    const res = await apiClient.post(`/me/events/${eventId}/group-members`, data);
    return res.data;
  },

  updateGroupMember: async (eventId: string, memberId: string, data: { full_name?: string }) => {
    const res = await apiClient.patch(`/me/events/${eventId}/group-members/${memberId}`, data);
    return res.data;
  },

  deleteGroupMember: async (eventId: string, memberId: string) => {
    const res = await apiClient.delete(`/me/events/${eventId}/group-members/${memberId}`);
    return res.data;
  },

  listProducts: async (eventId: string) => {
    const res = await apiClient.get(`/me/events/${eventId}/products`);
    return res.data;
  },

  quoteLineItems: async (eventId: string, items: Array<{ product_id: string; quantity: number }>) => {
    const res = await apiClient.post(`/me/events/${eventId}/contract-line-items/quote`, { items });
    return res.data;
  },

  listMealOptions: async (eventId: string) => {
    const res = await apiClient.get(`/me/events/${eventId}/meals/options`);
    return res.data;
  },

  getMealSelections: async (eventId: string) => {
    const res = await apiClient.get(`/me/events/${eventId}/meals/selections`);
    return res.data;
  },

  setMealSelection: async (eventId: string, memberId: string, mealOptionId: string) => {
    const res = await apiClient.put(`/me/events/${eventId}/meals/selections/${memberId}`, {
      meal_option_id: mealOptionId,
    });
    return res.data;
  },

  getSeatingMap: async (eventId: string) => {
    const res = await apiClient.get(`/me/events/${eventId}/seating-map`);
    return res.data;
  },

  getTableAssignments: async (eventId: string) => {
    const res = await apiClient.get(`/me/events/${eventId}/table-assignments`);
    return res.data;
  },

  assignTableMembers: async (eventId: string, tableId: string, memberIds: string[]) => {
    const res = await apiClient.put(`/me/events/${eventId}/table-assignments`, {
      table_id: tableId,
      member_ids: memberIds,
    });
    return res.data;
  },

  getPaymentPlan: async (eventId: string) => {
    const res = await apiClient.get(`/me/events/${eventId}/payment-plan`);
    return res.data;
  },

  createPaymentAttempt: async (eventId: string, data: { provider: 'MERCADO_PAGO' | 'OPENPAY'; installment_id?: string; custom_amount?: number }) => {
    const res = await apiClient.post(`/me/events/${eventId}/payment-attempts`, data);
    return res.data;
  },

  submitPaymentProof: async (eventId: string, data: { amount: number; method: string; reference: string; paid_at: string; evidence_url?: string }) => {
    const res = await apiClient.post(`/me/events/${eventId}/payment-submissions`, data);
    return res.data;
  },

  getThermoStatus: async (eventId: string) => {
    const res = await apiClient.get(`/me/events/${eventId}/thermo`);
    return res.data;
  },

  submitThermoRequest: async (eventId: string, values: Record<string, string>) => {
    const res = await apiClient.post(`/me/events/${eventId}/thermo`, { values });
    return res.data;
  },

  listNotifications: async () => {
    const res = await apiClient.get('/me/notifications');
    return res.data;
  },

  markNotificationRead: async (id: string) => {
    const res = await apiClient.post(`/me/notifications/${id}/read`);
    return res.data;
  },
};
