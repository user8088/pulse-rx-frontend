import apiClient from './client';
import { AuthResponse, UserResponse } from '@/types/auth';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/login', { email, password });
    return response.data;
  },

  register: async (data: any): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  },

  me: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/user');
    return response.data;
  },
};
