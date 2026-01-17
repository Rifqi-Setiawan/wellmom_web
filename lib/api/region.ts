import axios from 'axios';
import type { Province, RegionApiResponse } from '@/lib/types/region';

// Using free public API for Indonesian regions
const REGION_API_BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const api = axios.create({
  baseURL: REGION_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const regionApi = {
  // Get all provinces in Indonesia
  getProvinces: async (): Promise<Province[]> => {
    console.log('🗺️ API Request: GET provinces from Indonesian Region API');
    
    try {
      const response = await api.get<RegionApiResponse[]>('/provinces.json');
      
      console.log('🗺️ API Response Status:', response.status);
      console.log('🗺️ Total Provinces:', response.data.length);
      
      // Transform to our Province type
      const provinces: Province[] = response.data.map((item) => ({
        id: item.id,
        name: item.name,
      }));
      
      return provinces;
    } catch (error) {
      console.error('❌ Failed to fetch provinces:', error);
      // Return empty array on error
      return [];
    }
  },
};
