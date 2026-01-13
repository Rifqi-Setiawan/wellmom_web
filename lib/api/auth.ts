import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/lib/types/auth';

// Base API URL - ganti dengan URL backend Anda
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Terjadi kesalahan saat login. Silakan coba lagi.',
      };
    }
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register/puskesmas', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.',
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
};
