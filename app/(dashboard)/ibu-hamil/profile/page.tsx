"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ibuHamilProfileApi } from "@/lib/api/ibu-hamil-profile";
import type { IbuHamilProfileResponse } from "@/lib/types/ibu-hamil";
import { Loader2, MapPin, Phone, Mail, Calendar, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditProfileModal } from "@/components/ibu-hamil/edit-profile-modal";
import Image from "next/image";

export default function IbuHamilProfilePage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [profileData, setProfileData] = useState<IbuHamilProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const data = await ibuHamilProfileApi.getProfile(token);
      setProfileData(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
        router.push("/login");
        return;
    }
    fetchProfile();
  }, [token, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B9ECF]" />
      </div>
    );
  }

  if (!profileData) {
    return (
        <div className="p-8 text-center text-red-500">
            Gagal memuat profil. Silakan coba lagi.
        </div>
    );
  }

  const { ibu_hamil: ibuHamil, user: userData } = profileData;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white rounded-xl shadow-sm border">
         <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-4 border-[#3B9ECF]/10">
            <Image
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(ibuHamil.nama_lengkap)}&background=3B9ECF&color=fff&size=128`}
                alt={ibuHamil.nama_lengkap}
                fill
                className="object-cover"
            />
         </div>
         <div className="flex-1 space-y-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{ibuHamil.nama_lengkap}</h1>
                <p className="text-gray-500 flex items-center gap-1">
                    <Mail className="w-4 h-4" /> {userData.email}
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                 <Badge variant={userData.is_verified ? "default" : "secondary"} className={userData.is_verified ? "bg-green-500 hover:bg-green-600" : ""}>
                    {userData.is_verified ? <ShieldCheck className="w-3 h-3 mr-1"/> : null}
                    {userData.is_verified ? "Terverifikasi" : "Belum Terverifikasi"}
                 </Badge>
                 <Badge variant="outline" className="border-[#3B9ECF] text-[#3B9ECF]">
                    {userData.role}
                 </Badge>
            </div>
         </div>
         <div className="flex-shrink-0">
            <EditProfileModal 
                ibuHamil={ibuHamil} 
                onSuccess={fetchProfile}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2 shadow-sm border-gray-100">
             <CardHeader>
                 <CardTitle className="text-lg font-semibold text-gray-800">Informasi Pribadi</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Nama Lengkap</label>
                        <p className="mt-1 font-medium text-gray-900 flex items-center gap-2">
                           <User className="w-4 h-4 text-[#3B9ECF]" /> {ibuHamil.nama_lengkap}
                        </p>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-500">NIK (Nomor Induk Kependudukan)</label>
                        <p className="mt-1 font-medium text-gray-900">{ibuHamil.nik || "-"}</p>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-500">Nomor Telepon</label>
                        <p className="mt-1 font-medium text-gray-900 flex items-center gap-2">
                             <Phone className="w-4 h-4 text-[#3B9ECF]" /> {userData.phone || "-"}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Tanggal Lahir</label>
                        <p className="mt-1 font-medium text-gray-900 flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-[#3B9ECF]" /> {ibuHamil.date_of_birth}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t">
                     <label className="text-sm font-medium text-gray-500 mb-2 block">Alamat Lengkap</label>
                     <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#3B9ECF] mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-gray-900">{ibuHamil.address}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {ibuHamil.kelurahan}, {ibuHamil.kecamatan}, {ibuHamil.kota_kabupaten}, {ibuHamil.provinsi}
                            </p>
                            <div className="mt-2 text-xs text-gray-400">
                                Koordinat: {ibuHamil.location[0]}, {ibuHamil.location[1]}
                            </div>
                        </div>
                     </div>
                </div>
             </CardContent>
          </Card>
            
          {/* Side Status */}
          <div className="space-y-6">
             <Card className="shadow-sm border-gray-100">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Status Akun</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Status Aktif</span>
                            <Badge variant={ibuHamil.is_active ? "default" : "destructive"}>
                                {ibuHamil.is_active ? "Aktif" : "Non-Aktif"}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Role ID</span>
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{userData.id}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Profil ID</span>
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{ibuHamil.id}</span>
                        </div>
                     </div>
                </CardContent>
             </Card>
          </div>
      </div>
    </div>
  );
}
