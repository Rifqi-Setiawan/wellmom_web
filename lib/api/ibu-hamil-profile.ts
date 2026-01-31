import axios from "axios";
import type {
  IbuHamilProfileResponse,
  UpdateIbuHamilProfileRequest,
} from "@/lib/types/ibu-hamil";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://103.191.92.29:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const ibuHamilProfileApi = {
  // Get Ibu Hamil Profile
  getProfile: async (token: string): Promise<IbuHamilProfileResponse> => {
    const response = await api.get<IbuHamilProfileResponse>(
      "/api/v1/ibu-hamil/me/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Update Ibu Hamil Identity
  updateProfile: async (
    token: string,
    data: UpdateIbuHamilProfileRequest
  ): Promise<void> => {
    await api.patch("/api/v1/ibu-hamil/me/profile/identitas", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
