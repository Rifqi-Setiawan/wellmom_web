import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserRole,
  User,
  PuskesmasInfo,
  PerawatInfo,
  LoginResponse,
} from '@/lib/types/auth';

interface AuthUser extends User {
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  puskesmasInfo: PuskesmasInfo | null;
  perawatInfo: PerawatInfo | null;
  isAuthenticated: boolean;
  setAuth: (response: LoginResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      puskesmasInfo: null,
      perawatInfo: null,
      isAuthenticated: false,
      setAuth: (response) => {
        const authUser: AuthUser = {
          ...response.user,
          role: response.role,
        };

        set({
          user: authUser,
          token: response.access_token,
          puskesmasInfo: 'puskesmas' in response ? response.puskesmas : null,
          perawatInfo: 'perawat' in response ? response.perawat : null,
          isAuthenticated: true,
        });
      },
      clearAuth: () =>
        set({
          user: null,
          token: null,
          puskesmasInfo: null,
          perawatInfo: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'wellmom-auth',
    }
  )
);
