export interface IbuHamil {
  id: number;
  user_id: number;
  puskesmas_id: number;
  perawat_id: number | null;
  assigned_by_user_id: number | null;
  nama_lengkap: string;
  nik: string;
  date_of_birth: string;
  age: number;
  blood_type: string;
  profile_photo_url: string | null;
  last_menstrual_period: string;
  estimated_due_date: string;
  usia_kehamilan: number; // in weeks
  kehamilan_ke: number;
  jumlah_anak: number;
  miscarriage_number: number;
  jarak_kehamilan_terakhir: string;
  pernah_caesar: boolean;
  pernah_perdarahan_saat_hamil: boolean;
  address: string;
  provinsi: string;
  kota_kabupaten: string;
  kelurahan: string;
  kecamatan: string;
  location: [number, number]; // [longitude, latitude]
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  darah_tinggi: boolean;
  diabetes: boolean;
  anemia: boolean;
  penyakit_jantung: boolean;
  asma: boolean;
  penyakit_ginjal: boolean;
  tbc_malaria: boolean;
  risk_level: 'rendah' | 'sedang' | 'tinggi' | null;
  risk_level_set_by: number | null;
  risk_level_set_by_name: string | null;
  risk_level_set_at: string | null;
  assignment_date: string | null;
  assignment_distance_km: number | null;
  assignment_method: string | null;
  healthcare_preference: string;
  whatsapp_consent: boolean;
  data_sharing_consent: boolean;
  is_active: boolean;
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
