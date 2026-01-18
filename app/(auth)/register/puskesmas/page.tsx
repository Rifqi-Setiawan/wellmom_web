"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/forms/file-upload";
import { InteractiveMap } from "@/components/maps/interactive-map";
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react";

interface RegistrationData {
  name: string;
  email: string;
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
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
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

  const updateFormData = (
    field: keyof RegistrationData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const requestBody = {
        address: formData.address,
        building_photo_url: formData.building_photo_url || "/files/gedung.jpg",
        data_truth_confirmed: formData.data_truth_confirmed,
        email: formData.email,
        kepala_name: formData.kepala_name,
        kepala_nip: formData.kepala_nip,
        latitude: formData.latitude,
        longitude: formData.longitude,
        name: formData.name,
        npwp: formData.npwp,
        npwp_document_url: formData.npwp_document_url || "/files/npwp.pdf",
        phone: formData.phone,
        registration_status: "pending_approval",
        sk_document_url: formData.sk_document_url || "/files/sk_pendirian.pdf",
      };

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiBaseUrl}/api/v1/puskesmas/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // Registrasi berhasil - redirect ke halaman login
        router.push("/login?registered=true");
      } else {
        // Handle error response
        const errorMsg = data?.message || data?.error || "Registrasi gagal. Silakan coba lagi.";
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Langkah 1: Data Puskesmas & Penanggung Jawab
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Puskesmas</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Masukkan nama puskesmas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Resmi</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="admin@puskesmas.go.id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="+62812345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  placeholder="Jl. Merdeka No. 1, Sungai Penuh, Jambi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kepala_name">Nama Kepala Puskesmas</Label>
                <Input
                  id="kepala_name"
                  value={formData.kepala_name}
                  onChange={(e) =>
                    updateFormData("kepala_name", e.target.value)
                  }
                  placeholder="dr. Rina"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kepala_nip">NIP Kepala Puskesmas</Label>
              <Input
                id="kepala_nip"
                value={formData.kepala_nip}
                onChange={(e) => updateFormData("kepala_nip", e.target.value)}
                placeholder="198012312010012001"
              />
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
                  <Label>SK Pendirian (PDF)</Label>
                  <FileUpload
                    onUpload={(url) => updateFormData("sk_document_url", url)}
                    acceptedTypes=".pdf"
                    maxSize={5}
                    uploadText="Drag & Drop atau Cari File"
                    subtitle="Maks. 5MB"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Scan NPWP</Label>
                  <FileUpload
                    onUpload={(url) => updateFormData("npwp_document_url", url)}
                    acceptedTypes=".pdf,.jpg,.png"
                    maxSize={5}
                    uploadText="Upload Gambar/PDF"
                    subtitle="Format: JPG, PNG, PDF"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Foto Gedung Utama</Label>
                  <FileUpload
                    onUpload={(url) =>
                      updateFormData("building_photo_url", url)
                    }
                    acceptedTypes=".jpg,.png"
                    maxSize={5}
                    uploadText="Ambil Foto atau Upload"
                    subtitle="Minimal 3 sisi berbeda"
                  />
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

            {/* Info tentang proses verifikasi */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong> Setelah registrasi, akun Anda akan direview oleh Super Admin. 
                Proses verifikasi biasanya memakan waktu 1-3 hari kerja.
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

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Lanjutkan
                <ChevronRight className="w-4 h-4" />
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
