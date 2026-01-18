/**
 * Application Routes Constants
 * Centralized route paths for type-safe navigation
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Super Admin routes
  SUPER_ADMIN: {
    DASHBOARD: '/super-admin/dashboard',
    PUSKESMAS: {
      LIST: '/super-admin/puskesmas',
      PENDING: '/super-admin/puskesmas/pending',
      DETAIL: (id: string | number) => `/super-admin/puskesmas/${id}`,
    },
    PERAWAT: {
      LIST: '/super-admin/perawat',
    },
    REPORTS: '/super-admin/reports',
    SETTINGS: '/super-admin/settings',
  },

  // Puskesmas routes
  PUSKESMAS: {
    DASHBOARD: '/puskesmas/dashboard',
    TENAGA_KESEHATAN: {
      LIST: '/puskesmas/tenaga-kesehatan',
      ADD: '/puskesmas/tenaga-kesehatan/tambah',
      DETAIL: (id: string | number) => `/puskesmas/tenaga-kesehatan/${id}`,
      EDIT: (id: string | number) => `/puskesmas/tenaga-kesehatan/${id}/edit`,
    },
    PASIEN: {
      LIST: '/puskesmas/pasien',
      ADD: '/puskesmas/pasien/tambah',
      DETAIL: (id: string | number) => `/puskesmas/pasien/${id}`,
      EDIT: (id: string | number) => `/puskesmas/pasien/${id}/edit`,
    },
    PERAWAT: {
      LIST: '/puskesmas/perawat',
      ADD: '/puskesmas/perawat/tambah',
      DETAIL: (id: string | number) => `/puskesmas/perawat/${id}`,
      EDIT: (id: string | number) => `/puskesmas/perawat/${id}/edit`,
    },
    IBU_HAMIL: {
      LIST: '/puskesmas/ibu-hamil',
      ADD: '/puskesmas/ibu-hamil/tambah',
      DETAIL: (id: string | number) => `/puskesmas/ibu-hamil/${id}`,
      EDIT: (id: string | number) => `/puskesmas/ibu-hamil/${id}/edit`,
    },
    LAPORAN: '/puskesmas/laporan',
    PROFILE: '/puskesmas/profile',
  },

  // Perawat routes
  PERAWAT: {
    DASHBOARD: '/perawat/dashboard',
    PASIEN: {
      LIST: '/perawat/pasien',
      ADD: '/perawat/pasien/tambah',
      DETAIL: (id: string | number) => `/perawat/pasien/${id}`,
      CHECKUP: (id: string | number) => `/perawat/pasien/${id}/checkup`,
      RIWAYAT: (id: string | number) => `/perawat/pasien/${id}/riwayat`,
    },
    JADWAL: '/perawat/jadwal',
    PROFILE: '/perawat/profile',
  },
} as const;

/**
 * Get dashboard route based on user role
 */
export function getDashboardRoute(role: 'super_admin' | 'puskesmas' | 'perawat'): string {
  const roleRoutes = {
    super_admin: ROUTES.SUPER_ADMIN.DASHBOARD,
    puskesmas: ROUTES.PUSKESMAS.DASHBOARD,
    perawat: ROUTES.PERAWAT.DASHBOARD,
  };

  return roleRoutes[role];
}

/**
 * Check if path matches a role's routes
 */
export function isRolePath(path: string, role: 'super_admin' | 'puskesmas' | 'perawat'): boolean {
  const rolePrefix = {
    super_admin: '/super-admin',
    puskesmas: '/puskesmas',
    perawat: '/perawat',
  };

  return path.startsWith(rolePrefix[role]);
}
