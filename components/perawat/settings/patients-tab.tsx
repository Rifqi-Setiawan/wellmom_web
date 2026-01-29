"use client";

import { useState } from "react";
import { Search, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "./stat-card";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { PatientsResponse, PerawatPatient } from "@/lib/types/perawat";

interface PatientsTabProps {
  data: PatientsResponse | null;
  isLoading: boolean;
}

export function PatientsTab({ data, isLoading }: PatientsTabProps) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<'all' | 'tinggi' | 'sedang' | 'rendah'>('all');

  if (isLoading || !data) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Filter patients
  const filteredPatients = data.patients.filter((patient) => {
    const matchesSearch = patient.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || 
                          (patient.nik?.includes(search) ?? false);
    const matchesRisk = riskFilter === 'all' || patient.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk?: string) => {
    switch(risk) {
      case 'tinggi': return <Badge className="bg-red-100 text-red-800 border-red-200">Tinggi</Badge>;
      case 'sedang': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Sedang</Badge>;
      case 'rendah': return <Badge className="bg-green-100 text-green-800 border-green-200">Rendah</Badge>;
      default: return <Badge variant="outline">Belum Ditentukan</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
           title="Total Pasien" 
           value={data.total_patients} 
           color="blue"
        />
        <StatCard 
           title="Risiko Tinggi" 
           value={data.patients_by_risk.tinggi} 
           color="red"
        />
        <StatCard 
           title="Risiko Sedang" 
           value={data.patients_by_risk.sedang} 
           color="yellow"
        />
        <StatCard 
           title="Risiko Rendah" 
           value={data.patients_by_risk.rendah} 
           color="green"
        />
      </div>

      {/* 2. Patient List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Daftar Pasien Anda</h3>
          
          <div className="flex gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <Input 
                 placeholder="Cari nama atau NIK..." 
                 className="pl-9 h-9 bg-white"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             
             <div className="flex bg-white rounded-md border border-gray-200 p-1 h-9 items-center">
                <button 
                  onClick={() => setRiskFilter('all')}
                  className={`px-3 text-xs font-medium rounded-sm transition-colors ${riskFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Semua
                </button>
                 <button 
                  onClick={() => setRiskFilter('tinggi')}
                  className={`px-3 text-xs font-medium rounded-sm transition-colors ${riskFilter === 'tinggi' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:text-red-600'}`}
                >
                  Tinggi
                </button>
             </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
           {filteredPatients.length > 0 ? (
             filteredPatients.map((patient) => (
               <div key={patient.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm">
                        {patient.nama_lengkap.charAt(0)}
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <h4 className="font-medium text-gray-900">{patient.nama_lengkap}</h4>
                           {getRiskBadge(patient.risk_level)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex gap-3">
                           <span>Usia Hamil: {patient.usia_kehamilan_minggu} Mg {patient.usia_kehamilan_hari} Hari</span>
                           <span>•</span>
                           <span>HPL: {patient.hpl ? format(new Date(patient.hpl), 'd MMM yyyy', { locale: id }) : '-'}</span>
                           {patient.nomor_hp && (
                             <>
                               <span>•</span>
                               <span>{patient.nomor_hp}</span>
                             </>
                           )}
                        </div>
                     </div>
                  </div>
                  <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                     Lihat Detail
                  </Button>
               </div>
             ))
           ) : (
             <div className="p-12 text-center text-gray-500">
                <p>Tidak ada pasien yang ditemukan.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
