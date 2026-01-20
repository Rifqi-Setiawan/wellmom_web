"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, UserCheck, Clock, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nurseApi } from "@/lib/api/nurse";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { NurseListItem } from "@/lib/types/nurse";

export default function NurseManagementPage() {
  const { token } = useAuthStore();
  const [nurses, setNurses] = useState<NurseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ active: 0, pending: 0, total: 0 });
  const [resendingId, setResendingId] = useState<number | null>(null);

  const fetchNurses = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await nurseApi.getNurses(token);
      setNurses(data.perawat_list);
      setStats({
        active: data.perawat_aktif,
        pending: data.perawat_pending,
        total: data.total_perawat,
      });
    } catch (error) {
      console.error("Failed to fetch nurses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNurses();
  }, [token]);

  const handleResendActivation = async (userId: number) => {
    if (!token) return;
    setResendingId(userId);
    try {
      await nurseApi.resendActivation(token, userId);
      alert("Email aktivasi berhasil dikirim ulang.");
    } catch (error) {
      console.error("Error resending activation:", error);
      alert("Gagal mengirim ulang email aktivasi.");
    } finally {
      setResendingId(null);
    }
  };

  const filteredNurses = nurses.filter(
    (nurse) =>
      nurse.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nurse.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nurse.nip.includes(searchQuery)
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Perawat</h1>
          <p className="text-gray-600">
            Daftar perawat yang terdaftar di Puskesmas Anda.
          </p>
        </div>
        <Link href="/puskesmas/dashboard/perawat/tambah">
          <Button className="bg-[#3B9ECF] hover:bg-[#2d7ba8]">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Perawat
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Perawat</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Perawat Aktif</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Menunggu Aktivasi</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Cari nama, email, atau NIP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Lengkap</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NIP</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                       <RefreshCw className="animate-spin h-5 w-5" />
                       Memuat data...
                    </div>
                  </td>
                </tr>
              ) : filteredNurses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data perawat ditemukan.
                  </td>
                </tr>
              ) : (
                filteredNurses.map((nurse) => (
                  <tr key={nurse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{nurse.nama_lengkap}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{nurse.nip}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{nurse.email}</td>
                    <td className="px-6 py-4">
                      {nurse.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!nurse.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendActivation(nurse.user_id)}
                          disabled={resendingId === nurse.user_id}
                          className="text-[#3B9ECF] border-[#3B9ECF] hover:bg-blue-50"
                        >
                          {resendingId === nurse.user_id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Resend Aktivasi
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
