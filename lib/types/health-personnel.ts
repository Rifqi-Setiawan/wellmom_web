export interface HealthPersonnel {
  id: number;
  name: string;
  str_number: string; // NO. STR
  role: 'Dokter' | 'Bidan' | 'Perawat';
  workload: number; // Jumlah pasien
  max_capacity: number; // Kapasitas optimal (default 50)
  status: 'Aktif' | 'Nonaktif';
  avatar_initials: string;
  avatar_color: string;
}
