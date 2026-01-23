import axios from 'axios';
import type { Puskesmas } from '@/lib/types/puskesmas';
import type { IbuHamil, PuskesmasStatistics } from '@/lib/types/ibu-hamil';

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

  // Get puskesmas statistics (for puskesmas dashboard)
  getPuskesmasStatistics: async (token: string): Promise<PuskesmasStatistics> => {
    console.log('📊 API Request: GET /api/v1/puskesmas/me/statistics');
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const response = await api.get<PuskesmasStatistics>('/api/v1/puskesmas/me/statistics', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('📊 API Response Status:', response.status);
    console.log('📊 Statistics:', response.data);
    
    return response.data;
  },

  // Get ibu hamil list for puskesmas
  getIbuHamilList: async (token: string): Promise<IbuHamil[]> => {
    console.log('👶 API Request: GET /api/v1/puskesmas/me/ibu-hamil');
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const response = await api.get<IbuHamil[]>('/api/v1/puskesmas/me/ibu-hamil', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('👶 API Response Status:', response.status);
    console.log('👶 Ibu Hamil Count:', response.data.length);
    
    return response.data;
  },

  // Get ibu hamil by puskesmas_id
  getIbuHamilByPuskesmas: async (token: string, puskesmasId: number): Promise<IbuHamil[]> => {
    console.log(`👶 API Request: GET /api/v1/ibu-hamil/by-puskesmas/${puskesmasId}`);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const response = await api.get<IbuHamil[]>(`/api/v1/ibu-hamil/by-puskesmas/${puskesmasId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('👶 API Response Status:', response.status);
    console.log('👶 Ibu Hamil Count:', response.data.length);
    
    return response.data;
  },

  // Assign ibu hamil to perawat
  assignIbuHamilToPerawat: async (
    token: string,
    puskesmasId: number,
    ibuHamilId: number,
    perawatId: number
  ): Promise<{
    id: number;
    puskesmas_id: number;
    perawat_id: number;
    nik: string;
    nama_lengkap: string;
    is_active: boolean;
  }> => {
    console.log(`👶 API Request: POST /api/v1/puskesmas/${puskesmasId}/ibu-hamil/${ibuHamilId}/assign-perawat/${perawatId}`);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    console.log('📝 Assigning to perawat:', perawatId);
    
    const response = await api.post<{
      id: number;
      puskesmas_id: number;
      perawat_id: number;
      nik: string;
      nama_lengkap: string;
      is_active: boolean;
    }>(
      `/api/v1/puskesmas/${puskesmasId}/ibu-hamil/${ibuHamilId}/assign-perawat/${perawatId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log('👶 API Response Status:', response.status);
    console.log('👶 Assigned Response:', response.data);
    
    return response.data;
  },

  // Get ibu hamil detail by ID (for puskesmas)
  // Endpoint: /api/v1/ibu-hamil/{ibu_id}/detail
  getIbuHamilDetail: async (token: string, ibuHamilId: number): Promise<IbuHamil> => {
    console.log(`👶 API Request: GET /api/v1/ibu-hamil/${ibuHamilId}/detail`);
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    console.log('📋 Patient ID:', ibuHamilId);
    
    const response = await api.get<IbuHamil>(`/api/v1/ibu-hamil/${ibuHamilId}/detail`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('👶 API Response Status:', response.status);
    console.log('👶 Ibu Hamil Detail:', response.data);
    
    return response.data;
  },

  // Get puskesmas profile (for puskesmas user)
  getPuskesmasProfile: async (token: string): Promise<any> => {
    console.log('🏥 API Request: GET /api/v1/puskesmas/me');
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const response = await api.get('/api/v1/puskesmas/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('🏥 API Response Status:', response.status);
    console.log('🏥 Puskesmas Profile:', response.data);
    
    return response.data;
  },

  // Update puskesmas profile (for puskesmas user)
  updatePuskesmasProfile: async (
    token: string,
    data: {
      name?: string;
      address?: string;
      email?: string;
      phone?: string;
      kepala_name?: string;
      kepala_nip?: string;
      sk_document_url?: string;
      npwp_document_url?: string;
      building_photo_url?: string;
      npwp?: string;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<any> => {
    console.log('🏥 API Request: PUT /api/v1/puskesmas/me');
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    console.log('📝 Update Data:', data);
    
    const response = await api.put(
      '/api/v1/puskesmas/me',
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log('🏥 API Response Status:', response.status);
    console.log('🏥 Updated Profile:', response.data);
    
    return response.data;
  },

  // Upload SK Pendirian
  uploadSKPendirian: async (token: string, puskesmasId: number, file: File): Promise<{ file_url: string; file_path: string; success: boolean; message: string }> => {
    console.log(`📄 Uploading SK Pendirian for puskesmas ID: ${puskesmasId}`);
    console.log('📁 File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`, `Type: ${file.type}`);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.put<{ file_url: string; file_path: string; success: boolean; message: string }>(
        `/api/v1/upload/puskesmas/${puskesmasId}/sk-pendirian`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': undefined, // Remove default Content-Type, let browser set multipart/form-data with boundary
          },
        }
      );

      console.log('✅ SK Pendirian uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ SK Pendirian upload failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Upload NPWP
  uploadNPWP: async (token: string, puskesmasId: number, file: File): Promise<{ file_url: string; file_path: string; success: boolean; message: string }> => {
    console.log(`📄 Uploading NPWP for puskesmas ID: ${puskesmasId}`);
    console.log('📁 File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`, `Type: ${file.type}`);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.put<{ file_url: string; file_path: string; success: boolean; message: string }>(
        `/api/v1/upload/puskesmas/${puskesmasId}/npwp`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': undefined, // Remove default Content-Type, let browser set multipart/form-data with boundary
          },
        }
      );

      console.log('✅ NPWP uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ NPWP upload failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Upload Foto Puskesmas
  uploadFotoPuskesmas: async (token: string, puskesmasId: number, file: File): Promise<{ file_url: string; file_path: string; success: boolean; message: string }> => {
    console.log(`📷 Uploading Foto Puskesmas for puskesmas ID: ${puskesmasId}`);
    console.log('📁 File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`, `Type: ${file.type}`);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.put<{ file_url: string; file_path: string; success: boolean; message: string }>(
        `/api/v1/upload/puskesmas/${puskesmasId}/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': undefined, // Remove default Content-Type, let browser set multipart/form-data with boundary
          },
        }
      );

      console.log('✅ Foto Puskesmas uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Photo upload failed:', error.response?.data || error.message);
      throw error;
    }
  },
};
