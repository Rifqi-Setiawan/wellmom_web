'use client';

import { useState } from 'react';
import type { HealthPersonnel } from '@/lib/types/health-personnel';
import {
  Search,
  Plus,
  FileText,
  Settings,
  UserPlus,
  Info,
} from 'lucide-react';

// Dummy data
const dummyHealthPersonnel: HealthPersonnel[] = [
  {
    id: 1,
    name: 'dr. Ahmad Sujatmiko',
    str_number: '3112000219882341',
    role: 'Dokter',
    workload: 42,
    max_capacity: 50,
    status: 'Aktif',
    avatar_initials: 'AS',
    avatar_color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 2,
    name: 'Siti Lestari, S.Tr.Keb',
    str_number: '3245001220191102',
    role: 'Bidan',
    workload: 58,
    max_capacity: 50,
    status: 'Aktif',
    avatar_initials: 'SL',
    avatar_color: 'bg-pink-100 text-pink-700',
  },
  {
    id: 3,
    name: 'dr. Bambang Wahyudi',
    str_number: '3112001020054421',
    role: 'Dokter',
    workload: 12,
    max_capacity: 50,
    status: 'Nonaktif',
    avatar_initials: 'BW',
    avatar_color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 4,
    name: 'Ratna Dewi, S.Kep',
    str_number: '3256001220201103',
    role: 'Perawat',
    workload: 35,
    max_capacity: 50,
    status: 'Aktif',
    avatar_initials: 'RD',
    avatar_color: 'bg-teal-100 text-teal-700',
  },
  {
    id: 5,
    name: 'dr. Indah Permata',
    str_number: '3112000319902342',
    role: 'Dokter',
    workload: 48,
    max_capacity: 50,
    status: 'Aktif',
    avatar_initials: 'IP',
    avatar_color: 'bg-blue-100 text-blue-700',
  },
];

export default function TenagaKesehatanPage() {
  const [healthPersonnel] = useState<HealthPersonnel[]>(dummyHealthPersonnel);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Filter berdasarkan search
  const filteredData = healthPersonnel.filter(
    (person) =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.str_number.includes(searchQuery) ||
      person.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get workload color based on percentage
  const getWorkloadColor = (workload: number, maxCapacity: number): string => {
    const percentage = (workload / maxCapacity) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'Dokter':
        return 'bg-blue-100 text-blue-700';
      case 'Bidan':
        return 'bg-purple-100 text-purple-700';
      case 'Perawat':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Tenaga Kesehatan</h1>
          <p className="text-gray-600">
            Kelola data profesional medis dan distribusi beban kerja puskesmas.
          </p>
        </div>
        <button className="px-4 py-2 bg-[#3B9ECF] text-white rounded-lg hover:bg-[#2d7ba8] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Nakes
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, STR, atau peran..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent text-sm"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] bg-white">
            <option>Semua Peran</option>
            <option>Dokter</option>
            <option>Bidan</option>
            <option>Perawat</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] bg-white">
            <option>Semua Status</option>
            <option>Aktif</option>
            <option>Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  NAMA
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  NO. STR
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PERAN
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  BEBAN KERJA
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((person) => {
                const workloadPercentage = (person.workload / person.max_capacity) * 100;
                const workloadColor = getWorkloadColor(person.workload, person.max_capacity);
                return (
                  <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${person.avatar_color}`}
                        >
                          {person.avatar_initials}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{person.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{person.str_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                          person.role
                        )}`}
                      >
                        {person.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[120px]">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${workloadColor}`}
                              style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {person.workload} Pasien
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            person.status === 'Aktif' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        <span className="text-sm text-gray-900">{person.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Detail"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Pengaturan"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        {person.workload > person.max_capacity && (
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Pindah Pasien"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredData.length)} dari{' '}
            {filteredData.length} Tenaga Kesehatan
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-[#3B9ECF] border border-[#3B9ECF] rounded-lg hover:bg-[#2d7ba8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* Management Tip */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Tips Manajemen:</p>
            <p className="text-sm text-blue-800">
              Gunakan fitur &quot;Pindah Pasien&quot; jika beban kerja nakes melebihi kapasitas
              optimal (lebih dari 50 pasien) untuk menjaga kualitas pelayanan. Data nakes yang
              dinonaktifkan akan tetap tersimpan dalam arsip SISDMK.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
