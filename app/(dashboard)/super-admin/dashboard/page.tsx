'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { statisticsApi } from '@/lib/api/statistics';
import type { PlatformStatistics, PuskesmasListItem } from '@/lib/types/statistics';
import {
  Building2,
  FileText,
  UserCheck,
  Baby,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

// Dummy data for Puskesmas list
const DUMMY_PUSKESMAS: PuskesmasListItem[] = [
  {
    id: 1,
    name: 'Puskesmas Sehat',
    district: 'South District',
    head_of_clinic: 'Dr. Adi Wijaya',
    patients: 450,
    status: 'active',
  },
  {
    id: 2,
    name: 'Puskesmas Mawar',
    district: 'Central District',
    head_of_clinic: 'Dr. Linda Sari',
    patients: 312,
    status: 'active',
  },
  {
    id: 3,
    name: 'Puskesmas Harapan',
    district: 'West District',
    head_of_clinic: 'Dr. Budi Santoso',
    patients: 189,
    status: 'inactive',
  },
  {
    id: 4,
    name: 'Puskesmas Mentari',
    district: 'North District',
    head_of_clinic: 'Dr. Siti Aminah',
    patients: 542,
    status: 'operational',
  },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [statistics, setStatistics] = useState<PlatformStatistics | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token || user?.role !== 'super_admin') {
      router.push('/login');
      return;
    }

    // Fetch statistics
    const fetchStatistics = async () => {
      try {
        const data = await statisticsApi.getPlatformStatistics(token);
        setStatistics(data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        // Use dummy data for now
        setStatistics({
          total_puskesmas_active: 42,
          total_puskesmas_pending: 12,
          total_puskesmas_approved: 42,
          total_puskesmas_rejected: 0,
          total_puskesmas_draft: 0,
          total_perawat: 156,
          total_perawat_active: 156,
          total_ibu_hamil: 1204,
          total_ibu_hamil_active: 1204,
          total_ibu_hamil_risk_low: 450,
          total_ibu_hamil_risk_normal: 620,
          total_ibu_hamil_risk_high: 134,
        });
      } finally {
        // Statistics loaded
      }
    };

    fetchStatistics();
  }, [isAuthenticated, token, user, router]);

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
      trend: '+2%',
      trendUp: true,
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
      trend: '+5%',
      trendUp: true,
      icon: UserCheck,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      title: 'Total Pregnant Women',
      value: statistics?.total_ibu_hamil || 0,
      trend: '+12%',
      trendUp: true,
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
            <p className="text-gray-600">Welcome back. Here&apos;s what&apos;s happening in your region today.</p>
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
                  {card.trend && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{card.trend}</span>
                    </div>
                  )}
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

          {/* Active Puskesmas Overview */}
          <div className="bg-white rounded-xl border border-gray-200">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Puskesmas Overview</h2>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
                <button className="text-sm font-medium text-[#3B9ECF] hover:text-[#2d7ba8] transition-colors">
                  View All
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
                      Head of Clinic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Patients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {DUMMY_PUSKESMAS.map((puskesmas) => (
                    <tr key={puskesmas.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{puskesmas.name}</p>
                          <p className="text-sm text-gray-500">{puskesmas.district}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{puskesmas.head_of_clinic}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{puskesmas.patients}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            puskesmas.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : puskesmas.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            puskesmas.status === 'active'
                              ? 'bg-green-500'
                              : puskesmas.status === 'inactive'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}></span>
                          {puskesmas.status === 'active' ? '● ACTIVE' : puskesmas.status === 'inactive' ? '● TIDAK AKTIF' : '● Operational'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">Showing 4 of 42 Puskesmas</p>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Previous
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-[#3B9ECF] border border-[#3B9ECF] rounded-lg hover:bg-[#2d7ba8] transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
    </div>
  );
}
