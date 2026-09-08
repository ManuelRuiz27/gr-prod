import apiClient from './apiClient';

export const adminApi = {
  getDashboard: async () => {
    const res = await apiClient.get('/admin/dashboard/summary');
    return res.data;
  },

  listEvents: async () => {
    const res = await apiClient.get('/admin/events');
    return res.data;
  },

  getEvent: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}`);
    return res.data;
  },

  createEvent: async (data: any) => {
    const res = await apiClient.post('/admin/events', data);
    return res.data;
  },

  createEventWizard: async (data: any) => {
    const res = await apiClient.post('/admin/events/wizard', data);
    return res.data;
  },

  updateEvent: async (eventId: string, data: any) => {
    const res = await apiClient.patch(`/admin/events/${eventId}`, data);
    return res.data;
  },

  changeEventStatus: async (eventId: string, status: string, reason?: string) => {
    const res = await apiClient.post(`/admin/events/${eventId}/status`, { status, reason });
    return res.data;
  },

  // Graduates
  listGraduates: async (eventId: string, query?: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/graduates`, {
      params: { q: query },
    });
    return res.data;
  },

  getGraduate: async (eventId: string, membershipId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/graduates/${membershipId}`);
    return res.data;
  },

  reduceGraduatePlaces: async (eventId: string, membershipId: string, placesToRemove: number, reason: string) => {
    const res = await apiClient.post(`/admin/events/${eventId}/graduates/${membershipId}/reduce-places`, {
      places_to_remove: placesToRemove,
      reason,
    });
    return res.data;
  },

  cancelGraduateMembership: async (eventId: string, membershipId: string, reason: string, customRefundAmount?: number) => {
    const res = await apiClient.post(`/admin/events/${eventId}/graduates/${membershipId}/cancel`, {
      reason,
      custom_refund_amount: customRefundAmount,
    });
    return res.data;
  },

  getCancellationQuote: async (eventId: string, membershipId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/graduates/${membershipId}/cancellation-quote`);
    return res.data;
  },

  recordManualPayment: async (eventId: string, membershipId: string, data: { payment_method: string; amount: number; reference: string; notes?: string }) => {
    const res = await apiClient.post(`/admin/events/${eventId}/graduates/${membershipId}/manual-payment`, data);
    return res.data;
  },

  // Finance
  getFinancialPortfolio: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/finance/portfolio`);
    return res.data;
  },

  listSubmissions: async (eventId: string, status?: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/finance/submissions`, {
      params: { status },
    });
    return res.data;
  },

  reviewSubmission: async (eventId: string, submissionId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    const res = await apiClient.post(`/admin/events/${eventId}/finance/submissions/${submissionId}/review`, {
      action,
      rejection_reason: reason,
    });
    return res.data;
  },

  listTransactions: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/finance/transactions`);
    return res.data;
  },

  // Seating & Tables
  getSeatingMap: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/seating-map`);
    return res.data;
  },

  updateSeatingMap: async (eventId: string, data: { background_url?: string; width?: number; height?: number }) => {
    const res = await apiClient.put(`/admin/events/${eventId}/seating-map`, data);
    return res.data;
  },

  listTables: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/seating-map`);
    return res.data.tables || [];
  },

  createTable: async (eventId: string, data: { label: string; capacity: number; shape: 'ROUND' | 'SQUARE'; position_x: number; position_y: number }) => {
    const res = await apiClient.post(`/admin/events/${eventId}/tables`, data);
    return res.data;
  },

  bulkCreateTables: async (eventId: string, tables: Array<{ label: string; capacity: number; shape: 'ROUND' | 'SQUARE'; position_x: number; position_y: number }>) => {
    const res = await apiClient.post(`/admin/events/${eventId}/tables/bulk`, { tables });
    return res.data;
  },

  importDetectedTables: async (eventId: string, tables: Array<{ label: string; capacity: number; shape: 'ROUND' | 'SQUARE'; position_x: number; position_y: number; confidence?: number }>, replaceExisting = false) => {
    const res = await apiClient.post(`/admin/events/${eventId}/tables/import`, {
      tables,
      replace_existing: replaceExisting,
    });
    return res.data;
  },

  updateTable: async (eventId: string, tableId: string, data: { label?: string; capacity?: number; shape?: 'ROUND' | 'SQUARE'; position_x?: number; position_y?: number }) => {
    const res = await apiClient.patch(`/admin/events/${eventId}/tables/${tableId}`, data);
    return res.data;
  },

  deleteTable: async (eventId: string, tableId: string) => {
    const res = await apiClient.delete(`/admin/events/${eventId}/tables/${tableId}`);
    return res.data;
  },

  blockTable: async (eventId: string, tableId: string) => {
    const res = await apiClient.post(`/admin/events/${eventId}/tables/${tableId}/block`);
    return res.data;
  },

  unblockTable: async (eventId: string, tableId: string) => {
    const res = await apiClient.post(`/admin/events/${eventId}/tables/${tableId}/unblock`);
    return res.data;
  },

  // Reports
  getOperationsReport: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/reports/operations`);
    return res.data;
  },

  getFinancialReport: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/reports/financial`);
    return res.data;
  },

  getMealsReport: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/reports/meals`);
    return res.data;
  },

  getSeatingReport: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/reports/seating`);
    return res.data;
  },

  getThermosReport: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/reports/thermos`);
    return res.data;
  },

  getAuditReport: async (eventId: string) => {
    const res = await apiClient.get(`/admin/events/${eventId}/reports/audit`);
    return res.data;
  },

  createExportJob: async (eventId: string, jobType: string, fileFormat = 'CSV', filters?: any) => {
    const res = await apiClient.post(`/admin/events/${eventId}/reports/export`, {
      job_type: jobType,
      file_format: fileFormat,
      filters,
    });
    return res.data;
  },
};
