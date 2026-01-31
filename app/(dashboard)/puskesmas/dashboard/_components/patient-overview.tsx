"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { UserPlus, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PuskesmasStatistics, IbuHamil } from "@/lib/types/ibu-hamil";
import { puskesmasApi } from "@/lib/api/puskesmas";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PatientOverviewProps {
  statistics: PuskesmasStatistics | null;
}

export function PatientOverview({ statistics }: PatientOverviewProps) {
  const router = useRouter();
  const { token, puskesmasInfo } = useAuthStore();
  const [ibuHamilList, setIbuHamilList] = useState<IbuHamil[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIbuHamil = async () => {
      if (!token || !puskesmasInfo) return;

      setIsLoading(true);
      try {
        // Use the same endpoint as patient management page for consistency
        const data = await puskesmasApi.getIbuHamilByPuskesmas(
          token,
          puskesmasInfo.id,
        );
        setIbuHamilList(data);

        // Log risk distribution for debugging
        const rendah = data.filter((p) => p.risk_level === "rendah").length;
        const sedang = data.filter((p) => p.risk_level === "sedang").length;
        const tinggi = data.filter((p) => p.risk_level === "tinggi").length;
        console.log("📊 Fetched patients for chart:", {
          total: data.length,
          unassigned: data.filter((p) => !p.perawat_id).length,
          riskDistribution: { rendah, sedang, tinggi },
        });
      } catch (error) {
        console.error("Failed to fetch ibu hamil list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIbuHamil();
  }, [token, puskesmasInfo]);

  // Calculate risk distribution from actual patient data
  const calculateRiskDistribution = () => {
    const rendah = ibuHamilList.filter((p) => p.risk_level === "rendah").length;
    const sedang = ibuHamilList.filter((p) => p.risk_level === "sedang").length;
    const tinggi = ibuHamilList.filter((p) => p.risk_level === "tinggi").length;
    // Note: We don't include null/undefined in the chart, but it's tracked separately

    return { rendah, sedang, tinggi };
  };

  // Use statistics if available and valid, otherwise calculate from patient list
  const riskDistribution =
    statistics?.distribusi_risiko &&
    (statistics.distribusi_risiko.rendah > 0 ||
      statistics.distribusi_risiko.sedang > 0 ||
      statistics.distribusi_risiko.tinggi > 0)
      ? statistics.distribusi_risiko
      : calculateRiskDistribution();

  const riskData = [
    { name: "Rendah", value: riskDistribution.rendah, color: "#4ade80" },
    { name: "Sedang", value: riskDistribution.sedang, color: "#facc15" },
    { name: "Tinggi", value: riskDistribution.tinggi, color: "#f87171" },
  ];

  // Calculate assignment data from actual patient list
  const totalPatients = ibuHamilList.length;
  const unassignedCount = ibuHamilList.filter(
    (patient) => !patient.perawat_id,
  ).length;
  const assignedCount = totalPatients - unassignedCount;

  // Use statistics if available, otherwise use calculated values
  const finalUnassigned =
    statistics?.pasien_belum_ditugaskan ?? unassignedCount;
  const finalTotal = statistics?.total_ibu_hamil ?? totalPatients;
  const finalAssigned = finalTotal - finalUnassigned;

  const assignmentData =
    finalTotal > 0
      ? [
          { name: "Sudah Ditugaskan", value: finalAssigned, color: "#3B9ECF" },
          {
            name: "Belum Ditugaskan",
            value: finalUnassigned,
            color: "#E5E7EB",
          },
        ]
      : [];

  // Get unassigned patients (patients without perawat_id)
  const unassignedPatients = ibuHamilList
    .filter((patient) => !patient.perawat_id)
    .slice(0, 4);

  // Ibu hamil dengan risk_level "tinggi" untuk section Pasien Perlu Perhatian
  const highRiskPatients = ibuHamilList.filter(
    (patient) => patient.risk_level === "tinggi",
  );

  // Calculate percentage of unassigned patients (focus on unassigned)
  const unassignedPercentage =
    finalTotal > 0 ? Math.round((finalUnassigned / finalTotal) * 100) : 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Patient Overview (Monitoring Ibu Hamil)
        </h2>
        <p className="text-sm text-gray-500">
          Visualisasi risiko dan status penugasan pasien secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Charts */}
        <div className="space-y-8">
          {/* Risk Distribution */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Distribusi Risiko
            </h3>
            {isLoading ? (
              <div className="h-[200px] w-full flex items-center justify-center text-sm text-gray-500">
                Memuat data...
              </div>
            ) : riskData.length > 0 ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={riskData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number | undefined) => [
                        value ?? 0,
                        "Jumlah",
                      ]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] w-full flex items-center justify-center text-sm text-gray-500">
                Data tidak tersedia
              </div>
            )}
          </div>

          {/* Assignment Status */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Status Penugasan Pasien
            </h3>
            {assignmentData.length > 0 && finalTotal > 0 ? (
              <div className="h-[200px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assignmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {assignmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(
                        value: number | undefined,
                        name: string | undefined,
                      ) => [`${name ?? "Unknown"}: ${value ?? 0}`, ""]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-gray-600 ml-1">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text - Show unassigned percentage */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                  <span className="block text-2xl font-bold text-[#3B9ECF]">
                    {unassignedPercentage}%
                  </span>
                  <span className="block text-[10px] text-gray-400">
                    Belum Ditugaskan
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-[200px] w-full flex items-center justify-center text-sm text-gray-500">
                Data tidak tersedia
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Unassigned Patients */}
        <div className="border-l border-r border-gray-100 px-0 lg:px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pasien Belum Mendapat Bidan
            </h3>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700 hover:bg-orange-100 font-normal text-xs"
            >
              {finalUnassigned} Pending
            </Badge>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4 text-sm text-gray-500">
                Memuat data...
              </div>
            ) : unassignedPatients.length > 0 ? (
              unassignedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-3 border border-gray-100 rounded-lg flex items-center justify-between group hover:border-blue-200 transition-colors bg-white"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {patient.nama_lengkap}
                    </h4>
                    <p className="text-xs text-gray-500">NIK: {patient.nik}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-[#3B9ECF] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                Semua pasien sudah ditugaskan
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="text-[#3B9ECF] text-xs font-medium"
            >
              Lihat Semua Daftar Tunggu
            </Button>
          </div>
        </div>

        {/* Column 3: Pasien Perlu Perhatian (risk_level tinggi) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pasien Perlu Perhatian
            </h3>
            <Badge
              variant="destructive"
              className="bg-red-50 text-red-600 hover:bg-red-50 font-normal text-xs"
            >
              {highRiskPatients.length} Risiko Tinggi
            </Badge>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4 text-sm text-gray-500">
                Memuat data...
              </div>
            ) : highRiskPatients.length > 0 ? (
              highRiskPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => router.push(`/puskesmas/pasien/${patient.id}`)}
                  className="w-full p-3 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-200 transition-colors text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {patient.nama_lengkap}
                      </h4>
                      <p className="text-xs text-gray-500">
                        NIK: {patient.nik}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-red-600 transition-colors" />
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                Tidak ada pasien dengan risiko tinggi
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
