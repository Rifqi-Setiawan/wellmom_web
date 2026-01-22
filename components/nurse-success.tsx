import { Check, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NurseGenerationRequest } from '@/lib/types/nurse';

interface NurseSuccessProps {
  data: NurseGenerationRequest;
  onClose: () => void;
}

export function NurseSuccess({ data, onClose }: NurseSuccessProps) {
  const currentDate = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Top Icon - Large Green Circle */}
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>

        <h2 className="text-2xl font-bold text-white mb-8">Pembuatan Akun Berhasil</h2>

        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Banner with Gradient */}
          <div className="bg-gradient-to-br from-green-50 via-green-50/50 to-white px-6 py-6 relative overflow-hidden">
            <div className="flex items-center gap-2 text-green-600 font-semibold text-xs tracking-wider mb-2">
              <div className="p-1 rounded-full border-2 border-green-500 bg-white">
                <Check className="w-3 h-3" strokeWidth={3} />
              </div>
              TERVERIFIKASI
            </div>
            
            {/* Shield Watermark */}
            <ShieldCheck className="absolute -right-4 -bottom-8 w-32 h-32 text-gray-200/40" />
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Ringkasan Data Tenaga Kesehatan</h3>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-6">
              {/* Name */}
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-wider mb-1 uppercase">Nama Tenaga Kesehatan</p>
                <p className="text-base font-bold text-gray-900">{data.nama_lengkap}</p>
              </div>

              {/* NIP */}
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-wider mb-1 uppercase">NIP</p>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-gray-900">{data.nip}</p>
                  <div className="p-0.5 bg-green-100 rounded-full">
                    <Check className="w-3 h-3 text-green-600" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-wider mb-1 uppercase">Email</p>
                <p className="text-base font-medium text-gray-900">{data.email}</p>
              </div>

              {/* Phone */}
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-wider mb-1 uppercase">Nomor Telepon</p>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-gray-900">{data.nomor_hp}</p>
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wide">AKTIF</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Waktu Verifikasi: {currentDate}
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        <Button 
          onClick={onClose}
          className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white py-4 text-base font-semibold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Users className="w-5 h-5" />
          Selesaikan Pendaftaran
        </Button>
      </div>
    </div>
  );
}
