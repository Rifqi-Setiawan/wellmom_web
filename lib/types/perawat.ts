export interface Puskesmas {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

export interface PerawatProfile {
  id: number;
  user_id: number;
  nama_lengkap: string;
  email: string;
  nomor_hp: string;
  nip: string;
  profile_photo_url?: string;
  is_active: boolean;
  current_patients: number;
  puskesmas?: Puskesmas;
  created_at: string;
  updated_at: string;
}

export interface PerawatPatient {
  id: number;
  nama_lengkap: string;
  nik?: string;
  nomor_hp?: string;
  tanggal_lahir?: string;
  usia_kehamilan_minggu?: number;
  usia_kehamilan_hari?: number;
  hpht?: string;
  hpl?: string;
  risk_level?: 'rendah' | 'sedang' | 'tinggi';
  profile_photo_url?: string;
  is_active: boolean;
  created_at?: string;
}

export interface PatientsResponse {
  perawat_id: number;
  perawat_nama: string;
  total_patients: number;
  patients_by_risk: {
    rendah: number;
    sedang: number;
    tinggi: number;
    belum_ditentukan: number;
  };
  patients: PerawatPatient[];
}

export interface ProfileUpdateRequest {
  nama_lengkap?: string;
  nomor_hp?: string;
  profile_photo_url?: string;
}

export interface CredentialsUpdateRequest {
  email?: string;
  new_password?: string;
  current_password: string;
}
