'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Heart, Thermometer, Scale, Droplet, Activity, Baby, Ruler, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InputHealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HealthRecordFormData) => Promise<void>;
  patientName: string;
  isLoading?: boolean;
}

export interface HealthRecordFormData {
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
}

export default function InputHealthRecordModal({
  isOpen,
  onClose,
  onSubmit,
  patientName,
  isLoading = false,
}: InputHealthRecordModalProps) {
  const [formData, setFormData] = useState<HealthRecordFormData>({
    checkup_date: new Date().toISOString().split('T')[0],
    gestational_age_weeks: 0,
    gestational_age_days: 0,
    blood_pressure_systolic: 0,
    blood_pressure_diastolic: 0,
    heart_rate: 0,
    body_temperature: 0,
    weight: 0,
    hemoglobin: 0,
    blood_glucose: 0,
    protein_urin: 'negatif',
    fetal_heart_rate: 0,
    upper_arm_circumference: 0,
    fundal_height: 0,
    complaints: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        checkup_date: new Date().toISOString().split('T')[0],
        gestational_age_weeks: 0,
        gestational_age_days: 0,
        blood_pressure_systolic: 0,
        blood_pressure_diastolic: 0,
        heart_rate: 0,
        body_temperature: 0,
        weight: 0,
        hemoglobin: 0,
        blood_glucose: 0,
        protein_urin: 'negatif',
        fetal_heart_rate: 0,
        upper_arm_circumference: 0,
        fundal_height: 0,
        complaints: '',
        notes: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.checkup_date) {
      newErrors.checkup_date = 'Tanggal pemeriksaan harus diisi';
    }

    if (formData.gestational_age_weeks < 0 || formData.gestational_age_weeks > 50) {
      newErrors.gestational_age_weeks = 'Usia kehamilan (minggu) harus antara 0-50';
    }

    if (formData.gestational_age_days < 0 || formData.gestational_age_days >= 7) {
      newErrors.gestational_age_days = 'Usia kehamilan (hari) harus antara 0-6';
    }

    if (formData.blood_pressure_systolic <= 0 || formData.blood_pressure_systolic > 300) {
      newErrors.blood_pressure_systolic = 'Tekanan darah sistolik tidak valid';
    }

    if (formData.blood_pressure_diastolic <= 0 || formData.blood_pressure_diastolic > 200) {
      newErrors.blood_pressure_diastolic = 'Tekanan darah diastolik tidak valid';
    }

    if (formData.heart_rate <= 0 || formData.heart_rate > 200) {
      newErrors.heart_rate = 'Detak jantung tidak valid';
    }

    if (formData.body_temperature <= 0 || formData.body_temperature > 45) {
      newErrors.body_temperature = 'Suhu tubuh tidak valid';
    }

    if (formData.weight <= 0 || formData.weight > 200) {
      newErrors.weight = 'Berat badan tidak valid';
    }

    if (formData.hemoglobin < 0 || formData.hemoglobin > 20) {
      newErrors.hemoglobin = 'Hemoglobin tidak valid';
    }

    if (formData.blood_glucose < 0 || formData.blood_glucose > 500) {
      newErrors.blood_glucose = 'Gula darah tidak valid';
    }

    if (formData.fetal_heart_rate < 0 || formData.fetal_heart_rate > 300) {
      newErrors.fetal_heart_rate = 'Denyut jantung janin tidak valid';
    }

    if (formData.upper_arm_circumference <= 0 || formData.upper_arm_circumference > 50) {
      newErrors.upper_arm_circumference = 'Lingkar lengan atas tidak valid';
    }

    if (formData.fundal_height <= 0 || formData.fundal_height > 50) {
      newErrors.fundal_height = 'Tinggi fundus uteri tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit health record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof HealthRecordFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200 bg-gradient-to-r from-[#3B9ECF] to-[#2d7ba8]">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Input Data Pemeriksaan</h2>
            <p className="text-sm text-white/90 mt-0.5">Pasien: {patientName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting || isLoading}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Tanggal Pemeriksaan & Usia Kehamilan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="checkup_date" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-[#3B9ECF]" />
                  Tanggal Pemeriksaan *
                </Label>
                <Input
                  id="checkup_date"
                  type="date"
                  value={formData.checkup_date}
                  onChange={(e) => handleChange('checkup_date', e.target.value)}
                  className={errors.checkup_date ? 'border-red-500' : ''}
                  required
                />
                {errors.checkup_date && (
                  <p className="text-xs text-red-500 mt-1">{errors.checkup_date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gestational_age_weeks" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Baby className="w-4 h-4 text-[#3B9ECF]" />
                  Usia Kehamilan (Minggu) *
                </Label>
                <Input
                  id="gestational_age_weeks"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.gestational_age_weeks || ''}
                  onChange={(e) => handleChange('gestational_age_weeks', parseInt(e.target.value) || 0)}
                  className={errors.gestational_age_weeks ? 'border-red-500' : ''}
                  required
                />
                {errors.gestational_age_weeks && (
                  <p className="text-xs text-red-500 mt-1">{errors.gestational_age_weeks}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gestational_age_days" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Baby className="w-4 h-4 text-[#3B9ECF]" />
                  Usia Kehamilan (Hari) *
                </Label>
                <Input
                  id="gestational_age_days"
                  type="number"
                  min="0"
                  max="6"
                  value={formData.gestational_age_days || ''}
                  onChange={(e) => handleChange('gestational_age_days', parseInt(e.target.value) || 0)}
                  className={errors.gestational_age_days ? 'border-red-500' : ''}
                  required
                />
                {errors.gestational_age_days && (
                  <p className="text-xs text-red-500 mt-1">{errors.gestational_age_days}</p>
                )}
              </div>
            </div>

            {/* Tekanan Darah */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#3B9ECF]" />
                Tekanan Darah
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blood_pressure_systolic" className="text-xs text-gray-600 mb-2">
                    Sistolik (mmHg) *
                  </Label>
                  <Input
                    id="blood_pressure_systolic"
                    type="number"
                    min="1"
                    max="300"
                    step="1"
                    value={formData.blood_pressure_systolic || ''}
                    onChange={(e) => handleChange('blood_pressure_systolic', parseFloat(e.target.value) || 0)}
                    className={errors.blood_pressure_systolic ? 'border-red-500' : ''}
                    required
                  />
                  {errors.blood_pressure_systolic && (
                    <p className="text-xs text-red-500 mt-1">{errors.blood_pressure_systolic}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="blood_pressure_diastolic" className="text-xs text-gray-600 mb-2">
                    Diastolik (mmHg) *
                  </Label>
                  <Input
                    id="blood_pressure_diastolic"
                    type="number"
                    min="1"
                    max="200"
                    step="1"
                    value={formData.blood_pressure_diastolic || ''}
                    onChange={(e) => handleChange('blood_pressure_diastolic', parseFloat(e.target.value) || 0)}
                    className={errors.blood_pressure_diastolic ? 'border-red-500' : ''}
                    required
                  />
                  {errors.blood_pressure_diastolic && (
                    <p className="text-xs text-red-500 mt-1">{errors.blood_pressure_diastolic}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vital Signs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="heart_rate" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Activity className="w-4 h-4 text-[#3B9ECF]" />
                  Detak Jantung (BPM) *
                </Label>
                <Input
                  id="heart_rate"
                  type="number"
                  min="1"
                  max="200"
                  step="1"
                  value={formData.heart_rate || ''}
                  onChange={(e) => handleChange('heart_rate', parseFloat(e.target.value) || 0)}
                  className={errors.heart_rate ? 'border-red-500' : ''}
                  required
                />
                {errors.heart_rate && (
                  <p className="text-xs text-red-500 mt-1">{errors.heart_rate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="body_temperature" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Thermometer className="w-4 h-4 text-[#3B9ECF]" />
                  Suhu Tubuh (°C) *
                </Label>
                <Input
                  id="body_temperature"
                  type="number"
                  min="30"
                  max="45"
                  step="0.1"
                  value={formData.body_temperature || ''}
                  onChange={(e) => handleChange('body_temperature', parseFloat(e.target.value) || 0)}
                  className={errors.body_temperature ? 'border-red-500' : ''}
                  required
                />
                {errors.body_temperature && (
                  <p className="text-xs text-red-500 mt-1">{errors.body_temperature}</p>
                )}
              </div>

              <div>
                <Label htmlFor="weight" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Scale className="w-4 h-4 text-[#3B9ECF]" />
                  Berat Badan (kg) *
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  max="200"
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                  className={errors.weight ? 'border-red-500' : ''}
                  required
                />
                {errors.weight && (
                  <p className="text-xs text-red-500 mt-1">{errors.weight}</p>
                )}
              </div>
            </div>

            {/* Pemeriksaan Laboratorium */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-[#3B9ECF]" />
                Pemeriksaan Laboratorium
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hemoglobin" className="text-xs text-gray-600 mb-2">
                    Hemoglobin (g/dL) *
                  </Label>
                  <Input
                    id="hemoglobin"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formData.hemoglobin || ''}
                    onChange={(e) => handleChange('hemoglobin', parseFloat(e.target.value) || 0)}
                    className={errors.hemoglobin ? 'border-red-500' : ''}
                    required
                  />
                  {errors.hemoglobin && (
                    <p className="text-xs text-red-500 mt-1">{errors.hemoglobin}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="blood_glucose" className="text-xs text-gray-600 mb-2">
                    Gula Darah (mg/dL) *
                  </Label>
                  <Input
                    id="blood_glucose"
                    type="number"
                    min="0"
                    max="500"
                    step="1"
                    value={formData.blood_glucose || ''}
                    onChange={(e) => handleChange('blood_glucose', parseFloat(e.target.value) || 0)}
                    className={errors.blood_glucose ? 'border-red-500' : ''}
                    required
                  />
                  {errors.blood_glucose && (
                    <p className="text-xs text-red-500 mt-1">{errors.blood_glucose}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="protein_urin" className="text-xs text-gray-600 mb-2">
                    Protein Urin *
                  </Label>
                  <select
                    id="protein_urin"
                    value={formData.protein_urin}
                    onChange={(e) => handleChange('protein_urin', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent"
                  >
                    <option value="negatif">Negatif</option>
                    <option value="positif">Positif</option>
                    <option value="trace">Trace</option>
                    <option value="+1">+1</option>
                    <option value="+2">+2</option>
                    <option value="+3">+3</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pemeriksaan Janin & Antropometri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fetal_heart_rate" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Baby className="w-4 h-4 text-[#3B9ECF]" />
                  Denyut Jantung Janin (bpm) *
                </Label>
                <Input
                  id="fetal_heart_rate"
                  type="number"
                  min="0"
                  max="300"
                  step="1"
                  value={formData.fetal_heart_rate || ''}
                  onChange={(e) => handleChange('fetal_heart_rate', parseFloat(e.target.value) || 0)}
                  className={errors.fetal_heart_rate ? 'border-red-500' : ''}
                  required
                />
                {errors.fetal_heart_rate && (
                  <p className="text-xs text-red-500 mt-1">{errors.fetal_heart_rate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="upper_arm_circumference" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Ruler className="w-4 h-4 text-[#3B9ECF]" />
                  Lingkar Lengan Atas (cm) *
                </Label>
                <Input
                  id="upper_arm_circumference"
                  type="number"
                  min="1"
                  max="50"
                  step="0.1"
                  value={formData.upper_arm_circumference || ''}
                  onChange={(e) => handleChange('upper_arm_circumference', parseFloat(e.target.value) || 0)}
                  className={errors.upper_arm_circumference ? 'border-red-500' : ''}
                  required
                />
                {errors.upper_arm_circumference && (
                  <p className="text-xs text-red-500 mt-1">{errors.upper_arm_circumference}</p>
                )}
              </div>

              <div>
                <Label htmlFor="fundal_height" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Ruler className="w-4 h-4 text-[#3B9ECF]" />
                  Tinggi Fundus Uteri (cm) *
                </Label>
                <Input
                  id="fundal_height"
                  type="number"
                  min="1"
                  max="50"
                  step="0.1"
                  value={formData.fundal_height || ''}
                  onChange={(e) => handleChange('fundal_height', parseFloat(e.target.value) || 0)}
                  className={errors.fundal_height ? 'border-red-500' : ''}
                  required
                />
                {errors.fundal_height && (
                  <p className="text-xs text-red-500 mt-1">{errors.fundal_height}</p>
                )}
              </div>
            </div>

            {/* Keluhan & Catatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="complaints" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <AlertCircle className="w-4 h-4 text-[#3B9ECF]" />
                  Keluhan
                </Label>
                <Textarea
                  id="complaints"
                  value={formData.complaints}
                  onChange={(e) => handleChange('complaints', e.target.value)}
                  placeholder="Masukkan keluhan pasien (opsional)"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-[#3B9ECF]" />
                  Catatan Tenaga Kesehatan
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Masukkan catatan pemeriksaan (opsional)"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="px-6"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white px-6"
            >
              {isSubmitting || isLoading ? 'Menyimpan...' : 'Simpan Data Pemeriksaan'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
