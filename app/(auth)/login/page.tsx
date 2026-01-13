'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const rememberMe = watch('remember');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
        remember: data.remember,
      });

      if (response.success && response.data) {
        // Simpan auth state
        setAuth(response.data.user, response.data.token);

        // Redirect berdasarkan role
        const roleRoutes = {
          super_admin: '/super-admin/dashboard',
          puskesmas: '/puskesmas/dashboard',
          perawat: '/perawat/dashboard',
        };

        router.push(roleRoutes[response.data.user.role]);
      } else {
        setErrorMessage(response.message || 'Login gagal. Silakan coba lagi.');
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              Digitalizing Public Health
              <br />
              for a Better Future.
            </h1>
            <p className="text-lg text-white/90">
              Access the integrated management portal for Puskesmas administrators and health
              ministry officials.
            </p>
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Wellmom</h2>
            <p className="text-gray-600">Please enter your credentials to access the admin portal.</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@puskesmas.go.id"
                  className="pl-10"
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#3B9ECF] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue('remember', checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">atau</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-[#3B9ECF] hover:underline"
                >
                  Daftar sebagai Puskesmas
                </Link>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-4">
              <Link href="/privacy-policy" className="hover:text-[#3B9ECF]">
                Privacy Policy
              </Link>
              <Link href="/support" className="hover:text-[#3B9ECF]">
                Support Helpdesk
              </Link>
            </div>
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
