"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Edit, Users, AlertTriangle, AlertCircle, UserPlus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { puskesmasApi } from "@/lib/api/puskesmas";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { IbuHamil } from "@/lib/types/ibu-hamil";
import { nurseApi } from "@/lib/api/nurse";
import type { NurseListItem } from "@/lib/types/nurse";

type RiskLevel = 'rendah' | 'sedang' | 'tinggi';
type AssignmentStatus = 'all' | 'assigned' | 'unassigned';

export default function PatientManagementPage() {
  const router = useRouter();
  const { token, puskesmasInfo } = useAuthStore();
  const [patients, setPatients] = useState<IbuHamil[]>([]);
  const [nurses, setNurses] = useState<NurseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch patients
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !puskesmasInfo) return;
      
      setIsLoading(true);
      try {
        const [patientsData, nursesData] = await Promise.all([
          puskesmasApi.getIbuHamilByPuskesmas(token, puskesmasInfo.id),
          nurseApi.getNurses(token),
        ]);
        setPatients(patientsData);
        setNurses(nursesData.perawat_list);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, puskesmasInfo]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, riskFilter, assignmentFilter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = patients.length;
    const highRisk = patients.filter(p => p.risk_level === 'tinggi').length;
    const mediumRisk = patients.filter(p => p.risk_level === 'sedang').length;
    const unassigned = patients.filter(p => !p.perawat_id).length;
    
    // Calculate percentage increase (mock data for now)
    const percentageIncrease = 5.2;

    return {
      total,
      highRisk,
      mediumRisk,
      unassigned,
      percentageIncrease,
    };
  }, [patients]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Search filter
      const matchesSearch = 
        patient.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.nik.includes(searchQuery);

      // Risk filter
      const matchesRisk = riskFilter === 'all' || patient.risk_level === riskFilter;

      // Assignment filter
      const matchesAssignment = 
        assignmentFilter === 'all' ||
        (assignmentFilter === 'assigned' && patient.perawat_id !== null) ||
        (assignmentFilter === 'unassigned' && patient.perawat_id === null);

      return matchesSearch && matchesRisk && matchesAssignment;
    });
  }, [patients, searchQuery, riskFilter, assignmentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  // Get nurse name by ID
  const getNurseName = (perawatId: number | null): string => {
    if (!perawatId) return '';
    const nurse = nurses.find(n => n.id === perawatId);
    return nurse ? `Bdn. ${nurse.nama_lengkap}` : '';
  };

  // Get risk badge
  const getRiskBadge = (riskLevel: string | null | undefined) => {
    const badges: Record<string, { label: string; className: string }> = {
      tinggi: {
        label: 'High Risk',
        className: 'bg-red-100 text-red-700',
      },
      sedang: {
        label: 'Medium Risk',
        className: 'bg-orange-100 text-orange-700',
      },
      rendah: {
        label: 'Low Risk',
        className: 'bg-green-100 text-green-700',
      },
    };
    // Fallback to 'sedang' if risk level is not found or invalid
    return badges[riskLevel || 'sedang'] || badges['sedang'];
  };

  // Get status badge
  const getStatusBadge = (patient: IbuHamil) => {
    // Determine status based on patient data
    // For now, using is_active and other fields to determine status
    if (patient.is_active === false) {
      return {
        label: 'Nonaktif',
        className: 'bg-gray-100 text-gray-700',
      };
    }
    
    // Check if patient has referral (mock logic - adjust based on actual data)
    // For now, using a simple check
    if (patient.risk_level === 'tinggi' && patient.perawat_id) {
      return {
        label: 'Rujukan',
        className: 'bg-orange-100 text-orange-700',
      };
    }

    // Default to active status
    return {
      label: 'Aktif',
      className: 'bg-green-100 text-green-700',
    };
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Pasien Ibu Hamil</h1>
        <p className="text-gray-600">
          Kelola data pasien dan pantau klasifikasi risiko kehamilan secara real-time.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Pasien */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Pasien</p>
              <h3 className="text-3xl font-bold text-gray-900">{statistics.total.toLocaleString()}</h3>
              <p className="text-xs text-green-600 mt-1">+{statistics.percentageIncrease}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Risiko Tinggi */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Risiko Tinggi</p>
              <h3 className="text-3xl font-bold text-gray-900">{statistics.highRisk}</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 mt-1">
                KRITIS
              </span>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Risiko Menengah */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Risiko Menengah</p>
              <h3 className="text-3xl font-bold text-gray-900">{statistics.mediumRisk}</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 mt-1">
                PANTAU
              </span>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Belum Ditugaskan */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Belum Ditugaskan</p>
              <h3 className="text-3xl font-bold text-gray-900">{statistics.unassigned}</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                PENDING
              </span>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Cari nama pasien atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent"
          >
            <option value="all">Semua Risiko</option>
            <option value="tinggi">Risiko Tinggi</option>
            <option value="sedang">Risiko Menengah</option>
            <option value="rendah">Risiko Rendah</option>
          </select>

          {/* Assignment Status Filter */}
          <select
            value={assignmentFilter}
            onChange={(e) => setAssignmentFilter(e.target.value as AssignmentStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent"
          >
            <option value="all">Status Penugasan</option>
            <option value="assigned">Sudah Ditugaskan</option>
            <option value="unassigned">Belum Ditugaskan</option>
          </select>

          {/* Filter Icon Button */}
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  NAMA PASIEN
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  USIA KEHAMILAN
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  SKOR RISIKO
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  BIDAN PENDAMPING
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#3B9ECF]"></div>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data pasien ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => {
                  const riskBadge = getRiskBadge(patient.risk_level);
                  const statusBadge = getStatusBadge(patient);
                  const nurseName = getNurseName(patient.perawat_id);

                  // Safety check - ensure badges are defined
                  if (!riskBadge || !statusBadge) {
                    console.error('Invalid badge data for patient:', patient);
                    return null;
                  }

                  return (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{patient.nama_lengkap || '-'}</p>
                          <p className="text-xs text-gray-500">NIK: {patient.nik || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{patient.usia_kehamilan || 0} Minggu</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskBadge.className || 'bg-gray-100 text-gray-700'}`}>
                          {riskBadge.label || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {patient.perawat_id ? (
                          <span className="text-sm text-gray-900">{nurseName}</span>
                        ) : (
                          <button className="inline-flex items-center gap-1 text-sm text-[#3B9ECF] hover:text-[#2d7ba8] font-medium">
                            <UserPlus className="w-4 h-4" />
                            Tugaskan Bidan
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.className || 'bg-gray-100 text-gray-700'}`}>
                          {statusBadge.label || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/puskesmas/pasien/${patient.id}`)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/puskesmas/pasien/${patient.id}/edit`)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
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
        {!isLoading && filteredPatients.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredPatients.length)} dari {filteredPatients.length} pasien
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </Button>
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
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#3B9ECF] text-white'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="border-gray-300"
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
