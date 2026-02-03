'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, ChevronRight, AlertTriangle, Plus, Edit, Trash2, X, User, Calendar, Phone, MapPin, Heart, Baby, FileText, ChevronDown, MessageCircle } from 'lucide-react';
import { nurseApi } from '@/lib/api/nurse';
import { healthRecordsApi } from '@/lib/api/health-records';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { IbuHamil } from '@/lib/types/ibu-hamil';

interface HealthRecord {
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

interface HealthRecordsResponse {
  records: any[];
  total: number;
}

// Map API response to HealthRecord interface
const mapHealthRecord = (record: any): HealthRecord => ({
  id: record.id,
  ibu_hamil_id: record.ibu_hamil_id,
  perawat_id: record.perawat_id,
  checkup_date: record.checkup_date,
  gestational_age_weeks: record.gestational_age_weeks,
  gestational_age_days: record.gestational_age_days,
  blood_pressure_systolic: record.blood_pressure_systolic,
  blood_pressure_diastolic: record.blood_pressure_diastolic,
  heart_rate: record.heart_rate,
  body_temperature: record.body_temperature,
  weight: record.weight,
  hemoglobin: record.hemoglobin,
  blood_glucose: record.blood_glucose,
  protein_urin: record.protein_urin || '-',
  fetal_heart_rate: record.fetal_heart_rate,
  upper_arm_circumference: record.upper_arm_circumference,
  fundal_height: record.fundal_height,
  complaints: record.complaints || '',
  notes: record.notes || '',
  checked_by: record.checked_by,
  created_at: record.created_at,
  updated_at: record.updated_at,
});

export default function PerawatPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const patientId = typeof idParam === 'string' ? parseInt(idParam, 10) : Number(idParam);

  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [patient, setPatient] = useState<IbuHamil | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [latestRecord, setLatestRecord] = useState<HealthRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingRisk, setIsUpdatingRisk] = useState(false);
  const [isRiskMenuOpen, setIsRiskMenuOpen] = useState(false);
  const [riskUpdateError, setRiskUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !patientId || isNaN(patientId)) {
      setError('Invalid patient ID or authentication token');
      setIsLoading(false);
      return;
    }

    fetchPatientDetail();
    fetchLatestHealthRecord();
  }, [token, patientId]);

  useEffect(() => {
    if (activeTab === 'history' && patientId && token) {
      fetchHealthRecords();
    }
  }, [activeTab, patientId, token]);

  const fetchPatientDetail = async () => {
    if (!token || !patientId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await nurseApi.getIbuHamilDetail(token, patientId);
      setPatient(data);
    } catch (err: any) {
      console.error('Failed to fetch patient detail:', err);
      setError(err.response?.data?.message || 'Gagal memuat data pasien. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHealthRecords = async () => {
    if (!token || !patientId) return;

    setIsLoadingRecords(true);
    try {
      const data: HealthRecordsResponse = await nurseApi.getHealthRecords(token, patientId);
      // Map and sort records by date (newest first)
      const mappedRecords = (data.records || []).map(mapHealthRecord);
      mappedRecords.sort((a, b) => new Date(b.checkup_date).getTime() - new Date(a.checkup_date).getTime());
      setHealthRecords(mappedRecords);
    } catch (err: any) {
      console.error('Failed to fetch health records:', err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const fetchLatestHealthRecord = async () => {
    if (!token || !patientId) return;

    try {
      const data = await nurseApi.getLatestHealthRecord(token, patientId);
      if (data) {
        setLatestRecord(mapHealthRecord(data));
      } else {
        setLatestRecord(null);
      }
    } catch (err: any) {
      // Jika belum pernah diperiksa atau error lain, jangan blok halaman
      console.warn('Failed to fetch latest health record:', err?.response?.data || err?.message);
      setLatestRecord(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskBadge = (riskLevel: string | null | undefined) => {
    if (!riskLevel) {
      return {
        label: 'Belum Ditentukan',
        className: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    }
    
    switch (riskLevel) {
      case 'tinggi':
        return {
          label: 'RISIKO TINGGI',
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'sedang':
        return {
          label: 'RISIKO SEDANG',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      case 'rendah':
        return {
          label: 'RISIKO RENDAH',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      default:
        return {
          label: 'Belum Ditentukan',
          className: 'bg-amber-100 text-amber-800 border-amber-200',
        };
    }
  };

  const getLatestClinicalData = () => {
    const latest = latestRecord || healthRecords[0];
    if (!latest) return null;
    return {
      protein_urin: latest.protein_urin || '-',
      hemoglobin: latest.hemoglobin,
      hemoglobinStatus: latest.hemoglobin < 11 ? 'Anemia Ringan' : 'Normal',
      blood_glucose: latest.blood_glucose,
      fetal_heart_rate: latest.fetal_heart_rate,
      fetalHeartRateStatus: latest.fetal_heart_rate >= 120 && latest.fetal_heart_rate <= 160 ? 'Normal & Teratur' : 'Perlu Perhatian',
      upper_arm_circumference: latest.upper_arm_circumference,
      fundal_height: latest.fundal_height,
    };
  };

  const handleRiskLevelChange = async (newRiskLevel: 'rendah' | 'sedang' | 'tinggi') => {
    if (!token || !patient || isUpdatingRisk || patient.risk_level === newRiskLevel) return;

    setIsUpdatingRisk(true);
    setRiskUpdateError(null);

    try {
      const response = await nurseApi.updateRiskLevel(token, patient.id, newRiskLevel);

      // Gunakan response dari API jika tersedia, fallback ke nilai lokal
      const updatedRiskLevel = response?.risk_level || newRiskLevel;
      const updatedRiskSetAt = response?.risk_level_set_at || new Date().toISOString();

      setPatient((prev) =>
        prev
          ? {
              ...prev,
              risk_level: updatedRiskLevel,
              risk_level_set_at: updatedRiskSetAt,
            }
          : prev
      );
      setIsRiskMenuOpen(false);
    } catch (err: any) {
      console.error('Failed to update risk level:', err);
      setRiskUpdateError(err?.response?.data?.message || 'Gagal mengubah level risiko. Silakan coba lagi.');
    } finally {
      setIsUpdatingRisk(false);
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!token || !confirm('Apakah Anda yakin ingin menghapus riwayat pengecekan ini? Data yang dihapus tidak dapat dikembalikan.')) return;

    try {
      await healthRecordsApi.deleteHealthRecord(token, recordId);
      // Close modal
      setSelectedRecord(null);
      // Refresh list
      fetchHealthRecords();
      // Refresh latest record if needed
      fetchLatestHealthRecord();
    } catch (err) {
      console.error('Failed to delete record:', err);
      alert('Gagal menghapus data pengecekan.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]"></div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'Pasien tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  const riskBadge = getRiskBadge(patient.risk_level);
  const latestClinical = getLatestClinicalData();
  const riskUpdatedAt = (patient as { risk_level_set_at?: string | null })?.risk_level_set_at ?? null;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Baris 1: Hanya tombol Kembali */}
      <div className="mb-5">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>

      {/* Baris 2: Informasi header pasien — kiri: info pasien, kanan: Chat & Menentukan Risiko */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Kiri: informasi pasien (avatar, nama, NIK, usia, alamat) */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="w-16 h-16 bg-[#3B9ECF] rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0">
              {patient.nama_lengkap.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                {patient.nama_lengkap}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                NIK {patient.nik}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {patient.age != null ? `${patient.age} tahun` : '—'}
                <span className="mx-1.5 text-gray-400">·</span>
                <span className="line-clamp-2">{patient.address}</span>
              </p>
            </div>
          </div>

          {/* Kanan: tombol Chat dan tombol Menentukan Risiko */}
          <div className="flex flex-col items-stretch sm:items-end gap-4 shrink-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push(`/perawat/chat?ibu_hamil_id=${patient.id}`)}
                variant="outline"
                className="h-[42px] px-4 py-2.5 rounded-lg text-sm font-semibold text-emerald-600 border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 gap-2"
                title="Chat dengan ibu hamil"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </Button>
              <div className="relative">
                <button
                  type="button"
                  disabled={isUpdatingRisk}
                  onClick={() => setIsRiskMenuOpen((prev) => !prev)}
                  className={`h-[42px] inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B9ECF] w-full sm:w-auto justify-center ${riskBadge.className} ${isUpdatingRisk ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                >
                  <span>{riskBadge.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isRiskMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 border border-gray-100">
                    <div className="py-2">
                      <p className="px-4 pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Ubah Level Risiko
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRiskLevelChange('rendah')}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-green-50 text-gray-800"
                      >
                        <span>Risiko Rendah</span>
                        <span className="inline-flex items-center">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px]">
                            RENDAH
                          </Badge>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRiskLevelChange('sedang')}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-orange-50 text-gray-800"
                      >
                        <span>Risiko Sedang</span>
                        <span className="inline-flex items-center">
                          <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-[10px]">
                            SEDANG
                          </Badge>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRiskLevelChange('tinggi')}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-red-50 text-gray-800"
                      >
                        <span>Risiko Tinggi</span>
                        <span className="inline-flex items-center">
                          <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                          <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px]">
                            TINGGI
                          </Badge>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {riskUpdateError && (
              <p className="text-xs text-red-500 text-left sm:text-right">
                {riskUpdateError}
              </p>
            )}
            <p className="text-xs text-gray-500 text-left sm:text-right">
              Terakhir diperbarui: {riskUpdatedAt ? formatDateTime(riskUpdatedAt) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'current'
                ? 'border-[#3B9ECF] text-[#3B9ECF]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Data Saat Ini
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-[#3B9ECF] text-[#3B9ECF]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Riwayat Pengecekan
          </button>
        </div>

      {/* Tab Content */}
      {activeTab === 'current' ? (
        <div className="space-y-6">
          {/* Data Ibu Hamil */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-[#3B9ECF]" />
              <h2 className="text-lg font-semibold text-gray-900">Data Ibu Hamil</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informasi Dasar */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Informasi Dasar</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">Nama Lengkap</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.nama_lengkap}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">NIK</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.nik}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Tanggal Lahir</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(patient.date_of_birth)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Usia</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.age} Tahun</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Golongan Darah</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.blood_type || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Informasi Kehamilan */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Baby className="w-4 h-4 text-[#3B9ECF]" />
                  Informasi Kehamilan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">HPHT</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(patient.last_menstrual_period)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">HPL</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(patient.estimated_due_date)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Usia Kehamilan</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.usia_kehamilan} Minggu</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Kehamilan Ke</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.kehamilan_ke}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Jumlah Anak</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.jumlah_anak}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Jarak Kehamilan</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.jarak_kehamilan_terakhir || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Medis */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3B9ECF]" />
                Riwayat Medis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${patient.darah_tinggi ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-700">Darah Tinggi</span>
                  {patient.darah_tinggi && <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Ya</Badge>}
                  {!patient.darah_tinggi && <span className="text-xs text-gray-500 ml-auto">Tidak</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${patient.diabetes ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-700">Diabetes</span>
                  {patient.diabetes && <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Ya</Badge>}
                  {!patient.diabetes && <span className="text-xs text-gray-500 ml-auto">Tidak</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${patient.anemia ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-700">Anemia</span>
                  {patient.anemia && <Badge className="bg-orange-100 text-orange-800 text-xs ml-auto">Ya</Badge>}
                  {!patient.anemia && <span className="text-xs text-gray-500 ml-auto">Tidak</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${patient.penyakit_jantung ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-700">Penyakit Jantung</span>
                  {patient.penyakit_jantung && <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Ya</Badge>}
                  {!patient.penyakit_jantung && <span className="text-xs text-gray-500 ml-auto">Tidak</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${patient.asma ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-700">Asma</span>
                  {patient.asma && <Badge className="bg-yellow-100 text-yellow-800 text-xs ml-auto">Ya</Badge>}
                  {!patient.asma && <span className="text-xs text-gray-500 ml-auto">Tidak</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${patient.penyakit_ginjal ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-700">Penyakit Ginjal</span>
                  {patient.penyakit_ginjal && <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Ya</Badge>}
                  {!patient.penyakit_ginjal && <span className="text-xs text-gray-500 ml-auto">Tidak</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${patient.tbc_malaria ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-700">TBC/Malaria</span>
                  {patient.tbc_malaria && <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Ya</Badge>}
                  {!patient.tbc_malaria && <span className="text-xs text-gray-500 ml-auto">Tidak</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${patient.pernah_caesar ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-700">Pernah Caesar</span>
                  {patient.pernah_caesar && <Badge className="bg-orange-100 text-orange-800 text-xs ml-auto">Ya</Badge>}
                  {!patient.pernah_caesar && <span className="text-xs text-gray-500 ml-auto">Tidak</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${patient.pernah_perdarahan_saat_hamil ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-700">Pernah Perdarahan</span>
                  {patient.pernah_perdarahan_saat_hamil && <Badge className="bg-red-100 text-red-800 text-xs ml-auto">Ya</Badge>}
                  {!patient.pernah_perdarahan_saat_hamil && <span className="text-xs text-gray-500 ml-auto">Tidak</span>}
                </div>
              </div>
            </div>

            {/* Kontak Darurat & Alamat */}
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kontak Darurat */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#3B9ECF]" />
                  Kontak Darurat
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Nama</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.emergency_contact_name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Hubungan</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.emergency_contact_relation || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">No. Telepon</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.emergency_contact_phone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3B9ECF]" />
                  Alamat
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Alamat Lengkap</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{patient.address || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Provinsi</Label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{patient.provinsi || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Kota/Kabupaten</Label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{patient.kota_kabupaten || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Kecamatan</Label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{patient.kecamatan || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Kelurahan</Label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{patient.kelurahan || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Pemantauan & Pemeriksaan Kehamilan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-[#3B9ECF]" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Data Pemantauan & Pemeriksaan Kehamilan
                  </h2>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ringkasan pengukuran mandiri di rumah dan hasil pemeriksaan klinis di puskesmas.
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {latestRecord
                    ? `Terakhir diperiksa: ${formatDate(latestRecord.checkup_date)}`
                    : 'Belum ada data pemeriksaan terakhir.'}
                </p>
              </div>
              <Link href={`/perawat/pasien/${patientId}/pemeriksaan/tambah`}>
                <Button className="bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white text-sm font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Input Data Pemeriksaan
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pengukuran Mandiri di Rumah */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Pengukuran Mandiri (Di Rumah)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tekanan Darah */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">TEKANAN DARAH</p>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      {latestRecord
                        ? `${latestRecord.blood_pressure_systolic}/${latestRecord.blood_pressure_diastolic} mmHg`
                        : '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {latestRecord ? 'Tekanan darah terakhir tercatat.' : 'Belum ada data tekanan darah.'}
                    </p>
                  </div>

                  {/* Detak Jantung */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">DETAK JANTUNG</p>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      {latestRecord ? `${latestRecord.heart_rate} BPM` : '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {latestRecord ? 'Detak jantung ibu dalam pengecekan terakhir.' : 'Belum ada data detak jantung.'}
                    </p>
                  </div>

                  {/* Suhu Tubuh */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">SUHU TUBUH</p>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      {latestRecord ? `${latestRecord.body_temperature}°C` : '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {latestRecord ? 'Suhu tubuh saat pemeriksaan terakhir.' : 'Belum ada data suhu tubuh.'}
                    </p>
                  </div>

                  {/* Berat Badan */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">BERAT BADAN</p>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                      {latestRecord ? `${latestRecord.weight} kg` : '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {latestRecord ? 'Berat badan ibu pada pemeriksaan terakhir.' : 'Belum ada data berat badan.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Pemeriksaan Klinis Puskesmas */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Data Pemeriksaan Klinis (Puskesmas)
                </h3>
                {latestClinical ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Protein Urin */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">PROTEIN URIN</p>
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {latestClinical.protein_urin}
                      </p>
                      <p className="text-xs text-gray-500">
                        Hasil pemeriksaan protein dalam urin.
                      </p>
                    </div>

                    {/* Hemoglobin */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">HEMOGLOBIN (HB)</p>
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {latestClinical.hemoglobin} g/dL
                      </p>
                      <p
                        className={`text-xs ${
                          latestClinical.hemoglobinStatus.includes('Anemia')
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {latestClinical.hemoglobinStatus}
                      </p>
                    </div>

                    {/* Gula Darah */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">GULA DARAH (GDS)</p>
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {latestClinical.blood_glucose} mg/dL
                      </p>
                      <p className="text-xs text-gray-500">
                        Kadar gula darah saat pemeriksaan.
                      </p>
                    </div>

                    {/* Denyut Jantung Janin */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">DENYUT JANTUNG JANIN (DJJ)</p>
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {latestClinical.fetal_heart_rate} bpm
                      </p>
                      <p
                        className={`text-xs ${
                          latestClinical.fetalHeartRateStatus.includes('Normal')
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {latestClinical.fetalHeartRateStatus}
                      </p>
                    </div>

                    {/* Lingkar Lengan Atas */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">LINGKAR LENGAN ATAS (LILA)</p>
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {latestClinical.upper_arm_circumference} cm
                      </p>
                      <p className="text-xs text-gray-500">
                        Ukuran lingkar lengan atas ibu.
                      </p>
                    </div>

                    {/* Tinggi Fundus Uteri */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">TINGGI FUNDUS UTERI (TFU)</p>
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {latestClinical.fundal_height} cm
                      </p>
                      <p className="text-xs text-gray-500">
                        Tinggi fundus uteri untuk estimasi usia kehamilan.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4">
                    Belum ada data pemeriksaan klinis yang tercatat.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Riwayat Pengecekan</h2>
          
          {isLoadingRecords ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3B9ECF]"></div>
            </div>
          ) : healthRecords.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">Belum ada riwayat pengecekan</p>
          ) : (
            <div className="space-y-4">
              {healthRecords.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRecord(record)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(record.checkup_date)}
                        </p>
                        <span className="text-xs text-gray-500">
                          Usia Kehamilan: {record.gestational_age_weeks} minggu {record.gestational_age_days} hari
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Tekanan Darah: </span>
                          <span className="font-medium text-gray-900">
                            {record.blood_pressure_systolic}/{record.blood_pressure_diastolic} mmHg
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Suhu: </span>
                          <span className="font-medium text-gray-900">{record.body_temperature}°C</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Detak Jantung: </span>
                          <span className="font-medium text-gray-900">{record.heart_rate} BPM</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Berat Badan: </span>
                          <span className="font-medium text-gray-900">{record.weight} kg</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-[#3B9ECF] hover:text-[#2d7ba8] text-sm font-medium ml-4">
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Health Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Detail Pengecekan - {formatDate(selectedRecord.checkup_date)}
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Clinical Data */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Pemeriksaan Klinis</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">Tekanan Darah</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {selectedRecord.blood_pressure_systolic}/{selectedRecord.blood_pressure_diastolic} mmHg
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Detak Jantung</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{selectedRecord.heart_rate} BPM</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Suhu Tubuh</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{selectedRecord.body_temperature}°C</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Berat Badan</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{selectedRecord.weight} kg</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Hemoglobin</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{selectedRecord.hemoglobin} g/dL</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Gula Darah</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{selectedRecord.blood_glucose} mg/dL</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Protein Urin</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{selectedRecord.protein_urin}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Denyut Jantung Janin</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{selectedRecord.fetal_heart_rate} bpm</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Lingkar Lengan Atas</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{selectedRecord.upper_arm_circumference} cm</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Tinggi Fundus Uteri</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{selectedRecord.fundal_height} cm</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Usia Kehamilan</Label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {selectedRecord.gestational_age_weeks} minggu {selectedRecord.gestational_age_days} hari
                    </p>
                  </div>
                </div>
              </div>

              {/* Complaints */}
              {selectedRecord.complaints && (
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2">Keluhan</Label>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedRecord.complaints}</p>
                </div>
              )}

              {/* Notes */}
              {selectedRecord.notes && (
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-2">Catatan</Label>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedRecord.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                   router.push(`/perawat/pasien/${patientId}/pemeriksaan/${selectedRecord.id}/edit`);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleDeleteRecord(selectedRecord.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
