'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { statisticsApi } from '@/lib/api/statistics';
import { puskesmasApi } from '@/lib/api/puskesmas';
import { regionApi } from '@/lib/api/region';
import type { PlatformStatistics } from '@/lib/types/statistics';
import type { Puskesmas } from '@/lib/types/puskesmas';
import type { Province } from '@/lib/types/region';
import FilterModal, { type FilterOptions } from '@/components/filters/filter-modal';
import {
  Building2,
  FileText,
  UserCheck,
  Baby,
  ChevronRight,
  Search,
  Download,
  MapPin,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import RejectModal from '@/components/modals/reject-modal';

type TabType = 'active' | 'pending';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [statistics, setStatistics] = useState<PlatformStatistics | null>(null);
  const [activePuskesmas, setActivePuskesmas] = useState<Puskesmas[]>([]);
  const [pendingPuskesmas, setPendingPuskesmas] = useState<Puskesmas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Region & Filter states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    status: [],
    dateRange: { from: '', to: '' },
    minPregnantWomen: '',
    minHealthWorkers: '',
  });

  // Approve/Reject states
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedPuskesmas, setSelectedPuskesmas] = useState<Puskesmas | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token || user?.role !== 'super_admin') {
      router.push('/login');
      return;
    }

    fetchAllData();
    fetchProvinces();
  }, [isAuthenticated, token, user, router]);

  const fetchProvinces = async () => {
    try {
      console.log('🔄 Fetching provinces from Indonesian Region API...');
      const data = await regionApi.getProvinces();
      console.log('✅ Provinces received:', data.length, 'provinces');
      setProvinces(data);
    } catch (error) {
      console.error('❌ Failed to fetch provinces:', error);
    }
  };

  const handleApprove = async (puskesmasId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    
    if (!token) return;
    
    setIsProcessing(true);
    try {
      await puskesmasApi.approvePuskesmas(token, puskesmasId);
      // Refresh data
      await fetchAllData();
      // Show success message (you can add toast notification here)
      alert('Puskesmas berhasil diapprove!');
    } catch (error) {
      console.error('Failed to approve puskesmas:', error);
      alert('Gagal approve puskesmas. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (puskesmas: Puskesmas, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setSelectedPuskesmas(puskesmas);
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!token || !selectedPuskesmas) return;
    
    setIsProcessing(true);
    try {
      await puskesmasApi.rejectPuskesmas(token, selectedPuskesmas.id, reason);
      // Refresh data
      await fetchAllData();
      setIsRejectModalOpen(false);
      setSelectedPuskesmas(null);
      // Show success message
      alert('Puskesmas berhasil direject!');
    } catch (error) {
      console.error('Failed to reject puskesmas:', error);
      alert('Gagal reject puskesmas. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchAllData = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      // Fetch statistics from backend
      console.log('🔄 Fetching platform statistics...');
      const stats = await statisticsApi.getPlatformStatistics(token);
      console.log('✅ Statistics received:', stats);
      setStatistics(stats);

      // Fetch active puskesmas from backend
      console.log('🔄 Fetching active puskesmas...');
      const activeData = await puskesmasApi.getActivePuskesmas(token);
      console.log('✅ Active puskesmas received:', activeData.length, 'items');
      setActivePuskesmas(activeData);

      // Fetch pending puskesmas from backend
      console.log('🔄 Fetching pending puskesmas...');
      const pendingData = await puskesmasApi.getPendingPuskesmas(token);
      console.log('✅ Pending puskesmas received:', pendingData.length, 'items');
      setPendingPuskesmas(pendingData);
    } catch (error) {
      console.error('❌ Failed to fetch data:', error);
      // Set empty data on error instead of dummy data
      setStatistics({
        total_puskesmas_active: 0,
        total_puskesmas_pending: 0,
        total_puskesmas_approved: 0,
        total_puskesmas_rejected: 0,
        total_puskesmas_draft: 0,
        total_perawat: 0,
        total_perawat_active: 0,
        total_ibu_hamil: 0,
        total_ibu_hamil_active: 0,
        total_ibu_hamil_risk_low: 0,
        total_ibu_hamil_risk_normal: 0,
        total_ibu_hamil_risk_high: 0,
      });
      setActivePuskesmas([]);
      setPendingPuskesmas([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current list based on active tab
  const currentList = activeTab === 'active' ? activePuskesmas : pendingPuskesmas;

  // Apply all filters
  const filteredPuskesmas = currentList.filter((p) => {
    // Search filter
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery);

    if (!matchesSearch) return false;

    // Region filter
    if (selectedRegion !== 'all') {
      const matchesRegion = p.address.toLowerCase().includes(selectedRegion.toLowerCase());
      if (!matchesRegion) return false;
    }

    // Advanced filters
    // Status filter
    if (advancedFilters.status.length > 0) {
      if (!advancedFilters.status.includes(p.registration_status)) return false;
    }

    // Date range filter
    if (advancedFilters.dateRange.from) {
      const puskesmasDate = new Date(p.registration_date);
      const fromDate = new Date(advancedFilters.dateRange.from);
      if (puskesmasDate < fromDate) return false;
    }
    if (advancedFilters.dateRange.to) {
      const puskesmasDate = new Date(p.registration_date);
      const toDate = new Date(advancedFilters.dateRange.to);
      if (puskesmasDate > toDate) return false;
    }

    // Min pregnant women filter
    if (advancedFilters.minPregnantWomen) {
      const min = parseInt(advancedFilters.minPregnantWomen);
      if ((p.active_ibu_hamil_count || 0) < min) return false;
    }

    // Min health workers filter
    if (advancedFilters.minHealthWorkers) {
      const min = parseInt(advancedFilters.minHealthWorkers);
      if ((p.active_perawat_count || 0) < min) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPuskesmas.length / itemsPerPage);
  const paginatedPuskesmas = filteredPuskesmas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get initials for badge
  const getInitials = (name: string): string => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  const getBadgeColor = (index: number): string => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-teal-100 text-teal-700',
      'bg-indigo-100 text-indigo-700',
    ];
    return colors[index % colors.length];
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Active Puskesmas',
      value: statistics?.total_puskesmas_active || 0,
      icon: Building2,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Pending Registrations',
      value: statistics?.total_puskesmas_pending || 0,
      badge: 'PENDING REVIEW',
      icon: FileText,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Registered Midwives',
      value: statistics?.total_perawat || 0,
      icon: UserCheck,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      title: 'Total Pregnant Women',
      value: statistics?.total_ibu_hamil || 0,
      icon: Baby,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
        <p className="text-gray-600">
          Welcome back. Here&apos;s what&apos;s happening in your region today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.iconBg} p-3 rounded-lg`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              {card.badge && (
                <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                  {card.badge}
                </span>
              )}
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Puskesmas Management Section */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => {
                setActiveTab('active');
                setCurrentPage(1);
                setSearchQuery('');
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'active'
                  ? 'border-[#3B9ECF] text-[#3B9ECF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Puskesmas
            </button>
            <button
              onClick={() => {
                setActiveTab('pending');
                setCurrentPage(1);
                setSearchQuery('');
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'border-[#3B9ECF] text-[#3B9ECF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Requests
              {(statistics?.total_puskesmas_pending || 0) > 0 && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                  {statistics?.total_puskesmas_pending || 0}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Puskesmas name, address, or ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] bg-white min-w-[200px]"
            >
              <option value="all">All Regions</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                advancedFilters.status.length > 0 ||
                advancedFilters.dateRange.from ||
                advancedFilters.dateRange.to ||
                advancedFilters.minPregnantWomen ||
                advancedFilters.minHealthWorkers
                  ? 'bg-[#3B9ECF] text-white border-[#3B9ECF] hover:bg-[#2d7ba8]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(advancedFilters.status.length > 0 ||
                advancedFilters.dateRange.from ||
                advancedFilters.dateRange.to ||
                advancedFilters.minPregnantWomen ||
                advancedFilters.minHealthWorkers) && (
                <span className="px-1.5 py-0.5 bg-white text-[#3B9ECF] rounded text-xs font-semibold">
                  {[
                    advancedFilters.status.length,
                    advancedFilters.dateRange.from ? 1 : 0,
                    advancedFilters.dateRange.to ? 1 : 0,
                    advancedFilters.minPregnantWomen ? 1 : 0,
                    advancedFilters.minHealthWorkers ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>

            {/* Export Button */}
            <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Puskesmas Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pregnant Women
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Health Workers
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3B9ECF]"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedPuskesmas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery
                      ? 'Tidak ada puskesmas yang cocok dengan pencarian'
                      : activeTab === 'active'
                      ? 'Tidak ada puskesmas aktif'
                      : 'Tidak ada pendaftaran pending'}
                  </td>
                </tr>
              ) : (
                paginatedPuskesmas.map((puskesmas, index) => (
                  <tr 
                    key={puskesmas.id} 
                    onClick={() => router.push(`/super-admin/puskesmas/${puskesmas.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${getBadgeColor(
                            index
                          )}`}
                        >
                          {getInitials(puskesmas.name).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{puskesmas.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-900 max-w-[200px] truncate">
                          {puskesmas.address}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {puskesmas.active_ibu_hamil_count || 0}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {puskesmas.active_perawat_count || 0}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {activeTab === 'pending' ? (
                          <>
                            <button
                              onClick={(e) => handleApprove(puskesmas.id, e)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={(e) => handleRejectClick(puskesmas, e)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/super-admin/puskesmas/${puskesmas.id}`);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredPuskesmas.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredPuskesmas.length)} of{' '}
              {filteredPuskesmas.length} Puskesmas
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {totalPages <= 5 ? (
                [...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#3B9ECF] text-white'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })
              ) : (
                <>
                  {[1, 2, 3].map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#3B9ECF] text-white'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  {totalPages > 3 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? 'bg-[#3B9ECF] text-white'
                            : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-[#3B9ECF] border border-[#3B9ECF] rounded-lg hover:bg-[#2d7ba8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          setCurrentPage(1);
        }}
        currentFilters={advancedFilters}
      />

      {/* Reject Modal */}
      {selectedPuskesmas && (
        <RejectModal
          isOpen={isRejectModalOpen}
          onClose={() => {
            setIsRejectModalOpen(false);
            setSelectedPuskesmas(null);
          }}
          onConfirm={handleRejectConfirm}
          puskesmasName={selectedPuskesmas.name}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
}
