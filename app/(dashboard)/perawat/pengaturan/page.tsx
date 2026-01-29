"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Shield, Users } from "lucide-react";
import type { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { nurseApi } from "@/lib/api/nurse";
import type {
  PerawatProfile,
  PatientsResponse,
  ProfileUpdateRequest,
  CredentialsUpdateRequest,
} from "@/lib/types/perawat";

import { ProfileTab } from "@/components/perawat/settings/profile-tab";
import { SecurityTab } from "@/components/perawat/settings/security-tab";
import { PatientsTab } from "@/components/perawat/settings/patients-tab";

export default function SettingsPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "patients"
  >("profile");

  const [profile, setProfile] = useState<PerawatProfile | null>(null);
  const [patientsData, setPatientsData] = useState<PatientsResponse | null>(
    null,
  );

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Fetch Profile Data
  const fetchProfile = async () => {
    if (!token) return;
    setIsLoadingProfile(true);
    try {
      const data = await nurseApi.getMe(token);
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch Patients Data
  const fetchPatients = async () => {
    if (!token) return;
    setIsLoadingPatients(true);
    try {
      const data = await nurseApi.getMePatients(token);
      setPatientsData(data);
    } catch (error) {
      console.error("Failed to fetch patients stats", error);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "patients" && !patientsData && token) {
      fetchPatients();
    }
  }, [activeTab, patientsData, token]);

  const handleUpdateProfile = async (data: ProfileUpdateRequest) => {
    if (!token) return;
    setIsUpdating(true);
    try {
      await nurseApi.updateProfile(token, data);
      alert("Profil berhasil diperbarui!");
      fetchProfile(); // Refresh data
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Update profile failed", error);
      alert(axiosError.response?.data?.message || "Gagal memperbarui profil.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateCredentials = async (data: CredentialsUpdateRequest) => {
    if (!token) return;
    setIsUpdating(true);
    try {
      await nurseApi.updateCredentials(token, data);
      alert("Data keamanan berhasil diperbarui!");
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      console.error("Update credentials failed", error);
      alert(
        axiosError.response?.data?.detail || "Gagal memperbarui data keamanan.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    if (!token || !profile) return;
    setIsUploadingPhoto(true);
    try {
      const response = await nurseApi.uploadProfilePhoto(
        token,
        profile.id,
        file,
      );
      // Assuming response contains file_url or we refresh profile
      alert("Foto profil berhasil diubah!");
      fetchProfile();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Upload photo failed", error);
      alert(
        axiosError.response?.data?.message || "Gagal mengupload foto profil.",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (!user || !token) {
    return <div className="p-8 text-center">Silakan login kembali.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="-ml-2 mb-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Pengaturan Profil
            </h1>
            <p className="text-gray-600">
              Kelola informasi akun dan preferensi Anda.
            </p>
          </div>
        </div>

        {/* Tabs & Content Layout */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Navigation */}
          <nav className="w-full md:w-64 flex flex-row md:flex-col gap-1 bg-white p-2 rounded-xl border border-gray-200 shadow-sm sticky top-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "profile"
                  ? "bg-blue-50 text-[#3B9ECF]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <User className="w-4 h-4" />
              Profil Saya
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-blue-50 text-[#3B9ECF]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Shield className="w-4 h-4" />
              Keamanan
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "patients"
                  ? "bg-blue-50 text-[#3B9ECF]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Users className="w-4 h-4" />
              Pasien Saya
            </button>
          </nav>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            {activeTab === "profile" && (
              <ProfileTab
                profile={profile}
                isLoading={isLoadingProfile}
                onUpdateProfile={handleUpdateProfile}
                onUploadPhoto={handleUploadPhoto}
                isUpdating={isUpdating}
                isUploadingPhoto={isUploadingPhoto}
              />
            )}

            {activeTab === "security" && (
              <SecurityTab
                email={profile?.email || ""}
                onUpdateCredentials={handleUpdateCredentials}
                isUpdating={isUpdating}
              />
            )}

            {activeTab === "patients" && (
              <PatientsTab data={patientsData} isLoading={isLoadingPatients} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
