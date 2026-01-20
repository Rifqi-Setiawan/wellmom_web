'use client';

import { useRouter } from 'next/navigation';
import { Clock, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WaitingApprovalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Menunggu Persetujuan
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Registrasi puskesmas Anda sedang dalam proses verifikasi oleh Super Admin.
          Anda akan menerima notifikasi setelah akun disetujui.
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Estimasi waktu:</strong> 1-3 hari kerja
          </p>
        </div>

        {/* Additional Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm font-medium text-gray-700 mb-2">Yang akan dilakukan:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Verifikasi dokumen pendaftaran</li>
            <li>• Validasi data puskesmas</li>
            <li>• Review kelengkapan informasi</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => router.push('/login')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Login
          </Button>
          <p className="text-sm text-gray-500">
            Ada pertanyaan?{' '}
            <Link href="/contact" className="text-[#3B9ECF] hover:underline">
              Hubungi kami
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
