/**
 * Utility functions untuk handle error dari login API
 * dan menentukan redirect path berdasarkan error message
 */

export type RegistrationStatus = 'pending_approval' | 'draft' | 'rejected' | 'deactivated' | 'unknown';

/**
 * Detect registration status dari error detail message
 */
export const detectRegistrationStatus = (errorDetail: string): RegistrationStatus => {
  const detail = errorDetail.toLowerCase();
  
  if (detail.includes('menunggu persetujuan') || detail.includes('pending')) {
    return 'pending_approval';
  }
  
  if (detail.includes('belum diajukan') || detail.includes('draft')) {
    return 'draft';
  }
  
  if (detail.includes('ditolak') || detail.includes('rejected')) {
    return 'rejected';
  }
  
  if (detail.includes('tidak aktif') || detail.includes('deactivated') || detail.includes('nonaktif')) {
    return 'deactivated';
  }
  
  return 'unknown';
};

/**
 * Get redirect path berdasarkan registration status
 */
export const getRedirectPath = (status: RegistrationStatus): string | null => {
  const routes: Record<RegistrationStatus, string | null> = {
    pending_approval: '/waiting-approval',
    draft: '/complete-registration',
    rejected: '/registration-rejected',
    deactivated: null, // show error, don't redirect
    unknown: null,
  };
  return routes[status];
};

/**
 * Extract error message untuk display
 */
export const getErrorMessage = (errorDetail: string, status: RegistrationStatus): string => {
  if (status === 'deactivated') {
    return 'Puskesmas Anda telah dinonaktifkan. Hubungi administrator untuk informasi lebih lanjut.';
  }
  
  // Return original error detail jika tidak ada custom message
  return errorDetail || 'Login gagal. Periksa nomor telepon dan password Anda.';
};
