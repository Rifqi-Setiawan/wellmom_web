"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, Save, User, Phone, Briefcase, MapPin, Mail, Calendar, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "./stat-card";
import { PhotoUploader } from "./photo-uploader";
import { profileUpdateSchema } from "@/lib/schemas/perawat-profile";
import type { PerawatProfile } from "@/lib/types/perawat";

interface ProfileTabProps {
  profile: PerawatProfile | null;
  isLoading: boolean;
  onUpdateProfile: (data: any) => Promise<void>;
  onUploadPhoto: (file: File) => Promise<void>;
  isUpdating: boolean;
  isUploadingPhoto: boolean;
}

export function ProfileTab({ 
  profile, 
  isLoading, 
  onUpdateProfile, 
  onUploadPhoto,
  isUpdating,
  isUploadingPhoto
}: ProfileTabProps) {
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      nama_lengkap: "",
      nomor_hp: "",
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        nama_lengkap: profile.nama_lengkap,
        nomor_hp: profile.nomor_hp,
      });
    }
  }, [profile, reset]);

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "d MMM yyyy", { locale: id });
  };

  return (
    <div className="space-y-8">
      {/* 1. Photo & Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <PhotoUploader 
            currentPhoto={profile.profile_photo_url} 
            onPhotoChange={onUploadPhoto}
            isUploading={isUploadingPhoto}
          />
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
           <h3 className="text-sm font-semibold text-gray-700">Statistik Cepat</h3>
           <StatCard 
             title="Pasien Aktif" 
             value={profile.current_patients} 
             color="blue" 
             icon={User}
           />
           <div className="grid grid-cols-2 gap-2">
             <StatCard 
               title="Bergabung" 
               value={formatDate(profile.created_at)} 
               color="gray" 
               className="text-sm"
             />
             <StatCard 
                title="Diupdate" 
                value={formatDate(profile.updated_at)} 
                color="gray" 
                className="text-sm"
             />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Personal Information Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#3B9ECF]" />
              Informasi Personal
            </h3>
            
            <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                  <Input 
                    id="nama_lengkap" 
                    {...register("nama_lengkap")} 
                    disabled={isUpdating}
                  />
                  {errors.nama_lengkap && (
                    <p className="text-xs text-red-500">{errors.nama_lengkap.message as string}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomor_hp">Nomor HP</Label>
                  <Input 
                    id="nomor_hp" 
                    {...register("nomor_hp")} 
                    disabled={isUpdating}
                  />
                  {errors.nomor_hp && (
                    <p className="text-xs text-red-500">{errors.nomor_hp.message as string}</p>
                  )}
                </div>
              </div>

               {/* Read Only Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="space-y-2">
                  <Label className="text-gray-500 text-xs uppercase tracking-wide">NIP (Nomor Induk Perawat)</Label>
                  <div className="flex items-center gap-2 font-mono text-sm text-gray-700 font-medium">
                     <Briefcase className="w-4 h-4 text-gray-400" />
                     {profile.nip}
                  </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-gray-500 text-xs uppercase tracking-wide">Email Terdaftar</Label>
                   <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                     <Mail className="w-4 h-4 text-gray-400" />
                     {profile.email}
                   </div>
                   <p className="text-[10px] text-gray-400">
                     *Untuk mengubah email silakan ke tab Keamanan
                   </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isUpdating || !isDirty}
                  className="bg-[#3B9ECF] hover:bg-[#2d7ba8]"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* 3. Puskesmas Info (Read Only) */}
        <div>
           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#3B9ECF]" />
                Info Puskesmas
             </h3>
             
             {profile.puskesmas ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Nama Puskesmas</Label>
                    <p className="font-medium text-gray-900 mt-1">{profile.puskesmas.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Alamat</Label>
                    <p className="text-sm text-gray-700 mt-1">{profile.puskesmas.address || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Telepon Kantor</Label>
                    <p className="text-sm text-gray-700 mt-1">{profile.puskesmas.phone || "-"}</p>
                  </div>
                </div>
             ) : (
                <p className="text-sm text-gray-500 italic">Data Puskesmas tidak tersedia.</p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
