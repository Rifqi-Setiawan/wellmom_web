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
  Legend
} from 'recharts';
import { UserPlus, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PuskesmasStatistics, IbuHamil } from '@/lib/types/ibu-hamil';
import { puskesmasApi } from '@/lib/api/puskesmas';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useEffect, useState } from 'react';

interface PatientOverviewProps {
  statistics: PuskesmasStatistics | null;
}

export function PatientOverview({ statistics }: PatientOverviewProps) {
  const { token } = useAuthStore();
  const [ibuHamilList, setIbuHamilList] = useState<IbuHamil[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIbuHamil = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const data = await puskesmasApi.getIbuHamilList(token);
        setIbuHamilList(data);
      } catch (error) {
        console.error('Failed to fetch ibu hamil list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIbuHamil();
  }, [token]);

  // Prepare risk distribution data
  const riskData = statistics?.distribusi_risiko ? [
    { name: 'Rendah', value: statistics.distribusi_risiko.rendah, color: '#4ade80' },
    { name: 'Sedang', value: statistics.distribusi_risiko.sedang, color: '#facc15' },
    { name: 'Tinggi', value: statistics.distribusi_risiko.tinggi, color: '#f87171' },
  ] : [];

  // Prepare assignment data
  const totalAssigned = statistics 
    ? statistics.total_ibu_hamil - statistics.pasien_belum_ditugaskan 
    : 0;
  const assignmentData = statistics ? [
    { name: 'Sudah Ditugaskan', value: totalAssigned, color: '#3B9ECF' },
    { name: 'Belum Ditugaskan', value: statistics.pasien_belum_ditugaskan, color: '#E5E7EB' },
  ] : [];

  // Get unassigned patients (patients without perawat_id)
  const unassignedPatients = ibuHamilList
    .filter(patient => !patient.perawat_id)
    .slice(0, 4);

  // Get high risk patients (for now, we'll use a placeholder since risk level is not in the API response)
  // This would need to be calculated based on patient data or fetched from another endpoint
  const highRiskPatients: Array<{
    id: number;
    name: string;
    condition: string;
    priority: 'high' | 'medium';
    action: string;
  }> = []; // Placeholder - would need risk assessment data

  const assignmentPercentage = statistics && statistics.total_ibu_hamil > 0
    ? Math.round((totalAssigned / statistics.total_ibu_hamil) * 100)
    : 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Patient Overview (Monitoring Ibu Hamil)</h2>
        <p className="text-sm text-gray-500">Visualisasi risiko dan status penugasan pasien secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Charts */}
        <div className="space-y-8">
          {/* Risk Distribution */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Distribusi Risiko</h3>
            {riskData.length > 0 ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6b7280' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6b7280' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Status Penugasan Bidan</h3>
            {assignmentData.length > 0 && assignmentData.some(d => d.value > 0) ? (
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
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs text-gray-600 ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                  <span className="block text-2xl font-bold text-[#3B9ECF]">{assignmentPercentage}%</span>
                  <span className="block text-[10px] text-gray-400">Ditugaskan</span>
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
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pasien Belum Mendapat Bidan</h3>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 font-normal text-xs">
              {statistics?.pasien_belum_ditugaskan || 0} Pending
            </Badge>
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4 text-sm text-gray-500">Memuat data...</div>
            ) : unassignedPatients.length > 0 ? (
              unassignedPatients.map((patient) => (
                <div key={patient.id} className="p-3 border border-gray-100 rounded-lg flex items-center justify-between group hover:border-blue-200 transition-colors bg-white">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{patient.nama_lengkap}</h4>
                    <p className="text-xs text-gray-500">NIK: {patient.nik}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-[#3B9ECF] opacity-0 group-hover:opacity-100 transition-opacity">
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
            <Button variant="link" className="text-[#3B9ECF] text-xs font-medium">
              Lihat Semua Daftar Tunggu
            </Button>
          </div>
        </div>

        {/* Column 3: High Priority */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pasien Perlu Perhatian</h3>
            <Badge variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-50 font-normal text-xs">
              High Priority
            </Badge>
          </div>

          <div className="space-y-4">
            {highRiskPatients.length > 0 ? (
              highRiskPatients.map((patient) => (
                <div key={patient.id} className={`p-4 rounded-xl border ${patient.priority === 'high' ? 'bg-red-50 border-red-100' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${patient.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {patient.priority === 'high' ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{patient.name}</h4>
                      <p className={`text-xs mt-0.5 ${patient.priority === 'high' ? 'text-red-700' : 'text-gray-600'}`}>
                        {patient.condition}
                      </p>
                      <Button 
                        size="sm" 
                        className={`mt-3 h-7 text-xs ${
                          patient.priority === 'high' 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        }`}
                      >
                        {patient.action}
                      </Button>
                    </div>
                  </div>
                </div>
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
