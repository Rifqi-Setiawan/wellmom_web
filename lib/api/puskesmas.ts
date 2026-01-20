import axios from 'axios';
import type { Puskesmas } from '@/lib/types/puskesmas';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const puskesmasApi = {
  // Get active puskesmas list
  getActivePuskesmas: async (token: string): Promise<Puskesmas[]> => {
    console.log('🏥 API Request: GET /api/v1/puskesmas/admin/active');
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const response = await api.get<Puskesmas[]>('/api/v1/puskesmas/admin/active', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('🏥 API Response Status:', response.status);
    console.log('🏥 Active Puskesmas Count:', response.data.length);
    console.log('🏥 Sample Data:', response.data[0]);
    
    return response.data;
  },

  // Get pending puskesmas list
  getPendingPuskesmas: async (token: string): Promise<Puskesmas[]> => {
    console.log('⏳ API Request: GET /api/v1/puskesmas/pending');
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const response = await api.get<Puskesmas[]>('/api/v1/puskesmas/pending', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('⏳ API Response Status:', response.status);
    console.log('⏳ Pending Puskesmas Count:', response.data.length);
    console.log('⏳ Sample Data:', response.data[0]);
    
    return response.data;
  },

  // Get all puskesmas with filters
  getAllPuskesmas: async (
    token: string,
    params?: {
      skip?: number;
      limit?: number;
      status_filter?: 'pending_approval' | 'approved' | 'rejected' | 'draft';
    }
  ): Promise<Puskesmas[]> => {
    console.log('🏥 API Request: GET /api/v1/puskesmas/admin/all');
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    console.log('📋 Query params:', params);
    
    const response = await api.get<Puskesmas[]>('/api/v1/puskesmas/admin/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        status_filter: params?.status_filter || undefined,
      },
    });
    
    console.log('🏥 API Response Status:', response.status);
    console.log('🏥 Puskesmas Count:', response.data.length);
    
    return response.data;
  },

  // Get puskesmas by ID (for detail page)
  getPuskesmasById: async (token: string, id: number): Promise<Puskesmas> => {
    console.log(`🏥 API Request: GET /api/v1/puskesmas/admin/${id}`);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const response = await api.get<Puskesmas>(`/api/v1/puskesmas/admin/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('🏥 API Response Status:', response.status);
    console.log('🏥 Puskesmas Detail:', response.data);
    
    return response.data;
  },

  // Approve puskesmas registration
  approvePuskesmas: async (token: string, id: number): Promise<Puskesmas> => {
    console.log(`✅ API Request: POST /api/v1/puskesmas/${id}/approve`);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const response = await api.post<Puskesmas>(
      `/api/v1/puskesmas/${id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Puskesmas Approved:', response.data);
    
    return response.data;
  },

  // Reject puskesmas registration
  rejectPuskesmas: async (token: string, id: number, rejectionReason: string): Promise<Puskesmas> => {
    console.log(`❌ API Request: POST /api/v1/puskesmas/${id}/reject`);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    console.log('📝 Rejection Reason:', rejectionReason);
    
    const response = await api.post<Puskesmas>(
      `/api/v1/puskesmas/${id}/reject`,
      {
        rejection_reason: rejectionReason,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log('❌ API Response Status:', response.status);
    console.log('❌ Puskesmas Rejected:', response.data);
    
    return response.data;
  },

  // Deactivate puskesmas
  deactivatePuskesmas: async (token: string, id: number, reason: string): Promise<Puskesmas> => {
    console.log(`⚠️ API Request: POST /api/v1/puskesmas/${id}/deactivate`);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    console.log('📝 Deactivation Reason:', reason);
    
    const response = await api.post<Puskesmas>(
      `/api/v1/puskesmas/${id}/deactivate`,
      {
        reason,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log('⚠️ API Response Status:', response.status);
    console.log('⚠️ Puskesmas Deactivated:', response.data);
    
    return response.data;
  },
};
