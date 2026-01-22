export interface Patient {
  id: number;
  user_id: number;
  puskesmas_id: number;
  perawat_id: number;
  nik: string;
  nama_lengkap: string;
  date_of_birth: string;
  address: string;
  provinsi: string;
  location: [number, number]; // [longitude, latitude]
  profile_photo_url: string;
  created_at: string;
  updated_at: string;
}

export type PatientListResponse = Patient[];
