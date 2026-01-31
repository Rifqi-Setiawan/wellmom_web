export type UserRole = 'super_admin' | 'puskesmas' | 'perawat' | 'kerabat' | 'ibu_hamil';

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

export interface PerawatInfo {
  id: number;
  is_active: boolean;
  nip: string;
  puskesmas_id: number;
  puskesmas_name: string;
}

// Kerabat info
export interface KerabatInfo {
  id: number;
  ibu_hamil_id: number;
  ibu_hamil_name: string;
  requires_profile_completion: boolean;
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

// Kerabat Login Response
export interface KerabatLoginResponse {
  access_token: string;
  token_type: string;
  role: 'kerabat';
  kerabat: KerabatInfo;
  // Note: API response for kerabat does not wrap user info in a 'user' object like others
  // based on the provided JSON: { access_token, token_type, kerabat_id, ibu_hamil_id, ... }
  // We might need to construct a User object manually or adjust the interface.
  // The provided JSON example:
  // {
  //   "access_token": "...",
  //   "token_type": "bearer",
  //   "kerabat_id": 1,
  //   "ibu_hamil_id": 1,
  //   "ibu_hamil_name": "Siti Aminah",
  //   "requires_profile_completion": true
  // }
}

// Union type for all login responses
export type LoginResponse =
  | SuperAdminLoginResponse
  | PuskesmasLoginResponse
  | PerawatLoginResponse
  | KerabatLoginResponse;

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
