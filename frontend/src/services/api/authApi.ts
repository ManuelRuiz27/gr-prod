import apiClient from './apiClient';

export interface ResolveEventAccessResult {
  valid: boolean;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  status: string;
}

export interface RegisterGraduateInput {
  access_code?: string;
  event_id?: string;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  career?: string;
  generation?: string;
  group?: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    role: 'ADMIN' | 'GRADUATE';
    status: string;
  };
  memberships?: Array<{
    id: string;
    event_id: string;
    status: string;
    active_places: number;
    event?: {
      id: string;
      name: string;
      date: string;
      venue: string;
      status: string;
    };
  }>;
}

export const authApi = {
  resolveEventAccess: async (code: string): Promise<ResolveEventAccessResult> => {
    const res = await apiClient.post('/auth/event-access/resolve', { code });
    return res.data;
  },

  registerGraduate: async (input: RegisterGraduateInput): Promise<LoginResult> => {
    const res = await apiClient.post('/auth/graduate/register', input);
    return res.data;
  },

  login: async (email: string, password: string): Promise<LoginResult> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  refresh: async (refreshToken: string) => {
    const res = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },

  requestPasswordReset: async (email: string) => {
    const res = await apiClient.post('/auth/password-reset/request', { email });
    return res.data;
  },

  confirmPasswordReset: async (token: string, newPassword: string) => {
    const res = await apiClient.post('/auth/password-reset/confirm', {
      token,
      new_password: newPassword,
    });
    return res.data;
  },
};
