"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  User,
  ShieldCheck,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { nurseApi } from "@/lib/api/nurse";

// Schemas
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus mengandung huruf besar")
    .regex(/[a-z]/, "Harus mengandung huruf kecil")
    .regex(/[0-9]/, "Harus mengandung angka"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const profileSchema = z.object({
  photoUrl: z.string().optional(), // Simply text input for URL for now
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState<{
    user_id: number;
    email: string;
    full_name: string;
    puskesmas_name: string;
  } | null>(null);

  // Forms
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 1: Check Token on Mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError("Token aktivasi tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        const data = await nurseApi.checkActivationToken(token);
        if (data.valid) {
          setUserInfo(data.user_info);
          // If valid, auto proceed to step 2 (Verify Email action)
          setStep(2);
        } else {
          setError("Token tidak valid atau sudah kadaluarsa.");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Terjadi kesalahan saat validasi token.");
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [token]);

  // Actions
  const handleVerifyEmail = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await nurseApi.verifyEmail(token);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Gagal verifikasi email");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (data: PasswordFormData) => {
    if (!token) return;
    setLoading(true);
    try {
      await nurseApi.setPassword(token, data.password);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Gagal mengatur password");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (data: ProfileFormData) => {
    if (!token) return;
    setLoading(true);
    try {
      // Allow skipping or sending empty string if not provided
      await nurseApi.completeProfile(token, data.photoUrl || "");
      setStep(5);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan profil");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTerms = async () => {
    if (!token) return;
    if (!termsAccepted) return;
    setLoading(true);
    try {
      await nurseApi.acceptTerms(token);
      // Finished! Redirect or show success
      // We can redirect to login page with query param
      router.push("/login?activated=true");
    } catch (err: any) {
      setError(err.message || "Gagal menyelesaikan aktivasi");
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#3B9ECF] mx-auto mb-4" />
          <p className="text-gray-600">Memeriksa token aktivasi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-lg text-center border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aktivasi Gagal</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push("/login")} variant="outline">
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <Image
          src="/assets/images/logo-wellmom.png"
          alt="WellMom Logo"
          width={60}
          height={60}
          className="mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900">Aktivasi Akun Perawat</h1>
        <p className="text-gray-600 mt-2">
          {userInfo ? `Selamat datang, ${userInfo.full_name}` : "Lengkapi data anda"}
        </p>
        {userInfo && (
          <p className="text-sm font-medium text-[#3B9ECF] mt-1">
            {userInfo.puskesmas_name}
          </p>
        )}
      </div>

      {/* Progress Steps */}
      <div className="max-w-3xl w-full mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          {[2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-colors ${
                step >= s
                  ? "border-[#3B9ECF] text-[#3B9ECF]"
                  : "border-gray-300 text-gray-400"
              } ${step > s ? "bg-[#3B9ECF] text-white border-[#3B9ECF]" : ""}`}
            >
              {step > s ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span className="font-bold">{s - 1}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium text-gray-500 px-2">
          <span>Verifikasi</span>
          <span>Password</span>
          <span>Profil</span>
          <span>Selesai</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">
        {step === 2 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-[#3B9ECF]" />
            </div>
            <h2 className="text-xl font-bold mb-4">Verifikasi Email</h2>
            <p className="text-gray-600 mb-8">
              Konfirmasi bahwa alamat email <strong>{userInfo?.email}</strong> adalah benar milik Anda.
            </p>
            <Button
              onClick={handleVerifyEmail}
              className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8]"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Verifikasi Sekarang"
              )}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#3B9ECF]" />
              </div>
              <h2 className="text-xl font-bold">Buat Password Baru</h2>
            </div>
            
            <form onSubmit={passwordForm.handleSubmit(handleSetPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register("password")}
                />
                {passwordForm.formState.errors.password && (
                  <p className="text-xs text-red-500">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                <p>Password harus mengandung:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Minimal 8 karakter</li>
                  <li>Huruf besar & kecil</li>
                  <li>Angka</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8] mt-4"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Simpan Password"}
              </Button>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold">Lengkapi Profil</h2>
            </div>

            <form onSubmit={profileForm.handleSubmit(handleCompleteProfile)} className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="photoUrl">URL Foto Profil (Opsional)</Label>
                <Input
                  id="photoUrl"
                  placeholder="https://..."
                  {...profileForm.register("photoUrl")}
                />
                <p className="text-xs text-gray-500">
                  Anda dapat melewati langkah ini dan mengunggah foto nanti.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCompleteProfile({})}
                  disabled={loading}
                >
                  Lewati
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#3B9ECF] hover:bg-[#2d7ba8]"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Lanjut"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 5 && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">Syarat & Ketentuan</h2>
            </div>

            <div className="h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg text-sm text-gray-600 mb-6 border border-gray-200">
              <p className="mb-2 font-bold">1. Penggunaan Data</p>
              <p className="mb-4">Data yang Anda masukkan ke dalam sistem WellMom akan digunakan untuk keperluan pemantauan kesehatan ibu hamil dan pelaporan Puskesmas.</p>
              
              <p className="mb-2 font-bold">2. Keamanan Akun</p>
              <p className="mb-4">Anda bertanggung jawab menjaga kerahasiaan password akun Anda. Jangan berikan password kepada siapapun.</p>
              
              <p className="mb-2 font-bold">3. Kode Etik</p>
              <p className="mb-4">Sebagai tenaga kesehatan, Anda wajib mematuhi kode etik profesi dalam menggunakan aplikasi ini.</p>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(c) => setTermsAccepted(c as boolean)}
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                Saya menyetujui Syarat & Ketentuan yang berlaku
              </Label>
            </div>

            <Button
              onClick={handleAcceptTerms}
              className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8]"
              disabled={loading || !termsAccepted}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Aktifkan Akun Saya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivationPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-[#3B9ECF]" />
       </div>
    }>
      <ActivationContent />
    </Suspense>
  );
}
