/**
 * User Roles Constants
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  PUSKESMAS: 'puskesmas',
  PERAWAT: 'perawat',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.PUSKESMAS]: 'Admin Puskesmas',
  [ROLES.PERAWAT]: 'Perawat',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [ROLES.SUPER_ADMIN]: 'Kementerian Kesehatan',
  [ROLES.PUSKESMAS]: 'Administrator Puskesmas',
  [ROLES.PERAWAT]: 'Perawat Puskesmas',
};
