export interface NurseGenerationRequest {
  email: string;
  nip: string;
  nama_lengkap: string;
  nomor_hp: string;
}

export interface NurseGenerationResponse {
  user_id: number;
  perawat_id: number;
  email: string;
  nip: string;
  full_name: string;
  puskesmas_id: number;
  puskesmas_name: string;
  activation_link: string;
  email_sent: boolean;
  token_expires_in_hours: number;
  message: string;
}

export interface NurseListItem {
  id: number;
  user_id: number;
  nama_lengkap: string;
  email: string;
  nip: string;
  nomor_hp: string;
  is_active: boolean;
  current_patients: number;
  created_at: string;
  updated_at: string;
  activation_status?: {
    is_verified: boolean;
    is_user_active: boolean;
    has_pending_token: boolean;
  };
}

export interface NurseListResponse {
  puskesmas_id: number;
  puskesmas_name: string;
  total_perawat: number;
  perawat_aktif: number;
  perawat_pending: number;
  perawat_list: NurseListItem[];
}

export interface ActivationCheckTokenResponse {
  valid: boolean;
  user_info: {
    user_id: number;
    email: string;
    full_name: string;
    puskesmas_name: string;
  };
  expires_at: string;
}
