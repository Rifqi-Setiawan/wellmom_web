'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { puskesmasApi } from '@/lib/api/puskesmas';
import { statisticsApi } from '@/lib/api/statistics';
import type { Puskesmas } from '@/lib/types/puskesmas';
import type { PlatformStatistics } from '@/lib/types/statistics';
import {
  Search,
  Building2,
  Baby,
  Users as UsersIcon,
  TrendingUp,
  TrendingDown,
  MapPin,
  ChevronRight,
  Download,
  AlertTriangle,
  FileText,
} from 'lucide-react';

type TabType = 'active' | 'pending';

export default function PuskesmasManagementPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [puskesmasList, setPuskesmasList] = useState<Puskesmas[]>([]);
  const [statistics, setStatistics] = useState<PlatformStatistics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!isAuthenticated || !token || user?.role !== 'super_admin') {
      router.push('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, token, user, router, activeTab]);

  const fetchData = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      // Fetch statistics
      const stats = await statisticsApi.getPlatformStatistics(token);
      setStatistics(stats);

      // Fetch puskesmas list based on active tab
      const data =
        activeTab === 'active'
          ? await puskesmasApi.getActivePuskesmas(token)
          : await puskesmasApi.getPendingPuskesmas(token);

      setPuskesmasList(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Use dummy data on error
      setPuskesmasList([]);
      setStatistics({
        total_puskesmas_active: 1240,
        total_puskesmas_pending: 14,
        total_puskesmas_approved: 1240,
        total_puskesmas_rejected: 0,
        total_puskesmas_draft: 0,
        total_perawat: 156,
        total_perawat_active: 156,
        total_ibu_hamil: 45802,
        total_ibu_hamil_active: 45802,
        total_ibu_hamil_risk_low: 0,
        total_ibu_hamil_risk_normal: 0,
        total_ibu_hamil_risk_high: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter puskesmas based on search query
  const filteredPuskesmas = puskesmasList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery)
  );

  // Pagination
  const totalPages = Math.ceil(filteredPuskesmas.length / itemsPerPage);
  const paginatedPuskesmas = filteredPuskesmas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate average health workers per unit
  const avgHealthWorkers = puskesmasList.length > 0
    ? Math.round(
        puskesmasList.reduce((sum, p) => sum + (p.active_perawat_count || 0), 0) /
          puskesmasList.length
      )
    : 12;

  const statCards = [
    {
      title: 'Total Active Units',
      value: statistics?.total_puskesmas_active || 0,
      trend: '+2.4%',
      trendUp: true,
      icon: Building2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Enrolled Pregnant Women',
      value: statistics?.total_ibu_hamil || 0,
      trend: '+5.1%',
      trendUp: true,
      icon: Baby,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Avg. Health Workers / Unit',
      value: avgHealthWorkers,
      trend: '-0.8%',
      trendUp: false,
      icon: UsersIcon,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  // Get initials for badge
  const getInitials = (name: string): string => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  const getBadgeColor = (index: number): string => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700'];
    return colors[index % colors.length];
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Active Puskesmas Management</h1>
        <p className="text-gray-600">Manage and monitor operational permits for community health centers.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {card.trendUp ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{card.trend}</span>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => {
                setActiveTab('active');
                setCurrentPage(1);
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
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'border-[#3B9ECF] text-[#3B9ECF]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Requests
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                {statistics?.total_puskesmas_pending || 0}
              </span>
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
                  placeholder="Search by Puskesmas name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent"
                />
              </div>
            </div>

            {/* Region Filter */}
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3B9ECF]">
              <option>All Regions</option>
              <option>Central District</option>
              <option>South District</option>
              <option>West District</option>
              <option>North District</option>
            </select>

            {/* Filters Button */}
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>

            {/* Export Button */}
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
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
                    No puskesmas found
                  </td>
                </tr>
              ) : (
                paginatedPuskesmas.map((puskesmas, index) => (
                  <tr key={puskesmas.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${getBadgeColor(index)}`}>
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
                        <p className="text-sm text-gray-900">{puskesmas.address}</p>
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
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1}-
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
            {[...Array(Math.min(3, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-[#3B9ECF] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-white bg-[#3B9ECF] border border-[#3B9ECF] rounded-lg hover:bg-[#2d7ba8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Pending Compliance Reviews */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex items-start gap-4">
          <div className="bg-orange-100 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Pending Compliance Reviews</h3>
            <p className="text-sm text-gray-600 mb-3">
              {statistics?.total_puskesmas_pending || 0} Puskesmas have expired operational permits.
            </p>
            <button className="text-sm font-semibold text-[#3B9ECF] hover:text-[#2d7ba8] transition-colors">
              Review All
            </button>
          </div>
        </div>

        {/* New Registrations */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">New Registrations</h3>
            <p className="text-sm text-gray-600 mb-3">
              {statistics?.total_puskesmas_pending || 0} new applications waiting for site inspection.
            </p>
            <button className="text-sm font-semibold text-[#3B9ECF] hover:text-[#2d7ba8] transition-colors">
              View Apps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
