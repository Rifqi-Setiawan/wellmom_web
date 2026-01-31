import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserRole,
  User,
  PuskesmasInfo,
  PerawatInfo,
  KerabatInfo,
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
  kerabatInfo: KerabatInfo | null;
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
      kerabatInfo: null,
      isAuthenticated: false,
      setAuth: (response) => {
        let authUser: AuthUser;

        if (response.role === 'kerabat') {
          // Kerabat response has no 'user' object, construct one
          authUser = {
            id: response.kerabat.id,
            email: 'kerabat@wellmom.local', // Placeholder
            full_name: response.kerabat.ibu_hamil_name + ' (Kerabat)', // Descriptive name
            role: 'kerabat',
          };
        } else {
          authUser = {
            ...response.user,
            role: response.role,
          };
        }

        const puskesmasInfo = 'puskesmas' in response ? response.puskesmas : null;
        const perawatInfo = 'perawat' in response ? response.perawat : null;
        const kerabatInfo = 'kerabat' in response ? response.kerabat : null;

        console.log('🔐 Setting auth state:', {
          role: response.role,
          userId: authUser.id,
          hasToken: !!response.access_token,
          puskesmasInfo: puskesmasInfo,
          perawatInfo: perawatInfo,
          kerabatInfo: kerabatInfo,
        });

        set({
          user: authUser,
          token: response.access_token,
          puskesmasInfo: puskesmasInfo,
          perawatInfo: perawatInfo,
          kerabatInfo: kerabatInfo,
          isAuthenticated: true,
        });

        console.log('✅ Auth state set successfully', {
          user: authUser,
          hasToken: !!response.access_token,
          puskesmasInfo: puskesmasInfo,
          perawatInfo: perawatInfo,
          kerabatInfo: kerabatInfo,
        });
      },
      clearAuth: () =>
        set({
          user: null,
          token: null,
          puskesmasInfo: null,
          perawatInfo: null,
          kerabatInfo: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'wellmom-auth',
    }
  )
);
