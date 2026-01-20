'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { nurseApi } from '@/lib/api/nurse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NurseSuccess } from './nurse-success';
import type { NurseGenerationRequest } from '@/lib/types/nurse';

const nurseSchema = z.object({
  nama_lengkap: z.string().min(3, 'Nama harus lebih dari 3 karakter'),
  nip: z.string().min(1, 'NIP wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  nomor_hp: z.string().min(10, 'Nomor HP minimal 10 digit'),
});

type NurseFormValues = z.infer<typeof nurseSchema>;

interface AddNurseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddNurseModal({ isOpen, onClose, onSuccess }: AddNurseModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<NurseGenerationRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NurseFormValues>({
    resolver: zodResolver(nurseSchema),
  });

  const onSubmit = async (data: NurseFormValues) => {
    if (!token) {
      setError('Anda tidak memiliki akses (Token tidak ditemukan)');
      return;
    }

    try {
      setError(null);
      await nurseApi.generateNurse(token, data);
      setSubmittedData(data);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Gagal menambahkan perawat. Silakan coba lagi.';
      
      const responseData = err.response?.data;
      if (responseData) {
        if (typeof responseData.detail === 'string') {
          errorMsg = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          // Handle Pydantic validation errors array
          errorMsg = responseData.detail.map((e: any) => e.msg).join(', ');
        } else if (responseData.message) {
          errorMsg = responseData.message;
        }
      }
      
      setError(errorMsg);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setSubmittedData(null);
    reset();
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* If Success, show NurseSuccess component */}
      {isSuccess && submittedData ? (
        <NurseSuccess data={submittedData} onClose={handleClose} />
      ) : (
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-center relative">
            <h2 className="text-lg font-semibold text-gray-900">Tambah Perawat</h2>
            <button
              onClick={handleClose}
              className="absolute right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 break-all">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
              <Input
                id="nama_lengkap"
                placeholder="Contoh: Siti Nurhaliza"
                {...register('nama_lengkap')}
                className={errors.nama_lengkap ? 'border-red-500' : ''}
              />
              {errors.nama_lengkap && (
                <p className="text-xs text-red-500">{errors.nama_lengkap.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nip">NIP</Label>
              <Input
                id="nip"
                placeholder="198501012015011001"
                {...register('nip')}
                className={errors.nip ? 'border-red-500' : ''}
              />
              {errors.nip && (
                <p className="text-xs text-red-500">{errors.nip.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="siti.nurhaliza@puskesmas.go.id"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomor_hp">Nomor HP</Label>
              <Input
                id="nomor_hp"
                placeholder="+6281234567890"
                {...register('nomor_hp')}
                className={errors.nomor_hp ? 'border-red-500' : ''}
              />
              {errors.nomor_hp && (
                <p className="text-xs text-red-500">{errors.nomor_hp.message}</p>
              )}
              <p className="text-xs text-gray-500">Gunakan format internasional (contoh: +62...)</p>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Proses...
                  </>
                ) : (
                  'Tambah'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
