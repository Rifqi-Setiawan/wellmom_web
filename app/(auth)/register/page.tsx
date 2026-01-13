'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, Building2, MapPin, Phone, User, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { authApi } from '@/lib/api/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.register(data);

      if (response.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(response.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-[#3B9ECF]/10 to-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Registrasi Berhasil!
          </h2>
          
          <p className="text-gray-600 mb-8">
            Akun Puskesmas Anda telah terdaftar dengan status <span className="font-semibold text-yellow-600">Pending</span>.
            <br />
            <br />
            Tim kami akan melakukan verifikasi dan persetujuan dalam 1-3 hari kerja. Anda akan menerima email
            notifikasi setelah akun Anda disetujui.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> Anda belum dapat login sampai akun Anda disetujui oleh Super Admin.
            </p>
          </div>

          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white"
          >
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#3B9ECF] text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <Image
              src="/assets/images/logo-wellmom.png"
              alt="WellMom Logo"
              width={60}
              height={60}
              className="w-12 h-12"
            />
            <span className="text-2xl font-bold">WellMom</span>
          </div>

          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Join the Digital
              <br />
              Health Network
            </h1>
            <p className="text-lg text-white/90 mb-8">
              Daftarkan Puskesmas Anda untuk bergabung dalam sistem monitoring kesehatan ibu hamil
              terintegrasi.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Monitoring Terintegrasi</h3>
                  <p className="text-sm text-white/80">
                    Kelola data ibu hamil secara digital dan real-time
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Manajemen Perawat</h3>
                  <p className="text-sm text-white/80">
                    Kelola akses dan aktivitas perawat dengan mudah
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Laporan & Analisis</h3>
                  <p className="text-sm text-white/80">
                    Dashboard analitik untuk pengambilan keputusan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/80">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">Secure Government Portal</span>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Image
              src="/assets/images/logo-wellmom.png"
              alt="WellMom Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <span className="text-2xl font-bold text-[#3B9ECF]">WellMom</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Daftar Puskesmas</h2>
            <p className="text-gray-600">
              Lengkapi data Puskesmas untuk mendaftar ke sistem WellMom
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nama Puskesmas */}
            <div className="space-y-2">
              <Label htmlFor="nama_puskesmas">Nama Puskesmas</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="nama_puskesmas"
                  placeholder="Contoh: Puskesmas Kecamatan Cilandak"
                  className="pl-10"
                  {...register('nama_puskesmas')}
                  disabled={isLoading}
                />
              </div>
              {errors.nama_puskesmas && (
                <p className="text-sm text-red-600">{errors.nama_puskesmas.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Resmi Puskesmas</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="puskesmas@example.go.id"
                  className="pl-10"
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  className="pl-10 pr-10"
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password_confirmation"
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  className="pl-10 pr-10"
                  {...register('password_confirmation')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-red-600">{errors.password_confirmation.message}</p>
              )}
            </div>

            {/* Alamat */}
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat Lengkap</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="alamat"
                  rows={3}
                  placeholder="Jalan, Kelurahan, Kecamatan, Kota/Kabupaten"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  {...register('alamat')}
                  disabled={isLoading}
                />
              </div>
              {errors.alamat && (
                <p className="text-sm text-red-600">{errors.alamat.message}</p>
              )}
            </div>

            {/* Nomor Telepon */}
            <div className="space-y-2">
              <Label htmlFor="no_telepon">Nomor Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="no_telepon"
                  type="tel"
                  placeholder="08xxxxxxxxxx atau +62"
                  className="pl-10"
                  {...register('no_telepon')}
                  disabled={isLoading}
                />
              </div>
              {errors.no_telepon && (
                <p className="text-sm text-red-600">{errors.no_telepon.message}</p>
              )}
            </div>

            {/* Nama Kepala Puskesmas */}
            <div className="space-y-2">
              <Label htmlFor="nama_kepala_puskesmas">Nama Kepala Puskesmas</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="nama_kepala_puskesmas"
                  placeholder="dr. Nama Lengkap"
                  className="pl-10"
                  {...register('nama_kepala_puskesmas')}
                  disabled={isLoading}
                />
              </div>
              {errors.nama_kepala_puskesmas && (
                <p className="text-sm text-red-600">{errors.nama_kepala_puskesmas.message}</p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong> Setelah registrasi, akun Anda akan direview oleh Super Admin.
                Proses verifikasi biasanya memakan waktu 1-3 hari kerja.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#3B9ECF] hover:underline"
                >
                  Login di sini
                </Link>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © 2024 Ministry of Health Republic of Indonesia.
              <br />
              Authorized access only. All activities are monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
