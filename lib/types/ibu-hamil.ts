export interface IbuHamil {
  id: number;
  user_id: number;
  puskesmas_id: number;
  perawat_id: number | null;
  nama_lengkap: string;
  nik: string;
  date_of_birth: string;
  address: string;
  provinsi: string;
  location: [number, number]; // [longitude, latitude]
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PuskesmasStatistics {
  puskesmas_id: number;
  puskesmas_name: string;
  total_perawat: number;
  total_ibu_hamil: number;
  pemeriksaan_hari_ini: number;
  pasien_belum_ditugaskan: number;
  persentase_belum_ditugaskan: number;
  distribusi_risiko: {
    rendah: number;
    sedang: number;
    tinggi: number;
    note?: string;
  };
}
