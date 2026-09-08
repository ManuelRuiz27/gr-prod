import axios from 'axios';
import { safeGetItem, safeRemoveItem } from '../lib/storage';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = safeGetItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            safeRemoveItem('token');
            safeRemoveItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

import apiClient from './api/apiClient';
import { authApi, type LoginResult, type RegisterGraduateInput } from './api/authApi';
import { meApi } from './api/meApi';
import { adminApi } from './api/adminApi';

export const authAPI = {
  login: (email: string, password: string) => authApi.login(email, password),
  register: (data: any) => authApi.registerGraduate(data),
};

export const graduateAPI = {
  getProfile: () => meApi.getProfile(),
  getDashboard: () => meApi.listEvents(),
  getGuests: (eventId = '') => meApi.listGroupMembers(eventId),
  addGuests: (data: { additional_guests: number }) => Promise.resolve({ data: { ...data, financial_impact: 0 } }),
  updateGuest: (_guestId: string, data: any) => Promise.resolve({ data }),
};

export type { LoginResult, RegisterGraduateInput };
export { apiClient, authApi, meApi, adminApi };
export default apiClient;
