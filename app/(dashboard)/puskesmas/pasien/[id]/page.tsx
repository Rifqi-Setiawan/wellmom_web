'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Calendar, MapPin, Phone, Mail, Heart, AlertTriangle, AlertCircle, CheckCircle2, XCircle, FileText, Clock, Home, Stethoscope } from 'lucide-react';
import { puskesmasApi } from '@/lib/api/puskesmas';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { IbuHamil } from '@/lib/types/ibu-hamil';
import { Button } from '@/components/ui/button';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const patientId = typeof idParam === 'string' ? parseInt(idParam, 10) : Number(idParam);

  const [patient, setPatient] = useState<IbuHamil | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !patientId || isNaN(patientId)) {
      setError('Invalid patient ID or authentication token');
      setIsLoading(false);
      return;
    }

    fetchPatientDetail();
  }, [token, patientId]);

  const fetchPatientDetail = async () => {
    if (!token || !patientId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await puskesmasApi.getIbuHamilDetail(token, patientId);
      setPatient(data);
    } catch (err: any) {
      console.error('Failed to fetch patient detail:', err);
      setError(err.response?.data?.message || 'Gagal memuat data pasien. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskBadge = (riskLevel: string | null | undefined) => {
    if (!riskLevel || riskLevel === null) {
      return {
        label: 'Belum Ditentukan',
        className: 'bg-amber-100 text-amber-700 border border-amber-200',
        icon: AlertTriangle,
        iconColor: 'text-amber-600',
      };
    }

    const badges: Record<string, { label: string; className: string; icon: any; iconColor: string }> = {
      tinggi: {
        label: 'Risiko Tinggi',
        className: 'bg-red-100 text-red-700 border border-red-200',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
      },
      sedang: {
        label: 'Risiko Menengah',
        className: 'bg-orange-100 text-orange-700 border border-orange-200',
        icon: AlertCircle,
        iconColor: 'text-orange-600',
      },
      rendah: {
        label: 'Risiko Rendah',
        className: 'bg-green-100 text-green-700 border border-green-200',
        icon: CheckCircle2,
        iconColor: 'text-green-600',
      },
    };

    return badges[riskLevel] || {
      label: 'Belum Ditentukan',
      className: 'bg-gray-100 text-gray-600 border border-gray-300',
      icon: AlertTriangle,
      iconColor: 'text-gray-500',
    };
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return {
        label: 'Aktif',
        className: 'bg-green-100 text-green-700',
      };
    }
    return {
      label: 'Nonaktif',
      className: 'bg-gray-100 text-gray-700',
    };
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
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Gagal Memuat Data</h3>
          <p className="text-red-700">{error || 'Data pasien tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  const riskBadge = getRiskBadge(patient.risk_level);
  const statusBadge = getStatusBadge(patient.is_active);
  const RiskIcon = riskBadge.icon;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Detail Pasien Ibu Hamil</h1>
            <p className="text-gray-600">Informasi lengkap data pasien dan kehamilan</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${riskBadge.className}`}>
              <RiskIcon className={`w-4 h-4 mr-1.5 ${riskBadge.iconColor}`} />
              {riskBadge.label}
            </span>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {patient.profile_photo_url ? (
              <img
                src={patient.profile_photo_url}
                alt={patient.nama_lengkap}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              patient.nama_lengkap
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{patient.nama_lengkap}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm">NIK: <span className="font-medium text-gray-900">{patient.nik}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Usia: <span className="font-medium text-gray-900">{patient.age} tahun</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Heart className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Golongan Darah: <span className="font-medium text-gray-900">{patient.blood_type || '-'}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Usia Kehamilan: <span className="font-medium text-gray-900">{patient.usia_kehamilan} minggu</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Informasi Pribadi */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Tanggal Lahir
                </label>
                <p className="text-sm text-gray-900">{formatDate(patient.date_of_birth)}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Kehamilan Ke
                </label>
                <p className="text-sm text-gray-900">{patient.kehamilan_ke}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Jumlah Anak
                </label>
                <p className="text-sm text-gray-900">{patient.jumlah_anak}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Riwayat Keguguran
                </label>
                <p className="text-sm text-gray-900">{patient.miscarriage_number} kali</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Jarak Kehamilan Terakhir
                </label>
                <p className="text-sm text-gray-900">{patient.jarak_kehamilan_terakhir || '-'}</p>
              </div>
            </div>
          </div>

          {/* Informasi Kehamilan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Informasi Kehamilan</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Hari Pertama Haid Terakhir (HPHT)
                </label>
                <p className="text-sm text-gray-900">{formatDate(patient.last_menstrual_period)}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Perkiraan Tanggal Lahir (HPL)
                </label>
                <p className="text-sm text-gray-900">{formatDate(patient.estimated_due_date)}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Usia Kehamilan
                </label>
                <p className="text-sm font-medium text-gray-900">{patient.usia_kehamilan} minggu</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  {patient.pernah_caesar ? (
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">Pernah Caesar</span>
                </div>
                <div className="flex items-center gap-2">
                  {patient.pernah_perdarahan_saat_hamil ? (
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">Pernah Perdarahan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Alamat */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Informasi Alamat</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Alamat Lengkap
                </label>
                <p className="text-sm text-gray-900">{patient.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Provinsi
                  </label>
                  <p className="text-sm text-gray-900">{patient.provinsi}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Kota/Kabupaten
                  </label>
                  <p className="text-sm text-gray-900">{patient.kota_kabupaten}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Kecamatan
                  </label>
                  <p className="text-sm text-gray-900">{patient.kecamatan}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Kelurahan
                  </label>
                  <p className="text-sm text-gray-900">{patient.kelurahan}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Koordinat Lokasi
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Lat: {patient.location[1]?.toFixed(6) || '-'}, Lng: {patient.location[0]?.toFixed(6) || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Kontak Darurat */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Kontak Darurat</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Nama Kontak Darurat
                </label>
                <p className="text-sm text-gray-900">{patient.emergency_contact_name}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Nomor Telepon
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{patient.emergency_contact_phone}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Hubungan
                </label>
                <p className="text-sm text-gray-900">{patient.emergency_contact_relation}</p>
              </div>
            </div>
          </div>

          {/* Riwayat Kesehatan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Riwayat Kesehatan</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {patient.darah_tinggi ? (
                  <CheckCircle2 className="w-4 h-4 text-red-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Darah Tinggi</span>
              </div>
              <div className="flex items-center gap-2">
                {patient.diabetes ? (
                  <CheckCircle2 className="w-4 h-4 text-red-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Diabetes</span>
              </div>
              <div className="flex items-center gap-2">
                {patient.anemia ? (
                  <CheckCircle2 className="w-4 h-4 text-red-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Anemia</span>
              </div>
              <div className="flex items-center gap-2">
                {patient.penyakit_jantung ? (
                  <CheckCircle2 className="w-4 h-4 text-red-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Penyakit Jantung</span>
              </div>
              <div className="flex items-center gap-2">
                {patient.asma ? (
                  <CheckCircle2 className="w-4 h-4 text-red-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Asma</span>
              </div>
              <div className="flex items-center gap-2">
                {patient.penyakit_ginjal ? (
                  <CheckCircle2 className="w-4 h-4 text-red-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Penyakit Ginjal</span>
              </div>
              <div className="flex items-center gap-2">
                {patient.tbc_malaria ? (
                  <CheckCircle2 className="w-4 h-4 text-red-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">TBC/Malaria</span>
              </div>
            </div>
          </div>

          {/* Informasi Risiko */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Informasi Risiko</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Level Risiko
                </label>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${riskBadge.className}`}>
                  <RiskIcon className={`w-4 h-4 mr-1.5 ${riskBadge.iconColor}`} />
                  {riskBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Preferensi & Konsen */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Preferensi & Konsen</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Preferensi Layanan Kesehatan
                </label>
                <p className="text-sm text-gray-900 capitalize">{patient.healthcare_preference || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {patient.whatsapp_consent ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">Konsen WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  {patient.data_sharing_consent ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">Konsen Berbagi Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Dibuat: {formatDateTime(patient.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Diperbarui: {formatDateTime(patient.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
