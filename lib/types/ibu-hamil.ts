import { User } from './auth';

export interface IbuHamil {
  id: number;
  user_id: number;
  puskesmas_id?: number;
  perawat_id?: number | null;
  assigned_by_user_id?: number;
  nama_lengkap: string;
  nik: string;
  date_of_birth: string;
  location: [number, number];
  address: string;
  provinsi: string;
  kota_kabupaten: string;
  kelurahan: string;
  kecamatan: string;
  profile_photo_url?: string;
  is_active: boolean;
  /** Dari API daftar pasien (by-puskesmas): level risiko ibu hamil */
  risk_level?: 'rendah' | 'sedang' | 'tinggi' | null;
  /** Siapa yang menetapkan risk level */
  risk_level_set_by?: number;
  /** Nama yang menetapkan risk level */
  risk_level_set_by_name?: string;
  /** Kapan risk level ditetapkan */
  risk_level_set_at?: string;
  /** Dari API daftar pasien: usia (tahun) */
  age?: number;
  /** Golongan darah */
  blood_type?: string;
  /** Hari Pertama Haid Terakhir */
  last_menstrual_period?: string;
  /** Hari Perkiraan Lahir */
  estimated_due_date?: string;
  /** Usia kehamilan dalam minggu */
  usia_kehamilan?: number;
  /** Kehamilan ke berapa */
  kehamilan_ke?: number;
  /** Jumlah anak */
  jumlah_anak?: number;
  /** Jumlah keguguran */
  miscarriage_number?: number;
  /** Jarak kehamilan terakhir */
  jarak_kehamilan_terakhir?: string;
  /** Riwayat medis - Darah Tinggi */
  darah_tinggi?: boolean;
  /** Riwayat medis - Diabetes */
  diabetes?: boolean;
  /** Riwayat medis - Anemia */
  anemia?: boolean;
  /** Riwayat medis - Penyakit Jantung */
  penyakit_jantung?: boolean;
  /** Riwayat medis - Asma */
  asma?: boolean;
  /** Riwayat medis - Penyakit Ginjal */
  penyakit_ginjal?: boolean;
  /** Riwayat medis - TBC/Malaria */
  tbc_malaria?: boolean;
  /** Riwayat medis - Pernah Caesar */
  pernah_caesar?: boolean;
  /** Riwayat perdarahan saat hamil */
  pernah_perdarahan_saat_hamil?: boolean;
  /** Nama kontak darurat */
  emergency_contact_name?: string;
  /** Hubungan dengan kontak darurat */
  emergency_contact_relation?: string;
  /** Nomor telepon kontak darurat */
  emergency_contact_phone?: string;
  /** Tanggal penugasan pasien ke perawat */
  assignment_date?: string;
  /** Jarak penugasan dalam km */
  assignment_distance_km?: number;
  /** Metode penugasan (auto/manual) */
  assignment_method?: string;
  /** Preferensi layanan kesehatan */
  healthcare_preference?: string;
  /** Persetujuan WhatsApp */
  whatsapp_consent?: boolean;
  /** Persetujuan berbagi data */
  data_sharing_consent?: boolean;
  /** Tanggal dibuat */
  created_at?: string;
  /** Tanggal diupdate */
  updated_at?: string;
}

export interface IbuHamilProfileResponse {
  user: User & {
    phone: string;
    role: "ibu_hamil";
    is_active: boolean;
    is_verified: boolean;
  };
  ibu_hamil: IbuHamil;
}

export interface UpdateIbuHamilProfileRequest {
  address: string;
  date_of_birth: string;
  kecamatan: string;
  kelurahan: string;
  kota_kabupaten: string;
  location: [number, number];
  nama_lengkap: string;
  nik: string;
  provinsi: string;
}

export interface PuskesmasStatistics {
  /** Nama puskesmas */
  puskesmas_name?: string;
  /** Total jumlah perawat */
  total_perawat: number;
  /** Total jumlah ibu hamil */
  total_ibu_hamil: number;
  /** Jumlah pasien yang belum ditugaskan ke perawat */
  pasien_belum_ditugaskan: number;
  /** Persentase pasien yang belum ditugaskan */
  persentase_belum_ditugaskan?: number;
  /** Distribusi risiko pasien */
  distribusi_risiko?: {
    rendah: number;
    sedang: number;
    tinggi: number;
  };
}
