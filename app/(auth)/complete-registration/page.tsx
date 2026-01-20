'use client';

import { useRouter } from 'next/navigation';
import { FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CompleteRegistrationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-gray-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Registrasi Belum Lengkap
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Anda belum menyelesaikan proses registrasi.
          Silakan lengkapi dokumen yang diperlukan untuk melanjutkan.
        </p>

        {/* Checklist */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm font-medium text-gray-700 mb-3">Dokumen yang diperlukan:</p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>SK Pendirian Puskesmas (PDF, maks. 2MB)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>Foto Gedung Puskesmas (JPG/PNG, maks. 2MB)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>Lokasi Puskesmas pada peta (koordinat GPS)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>Konfirmasi kebenaran data</span>
            </li>
          </ul>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Catatan:</strong> Setelah melengkapi registrasi, data Anda akan direview oleh Super Admin dalam 1-3 hari kerja.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/register/puskesmas')}
            className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white"
          >
            Lanjutkan Registrasi
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            * Anda akan melanjutkan dari step terakhir yang belum diselesaikan
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Kembali ke Login
          </Button>
        </div>
      </div>
    </div>
  );
}
