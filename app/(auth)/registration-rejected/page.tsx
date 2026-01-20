'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RegistrationRejectedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Registrasi Ditolak
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Mohon maaf, registrasi puskesmas Anda tidak dapat disetujui.
          Silakan hubungi administrator untuk informasi lebih lanjut mengenai alasan penolakan.
        </p>

        {/* Info Box */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm font-medium text-red-900 mb-2">Kemungkinan alasan:</p>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Dokumen tidak lengkap atau tidak valid</li>
            <li>• Data yang diisi tidak sesuai dengan ketentuan</li>
            <li>• Informasi yang diberikan tidak dapat diverifikasi</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/contact')}
            className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            Hubungi Administrator
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/login')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Login
          </Button>
        </div>
      </div>
    </div>
  );
}
