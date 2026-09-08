import axios, { type AxiosInstance } from 'axios';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../../lib/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = safeGetItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = safeGetItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          safeSetItem('token', data.accessToken);
          if (data.refreshToken) {
            safeSetItem('refreshToken', data.refreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          safeRemoveItem('token');
          safeRemoveItem('refreshToken');
          safeRemoveItem('user');
        }
      } else {
        safeRemoveItem('token');
        safeRemoveItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
