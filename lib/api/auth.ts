import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  SuperAdminLoginResponse,
  PuskesmasLoginResponse,
  PerawatLoginResponse,
  KerabatLoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserRole,
} from '@/lib/types/auth';

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000';

// Debug: Log API URL
console.log('🔌 WellMom API Base URL:', API_BASE_URL);
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('⚠️ NEXT_PUBLIC_API_URL not set! Using fallback:', API_BASE_URL);
  console.warn('💡 Create .env.local file with: NEXT_PUBLIC_API_URL=http://103.191.92.29:8000');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  // Login Super Admin
  loginSuperAdmin: async (data: LoginRequest): Promise<SuperAdminLoginResponse> => {
    const response = await api.post<SuperAdminLoginResponse>(
      '/api/v1/auth/login/super-admin',
      data
    );
    return response.data;
  },

  // Login Puskesmas (menggunakan phone, bukan email)
  loginPuskesmas: async (data: LoginRequest): Promise<PuskesmasLoginResponse> => {
    try {
      // Puskesmas now uses email login
      const response = await api.post<PuskesmasLoginResponse>(
        '/api/v1/auth/login/puskesmas',
        {
          email: data.email,
          password: data.password,
        }
      );
      return response.data;
    } catch (error) {
      // Re-throw error dengan status code dan detail untuk handling di frontend
      if (axios.isAxiosError(error)) {
        // Preserve original error dengan status dan detail
        const customError = new Error(
          error.response?.data?.detail || 
          error.response?.data?.message || 
          error.message
        ) as Error & { status?: number; detail?: string };
        customError.status = error.response?.status;
        customError.detail = error.response?.data?.detail || error.response?.data?.message;
        throw customError;
      }
      throw error;
    }
  },

  // Login Perawat
  loginPerawat: async (data: LoginRequest): Promise<PerawatLoginResponse> => {
    const response = await api.post<PerawatLoginResponse>(
      '/api/v1/perawat/login',
      data
    );
    return response.data;
  },

  // Login Kerabat
  loginKerabat: async (data: LoginRequest): Promise<KerabatLoginResponse> => {
    // Note: The backend response structure for Kerabat is flat
    interface RawKerabatLoginResponse {
      access_token: string;
      token_type: string;
      kerabat_id: number;
      ibu_hamil_id: number;
      ibu_hamil_name: string;
      requires_profile_completion: boolean;
    }

    const response = await api.post<RawKerabatLoginResponse>(
      '/api/v1/kerabat/login', // Assumed endpoint
      data
    );

    // Transform to standard Auth structure
    return {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      role: 'kerabat',
      kerabat: {
        id: response.data.kerabat_id,
        ibu_hamil_id: response.data.ibu_hamil_id,
        ibu_hamil_name: response.data.ibu_hamil_name,
        requires_profile_completion: response.data.requires_profile_completion,
      },
    };
  },

  // Generic login function that routes to correct endpoint based on role
  login: async (role: UserRole, data: LoginRequest): Promise<LoginResponse> => {
    try {
      switch (role) {
        case 'super_admin':
          return await authApi.loginSuperAdmin(data);
        case 'puskesmas':
          // Untuk puskesmas, langsung return error dengan status code untuk handling di frontend
          return await authApi.loginPuskesmas(data);
        case 'perawat':
          return await authApi.loginPerawat(data);
        case 'kerabat':
          return await authApi.loginKerabat(data);
        default:
          throw new Error('Invalid role');
      }
    } catch (error) {
      console.error('Login API Error:', error);
      
      // Untuk puskesmas, pass through error dengan status code (sudah di-handle di loginPuskesmas)
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      
      if (axios.isAxiosError(error)) {
        // Network error (no response received)
        if (!error.response) {
          console.error('Network Error - No response:', {
            message: error.message,
            code: error.code,
            config: {
              url: error.config?.url,
              baseURL: error.config?.baseURL,
              method: error.config?.method,
            },
          });
          throw new Error(
            'Tidak dapat terhubung ke server. Pastikan backend API berjalan di http://103.191.92.29:8000'
          );
        }

        // Server responded with error
        console.error('API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
        });

        // Extract error message from response
        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.response?.data?.error;

        if (message) {
          throw new Error(message);
        }

        // Status-specific messages
        if (error.response.status === 401) {
          throw new Error('Email atau password salah');
        }
        if (error.response.status === 404) {
          throw new Error('Endpoint tidak ditemukan. Periksa URL API');
        }
        if (error.response.status === 422) {
          throw new Error('Data tidak valid. Periksa email dan password');
        }
        if (error.response.status >= 500) {
          throw new Error('Server error. Silakan coba lagi nanti');
        }

        throw new Error(`Login gagal (${error.response.status})`);
      }

      // Non-axios error
      console.error('Unknown Error:', error);
      throw new Error('Terjadi kesalahan. Silakan coba lagi.');
    }
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>(
        '/api/v1/puskesmas/register',
        data
      );
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

  logout: async (token: string): Promise<void> => {
    try {
      await api.post(
        '/api/v1/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Logout Puskesmas
  logoutPuskesmas: async (token: string): Promise<void> => {
    try {
      await api.post(
        '/api/v1/auth/logout/puskesmas',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Puskesmas Logout error:', error);
      // We continue even if API fails to clear local state
    }
  },

  // Logout Perawat
  logoutPerawat: async (token: string): Promise<void> => {
    try {
      await api.post(
        '/api/v1/auth/logout/perawat',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Perawat Logout error:', error);
      // We continue even if API fails to clear local state
    }
  },
};
