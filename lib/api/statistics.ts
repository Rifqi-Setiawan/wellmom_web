import axios from 'axios';
import type { PlatformStatistics } from '@/lib/types/statistics';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const statisticsApi = {
  getPlatformStatistics: async (token: string): Promise<PlatformStatistics> => {
    const response = await api.get<PlatformStatistics>('/api/v1/statistics/platform', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
