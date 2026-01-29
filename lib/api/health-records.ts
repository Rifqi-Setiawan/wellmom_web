import axios from "axios";
import { HealthRecordRequest, HealthRecordResponse } from "@/lib/types/health-record";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const healthRecordsApi = {
  createHealthRecord: async (token: string, data: HealthRecordRequest): Promise<HealthRecordResponse> => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/health-records/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error creating health record:", error.response?.data || error.message);
      throw error;
    }
  },

  updateHealthRecord: async (token: string, id: number, data: Partial<HealthRecordRequest>): Promise<HealthRecordResponse> => {
    try {
      const response = await axios.put(`${API_URL}/api/v1/health-records/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error updating health record:", error.response?.data || error.message);
      throw error;
    }
  },

  deleteHealthRecord: async (token: string, id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/api/v1/health-records/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error("Error deleting health record:", error.response?.data || error.message);
      throw error;
    }
  },
  
  getHealthRecordDetail: async (token: string, id: number): Promise<HealthRecordResponse> => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/health-records/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching health record detail:", error.response?.data || error.message);
      throw error;
    }
  },
};
