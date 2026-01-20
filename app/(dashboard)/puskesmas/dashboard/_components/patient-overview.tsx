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

// Mock Data
const riskData = [
  { name: 'Rendah', value: 65, color: '#4ade80' },
  { name: 'Sedang', value: 25, color: '#facc15' },
  { name: 'Tinggi', value: 10, color: '#f87171' },
];

const assignmentData = [
  { name: 'Sudah Ditugaskan', value: 32, color: '#3B9ECF' },
  { name: 'Belum Ditugaskan', value: 13, color: '#E5E7EB' },
];

const unassignedPatients = [
  { id: 1, name: 'Rina Wijaya', week: 24, status: 'pending' },
  { id: 2, name: 'Siti Aisyah', week: 12, status: 'new' },
  { id: 3, name: 'Dewi Sartika', week: 32, status: 'pending' },
  { id: 4, name: 'Maya Indah', week: 8, status: 'pending' },
];

const highRiskPatients = [
  {
    id: 1,
    name: 'Lestari Puji',
    condition: 'Pre-eklampsia & Hipertensi',
    priority: 'high',
    action: 'Hubungi Bidan'
  },
  {
    id: 2,
    name: 'Anisa Fitri',
    condition: 'Anemia Berat (Hb < 8g/dL)',
    priority: 'medium',
    action: 'Pantau Ketat'
  },
  {
    id: 3,
    name: 'Kartika Sari',
    condition: 'Usia Kehamilan > 40 Minggu',
    priority: 'medium',
    action: 'Pantau Ketat'
  },
];

export function PatientOverview() {
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
          </div>

          {/* Assignment Status */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Status Penugasan Bidan</h3>
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
                <span className="block text-2xl font-bold text-[#3B9ECF]">70%</span>
                <span className="block text-[10px] text-gray-400">Ditugaskan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Unassigned Patients */}
        <div className="border-l border-r border-gray-100 px-0 lg:px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pasien Belum Mendapat Bidan</h3>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 font-normal text-xs">
              13 Pending
            </Badge>
          </div>
          
          <div className="space-y-3">
            {unassignedPatients.map((patient) => (
              <div key={patient.id} className="p-3 border border-gray-100 rounded-lg flex items-center justify-between group hover:border-blue-200 transition-colors bg-white">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{patient.name}</h4>
                  <p className="text-xs text-gray-500">Usia Kehamilan: {patient.week} Minggu</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-[#3B9ECF] opacity-0 group-hover:opacity-100 transition-opacity">
                  <UserPlus className="w-4 h-4" />
                </Button>
                {patient.status === 'new' && (
                  <span className="absolute w-2 h-2 bg-pink-500 rounded-full translate-x-[200px]" />
                )}
              </div>
            ))}
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
            {highRiskPatients.map((patient) => (
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
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
