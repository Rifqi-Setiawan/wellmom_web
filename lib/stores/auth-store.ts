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

        const puskesmasInfo = 'puskesmas' in response ? response.puskesmas : null;
        const perawatInfo = 'perawat' in response ? response.perawat : null;

        console.log('🔐 Setting auth state:', {
          role: response.role,
          userId: response.user.id,
          hasToken: !!response.access_token,
          puskesmasInfo: puskesmasInfo,
          perawatInfo: perawatInfo,
        });

        set({
          user: authUser,
          token: response.access_token,
          puskesmasInfo: puskesmasInfo,
          perawatInfo: perawatInfo,
          isAuthenticated: true,
        });

        console.log('✅ Auth state set successfully', {
          user: authUser,
          hasToken: !!response.access_token,
          puskesmasInfo: puskesmasInfo,
          perawatInfo: perawatInfo,
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
