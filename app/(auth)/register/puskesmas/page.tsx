"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/forms/file-upload";
import { InteractiveMap } from "@/components/maps/interactive-map";
import { ChevronLeft, ChevronRight, CheckCircle, Loader2, Eye, EyeOff, AlertCircle, Navigation } from "lucide-react";
import { puskesmasRegistrationApi } from "@/lib/api/puskesmas-registration";
import { useToast } from "@/hooks/use-toast";

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

// Interface untuk field-level errors
interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  kepala_name?: string;
  kepala_nip?: string;
  npwp?: string;
  sk_document?: string;
  npwp_document?: string;
  building_photo?: string;
  latitude?: string;
  longitude?: string;
  data_truth_confirmed?: string;
}

const steps = [
  { id: 1, title: "Data Puskesmas" },
  { id: 2, title: "Legalitas & Dokumen" },
  { id: 3, title: "Lokasi Pelayanan" },
  { id: 4, title: "Konfirmasi" },
];

export default function PuskesmasRegistrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [puskesmasId, setPuskesmasId] = useState<number | null>(null); // Simpan ID dari Step 1
  const [completedSteps, setCompletedSteps] = useState<number[]>([]); // Track step yang sudah selesai
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

  // State for geolocation
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const updateFormData = (
    field: keyof RegistrationData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateFile = (field: keyof FileData, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    // Clear error when file is selected
    if (file) {
      console.log(`File selected for ${field}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      // Clear error untuk field ini
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      // Jika file dihapus, clear error juga
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Fungsi untuk deteksi lokasi saat ini
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Tidak Didukung",
        description: "Browser Anda tidak mendukung fitur geolocation. Silakan gunakan peta untuk memilih lokasi secara manual.",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Update koordinat di form data
        updateFormData("latitude", lat);
        updateFormData("longitude", lng);
        
        // Clear error untuk koordinat
        clearFieldError("latitude");
        clearFieldError("longitude");
        
        setIsGettingLocation(false);
        
        toast({
          title: "Lokasi Berhasil Dideteksi",
          description: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}. Silakan periksa lokasi di peta dan sesuaikan jika perlu.`,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsGettingLocation(false);
        
        let errorMessage = "Gagal mendapatkan lokasi saat ini.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Izin akses lokasi ditolak. Silakan berikan izin akses lokasi di pengaturan browser Anda.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Informasi lokasi tidak tersedia. Silakan gunakan peta untuk memilih lokasi secara manual.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Waktu permintaan lokasi habis. Silakan coba lagi atau gunakan peta untuk memilih lokasi secara manual.";
        }
        
        toast({
          variant: "destructive",
          title: "Gagal Mendapatkan Lokasi",
          description: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Helper function to clear field error
  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Helper function to set field error
  const setFieldError = (field: keyof FieldErrors, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  };

  // Fungsi untuk mengecek apakah bisa navigasi ke step tertentu
  const canNavigateToStep = (targetStep: number): boolean => {
    // Selalu bisa ke step 1
    if (targetStep === 1) return true;
    
    // Untuk step 2, harus sudah selesai step 1
    if (targetStep === 2) {
      return completedSteps.includes(1);
    }
    
    // Untuk step 3, harus sudah selesai step 1 dan 2
    if (targetStep === 3) {
      return completedSteps.includes(1) && completedSteps.includes(2);
    }
    
    // Untuk step 4, harus sudah selesai step 1, 2, dan 3
    if (targetStep === 4) {
      return completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
    }
    
    return false;
  };

  // Handler untuk navigasi step dari stepper
  const handleStepNavigation = (targetStep: number) => {
    // Jika target step sama dengan current step, tidak perlu navigasi
    if (targetStep === currentStep) return;
    
    // Jika target step lebih kecil dari current step, selalu bisa (backward navigation)
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    
    // Jika target step lebih besar, cek apakah bisa navigasi
    if (!canNavigateToStep(targetStep)) {
      toast({
        variant: "destructive",
        title: "Tidak Dapat Melanjutkan",
        description: `Silakan lengkapi tahap ${targetStep - 1} terlebih dahulu sebelum melanjutkan ke tahap ${targetStep}.`,
      });
      return;
    }
    
    // Jika bisa, navigasi ke step tersebut
    setCurrentStep(targetStep);
  };

  // Validasi Step 1 dengan field-level errors
  const validateStep1 = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    // Validasi Nama Puskesmas
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = "Nama Puskesmas wajib diisi";
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      errors.name = "Nama Puskesmas minimal 3 karakter";
      isValid = false;
    } else if (formData.name.length > 255) {
      errors.name = "Nama Puskesmas maksimal 255 karakter";
      isValid = false;
    }

    // Validasi Alamat
    if (!formData.address || formData.address.trim().length === 0) {
      errors.address = "Alamat wajib diisi";
      isValid = false;
    } else if (formData.address.trim().length < 10) {
      errors.address = "Alamat minimal 10 karakter";
      isValid = false;
    }

    // Validasi Email
    if (!formData.email || formData.email.trim().length === 0) {
      errors.email = "Email wajib diisi";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Format email tidak valid (contoh: admin@puskesmas.go.id)";
        isValid = false;
      }
    }

    // Validasi Password
    if (!formData.password || formData.password.length === 0) {
      errors.password = "Password wajib diisi";
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = "Password minimal 8 karakter";
      isValid = false;
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      errors.password = "Password harus mengandung huruf dan angka";
      isValid = false;
    }

    // Validasi Nomor Telepon
    if (!formData.phone || formData.phone.trim().length === 0) {
      errors.phone = "Nomor telepon wajib diisi";
      isValid = false;
    } else {
      const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
      const cleanPhone = formData.phone.replace(/\s/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = "Format nomor telepon tidak valid (contoh: +62812345678 atau 0812345678)";
        isValid = false;
      }
    }

    // Validasi Nama Kepala Puskesmas
    if (!formData.kepala_name || formData.kepala_name.trim().length === 0) {
      errors.kepala_name = "Nama Kepala Puskesmas wajib diisi";
      isValid = false;
    } else if (formData.kepala_name.trim().length < 3) {
      errors.kepala_name = "Nama Kepala Puskesmas minimal 3 karakter";
      isValid = false;
    } else if (formData.kepala_name.length > 255) {
      errors.kepala_name = "Nama Kepala Puskesmas maksimal 255 karakter";
      isValid = false;
    }

    // Validasi NIP
    if (!formData.kepala_nip || formData.kepala_nip.trim().length === 0) {
      errors.kepala_nip = "NIP wajib diisi";
      isValid = false;
    } else {
      const nipRegex = /^[0-9]{18}$/;
      const cleanNip = formData.kepala_nip.replace(/\s/g, "");
      if (!nipRegex.test(cleanNip)) {
        errors.kepala_nip = "NIP harus terdiri dari 18 digit angka";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Helper function untuk validasi tipe file berdasarkan MIME type dan ekstensi
  const isValidFileType = (file: File, allowedMimeTypes: string[], allowedExtensions: string[]): boolean => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // Normalisasi allowed types
    const normalizedAllowedTypes = allowedMimeTypes.map(t => t.toLowerCase());
    const normalizedAllowedExtensions = allowedExtensions.map(ext => {
      const normalized = ext.toLowerCase();
      return normalized.startsWith('.') ? normalized : `.${normalized}`;
    });
    
    // Cek MIME type dengan berbagai variasi
    const mimeTypeValid = normalizedAllowedTypes.some(allowedType => {
      // Exact match
      if (fileType === allowedType) return true;
      
      // Handle variations: image/jpeg vs image/jpg
      if ((fileType === 'image/jpeg' || fileType === 'image/jpg') && 
          (allowedType === 'image/jpeg' || allowedType === 'image/jpg')) {
        return true;
      }
      
      // Handle empty MIME type (beberapa browser tidak detect dengan benar)
      if (!fileType || fileType === '' || fileType === 'application/octet-stream') {
        // Fallback ke ekstensi
        return false;
      }
      
      return false;
    });
    
    // Jika MIME type valid, return true
    if (mimeTypeValid) {
      console.log(`File type valid (MIME): ${file.name} - ${fileType}`);
      return true;
    }
    
    // Fallback: cek ekstensi file (penting untuk browser yang tidak detect MIME type dengan benar)
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const extensionValid = normalizedAllowedExtensions.some(ext => {
      return fileName.endsWith(ext);
    });
    
    if (extensionValid) {
      console.log(`File type valid (extension): ${file.name} - ${fileExtension}`);
      return true;
    }
    
    console.warn(`File type invalid: ${file.name} - MIME: ${fileType}, Extension: ${fileExtension}`);
    return false;
  };

  // Validasi Step 2 dengan validasi file
  const validateStep2 = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    // Validasi SK Pendirian (WAJIB)
    if (!files.sk_document) {
      errors.sk_document = "SK Pendirian wajib diupload";
      isValid = false;
    } else {
      // Log untuk debugging
      console.log('SK Document validation:', {
        name: files.sk_document.name,
        type: files.sk_document.type,
        size: files.sk_document.size,
      });

      // Validasi ukuran file (max 5MB)
      if (files.sk_document.size > 5 * 1024 * 1024) {
        errors.sk_document = "Ukuran file maksimal 5MB";
        isValid = false;
      }
      // Validasi tipe file (PDF) - lebih fleksibel
      const isValidPDF = isValidFileType(
        files.sk_document,
        ["application/pdf"],
        [".pdf"]
      );
      if (!isValidPDF) {
        console.error('SK Document type validation failed:', files.sk_document.type);
        errors.sk_document = "File harus berupa PDF";
        isValid = false;
      }
    }

    // Validasi NPWP Document (OPSIONAL, tapi jika diupload harus valid)
    if (files.npwp_document) {
      // Log untuk debugging
      console.log('NPWP Document validation:', {
        name: files.npwp_document.name,
        type: files.npwp_document.type,
        size: files.npwp_document.size,
      });

      if (files.npwp_document.size > 5 * 1024 * 1024) {
        errors.npwp_document = "Ukuran file maksimal 5MB";
        isValid = false;
      }
      // Backend hanya menerima PDF atau JPG/JPEG untuk NPWP (BUKAN PNG)
      const isValidNPWP = isValidFileType(
        files.npwp_document,
        ["image/jpeg", "image/jpg", "application/pdf"],
        [".jpg", ".jpeg", ".pdf"]
      );
      if (!isValidNPWP) {
        console.error('NPWP Document type validation failed:', files.npwp_document.type);
        errors.npwp_document = "NPWP harus berformat PDF atau JPG/JPEG";
        isValid = false;
      }
    }

    // Validasi Foto Gedung (WAJIB)
    if (!files.building_photo) {
      errors.building_photo = "Foto Gedung wajib diupload";
      isValid = false;
    } else {
      // Log untuk debugging
      console.log('Building Photo validation:', {
        name: files.building_photo.name,
        type: files.building_photo.type,
        size: files.building_photo.size,
      });

      // Validasi ukuran file (max 5MB)
      if (files.building_photo.size > 5 * 1024 * 1024) {
        errors.building_photo = "Ukuran file maksimal 5MB";
        isValid = false;
      }
      // Validasi tipe file (Image) - lebih fleksibel
      const isValidImage = isValidFileType(
        files.building_photo,
        ["image/jpeg", "image/jpg", "image/png"],
        [".jpg", ".jpeg", ".png"]
      );
      if (!isValidImage) {
        console.error('Building Photo type validation failed:', files.building_photo.type);
        errors.building_photo = "File harus berupa JPG atau PNG";
        isValid = false;
      }
    }

    // Set errors (ini akan meng-overwrite semua error sebelumnya)
    // Penting: Clear error untuk semua field yang divalidasi, bukan hanya yang ada di object errors
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      
      // Field yang divalidasi di step 2
      const step2Fields: (keyof FieldErrors)[] = ['sk_document', 'npwp_document', 'building_photo'];
      
      // Untuk setiap field step 2, set error jika ada, atau hapus jika tidak ada
      step2Fields.forEach((field) => {
        if (errors[field]) {
          newErrors[field] = errors[field];
        } else {
          // Clear error jika field valid
          delete newErrors[field];
        }
      });
      
      return newErrors;
    });
    
    console.log('Step 2 validation result:', { isValid, errors, fieldErrors: Object.keys(errors) });
    
    return isValid;
  };

  // Validasi Step 3 dengan validasi koordinat
  const validateStep3 = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    // Validasi koordinat latitude
    if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = "Latitude tidak valid (harus antara -90 dan 90)";
      isValid = false;
    }

    // Validasi koordinat longitude
    if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = "Longitude tidak valid (harus antara -180 dan 180)";
      isValid = false;
    }

    // Validasi default coordinates (jika masih default Jakarta)
    // Hanya validasi jika koordinat masih default dan belum pernah diubah
    const isDefaultCoordinates = 
      Math.abs(formData.latitude - (-6.2088)) < 0.0001 && 
      Math.abs(formData.longitude - 106.8456) < 0.0001;
    
    if (isDefaultCoordinates) {
      errors.latitude = "Silakan pilih lokasi Puskesmas pada peta dengan mengklik atau drag marker";
      errors.longitude = "Silakan pilih lokasi Puskesmas pada peta dengan mengklik atau drag marker";
      isValid = false;
    }

    // Validasi pernyataan kebenaran data
    if (!formData.data_truth_confirmed) {
      errors.data_truth_confirmed = "Anda harus menyetujui pernyataan kebenaran data";
      isValid = false;
    }

    // Validasi puskesmasId
    if (!puskesmasId) {
      setErrorMessage("Data registrasi tidak ditemukan. Silakan mulai dari awal.");
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Step 1: Register dengan status draft
  const handleStep1Next = async () => {
    setErrorMessage("");
    setFieldErrors({});
    
    if (!validateStep1()) {
      toast({
        variant: "destructive",
        title: "Validasi Gagal",
        description: "Mohon periksa kembali data yang telah diisi. Terdapat beberapa field yang perlu diperbaiki.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await puskesmasRegistrationApi.registerStep1({
        name: formData.name.trim(),
        address: formData.address.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.replace(/\s/g, ""),
        kepala_name: formData.kepala_name.trim(),
        kepala_nip: formData.kepala_nip.replace(/\s/g, ""),
        npwp: formData.npwp?.trim() || undefined,
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
      
      toast({
        title: "Data Tersimpan",
        description: "Data Puskesmas berhasil disimpan. Lanjutkan ke tahap berikutnya.",
      });
      
      // Tandai step 1 sebagai completed
      setCompletedSteps((prev) => {
        if (!prev.includes(1)) {
          return [...prev, 1];
        }
        return prev;
      });
      
      // Lanjut ke step 2
      setCurrentStep(2);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Registrasi gagal. Silakan coba lagi.";
      setErrorMessage(errorMsg);
      toast({
        variant: "destructive",
        title: "Registrasi Gagal",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Upload dokumen
  const handleStep2Next = async () => {
    setErrorMessage("");
    setFieldErrors({});
    
    if (!validateStep2()) {
      toast({
        variant: "destructive",
        title: "Validasi Dokumen Gagal",
        description: "Mohon periksa kembali dokumen yang diupload. Pastikan format dan ukuran file sesuai ketentuan.",
      });
      return;
    }

    if (!puskesmasId) {
      const errorMsg = "Data registrasi tidak ditemukan. Silakan mulai dari awal.";
      setErrorMessage(errorMsg);
      toast({
        variant: "destructive",
        title: "Data Tidak Ditemukan",
        description: errorMsg,
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress({ sk: false, npwp: false, photo: false });

    try {
      // Upload SK Pendirian (WAJIB)
      if (files.sk_document) {
        try {
          setUploadProgress((prev) => ({ ...prev, sk: true }));
          await puskesmasRegistrationApi.uploadSKPendirian(puskesmasId, files.sk_document);
          setUploadProgress((prev) => ({ ...prev, sk: false }));
          // Clear error setelah upload berhasil
          setFieldErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.sk_document;
            return newErrors;
          });
          console.log('✅ SK Pendirian upload completed successfully');
        } catch (error) {
          setUploadProgress((prev) => ({ ...prev, sk: false }));
          const errorMsg = error instanceof Error ? error.message : 'Upload SK Pendirian gagal';
          setFieldErrors((prev) => ({ ...prev, sk_document: errorMsg }));
          throw error; // Re-throw untuk ditangani di catch block utama
        }
      }

      // Upload NPWP (OPSIONAL)
      if (files.npwp_document) {
        try {
          setUploadProgress((prev) => ({ ...prev, npwp: true }));
          await puskesmasRegistrationApi.uploadNPWP(puskesmasId, files.npwp_document);
          setUploadProgress((prev) => ({ ...prev, npwp: false }));
          // Clear error setelah upload berhasil
          setFieldErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.npwp_document;
            return newErrors;
          });
          console.log('✅ NPWP upload completed successfully');
        } catch (error) {
          setUploadProgress((prev) => ({ ...prev, npwp: false }));
          const errorMsg = error instanceof Error ? error.message : 'Upload NPWP gagal';
          setFieldErrors((prev) => ({ ...prev, npwp_document: errorMsg }));
          throw error; // Re-throw untuk ditangani di catch block utama
        }
      }

      // Upload Foto Gedung (WAJIB)
      if (files.building_photo) {
        try {
          setUploadProgress((prev) => ({ ...prev, photo: true }));
          await puskesmasRegistrationApi.uploadFotoGedung(puskesmasId, files.building_photo);
          setUploadProgress((prev) => ({ ...prev, photo: false }));
          // Clear error setelah upload berhasil
          setFieldErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.building_photo;
            return newErrors;
          });
          console.log('✅ Foto Gedung upload completed successfully');
        } catch (error) {
          setUploadProgress((prev) => ({ ...prev, photo: false }));
          const errorMsg = error instanceof Error ? error.message : 'Upload Foto Gedung gagal';
          setFieldErrors((prev) => ({ ...prev, building_photo: errorMsg }));
          throw error; // Re-throw untuk ditangani di catch block utama
        }
      }

      // Clear semua error setelah upload berhasil
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        const hadSkError = !!newErrors.sk_document;
        const hadNpwpError = !!newErrors.npwp_document;
        const hadPhotoError = !!newErrors.building_photo;
        
        delete newErrors.sk_document;
        delete newErrors.npwp_document;
        delete newErrors.building_photo;
        
        console.log('Clearing errors after upload:', {
          hadSkError,
          hadNpwpError,
          hadPhotoError,
          errorsBefore: Object.keys(prev),
          errorsAfter: Object.keys(newErrors),
        });
        
        return newErrors;
      });
      setErrorMessage("");

      toast({
        title: "Dokumen Berhasil Diupload",
        description: "Semua dokumen berhasil diupload. Lanjutkan ke tahap berikutnya.",
      });

      // Tandai step 2 sebagai completed
      setCompletedSteps((prev) => {
        if (!prev.includes(2)) {
          return [...prev, 2];
        }
        return prev;
      });

      // Lanjut ke step 3
      setCurrentStep(3);
    } catch (error) {
      console.error('❌ Upload error in handleStep2Next:', error);
      const errorMsg = error instanceof Error ? error.message : "Upload dokumen gagal. Silakan coba lagi.";
      setErrorMessage(errorMsg);
      
      // Pastikan semua upload progress di-reset
      setUploadProgress({ sk: false, npwp: false, photo: false });
      
      toast({
        variant: "destructive",
        title: "Upload Gagal",
        description: errorMsg,
      });
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
    } else if (currentStep === 3) {
      // Step 3 langsung submit, tidak ada next
      handleSubmit();
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setErrorMessage("");
      setFieldErrors({});
      setCurrentStep(currentStep - 1);
    }
  };

  // Step 3: Submit untuk verifikasi
  const handleSubmit = async () => {
    setErrorMessage("");
    setFieldErrors({});

    if (!validateStep3()) {
      toast({
        variant: "destructive",
        title: "Validasi Gagal",
        description: "Mohon pastikan lokasi sudah dipilih dan pernyataan kebenaran data sudah dicentang.",
      });
      return;
    }

    if (!puskesmasId) {
      const errorMsg = "Data registrasi tidak ditemukan. Silakan mulai dari awal.";
      setErrorMessage(errorMsg);
      toast({
        variant: "destructive",
        title: "Data Tidak Ditemukan",
        description: errorMsg,
      });
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

      toast({
        title: "Registrasi Berhasil",
        description: "Data registrasi telah dikirim untuk verifikasi. Proses verifikasi biasanya memakan waktu 1-3 hari kerja.",
      });

      // Registrasi berhasil - redirect ke halaman login dengan info login
      setTimeout(() => {
        router.push(
          `/login?registered=true&phone=${encodeURIComponent(formData.phone)}&password=${encodeURIComponent(formData.kepala_nip)}`
        );
      }, 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Submit gagal. Silakan coba lagi.";
      setErrorMessage(errorMsg);
      toast({
        variant: "destructive",
        title: "Submit Gagal",
        description: errorMsg,
      });
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
                  <Label htmlFor="name">
                    Nama Puskesmas <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      updateFormData("name", e.target.value);
                      clearFieldError("name");
                    }}
                    placeholder="Contoh: Puskesmas Sungai Penuh"
                    className={`focus:border-blue-500 transition-colors ${
                      fieldErrors.name ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => {
                      updateFormData("address", e.target.value);
                      clearFieldError("address");
                    }}
                    placeholder="Jl. Merdeka No. 1, Sungai Penuh, Jambi"
                    className={`focus:border-blue-500 transition-colors ${
                      fieldErrors.address ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.address && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.address}
                    </p>
                  )}
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
                  <Label htmlFor="email">
                    Email Resmi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      updateFormData("email", e.target.value);
                      clearFieldError("email");
                    }}
                    placeholder="admin@puskesmas.go.id"
                    className={`focus:border-blue-500 transition-colors ${
                      fieldErrors.email ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Nomor Telepon (Username) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      updateFormData("phone", e.target.value);
                      clearFieldError("phone");
                    }}
                    placeholder="+62812345678 atau 0812345678"
                    className={`focus:border-blue-500 transition-colors ${
                      fieldErrors.phone ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => {
                        updateFormData("password", e.target.value);
                        clearFieldError("password");
                      }}
                      placeholder="Minimal 8 karakter (huruf + angka)"
                      className={`pr-10 focus:border-blue-500 transition-colors ${
                        fieldErrors.password ? "border-red-500 focus:border-red-500" : ""
                      }`}
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
                  {fieldErrors.password ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.password}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Gunakan kombinasi huruf dan angka untuk keamanan.
                    </p>
                  )}
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
                  <Label htmlFor="kepala_name">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kepala_name"
                    value={formData.kepala_name}
                    onChange={(e) => {
                      updateFormData("kepala_name", e.target.value);
                      clearFieldError("kepala_name");
                    }}
                    placeholder="Contoh: dr. Rina Santoso"
                    className={`focus:border-blue-500 transition-colors ${
                      fieldErrors.kepala_name ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.kepala_name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.kepala_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kepala_nip">
                    NIP <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kepala_nip"
                    value={formData.kepala_nip}
                    onChange={(e) => {
                      updateFormData("kepala_nip", e.target.value);
                      clearFieldError("kepala_nip");
                    }}
                    placeholder="Contoh: 198012312010012001 (18 digit)"
                    className={`focus:border-blue-500 transition-colors ${
                      fieldErrors.kepala_nip ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                  {fieldErrors.kepala_nip && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.kepala_nip}
                    </p>
                  )}
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
                    maxSize={5}
                    uploadText="Drag & Drop atau Cari File"
                    subtitle="Maks. 5MB, PDF"
                  />
                  {uploadProgress.sk && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Mengupload...
                    </p>
                  )}
                  {fieldErrors.sk_document && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.sk_document}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Scan NPWP (Opsional)</Label>
                  <FileUpload
                    deferUpload={true}
                    onFileChange={(file) => updateFile("npwp_document", file)}
                    acceptedTypes=".pdf,.jpg,.jpeg"
                    maxSize={5}
                    uploadText="Upload Gambar/PDF"
                    subtitle="Format: PDF, JPG, atau JPEG (Maks. 5MB)"
                  />
                  {uploadProgress.npwp && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Mengupload...
                    </p>
                  )}
                  {fieldErrors.npwp_document && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.npwp_document}
                    </p>
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
                    maxSize={5}
                    uploadText="Ambil Foto atau Upload"
                    subtitle="Format: JPG, PNG, Maks. 5MB"
                  />
                  {uploadProgress.photo && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Mengupload...
                    </p>
                  )}
                  {fieldErrors.building_photo && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.building_photo}
                    </p>
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

            {/* Button Deteksi Lokasi Saat Ini */}
            <div className="mb-4">
              <Button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                variant="outline"
                className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mendeteksi lokasi...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    Deteksi Lokasi Saat Ini
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Klik tombol di atas untuk secara otomatis mendeteksi lokasi Anda saat ini menggunakan GPS
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
                <Label htmlFor="latitude">
                  Latitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="latitude"
                  type="text"
                  value={formData.latitude.toString().replace('.', ',')}
                  onChange={(e) => {
                    const value = e.target.value.replace(',', '.');
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      updateFormData("latitude", numValue);
                      clearFieldError("latitude");
                    }
                  }}
                  placeholder="-6,2088"
                  className={`bg-gray-50 ${
                    fieldErrors.latitude ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {fieldErrors.latitude && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.latitude}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">
                  Longitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="longitude"
                  type="text"
                  value={formData.longitude.toString().replace('.', ',')}
                  onChange={(e) => {
                    const value = e.target.value.replace(',', '.');
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      updateFormData("longitude", numValue);
                      clearFieldError("longitude");
                    }
                  }}
                  placeholder="106,8456"
                  className={`bg-gray-50 ${
                    fieldErrors.longitude ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {fieldErrors.longitude && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.longitude}
                  </p>
                )}
              </div>
            </div>

            {/* Pernyataan Kebenaran Data di Step 3 */}
            <div className={`bg-gray-50 p-6 rounded-lg border ${
              fieldErrors.data_truth_confirmed ? "border-red-200 bg-red-50/30" : ""
            }`}>
              <h3 className="font-semibold text-gray-900 mb-4">
                Pernyataan Kebenaran Data <span className="text-red-500">*</span>
              </h3>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="data_truth_confirmed"
                  checked={formData.data_truth_confirmed}
                  onCheckedChange={(checked) => {
                    updateFormData("data_truth_confirmed", checked === true);
                    clearFieldError("data_truth_confirmed");
                  }}
                  className={fieldErrors.data_truth_confirmed ? "border-red-500" : ""}
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
              {fieldErrors.data_truth_confirmed && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.data_truth_confirmed}
                </p>
              )}
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
            {steps.map((step) => {
              const isCompleted = completedSteps.includes(step.id);
              const canNavigate = canNavigateToStep(step.id) || step.id <= currentStep;
              const isDisabled = !canNavigate && step.id > currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepNavigation(step.id)}
                  disabled={isDisabled}
                  className={`
                    flex-1 py-4 px-2 text-sm font-medium border-b-2 transition-colors
                    ${
                      isDisabled
                        ? "border-transparent text-gray-300 cursor-not-allowed opacity-50"
                        : currentStep === step.id
                          ? "border-blue-600 text-blue-600"
                          : isCompleted || currentStep > step.id
                            ? "border-green-500 text-green-600 hover:border-green-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }
                  `}
                  title={
                    isDisabled
                      ? `Lengkapi tahap ${step.id - 1} terlebih dahulu`
                      : undefined
                  }
                >
                  <div className="flex items-center justify-center gap-2">
                    {isCompleted || currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span
                        className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs
                        ${
                          currentStep === step.id
                            ? "bg-blue-600 text-white"
                            : isDisabled
                              ? "bg-gray-200 text-gray-400"
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
              );
            })}
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
