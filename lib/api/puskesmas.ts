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
    const response = await api.get<Puskesmas[]>('/api/v1/puskesmas/admin/active', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get pending puskesmas list
  getPendingPuskesmas: async (token: string): Promise<Puskesmas[]> => {
    const response = await api.get<Puskesmas[]>('/api/v1/puskesmas/pending', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get all puskesmas (for overview - newest registrations first)
  getAllPuskesmas: async (token: string, limit: number = 100): Promise<Puskesmas[]> => {
    const response = await api.get<Puskesmas[]>('/api/v1/puskesmas/admin/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit,
      },
    });
    return response.data;
  },

  // Get puskesmas by ID
  getPuskesmasById: async (token: string, id: number): Promise<Puskesmas> => {
    const response = await api.get<Puskesmas>(`/api/v1/puskesmas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
