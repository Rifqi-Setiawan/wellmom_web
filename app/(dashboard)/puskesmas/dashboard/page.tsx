"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  Activity, 
  Calendar,
  ArrowRight,
  Baby
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { nurseApi } from "@/lib/api/nurse";
import { Button } from "@/components/ui/button";
import { PatientOverview } from "./_components/patient-overview";

export default function PuskesmasDashboard() {
  const { user, token } = useAuthStore();
  const [nurseCount, setNurseCount] = useState(0);

  useEffect(() => {
    // Fetch nurse count for dashboard
    const fetchStats = async () => {
      if (token) {
        try {
          const data = await nurseApi.getNurses(token);
          setNurseCount(data.total_perawat);
        } catch (error) {
          console.error("Failed to fetch dashboard stats", error);
        }
      }
    };
    fetchStats();
  }, [token]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Selamat Datang, Puskesmas {user?.full_name || user?.email}
        </h1>
        <p className="text-gray-600">
          Ringkasan aktivitas dan status operasional hari ini.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Perawat */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-[#3B9ECF] rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Aktif
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{nurseCount}</h3>
          <p className="text-sm text-gray-500 mb-4">Total Perawat</p>
          <Link 
            href="/puskesmas/dashboard/perawat" 
            className="text-sm font-medium text-[#3B9ECF] hover:text-[#2d7ba8] flex items-center gap-1"
          >
            Kelola Perawat <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Ibu Hamil (Dummy) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-lg">
              <Baby className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +5%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">128</h3>
          <p className="text-sm text-gray-500 mb-4">Total Ibu Hamil</p>
          <Link 
            href="/puskesmas/dashboard/ibu-hamil" 
            className="text-sm font-medium text-[#3B9ECF] hover:text-[#2d7ba8] flex items-center gap-1"
          >
            Lihat Data <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Pemeriksaan (Dummy) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
          <p className="text-sm text-gray-500 mb-4">Pemeriksaan Hari Ini</p>
          <span className="text-sm text-gray-400">Update: 10 menit lalu</span>
        </div>

        {/* Card 4: Pasien Belum Ditugaskan */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <UserCheck className="w-6 h-6" /> {/* Reusing UserCheck or similar, maybe AlertCircle would be better but keeping consistency for now */}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">13</h3>
          <p className="text-sm text-gray-500 mb-4">Pasien Belum Ditugaskan</p>
          <span className="text-sm text-gray-400">Perlu tindakan segera</span>
        </div>
      </div>

      {/* Patient Overview Section */}
      <div className="mb-8">
        <PatientOverview />
      </div>

    </div>
  );
}
