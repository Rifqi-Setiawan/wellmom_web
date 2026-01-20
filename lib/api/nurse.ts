import axios from 'axios';
import type { 
  NurseGenerationRequest, 
  NurseGenerationResponse, 
  NurseListResponse,
  ActivationCheckTokenResponse
} from '@/lib/types/nurse';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const nurseApi = {
  // Generate Nurse Account (Puskesmas Admin)
  generateNurse: async (token: string, data: NurseGenerationRequest): Promise<NurseGenerationResponse> => {
    const response = await api.post<NurseGenerationResponse>(
      '/api/v1/perawat/generate',
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get Nurses List (Puskesmas Admin)
  getNurses: async (token: string): Promise<NurseListResponse> => {
    const response = await api.get<NurseListResponse>(
      '/api/v1/perawat/puskesmas/my-nurses',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Resend Activation Email (Puskesmas Admin)
  resendActivation: async (token: string, userId: number): Promise<void> => {
    await api.post(
      '/api/v1/perawat/activation/request',
      { user_id: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Check Activation Token (Public)
  checkActivationToken: async (token: string): Promise<ActivationCheckTokenResponse> => {
    const response = await api.post<ActivationCheckTokenResponse>(
      '/api/v1/perawat/activation/check-token',
      { token }
    );
    return response.data;
  },

  // Verify Email (Public)
  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/api/v1/perawat/activation/verify', { token });
  },

  // Set Password (Public)
  setPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/api/v1/perawat/activation/set-password', { 
      token, 
      new_password: newPassword 
    });
  },

  // Complete Profile (Public)
  completeProfile: async (token: string, profilePhotoUrl: string): Promise<void> => {
    await api.post('/api/v1/perawat/activation/complete-profile', { 
      token, 
      profile_photo_url: profilePhotoUrl 
    });
  },

  // Accept Terms (Public)
  acceptTerms: async (token: string): Promise<void> => {
    await api.post('/api/v1/perawat/activation/accept-terms', { token });
  },
};
