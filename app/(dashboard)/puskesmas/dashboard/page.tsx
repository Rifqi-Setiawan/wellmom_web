"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  Calendar,
  ArrowRight,
  Baby
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { nurseApi } from "@/lib/api/nurse";
import { puskesmasApi } from "@/lib/api/puskesmas";
import { Button } from "@/components/ui/button";
import { PatientOverview } from "./_components/patient-overview";
import type { PuskesmasStatistics } from "@/lib/types/ibu-hamil";

export default function PuskesmasDashboard() {
  const { user, token, puskesmasInfo } = useAuthStore();
  const [statistics, setStatistics] = useState<PuskesmasStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const stats = await puskesmasApi.getPuskesmasStatistics(token);
        setStatistics(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard statistics", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Selamat Datang, {statistics?.puskesmas_name || puskesmasInfo?.name || user?.full_name || user?.email}
        </h1>
        <p className="text-gray-600">
          Ringkasan aktivitas dan status operasional hari ini.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Perawat */}
        <div className="bg-white p-7 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-[#3B9ECF] rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Aktif
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {statistics?.total_perawat || 0}
          </h3>
          <p className="text-sm text-gray-500 mb-4">Total Perawat</p>
          <Link 
            href="/puskesmas/dashboard/perawat" 
            className="text-sm font-medium text-[#3B9ECF] hover:text-[#2d7ba8] flex items-center gap-1"
          >
            Kelola Perawat <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Ibu Hamil */}
        <div className="bg-white p-7 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-lg">
              <Baby className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {statistics?.total_ibu_hamil || 0}
          </h3>
          <p className="text-sm text-gray-500 mb-4">Total Ibu Hamil</p>
          <Link 
            href="/puskesmas/dashboard/ibu-hamil" 
            className="text-sm font-medium text-[#3B9ECF] hover:text-[#2d7ba8] flex items-center gap-1"
          >
            Lihat Data <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Pasien Belum Ditugaskan */}
        <div className="bg-white p-7 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            {statistics && statistics.pasien_belum_ditugaskan > 0 && (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                {statistics.persentase_belum_ditugaskan}%
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {statistics?.pasien_belum_ditugaskan || 0}
          </h3>
          <p className="text-sm text-gray-500 mb-4">Pasien Belum Ditugaskan</p>
          <span className="text-sm text-gray-400">
            {statistics && statistics.pasien_belum_ditugaskan > 0 
              ? "Perlu tindakan segera" 
              : "Semua pasien sudah ditugaskan"}
          </span>
        </div>
      </div>

      {/* Patient Overview Section */}
      <div className="mb-8">
        <PatientOverview statistics={statistics} />
      </div>

    </div>
  );
}
