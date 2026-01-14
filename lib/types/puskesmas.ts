export interface Puskesmas {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  admin_user_id: number;
  kepala_name: string;
  kepala_nip: string;
  npwp: string;
  latitude: number;
  longitude: number;
  building_photo_url: string | null;
  npwp_document_url: string | null;
  sk_document_url: string | null;
  registration_date: string;
  registration_status: 'pending_approval' | 'approved' | 'rejected' | 'draft';
  is_active: boolean;
  data_truth_confirmed: boolean;
  created_at: string;
  updated_at: string;
  // Additional fields from API response
  active_ibu_hamil_count?: number;
  active_perawat_count?: number;
}

export interface PuskesmasListResponse {
  data: Puskesmas[];
  total: number;
  page: number;
  per_page: number;
}
