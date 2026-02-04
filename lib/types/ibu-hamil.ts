import { User } from './auth';

export interface IbuHamil {
  id: number;
  user_id: number;
  nama_lengkap: string;
  nik: string;
  date_of_birth: string;
  location: [number, number];
  address: string;
  provinsi: string;
  kota_kabupaten: string;
  kelurahan: string;
  kecamatan: string;
  is_active: boolean;
  /** Dari API daftar pasien (by-puskesmas): level risiko ibu hamil */
  risk_level?: 'rendah' | 'sedang' | 'tinggi' | null;
  /** Dari API daftar pasien: perawat yang menangani */
  perawat_id?: number | null;
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
