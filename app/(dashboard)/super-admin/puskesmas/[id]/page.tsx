'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { puskesmasApi } from '@/lib/api/puskesmas';
import type { Puskesmas } from '@/lib/types/puskesmas';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  FileText,
  User,
  Building2,
  Image as ImageIcon,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import RejectModal from '@/components/modals/reject-modal';

// Import Map component dynamically to avoid SSR issues
const MapView = dynamic(() => import('@/components/maps/map-view'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3B9ECF] mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function PuskesmasDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token, isAuthenticated, user } = useAuthStore();
  const [puskesmas, setPuskesmas] = useState<Puskesmas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const puskesmasId = params?.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    if (!isAuthenticated || !token || user?.role !== 'super_admin') {
      router.push('/login');
      return;
    }

    if (!puskesmasId) {
      setError('Invalid Puskesmas ID');
      setIsLoading(false);
      return;
    }

    fetchPuskesmasDetail();
  }, [isAuthenticated, token, user, router, puskesmasId]);

  const fetchPuskesmasDetail = async () => {
    if (!token || !puskesmasId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await puskesmasApi.getPuskesmasById(token, puskesmasId);
      setPuskesmas(data);
    } catch (err) {
      console.error('Failed to fetch puskesmas detail:', err);
      setError('Failed to load puskesmas details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_approval: {
        label: 'PENDING APPROVAL',
        className: 'bg-orange-100 text-orange-700',
      },
      approved: {
        label: 'APPROVED',
        className: 'bg-green-100 text-green-700',
      },
      rejected: {
        label: 'REJECTED',
        className: 'bg-red-100 text-red-700',
      },
      draft: {
        label: 'DRAFT',
        className: 'bg-gray-100 text-gray-700',
      },
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const handleApprove = async () => {
    if (!token || !puskesmasId) return;
    
    setIsProcessing(true);
    try {
      await puskesmasApi.approvePuskesmas(token, puskesmasId);
      // Refresh data
      await fetchPuskesmasDetail();
      alert('Puskesmas berhasil diapprove!');
    } catch (error) {
      console.error('Failed to approve puskesmas:', error);
      alert('Gagal approve puskesmas. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!token || !puskesmasId) return;
    
    setIsProcessing(true);
    try {
      await puskesmasApi.rejectPuskesmas(token, puskesmasId, reason);
      setIsRejectModalOpen(false);
      // Refresh data
      await fetchPuskesmasDetail();
      alert('Puskesmas berhasil direject!');
    } catch (error) {
      console.error('Failed to reject puskesmas:', error);
      alert('Gagal reject puskesmas. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading puskesmas details...</p>
        </div>
      </div>
    );
  }

  if (error || !puskesmas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error || 'Puskesmas not found'}</p>
          <button
            onClick={() => router.push('/super-admin/dashboard')}
            className="px-4 py-2 bg-[#3B9ECF] text-white rounded-lg hover:bg-[#2d7ba8] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(puskesmas.registration_status);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/super-admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Registration Management</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-900 font-medium">Detailed Form</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{puskesmas.name}</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        </div>
        {puskesmas.registration_status === 'pending_approval' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => setIsRejectModalOpen(true)}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Section 1: Data Puskesmas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Data Puskesmas</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Nama Puskesmas
            </label>
            <p className="text-sm text-gray-900">{puskesmas.name}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Alamat Lengkap
            </label>
            <p className="text-sm text-gray-900">{puskesmas.address}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Email Resmi
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{puskesmas.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Nomor Telepon
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{puskesmas.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Penanggung Jawab Puskesmas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Penanggung Jawab Puskesmas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Nama Kepala Puskesmas
            </label>
            <p className="text-sm text-gray-900">{puskesmas.kepala_name}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              NIP
            </label>
            <p className="text-sm text-gray-900">{puskesmas.kepala_nip}</p>
          </div>
        </div>
      </div>

      {/* Section 3: Legalitas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Legalitas</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Nomor NPWP
            </label>
            <p className="text-sm text-gray-900">{puskesmas.npwp}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SK Pendirian */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              SK Pendirian
            </label>
            {puskesmas.sk_document_url ? (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000'}${puskesmas.sk_document_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-5 h-5 text-red-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {puskesmas.sk_document_url.split('/').pop()}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            ) : (
              <p className="text-sm text-gray-500 italic">No document uploaded</p>
            )}
          </div>

          {/* Scan NPWP */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Scan NPWP
            </label>
            {puskesmas.npwp_document_url ? (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000'}${puskesmas.npwp_document_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {puskesmas.npwp_document_url.split('/').pop()}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            ) : (
              <p className="text-sm text-gray-500 italic">No document uploaded</p>
            )}
          </div>

          {/* Foto Gedung */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Foto Gedung
            </label>
            {puskesmas.building_photo_url ? (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000'}${puskesmas.building_photo_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {puskesmas.building_photo_url.split('/').pop()}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            ) : (
              <p className="text-sm text-gray-500 italic">No photo uploaded</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Lokasi */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Lokasi</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Koordinat GPS
            </label>
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>
                {puskesmas.latitude}, {puskesmas.longitude}
              </span>
            </div>
          </div>

          {/* Map View */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Google Maps View
                </div>
              </label>
              <a
                href={`https://www.google.com/maps?q=${puskesmas.latitude},${puskesmas.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#3B9ECF] hover:underline flex items-center gap-1"
              >
                Lihat di Peta
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <MapView
              latitude={puskesmas.latitude}
              longitude={puskesmas.longitude}
              name={puskesmas.name}
            />
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        puskesmasName={puskesmas.name}
        isLoading={isProcessing}
      />
    </div>
  );
}
