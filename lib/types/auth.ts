export type UserRole = 'super_admin' | 'puskesmas' | 'perawat';

export interface LoginRequest {
  email: string;
  password: string;
}

// Base user structure
export interface User {
  id: number;
  email: string;
  full_name: string;
}

// Puskesmas info
export interface PuskesmasInfo {
  id: number;
  name: string;
  registration_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
}

// Perawat info
export interface PerawatInfo {
  id: number;
  is_active: boolean;
  nip: string;
  puskesmas_id: number;
  puskesmas_name: string;
}

// Super Admin Login Response
export interface SuperAdminLoginResponse {
  access_token: string;
  token_type: string;
  role: 'super_admin';
  user: User;
}

// Puskesmas Login Response
export interface PuskesmasLoginResponse {
  access_token: string;
  token_type: string;
  role: 'puskesmas';
  user: User;
  puskesmas: PuskesmasInfo;
}

// Perawat Login Response
export interface PerawatLoginResponse {
  access_token: string;
  token_type: string;
  role: 'perawat';
  user: User;
  perawat: PerawatInfo;
}

// Union type for all login responses
export type LoginResponse =
  | SuperAdminLoginResponse
  | PuskesmasLoginResponse
  | PerawatLoginResponse;

export interface RegisterRequest {
  nama_puskesmas: string;
  email: string;
  password: string;
  password_confirmation: string;
  alamat: string;
  no_telepon: string;
  nama_kepala_puskesmas: string;
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    nama_puskesmas: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  message?: string;
}
