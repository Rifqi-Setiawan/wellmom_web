"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/forms/file-upload";
import { InteractiveMap } from "@/components/maps/interactive-map";
import { ChevronLeft, ChevronRight, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { puskesmasRegistrationApi } from "@/lib/api/puskesmas-registration";

interface RegistrationData {
  name: string;
  email: string;
  password: string; // [NEW] Added password
  phone: string;
  address: string;
  kepala_name: string;
  kepala_nip: string;
  npwp: string;
  npwp_document_url: string;
  sk_document_url: string;
  building_photo_url: string;
  latitude: number;
  longitude: number;
  data_truth_confirmed: boolean;
}

// Interface untuk menyimpan file sebelum upload
interface FileData {
  sk_document: File | null;
  npwp_document: File | null;
  building_photo: File | null;
}

const steps = [
  { id: 1, title: "Data Puskesmas" },
  { id: 2, title: "Legalitas & Dokumen" },
  { id: 3, title: "Lokasi Pelayanan" },
  { id: 4, title: "Konfirmasi" },
];

export default function PuskesmasRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [puskesmasId, setPuskesmasId] = useState<number | null>(null); // Simpan ID dari Step 1
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    password: "", // [NEW] Initial empty password
    phone: "",
    address: "",
    kepala_name: "",
    kepala_nip: "",
    npwp: "",
    npwp_document_url: "",
    sk_document_url: "",
    building_photo_url: "",
    latitude: -6.2088,
    longitude: 106.8456,
    data_truth_confirmed: false,
  });

  // State untuk menyimpan file sementara sebelum submit
  const [files, setFiles] = useState<FileData>({
    sk_document: null,
    npwp_document: null,
    building_photo: null,
  });

  // State untuk tracking upload progress
  const [uploadProgress, setUploadProgress] = useState({
    sk: false,
    npwp: false,
    photo: false,
  });

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const updateFormData = (
    field: keyof RegistrationData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateFile = (field: keyof FileData, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  // Validasi Step 1
  const validateStep1 = (): boolean => {
    if (!formData.name || formData.name.length < 3 || formData.name.length > 255) {
      setErrorMessage("Nama Puskesmas harus 3-255 karakter");
      return false;
    }
    if (!formData.address || formData.address.length < 5) {
      setErrorMessage("Alamat harus minimal 5 karakter");
      return false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage("Format email tidak valid");
      return false;
    }
    // [NEW] Password validation
    if (!formData.password || formData.password.length < 8) {
      setErrorMessage("Password harus minimal 8 karakter");
      return false;
    }
    if (!formData.phone || formData.phone.length < 8) {
      setErrorMessage("Nomor telepon harus minimal 8 digit");
      return false;
    }
    if (!formData.kepala_name || formData.kepala_name.length < 3 || formData.kepala_name.length > 255) {
      setErrorMessage("Nama Kepala Puskesmas harus 3-255 karakter");
      return false;
    }
    if (!formData.kepala_nip || formData.kepala_nip.length < 5) {
      setErrorMessage("NIP Kepala Puskesmas harus minimal 5 karakter");
      return false;
    }
    return true;
  };

  // Validasi Step 2
  const validateStep2 = (): boolean => {
    if (!files.sk_document) {
      setErrorMessage("SK Pendirian wajib diupload");
      return false;
    }
    if (!files.building_photo) {
      setErrorMessage("Foto Gedung wajib diupload");
      return false;
    }
    return true;
  };

  // Validasi Step 3
  const validateStep3 = (): boolean => {
    if (!formData.data_truth_confirmed) {
      setErrorMessage("Anda harus menyetujui pernyataan kebenaran data");
      return false;
    }
    if (!puskesmasId) {
      setErrorMessage("Data registrasi tidak ditemukan. Silakan mulai dari awal.");
      return false;
    }
    return true;
  };

  // Step 1: Register dengan status draft
  const handleStep1Next = async () => {
    setErrorMessage("");
    
    if (!validateStep1()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await puskesmasRegistrationApi.registerStep1({
        name: formData.name,
        address: formData.address,
        email: formData.email,
        password: formData.password, // [NEW] Send password to API
        phone: formData.phone,
        kepala_name: formData.kepala_name,
        kepala_nip: formData.kepala_nip,
        npwp: formData.npwp || undefined,
        sk_document_url: "",
        building_photo_url: "",
        latitude: 0,
        longitude: 0,
        data_truth_confirmed: false,
        registration_status: "draft",
      });

      // Simpan puskesmas_id untuk step selanjutnya
      setPuskesmasId(response.puskesmas.id);
      console.log("✅ Puskesmas ID saved:", response.puskesmas.id);
      
      // Lanjut ke step 2
      setCurrentStep(2);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Upload dokumen
  const handleStep2Next = async () => {
    setErrorMessage("");
    
    if (!validateStep2()) {
      return;
    }

    if (!puskesmasId) {
      setErrorMessage("Data registrasi tidak ditemukan. Silakan mulai dari awal.");
      return;
    }

    setIsLoading(true);
    setUploadProgress({ sk: false, npwp: false, photo: false });

    try {
      // Upload SK Pendirian (WAJIB)
      if (files.sk_document) {
        setUploadProgress((prev) => ({ ...prev, sk: true }));
        await puskesmasRegistrationApi.uploadSKPendirian(puskesmasId, files.sk_document);
        setUploadProgress((prev) => ({ ...prev, sk: false }));
      }

      // Upload NPWP (OPSIONAL)
      if (files.npwp_document) {
        setUploadProgress((prev) => ({ ...prev, npwp: true }));
        await puskesmasRegistrationApi.uploadNPWP(puskesmasId, files.npwp_document);
        setUploadProgress((prev) => ({ ...prev, npwp: false }));
      }

      // Upload Foto Gedung (WAJIB)
      if (files.building_photo) {
        setUploadProgress((prev) => ({ ...prev, photo: true }));
        await puskesmasRegistrationApi.uploadFotoGedung(puskesmasId, files.building_photo);
        setUploadProgress((prev) => ({ ...prev, photo: false }));
      }

      // Lanjut ke step 3
      setCurrentStep(3);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload dokumen gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setUploadProgress({ sk: false, npwp: false, photo: false });
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      handleStep1Next();
    } else if (currentStep === 2) {
      handleStep2Next();
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step 3: Submit untuk verifikasi
  const handleSubmit = async () => {
    setErrorMessage("");

    if (!validateStep3()) {
      return;
    }

    if (!puskesmasId) {
      setErrorMessage("Data registrasi tidak ditemukan. Silakan mulai dari awal.");
      return;
    }

    setIsLoading(true);

    try {
      // Update lokasi dan ubah status ke pending_approval
      await puskesmasRegistrationApi.submitStep3(puskesmasId, {
        latitude: formData.latitude,
        longitude: formData.longitude,
        data_truth_confirmed: formData.data_truth_confirmed,
        registration_status: "pending_approval",
      });

      // Registrasi berhasil - redirect ke halaman login dengan info login
      router.push(
        `/login?registered=true&phone=${encodeURIComponent(formData.phone)}&password=${encodeURIComponent(formData.kepala_nip)}`
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Submit gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Langkah 1: Data Puskesmas & Penanggung Jawab
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Lengkapi identitas puskesmas dan informasi akun penanggung jawab.
              </p>
            </div>

            {/* Section: Profil Puskesmas */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-blue-600 border-b border-gray-100 pb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Profil Puskesmas
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Puskesmas</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Contoh: Puskesmas Sungai Penuh"
                    className="focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    placeholder="Jl. Merdeka No. 1, Sungai Penuh, Jambi"
                    className="focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section: Informasi Akun & Kontak */}
            <div className="space-y-4">
               <h3 className="text-base font-medium text-blue-600 border-b border-gray-100 pb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Informasi Akun & Kontak
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Resmi</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="admin@puskesmas.go.id"
                    className="focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon (Username)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+62812345678"
                    className="focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="pr-10 focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Gunakan kombinasi huruf dan angka untuk keamanan.
                  </p>
                </div>
              </div>
            </div>

            {/* Section: Kepala Puskesmas */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-blue-600 border-b border-gray-100 pb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Kepala Puskesmas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="kepala_name">Nama Lengkap</Label>
                  <Input
                    id="kepala_name"
                    value={formData.kepala_name}
                    onChange={(e) => updateFormData("kepala_name", e.target.value)}
                    placeholder="Contoh: dr. Rina Santoso"
                    className="focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kepala_nip">NIP</Label>
                  <Input
                    id="kepala_nip"
                    value={formData.kepala_nip}
                    onChange={(e) => updateFormData("kepala_nip", e.target.value)}
                    placeholder="Contoh: 198012312010012001"
                    className="focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Langkah 2: Legalitas & Dokumen
              </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="npwp">NPWP Puskesmas</Label>
                <Input
                  id="npwp"
                  value={formData.npwp}
                  onChange={(e) => updateFormData("npwp", e.target.value)}
                  placeholder="12.345.678.9-012.345"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>
                    SK Pendirian (PDF) <span className="text-red-500">*</span>
                  </Label>
                  <FileUpload
                    deferUpload={true}
                    onFileChange={(file) => updateFile("sk_document", file)}
                    acceptedTypes=".pdf"
                    maxSize={2}
                    uploadText="Drag & Drop atau Cari File"
                    subtitle="Maks. 2MB, PDF"
                  />
                  {uploadProgress.sk && (
                    <p className="text-xs text-blue-600">Mengupload...</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Scan NPWP (Opsional)</Label>
                  <FileUpload
                    deferUpload={true}
                    onFileChange={(file) => updateFile("npwp_document", file)}
                    acceptedTypes=".pdf,.jpg,.jpeg"
                    maxSize={2}
                    uploadText="Upload Gambar/PDF"
                    subtitle="Format: JPG, JPEG, PDF, Maks. 2MB"
                  />
                  {uploadProgress.npwp && (
                    <p className="text-xs text-blue-600">Mengupload...</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Foto Gedung Utama <span className="text-red-500">*</span>
                  </Label>
                  <FileUpload
                    deferUpload={true}
                    onFileChange={(file) => updateFile("building_photo", file)}
                    acceptedTypes=".jpg,.jpeg,.png"
                    maxSize={2}
                    uploadText="Ambil Foto atau Upload"
                    subtitle="Format: JPG, JPEG, PNG, Maks. 2MB"
                  />
                  {uploadProgress.photo && (
                    <p className="text-xs text-blue-600">Mengupload...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Langkah 3: Lokasi Pelayanan
              </h2>
              <p className="text-gray-600">
                Silakan tentukan titik lokasi Puskesmas pada peta di bawah ini.
                Pastikan titik koordinat sesuai dengan lokasi fisik.
              </p>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              <InteractiveMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng) => {
                  updateFormData("latitude", lat);
                  updateFormData("longitude", lng);
                }}
                zoom={15}
                height="400px"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    updateFormData("latitude", parseFloat(e.target.value) || 0)
                  }
                  placeholder="-2.0645"
                  className="bg-gray-100"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    updateFormData("longitude", parseFloat(e.target.value) || 0)
                  }
                  placeholder="101.3912"
                  className="bg-gray-100"
                  readOnly
                />
              </div>
            </div>

            {/* Pernyataan Kebenaran Data di Step 3 */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-4">
                Pernyataan Kebenaran Data
              </h3>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="data_truth_confirmed"
                  checked={formData.data_truth_confirmed}
                  onCheckedChange={(checked) =>
                    updateFormData("data_truth_confirmed", checked === true)
                  }
                />
                <Label
                  htmlFor="data_truth_confirmed"
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                >
                  Saya menyatakan bahwa seluruh data yang telah diisi dalam
                  formulir ini adalah benar dan dapat dipertanggungjawabkan
                  sesuai dengan peraturan perundang-undangan yang berlaku. Saya
                  bersedia menerima sanksi administratif apabila di kemudian
                  hari ditemukan data yang tidak sesuai.
                </Label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Langkah 4: Konfirmasi
              </h2>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-4">
                Pernyataan Kebenaran Data
              </h3>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="data_truth_confirmed"
                  checked={formData.data_truth_confirmed}
                  onCheckedChange={(checked) =>
                    updateFormData("data_truth_confirmed", checked === true)
                  }
                />
                <Label
                  htmlFor="data_truth_confirmed"
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                >
                  Saya menyatakan bahwa seluruh data yang telah diisi dalam
                  formulir ini adalah benar dan dapat dipertanggungjawabkan
                  sesuai dengan peraturan perundang-undangan yang berlaku. Saya
                  bersedia menerima sanksi administratif apabila di kemudian
                  hari ditemukan data yang tidak sesuai.
                </Label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Terakhir disimpan:</strong> Hari ini,{" "}
                {new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            {/* Info Login */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Info Login:</strong> Setelah registrasi, Anda dapat login menggunakan:
                <br />
                • <strong>Username:</strong> Nomor telepon yang didaftarkan ({formData.phone || "..."})
                <br />
                • <strong>Password:</strong> NIP Kepala Puskesmas ({formData.kepala_nip ? "***" : "..."})
              </p>
            </div>

            {/* Info tentang proses verifikasi */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong> Setelah registrasi, akun Anda akan
                direview oleh Super Admin. Proses verifikasi biasanya memakan
                waktu 1-3 hari kerja.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Alur Registrasi Puskesmas Baru
          </h1>
          <p className="text-gray-600">
            Silakan lengkapi data registrasi mandiri di bawah ini secara akurat
            untuk proses validasi.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`
                  flex-1 py-4 px-2 text-sm font-medium border-b-2 transition-colors
                  ${
                    currentStep === step.id
                      ? "border-blue-600 text-blue-600"
                      : currentStep > step.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span
                      className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs
                      ${
                        currentStep === step.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }
                    `}
                    >
                      {step.id}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow-sm rounded-lg p-8 mb-8">
          {errorMessage && currentStep !== 4 && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center bg-white shadow-sm rounded-lg p-4">
          <div className="text-sm text-gray-500">
            Terakhir disimpan: Hari ini,{" "}
            {new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            WIB
          </div>

          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjutkan
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : currentStep === 3 ? (
              <Button
                onClick={handleSubmit}
                disabled={!formData.data_truth_confirmed || isLoading}
                className="bg-blue-600 hover:bg-blue-700 min-w-[180px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Kirim untuk Verifikasi"
                )}
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  disabled={isLoading}
                >
                  Simpan sebagai Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.data_truth_confirmed || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 min-w-[180px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Kirim untuk Verifikasi"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
