import axios from "axios";
import type {
  NurseGenerationRequest,
  NurseGenerationResponse,
  NurseListResponse,
  ActivationCheckTokenResponse,
} from "@/lib/types/nurse";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://103.191.92.29:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const nurseApi = {
  // Generate Nurse Account (Puskesmas Admin)
  generateNurse: async (
    token: string,
    data: NurseGenerationRequest,
  ): Promise<NurseGenerationResponse> => {
    const response = await api.post<NurseGenerationResponse>(
      "/api/v1/perawat/generate",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },

  // Get Nurses List (Puskesmas Admin)
  getNurses: async (token: string): Promise<NurseListResponse> => {
    const response = await api.get<NurseListResponse>(
      "/api/v1/perawat/puskesmas/my-nurses",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },

  // Resend Activation Email (Puskesmas Admin)
  resendActivation: async (token: string, userId: number): Promise<void> => {
    await api.post(
      "/api/v1/perawat/activation/request",
      { user_id: userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  // Check Activation Token (Public)
  checkActivationToken: async (
    token: string,
  ): Promise<ActivationCheckTokenResponse> => {
    const response = await api.post<ActivationCheckTokenResponse>(
      "/api/v1/perawat/activation/check-token",
      { token },
    );
    return response.data;
  },

  // Verify Email (Public)
  verifyEmail: async (token: string): Promise<void> => {
    await api.post("/api/v1/perawat/activation/verify", { token });
  },

  // Set Password (Public)
  setPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post("/api/v1/perawat/activation/set-password", {
      token,
      new_password: newPassword,
    });
  },

  // Complete Profile (Public)
  completeProfile: async (
    token: string,
    profilePhotoUrl: string,
  ): Promise<void> => {
    await api.post("/api/v1/perawat/activation/complete-profile", {
      token,
      profile_photo_url: profilePhotoUrl,
    });
  },

  // Accept Terms (Public)
  acceptTerms: async (token: string): Promise<void> => {
    await api.post("/api/v1/perawat/activation/accept-terms", { token });
  },

  // Transfer Patients (Puskesmas Admin)
  transferPatients: async (
    token: string,
    sourceNurseId: number,
    targetNurseId: number,
  ): Promise<void> => {
    await api.post(
      `/api/v1/perawat/${sourceNurseId}/transfer-all-patients`,
      { target_perawat_id: targetNurseId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  // Delete Nurse (Puskesmas Admin)
  deleteNurse: async (token: string, perawatId: number): Promise<void> => {
    await api.delete(`/api/v1/perawat/${perawatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get Patients by Nurse (Puskesmas Admin)
  getPatientsByNurse: async (token: string, perawatId: number) => {
    const response = await api.get(
      `/api/v1/ibu-hamil/by-perawat/${perawatId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },

  // Transfer Single Patient (Puskesmas Admin)
  transferSinglePatient: async (
    token: string,
    sourcePerawatId: number,
    ibuHamilId: number,
    targetPerawatId: number,
  ): Promise<void> => {
    await api.post(
      `/api/v1/perawat/${sourcePerawatId}/transfer-patient`,
      {
        ibu_hamil_id: ibuHamilId,
        target_perawat_id: targetPerawatId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  // Get My Patients (Perawat - for logged in perawat)
  getMyPatients: async (token: string) => {
    const response = await api.get("/api/v1/ibu-hamil/perawat/my-patients", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get All Patients by Puskesmas (Perawat - for logged in perawat to see all patients in their puskesmas)
  getAllPatientsByPuskesmas: async (token: string, puskesmasId: number) => {
    console.log(
      `👶 API Request (Perawat): GET /api/v1/ibu-hamil/by-puskesmas/${puskesmasId}`,
    );
    console.log("🔑 Using token:", token.substring(0, 20) + "...");

    const response = await api.get(
      `/api/v1/ibu-hamil/by-puskesmas/${puskesmasId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("👶 API Response Status:", response.status);
    console.log("👶 Ibu Hamil Count:", response.data.length);

    return response.data;
  },

  // Get Ibu Hamil Detail (Perawat)
  getIbuHamilDetail: async (token: string, ibuHamilId: number) => {
    const response = await api.get(`/api/v1/ibu-hamil/${ibuHamilId}/detail`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get Health Records (Perawat)
  getHealthRecords: async (token: string, ibuHamilId: number) => {
    const response = await api.get(
      `/api/v1/health-records/ibu-hamil/${ibuHamilId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },

  // Get Latest Health Record for a Patient (Perawat)
  getLatestHealthRecord: async (token: string, ibuHamilId: number) => {
    const response = await api.get(
      `/api/v1/ibu-hamil/perawat/${ibuHamilId}/latest-health-record`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },

  // Update Risk Level for Patient (Perawat)
  updateRiskLevel: async (
    token: string,
    ibuHamilId: number,
    riskLevel: "rendah" | "sedang" | "tinggi",
  ) => {
    const response = await api.patch(
      `/api/v1/perawat/me/patients/${ibuHamilId}/risk-level`,
      { risk_level: riskLevel },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },

  // Create Health Record (Perawat)
  createHealthRecord: async (
    token: string,
    data: {
      ibu_hamil_id: number;
      perawat_id: number;
      checkup_date: string;
      gestational_age_weeks: number;
      gestational_age_days: number;
      blood_pressure_systolic: number;
      blood_pressure_diastolic: number;
      heart_rate: number;
      body_temperature: number;
      weight: number;
      hemoglobin: number;
      blood_glucose: number;
      protein_urin: string;
      fetal_heart_rate: number;
      upper_arm_circumference: number;
      fundal_height: number;
      complaints?: string;
      notes?: string;
      checked_by?: string;
    },
  ) => {
    const response = await api.post(
      "/api/v1/health-records/",
      {
        ...data,
        checked_by: data.checked_by || "perawat",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },

  // === PROFILE MANAGEMENT ENDPOINTS ===

  // Get My Profile (Perawat)
  getMe: async (token: string) => {
    const response = await api.get("/api/v1/perawat/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Update Profile (Perawat)
  updateProfile: async (
    token: string,
    data: {
      nama_lengkap?: string;
      nomor_hp?: string;
      profile_photo_url?: string;
    },
  ) => {
    const response = await api.patch("/api/v1/perawat/me/profile", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Update Credentials (Perawat)
  updateCredentials: async (
    token: string,
    data: { email?: string; new_password?: string; current_password: string },
  ) => {
    const response = await api.patch("/api/v1/perawat/me/user", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get My Patients with Stats (Perawat Profile Page)
  getMePatients: async (token: string) => {
    const response = await api.get("/api/v1/perawat/me/patients", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Upload Profile Photo
  uploadProfilePhoto: async (token: string, perawatId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    // Note: This endpoint might vary based on backend implementation
    // Using the one specified in user request: PUT /upload/perawat/{perawat_id}/profile-photo
    const response = await api.put(
      `/api/v1/upload/perawat/${perawatId}/profile-photo`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // PENTING: Hapus Content-Type untuk FormData agar axios bisa auto-detect
          // dan set multipart/form-data dengan boundary yang benar
          "Content-Type": undefined,
        },
      },
    );
    return response.data;
  },
};
