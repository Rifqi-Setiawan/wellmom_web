export interface HealthRecordRequest {
  blood_glucose: number;
  blood_pressure_diastolic: number;
  blood_pressure_systolic: number;
  body_temperature: number;
  checked_by: string;
  checkup_date: string; // YYYY-MM-DD
  complaints: string;
  fetal_heart_rate: number;
  fundal_height: number;
  gestational_age_days: number;
  gestational_age_weeks: number;
  heart_rate: number;
  hemoglobin: number;
  ibu_hamil_id: number;
  notes: string;
  perawat_id: number;
  protein_urin: string;
  upper_arm_circumference: number;
  weight: number;
}

export interface HealthRecordResponse {
  id: number;
  ibu_hamil_id: number;
  perawat_id: number;
  checkup_date: string;
  gestational_age_weeks: number;
  gestational_age_days: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  body_temperature: number;
  weight: number;
  hemoglobin: number;
  blood_glucose: number;
  protein_urin: string;
  fetal_heart_rate: number;
  upper_arm_circumference: number;
  fundal_height: number;
  complaints: string;
  notes: string;
  checked_by: string;
  created_at: string;
  updated_at: string;
}
