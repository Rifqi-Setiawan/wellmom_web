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
