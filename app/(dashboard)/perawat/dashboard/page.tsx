'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Download, Eye } from 'lucide-react';
import { nurseApi } from '@/lib/api/nurse';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  Cell,
} from 'recharts';

interface PerawatPatient {
  id: number;
  user_id: number;
  puskesmas_id: number;
  perawat_id: number;
  nama_lengkap: string;
  nik: string;
  date_of_birth: string;
  age: number;
  blood_type: string;
  usia_kehamilan: number;
  kehamilan_ke: number;
  jumlah_anak: number;
  risk_level: 'rendah' | 'sedang' | 'tinggi' | null;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  is_active: boolean;
}

export default function PerawatDashboard() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [patients, setPatients] = useState<PerawatPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPatients();
  }, [token, router]);

  const fetchPatients = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const data = await nurseApi.getMyPatients(token);
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = patients.length;
    const tinggi = patients.filter(p => p.risk_level === 'tinggi').length;
    const sedang = patients.filter(p => p.risk_level === 'sedang').length;
    const rendah = patients.filter(p => p.risk_level === 'rendah').length;
    const belumDitentukan = patients.filter(p => !p.risk_level).length;
    
    // Get current month new patients (assuming created_at exists, if not, we'll use a placeholder)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    // Note: API response doesn't include created_at, so we'll set this to 0 for now
    // You may need to update the API or use a different field
    const pasienBaru = 0; // Placeholder - update when API includes created_at

    return {
      total,
      tinggi,
      sedang,
      rendah,
      belumDitentukan,
      pasienBaru,
    };
  }, [patients]);

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    
    const query = searchQuery.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.nama_lengkap.toLowerCase().includes(query) ||
        patient.nik.includes(query)
    );
  }, [patients, searchQuery]);

  // Get risk badge
  const getRiskBadge = (riskLevel: 'rendah' | 'sedang' | 'tinggi' | null) => {
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
          label: 'Risiko Tinggi',
          className: 'bg-red-100 text-red-800 border-red-200',
          dot: 'bg-red-500',
        };
      case 'sedang':
        return {
          label: 'Risiko Sedang',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          dot: 'bg-orange-500',
        };
      case 'rendah':
        return {
          label: 'Risiko Rendah',
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

  // Chart data for risk distribution
  const chartData = [
    {
      name: 'RISIKO TINGGI',
      value: statistics.tinggi,
      color: '#f87171',
    },
    {
      name: 'RISIKO SEDANG',
      value: statistics.sedang,
      color: '#facc15',
    },
    {
      name: 'RISIKO RENDAH',
      value: statistics.rendah,
      color: '#4ade80',
    },
  ];

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Pemantauan Pasien
            </h1>
            <p className="text-gray-600">
              Ringkasan data pasien berdasarkan tingkat risiko kesehatan terkini.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <Button className="bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white">
              <Download className="w-4 h-4 mr-2" />
              Ekspor Laporan
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Pasien */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Pasien</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{statistics.total}</p>
              <p className="text-sm text-green-600 mt-1">+5%</p>
            </div>
          </div>
        </div>

        {/* Risiko Tinggi */}
        <div className="bg-white rounded-xl border-l-4 border-red-500 border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Risiko Tinggi</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{statistics.tinggi}</p>
              <p className="text-sm text-red-600 mt-1">+12%</p>
            </div>
          </div>
        </div>

        {/* Risiko Sedang */}
        <div className="bg-white rounded-xl border-l-4 border-orange-500 border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Risiko Sedang</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{statistics.sedang}</p>
              <p className="text-sm text-red-600 mt-1">-3%</p>
            </div>
          </div>
        </div>

        {/* Pasien Baru */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pasien Baru (Bulan Ini)</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{statistics.pasienBaru}</p>
              <p className="text-sm text-green-600 mt-1">+8%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Pasien Prioritas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Daftar Pasien Prioritas</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Cari nama pasien atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">NAMA PASIEN</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">NIK</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">USIA</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">STATUS RISIKO</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">TERAKHIR PERIKSA</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {searchQuery ? 'Tidak ada pasien yang ditemukan' : 'Belum ada pasien'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const riskBadge = getRiskBadge(patient.risk_level);
                  return (
                    <tr
                      key={patient.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-gray-900">{patient.nama_lengkap}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">{patient.nik}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">{patient.age} Thn</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={`${riskBadge.className} border flex items-center gap-1.5 w-fit`}
                        >
                          <span className={`w-2 h-2 rounded-full ${riskBadge.dot}`}></span>
                          {riskBadge.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">-</p>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => router.push(`/perawat/pasien/${patient.id}`)}
                          className="text-[#3B9ECF] hover:text-[#2d7ba8] text-sm font-medium transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistik Risiko Pasien */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Statistik Risiko Pasien</h2>
          <p className="text-sm text-gray-600">
            Visualisasi distribusi jumlah pasien berdasarkan kategori risiko kesehatan.
          </p>
        </div>

        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                stroke="#E5E7EB"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                stroke="#E5E7EB"
                domain={[0, (dataMax: number) => Math.max(dataMax * 1.2, 300)]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fill: '#374151', fontSize: '14px', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Risiko Tinggi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-sm text-gray-600">Risiko Sedang</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Risiko Rendah</span>
          </div>
        </div>

        {/* Total Population */}
        <div className="mt-6 flex justify-end">
          <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
            <p className="text-xs text-gray-500">TOTAL POPULASI PASIEN</p>
            <p className="text-lg font-bold text-gray-900">{statistics.total} jiwa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
