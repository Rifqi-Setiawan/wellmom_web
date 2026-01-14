export interface PlatformStatistics {
  total_puskesmas_active: number;
  total_puskesmas_pending: number;
  total_puskesmas_approved: number;
  total_puskesmas_rejected: number;
  total_puskesmas_draft: number;
  total_perawat: number;
  total_perawat_active: number;
  total_ibu_hamil: number;
  total_ibu_hamil_active: number;
  total_ibu_hamil_risk_low: number;
  total_ibu_hamil_risk_normal: number;
  total_ibu_hamil_risk_high: number;
}

export interface PuskesmasListItem {
  id: number;
  name: string;
  district: string;
  head_of_clinic: string;
  patients: number;
  status: 'active' | 'inactive' | 'operational';
}
