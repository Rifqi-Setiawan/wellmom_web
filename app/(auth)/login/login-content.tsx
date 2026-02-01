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
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { UserRole } from "@/lib/types/auth";
import {
  detectRegistrationStatus,
  getRedirectPath,
  getErrorMessage,
} from "@/lib/utils/auth-error-handler";
import axios from "axios";

type LoginTab = "super_admin" | "puskesmas" | "perawat";

const LOGIN_TABS = [
  {
    id: "super_admin" as LoginTab,
    label: "Super Admin",
    icon: Shield,
    description: "Pemerintah Kota",
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

export function LoginContent() {
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
    clearErrors("email");
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
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use window.location.href for full page reload to ensure auth state is loaded
      // This is more reliable than router.push for auth redirects
      window.location.href = dashboardRoute;
    } catch (error) {
      console.error("❌ Login error:", error);

      // Ekstrak status dan detail dari response API (untuk semua role)
      const errorWithStatus = error as Error & {
        status?: number;
        detail?: string;
      };
      const status =
        errorWithStatus.status ||
        (axios.isAxiosError(error) ? error.response?.status : undefined);
      const apiDetail =
        errorWithStatus.detail ||
        (axios.isAxiosError(error)
          ? (error.response?.data?.detail ?? error.response?.data?.message)
          : undefined) ||
        (error instanceof Error ? error.message : "");

      const detail =
        typeof apiDetail === "string" ? apiDetail : String(apiDetail ?? "");

      // Hanya untuk Puskesmas: redirect 403 (status registrasi)
      if (activeTab === "puskesmas" && status === 403) {
        const registrationStatus = detectRegistrationStatus(detail);
        const redirectPath = getRedirectPath(registrationStatus);

        if (redirectPath) {
          router.push(redirectPath);
          return;
        }
        if (registrationStatus === "deactivated") {
          setErrorMessage(getErrorMessage(detail, registrationStatus));
          return;
        }
      }

      // Gagal login (401 atau response dengan detail): tampilkan pesan API
      const displayMessage =
        detail && detail.trim().length > 0
          ? detail.trim()
          : "Login gagal. Periksa kembali alamat surel dan kata sandi Anda.";

      setErrorMessage(displayMessage);
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
    return "Alamat Surel";
  };

  const getBrandingContent = () => {
    switch (activeTab) {
      case "super_admin":
        return {
          title: "Kelola Sistem WellMom Nasional",
          description:
            "Portal Super Admin untuk mengelola registrasi puskesmas, pemantauan sistem, dan pengawasan data kesehatan ibu hamil secara terpadu.",
        };
      case "puskesmas":
        return {
          title: "Transformasi Kesehatan Masyarakat Digital",
          description:
            "Akses portal manajemen terintegrasi bagi administrator puskesmas dan petugas kesehatan daerah.",
        };
      case "perawat":
        return {
          title: "Pemantauan Kesehatan Ibu Hamil",
          description:
            "Portal perawat untuk pencatatan data, pemantauan kondisi ibu hamil, dan koordinasi perawatan bersama tim kesehatan.",
        };
    }
  };

  const branding = getBrandingContent();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding (centered logo, gradient + subtle pattern) */}
      <div
        className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col items-center justify-center relative overflow-hidden bg-[#3B9ECF]"
        style={{
          backgroundImage: `
            linear-gradient(165deg, #2d7ba8 0%, #3B9ECF 40%, #5ab3e8 100%),
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)
          `,
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-sm">
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-white/10 p-4 shadow-xl ring-2 ring-white/20 backdrop-blur-sm">
              <Image
                src="/assets/images/logo-wellmom.png"
                alt="WellMom Logo"
                width={140}
                height={140}
                className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
            WellMom
          </h1>
          <p className="mt-3 text-base text-white/90 font-medium">
            {branding.title}
          </p>
          <p className="mt-2 text-sm text-white/80 max-w-xs">
            {branding.description}
          </p>
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

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Selamat Datang di WellMom
            </h2>
            <p className="text-gray-600">
              Pilih peran Anda dan masukkan kredensial untuk masuk ke portal.
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
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-800 font-medium">
                  Registrasi Berhasil!
                </p>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 shadow-sm"
              role="alert"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-red-800">Gagal masuk</p>
                <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
              </div>
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
              <Label htmlFor="password">Kata Sandi</Label>
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
                  Sedang masuk...
                </>
              ) : (
                `Masuk sebagai ${LOGIN_TABS.find((tab) => tab.id === activeTab)?.label}`
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
        </div>
      </div>
    </div>
  );
}
