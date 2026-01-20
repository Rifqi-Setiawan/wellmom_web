"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  Shield,
  Building2,
  Stethoscope,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { UserRole } from "@/lib/types/auth";
import { detectRegistrationStatus, getRedirectPath, getErrorMessage } from "@/lib/utils/auth-error-handler";
import axios from "axios";

type LoginTab = "super_admin" | "puskesmas" | "perawat";

const LOGIN_TABS = [
  {
    id: "super_admin" as LoginTab,
    label: "Super Admin",
    icon: Shield,
    description: "Kementerian Kesehatan",
  },
  {
    id: "puskesmas" as LoginTab,
    label: "Puskesmas",
    icon: Building2,
    description: "Admin Puskesmas",
  },
  {
    id: "perawat" as LoginTab,
    label: "Perawat",
    icon: Stethoscope,
    description: "Perawat Puskesmas",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<LoginTab>("puskesmas");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check if redirected from successful registration
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage(
        "Registrasi berhasil! Akun Anda akan direview oleh Super Admin dalam 1-3 hari kerja.",
      );
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear email validation error when switching tabs
  useEffect(() => {
    clearErrors('email');
  }, [activeTab, clearErrors]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");



    try {
      console.log("🔑 Attempting login as:", activeTab);
      console.log("📧 Email:", data.email);

      const response = await authApi.login(activeTab as UserRole, {
        email: data.email,
        password: data.password,
      });

      console.log("✅ Login API Response:", response);
      console.log("👤 User Role:", response.role);
      console.log(
        "🎫 Access Token:",
        response.access_token ? "✓ Present" : "✗ Missing",
      );

      // Simpan auth state
      console.log("💾 Saving auth state...");
      setAuth(response);
      console.log("✅ Auth state saved");

      // Redirect berdasarkan role (using route constants)
      const { getDashboardRoute } = await import("@/lib/constants/routes");
      const dashboardRoute = getDashboardRoute(response.role);

      console.log("🚀 Redirecting to:", dashboardRoute);

      // Wait a bit to ensure Zustand persist has written to localStorage
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use window.location.href for full page reload to ensure auth state is loaded
      // This is more reliable than router.push for auth redirects
      window.location.href = dashboardRoute;
    } catch (error) {
      console.error("❌ Login error:", error);
      
      // Handle error khusus untuk login puskesmas
      if (activeTab === 'puskesmas') {
        // Check jika error memiliki status code (dari loginPuskesmas)
        const errorWithStatus = error as Error & { status?: number; detail?: string };
        const status = errorWithStatus.status || (axios.isAxiosError(error) ? error.response?.status : undefined);
        const detail = errorWithStatus.detail || 
                      (axios.isAxiosError(error) ? (error.response?.data?.detail || error.response?.data?.message) : '') ||
                      (error instanceof Error ? error.message : '');
        
        console.log('🔍 Puskesmas login error:', { status, detail });
        
        // Handle 403 (Registration status issues)
        if (status === 403) {
          const registrationStatus = detectRegistrationStatus(detail);
          const redirectPath = getRedirectPath(registrationStatus);
          
          console.log('📋 Registration status:', registrationStatus);
          console.log('🔄 Redirect path:', redirectPath);
          
          if (redirectPath) {
            // Redirect ke halaman status
            router.push(redirectPath);
            return;
          }
          
          // Jika deactivated, tampilkan error
          if (registrationStatus === 'deactivated') {
            setErrorMessage(getErrorMessage(detail, registrationStatus));
            return;
          }
        }
        
        // Handle 401 (Auth errors)
        if (status === 401) {
          setErrorMessage(detail || 'Nomor telepon atau password salah');
          return;
        }
      }
      
      // Default error handling
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Login gagal. Silakan coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderEmail = () => {
    switch (activeTab) {
      case "super_admin":
        return "superadmin@wellmom.go.id";
      case "puskesmas":
        return "admin@puskesmas.go.id";
      case "perawat":
        return "perawat@puskesmas.go.id";
    }
  };

  const getEmailLabel = () => {
    return "Email Address";
  };

  const getBrandingContent = () => {
    switch (activeTab) {
      case "super_admin":
        return {
          title: "Kelola Sistem WellMom Nasional",
          description:
            "Portal Super Admin untuk mengelola registrasi puskesmas, monitoring sistem, dan pengawasan data kesehatan ibu hamil secara nasional.",
        };
      case "puskesmas":
        return {
          title: "Digitalizing Public Health for a Better Future.",
          description:
            "Access the integrated management portal for Puskesmas administrators and health ministry officials.",
        };
      case "perawat":
        return {
          title: "Monitoring Kesehatan Ibu Hamil",
          description:
            "Portal perawat untuk input data, monitoring kondisi ibu hamil, dan koordinasi perawatan dengan tim kesehatan.",
        };
    }
  };

  const branding = getBrandingContent();

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
              {branding.title}
            </h1>
            <p className="text-lg text-white/90">{branding.description}</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to WellMom
            </h2>
            <p className="text-gray-600">
              Please select your role and enter your credentials.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
              {LOGIN_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setErrorMessage("");
                    }}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-md transition-all duration-200
                      ${
                        isActive
                          ? "bg-white shadow-sm text-[#3B9ECF] font-semibold"
                          : "text-gray-600 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon
                      className={`h-5 w-5 mb-1 ${isActive ? "text-[#3B9ECF]" : "text-gray-500"}`}
                    />
                    <span className="text-xs lg:text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-500">
                {LOGIN_TABS.find((tab) => tab.id === activeTab)?.description}
              </p>
            </div>
          </div>

          {/* Success Message (after registration) */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-800 font-medium">
                  Registrasi Berhasil!
                </p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="email">{getEmailLabel()}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={getPlaceholderEmail()}
                  className="pl-10"
                  {...register("email")}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register("password")}
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
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
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
                `Login as ${LOGIN_TABS.find((tab) => tab.id === activeTab)?.label}`
              )}
            </Button>

            {/* Divider - Only show for puskesmas */}
            {activeTab === "puskesmas" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">atau</span>
                  </div>
                </div>

                {/* Register Link - Only for Puskesmas */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Belum punya akun?{" "}
                    <Link
                      href="/register"
                      className="font-semibold text-[#3B9ECF] hover:underline"
                    >
                      Daftar sebagai Puskesmas
                    </Link>
                  </p>
                </div>
              </>
            )}
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
