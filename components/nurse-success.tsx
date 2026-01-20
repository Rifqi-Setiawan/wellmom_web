import { Check, ShieldCheck } from 'lucide-react';
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
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Top Icon */}
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 text-green-500" strokeWidth={3} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-8">Pembuatan Akun Berhasil</h2>

      {/* Card */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden mb-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-8 relative overflow-hidden">
          <div className="flex items-center gap-2 text-green-600 font-semibold text-xs tracking-wider">
            <div className="p-1 rounded-full border-2 border-green-500">
             <Check className="w-3 h-3" strokeWidth={3} />
            </div>
            TERVERIFIKASI
          </div>
          
          {/* Shield Watermark */}
          <ShieldCheck className="absolute -right-4 -bottom-8 w-32 h-32 text-gray-200/50" />
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Data Tenaga Kesehatan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            {/* Name */}
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wider mb-1 uppercase">Nama Tenaga Kesehatan</p>
              <p className="text-base font-bold text-gray-900">{data.nama_lengkap}</p>
            </div>

            {/* NIP */}
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wider mb-1 uppercase">NIP</p>
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-gray-900">{data.nip}</p>
                <div className="p-0.5 bg-green-100 rounded-full">
                  <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wider mb-1 uppercase">Email</p>
              <p className="text-base font-medium text-gray-900">{data.email}</p>
            </div>

            {/* Phone */}
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wider mb-1 uppercase">Nomor Telepon</p>
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-gray-900">{data.nomor_hp}</p>
                <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-wide">Actual</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 italic">
              Waktu Verifikasi: {currentDate}
            </p>
          </div>
        </div>
      </div>

      <Button 
        onClick={onClose}
        className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-blue-200/50 transition-all active:scale-[0.98]"
      >
        Selesaikan Pendaftaran
      </Button>
    </div>
  );
}
