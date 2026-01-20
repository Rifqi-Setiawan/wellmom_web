"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Save, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nurseApi } from "@/lib/api/nurse";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { NurseGenerationResponse } from "@/lib/types/nurse";

const nurseFormSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama lengkap harus diisi").min(3, "Nama lengkap minimal 3 karakter"),
  nomor_telepon: z.string().min(1, "Nomor telepon harus diisi").regex(/^(\+62|62|0)[0-9]{9,12}$/, "Format nomor telepon tidak valid"),
  email: z.string().email("Format email tidak valid"),
  nip: z.string().min(5, "NIP minimal 5 karakter"),
});

type NurseFormData = z.infer<typeof nurseFormSchema>;

export default function AddNursePage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<NurseGenerationResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NurseFormData>({
    resolver: zodResolver(nurseFormSchema),
  });

  const onSubmit = async (data: NurseFormData) => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    
    try {
      const result = await nurseApi.generateNurse(token, data);
      setSuccessData(result);
    } catch (err: any) {
      console.error("Error generating nurse:", err);
      setError(err.response?.data?.message || err.message || "Gagal membuat akun perawat.");
    } finally {
      setIsLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Save className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akun Berhasil Dibuat!</h2>
          <p className="text-gray-600 mb-6">
            Akun perawat atas nama <span className="font-semibold">{successData.full_name || "Perawat"}</span> telah berhasil dibuat.
            Email aktivasi telah dikirim ke <span className="font-semibold">{successData.email}</span>.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Debug Info (Development Only)</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-700">Activation Link:</span>
            </div>
            <code className="block w-full bg-gray-200 p-2 rounded text-xs break-all">
              {successData.activation_link}
            </code>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setSuccessData(null);
                // navigate back to list
                router.push("/puskesmas/dashboard/perawat");
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar
            </Button>
            <Button onClick={() => setSuccessData(null)}>
              Tambah Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/puskesmas/dashboard/perawat" 
          className="text-sm text-gray-500 hover:text-[#3B9ECF] flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Perawat
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tambah Perawat Baru</h1>
        <p className="text-gray-600">
          Buat akun untuk tenaga kesehatan baru di Puskesmas Anda.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="nama_lengkap"
                placeholder="Nama lengkap perawat"
                className="pl-10"
                {...register("nama_lengkap")}
              />
            </div>
            {errors.nama_lengkap && (
              <p className="text-sm text-red-500">{errors.nama_lengkap.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="nomor_telepon"
                type="tel"
                placeholder="+6281234567890 atau 081234567890"
                className="pl-10"
                {...register("nomor_telepon")}
              />
            </div>
            {errors.nomor_telepon && (
              <p className="text-sm text-red-500">{errors.nomor_telepon.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Format: +62, 62, atau 0 diikuti 9-12 digit angka.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Perawat</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Email ini akan digunakan untuk mengirim link aktivasi akun.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nip">NIP (Nomor Induk Pegawai)</Label>
            <Input
              id="nip"
              placeholder="19xxxxxxxxxxxxxx"
              {...register("nip")}
            />
            {errors.nip && (
              <p className="text-sm text-red-500">{errors.nip.message}</p>
            )}
            <p className="text-xs text-gray-500">
              NIP akan digunakan sebagai password awal (sebelum diubah saat aktivasi).
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link href="/puskesmas/dashboard/perawat">
               <Button type="button" variant="ghost">Batal</Button>
            </Link>
            <Button type="submit" className="bg-[#3B9ECF] hover:bg-[#2d7ba8]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Generate Akun
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
