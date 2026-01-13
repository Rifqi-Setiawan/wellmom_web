export type UserRole = 'super_admin' | 'puskesmas' | 'perawat';

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
    token: string;
  };
  message?: string;
}

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
