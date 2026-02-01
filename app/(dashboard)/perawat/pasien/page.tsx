'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { nurseApi } from '@/lib/api/nurse';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { IbuHamil } from '@/lib/types/ibu-hamil';

type RiskFilter = 'all' | 'tinggi' | 'sedang' | 'rendah';
type AssignmentFilter = 'assigned' | 'all';

export default function PerawatPatientListPage() {
  const router = useRouter();
  const { token, perawatInfo } = useAuthStore();
  const [patients, setPatients] = useState<IbuHamil[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>('assigned'); // Default: assigned to me
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [latestCheckups, setLatestCheckups] = useState<Record<number, string | null>>({});

  const fetchPatients = useCallback(async () => {
    if (!token || !perawatInfo) {
      console.error('❌ Cannot fetch patients: missing token or perawatInfo', {
        hasToken: !!token,
        hasPerawatInfo: !!perawatInfo,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('📤 Fetching all patients in puskesmas for perawat:', perawatInfo.id);
      console.log('📤 Using puskesmas_id:', perawatInfo.puskesmas_id);
      
      // Use nurseApi to get all patients in the puskesmas (accessible by perawat role)
      const data = await nurseApi.getAllPatientsByPuskesmas(token, perawatInfo.puskesmas_id);
      console.log('✅ Fetched patients:', data.length, 'patients');
      setPatients(data);
    } catch (err: unknown) {
      const axiosError = err as { message?: string; response?: { status?: number; data?: unknown } };
      console.error('❌ Failed to fetch patients:', axiosError);
      setError(axiosError.message || 'Gagal memuat data pasien. Silakan coba lagi.');
      console.error('Error details:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        response: axiosError.response?.data,
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, perawatInfo]);

  // Fetch latest health record date for each patient
  useEffect(() => {
    const fetchLatestCheckups = async () => {
      if (!token || patients.length === 0) return;

      try {
        const entries = await Promise.all(
          patients.map(async (patient) => {
            try {
              const data = await nurseApi.getLatestHealthRecord(token, patient.id);
              return [patient.id, data.checkup_date as string] as const;
            } catch (err: unknown) {
              // Jika belum ada data health record, backend akan mengirim detail khusus
              const axiosErr = err as { response?: { data?: { detail?: string } } };
              const detail = axiosErr.response?.data?.detail;
              if (
                detail &&
                typeof detail === 'string' &&
                detail.includes('Belum ada data health record')
              ) {
                return [patient.id, null] as const;
              }
              console.error('❌ Failed to fetch latest health record for patient', patient.id, err);
              return [patient.id, null] as const;
            }
          })
        );

        const map: Record<number, string | null> = {};
        for (const [id, date] of entries) {
          map[id] = date;
        }
        setLatestCheckups(map);
      } catch (err) {
        console.error('❌ Failed to fetch latest checkups:', err);
      }
    };

    fetchLatestCheckups();
  }, [token, patients]);

  useEffect(() => {
    console.log('🔍 Perawat Patient List: Checking auth state', {
      hasToken: !!token,
      hasPerawatInfo: !!perawatInfo,
      perawatInfo: perawatInfo,
    });

    if (!token) {
      console.log('❌ No token found, redirecting to login');
      router.push('/login');
      return;
    }

    if (!perawatInfo) {
      console.log('❌ No perawatInfo found, redirecting to login');
      router.push('/login');
      return;
    }

    if (!perawatInfo.puskesmas_id) {
      console.error('❌ perawatInfo.puskesmas_id is missing!', perawatInfo);
      return;
    }

    console.log('✅ Auth check passed, fetching patients with puskesmas_id:', perawatInfo.puskesmas_id);
    fetchPatients();
  }, [token, perawatInfo, router, fetchPatients]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Search filter
      const matchesSearch = 
        !searchQuery ||
        patient.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.nik.includes(searchQuery) ||
        patient.address.toLowerCase().includes(searchQuery.toLowerCase());

      // Risk filter
      const matchesRisk = 
        riskFilter === 'all' || 
        patient.risk_level === riskFilter;

      // Assignment filter
      const matchesAssignment = 
        assignmentFilter === 'all' ||
        (assignmentFilter === 'assigned' && patient.perawat_id === perawatInfo?.id);

      return matchesSearch && matchesRisk && matchesAssignment;
    });
  }, [patients, searchQuery, riskFilter, assignmentFilter, perawatInfo?.id]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  // Get risk badge
  const getRiskBadge = (riskLevel: string | null | undefined) => {
    if (!riskLevel) {
      return {
        label: 'Belum Ditentukan',
        className: 'bg-amber-100 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
      };
    }
    
    switch (riskLevel) {
      case 'tinggi':
        return {
          label: 'Tinggi',
          className: 'bg-red-100 text-red-800 border-red-200',
          dot: 'bg-red-500',
        };
      case 'sedang':
        return {
          label: 'Sedang',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          dot: 'bg-orange-500',
        };
      case 'rendah':
        return {
          label: 'Rendah',
          className: 'bg-green-100 text-green-800 border-green-200',
          dot: 'bg-green-500',
        };
      default:
        return {
          label: 'Belum Ditentukan',
          className: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Gagal memuat data pasien</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" className="mt-3" onClick={() => { setError(null); fetchPatients(); }}>
            Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Daftar Semua Pasien</h1>
        <p className="text-sm text-gray-600">
          Manajemen database seluruh pasien {perawatInfo?.puskesmas_name || 'Puskesmas'}.
        </p>
      </div>

      <div className="p-8 pt-4">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Cari berdasarkan Nama, NIK, atau Alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Assignment Filter */}
            <div className="flex items-center gap-2">
              <select
                value={assignmentFilter}
                onChange={(e) => {
                  setAssignmentFilter(e.target.value as AssignmentFilter);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B9ECF]"
              >
                <option value="assigned">Pasien Saya</option>
                <option value="all">Semua Pasien</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4">
          <button
            onClick={() => {
              setRiskFilter('all');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              riskFilter === 'all'
                ? 'border-[#3B9ECF] text-[#3B9ECF]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Semua Pasien
          </button>
          <button
            onClick={() => {
              setRiskFilter('tinggi');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              riskFilter === 'tinggi'
                ? 'border-[#3B9ECF] text-[#3B9ECF]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Risiko Tinggi
          </button>
          <button
            onClick={() => {
              setRiskFilter('sedang');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              riskFilter === 'sedang'
                ? 'border-[#3B9ECF] text-[#3B9ECF]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Risiko Sedang
          </button>
          <button
            onClick={() => {
              setRiskFilter('rendah');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              riskFilter === 'rendah'
                ? 'border-[#3B9ECF] text-[#3B9ECF]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Risiko Rendah
          </button>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">NAMA PASIEN</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">NIK</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">USIA</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">STATUS RISIKO</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ALAMAT</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">TERAKHIR PERIKSA</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      {searchQuery ? 'Tidak ada pasien yang ditemukan' : 'Belum ada pasien'}
                    </td>
                  </tr>
                ) : (
                  paginatedPatients.map((patient) => {
                    const riskBadge = getRiskBadge(patient.risk_level);
                    return (
                      <tr
                        key={patient.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#3B9ECF] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {patient.nama_lengkap.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{patient.nama_lengkap}</p>
                              <p className="text-xs text-gray-500">WANITA</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{patient.nik}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{patient.age} Thn</p>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            className={`${riskBadge.className} border flex items-center gap-1.5 w-fit`}
                          >
                            <span className={`w-2 h-2 rounded-full ${riskBadge.dot}`}></span>
                            {riskBadge.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900 max-w-xs truncate">{patient.address}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">
                            {formatDate(latestCheckups[patient.id] ?? null)}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => router.push(`/perawat/pasien/${patient.id}`)}
                              variant="outline"
                              className="text-[#3B9ECF] border-[#3B9ECF] hover:bg-[#3B9ECF] hover:text-white"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Lihat Detail
                            </Button>
                            <Button
                              onClick={() => router.push(`/perawat/chat?ibu_hamil_id=${patient.id}`)}
                              variant="outline"
                              className="text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white"
                              title="Chat dengan ibu hamil"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Chat
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredPatients.length)} dari {filteredPatients.length} pasien
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === pageNum
                            ? 'bg-[#3B9ECF] text-white'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
