'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2, User, MapPin, Phone, Mail, FileText, Image as ImageIcon, Loader2, Upload, Eye, X, Check } from 'lucide-react';
import { puskesmasApi } from '@/lib/api/puskesmas';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationMap } from './_components/location-map';
import 'leaflet/dist/leaflet.css';

interface PuskesmasProfile {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  kepala_name: string;
  kepala_nip: string;
  npwp: string;
  latitude: number;
  longitude: number;
  building_photo_url: string | null;
  npwp_document_url: string | null;
  sk_document_url: string | null;
  registration_status: string;
  is_active: boolean;
  active_ibu_hamil_count?: number;
  active_perawat_count?: number;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000';

export default function PuskesmasProfilePage() {
  const router = useRouter();
  const { token, puskesmasInfo } = useAuthStore();
  const [profile, setProfile] = useState<PuskesmasProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File upload state
  const [skFile, setSkFile] = useState<File | null>(null);
  const [npwpFile, setNpwpFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [skPreview, setSkPreview] = useState<string | null>(null);
  const [npwpPreview, setNpwpPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0); // Force re-render key

  const skInputRef = useRef<HTMLInputElement>(null);
  const npwpInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    kepala_name: '',
    kepala_nip: '',
    npwp: '',
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [token, router]);

  const fetchProfile = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await puskesmasApi.getPuskesmasProfile(token);
      setProfile(data);
      setFormData({
        name: data.name || '',
        address: data.address || '',
        email: data.email || '',
        phone: data.phone || '',
        kepala_name: data.kepala_name || '',
        kepala_nip: data.kepala_nip || '',
        npwp: data.npwp || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      });
      // Set previews for existing files
      console.log('📄 Document URLs from API:');
      console.log('  SK Document URL:', data.sk_document_url);
      console.log('  NPWP Document URL:', data.npwp_document_url);
      console.log('  Building Photo URL:', data.building_photo_url);
      
      if (data.sk_document_url) setSkPreview(data.sk_document_url);
      if (data.npwp_document_url) setNpwpPreview(data.npwp_document_url);
      if (data.building_photo_url) setPhotoPreview(data.building_photo_url);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.message || 'Gagal memuat data profil. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (type: 'sk' | 'npwp' | 'photo', file: File | null) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`File terlalu besar. Maksimal 5MB. File Anda: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    // Validate file type based on upload type
    if (type === 'sk') {
      if (file.type !== 'application/pdf') {
        setError('SK Pendirian harus berformat PDF');
        return;
      }
    } else if (type === 'npwp') {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Dokumen NPWP harus berformat PDF atau JPG');
        return;
      }
    } else if (type === 'photo') {
      if (!file.type.startsWith('image/')) {
        setError('Foto Gedung harus berformat gambar (PNG, JPG, JPEG, dll)');
        return;
      }
    }

    setError(null); // Clear previous errors

    if (type === 'sk') {
      // Revoke old blob URL if exists
      if (skPreview && skPreview.startsWith('blob:')) {
        URL.revokeObjectURL(skPreview);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setSkFile(file);
      setSkPreview(newPreviewUrl);
      console.log('📄 SK file selected:', file.name, 'Type:', file.type, 'Preview URL created');
    } else if (type === 'npwp') {
      // Revoke old blob URL if exists
      if (npwpPreview && npwpPreview.startsWith('blob:')) {
        URL.revokeObjectURL(npwpPreview);
      }
      setNpwpFile(file);
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const newPreviewUrl = URL.createObjectURL(file);
        setNpwpPreview(newPreviewUrl);
        console.log('📄 NPWP file selected:', file.name, 'Type:', file.type, 'Preview URL created');
      }
    } else if (type === 'photo') {
      // Revoke old blob URL if exists
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoFile(file);
      if (file.type.startsWith('image/')) {
        const newPreviewUrl = URL.createObjectURL(file);
        setPhotoPreview(newPreviewUrl);
        setPreviewKey(prev => prev + 1); // Force re-render
        console.log('📷 Photo file selected:', file.name, 'Type:', file.type, 'Preview URL created:', newPreviewUrl);
      }
    }
  };

  const handleRemoveFile = (type: 'sk' | 'npwp' | 'photo') => {
    if (type === 'sk') {
      setSkFile(null);
      if (skPreview && skPreview.startsWith('blob:')) {
        URL.revokeObjectURL(skPreview);
      }
      setSkPreview(profile?.sk_document_url || null);
    } else if (type === 'npwp') {
      setNpwpFile(null);
      if (npwpPreview && npwpPreview.startsWith('blob:')) {
        URL.revokeObjectURL(npwpPreview);
      }
      setNpwpPreview(profile?.npwp_document_url || null);
    } else if (type === 'photo') {
      setPhotoFile(null);
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(profile?.building_photo_url || null);
    }
  };

  const openDocument = (url: string) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    window.open(fullUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !profile) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updateData: any = {};
      
      if (formData.name) updateData.name = formData.name;
      if (formData.address) updateData.address = formData.address;
      if (formData.email) updateData.email = formData.email;
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.kepala_name) updateData.kepala_name = formData.kepala_name;
      if (formData.kepala_nip) updateData.kepala_nip = formData.kepala_nip;
      if (formData.npwp) updateData.npwp = formData.npwp;
      if (formData.latitude !== 0) updateData.latitude = formData.latitude;
      if (formData.longitude !== 0) updateData.longitude = formData.longitude;

      // Upload files first, then update profile with URLs
      if (skFile) {
        console.log('📤 Uploading SK Pendirian file:', skFile.name);
        try {
          const skResult = await puskesmasApi.uploadSKPendirian(token, profile.id, skFile);
          console.log('✅ SK Upload result:', skResult);
          updateData.sk_document_url = skResult.file_url || skResult.file_path;
        } catch (uploadError: any) {
          console.error('❌ SK Upload error:', uploadError);
          const errorMsg = uploadError.response?.data?.detail || uploadError.response?.data?.message || uploadError.message || 'Terjadi kesalahan';
          throw new Error(`Gagal mengupload SK Pendirian: ${errorMsg}`);
        }
      }

      if (npwpFile) {
        console.log('📤 Uploading NPWP file:', npwpFile.name);
        try {
          const npwpResult = await puskesmasApi.uploadNPWP(token, profile.id, npwpFile);
          console.log('✅ NPWP Upload result:', npwpResult);
          updateData.npwp_document_url = npwpResult.file_url || npwpResult.file_path;
        } catch (uploadError: any) {
          console.error('❌ NPWP Upload error:', uploadError);
          const errorMsg = uploadError.response?.data?.detail || uploadError.response?.data?.message || uploadError.message || 'Terjadi kesalahan';
          throw new Error(`Gagal mengupload dokumen NPWP: ${errorMsg}`);
        }
      }

      if (photoFile) {
        console.log('📤 Uploading Photo file:', photoFile.name);
        try {
          const photoResult = await puskesmasApi.uploadFotoPuskesmas(token, profile.id, photoFile);
          console.log('✅ Photo Upload result:', photoResult);
          updateData.building_photo_url = photoResult.file_url || photoResult.file_path;
        } catch (uploadError: any) {
          console.error('❌ Photo Upload error:', uploadError);
          const errorMsg = uploadError.response?.data?.detail || uploadError.response?.data?.message || uploadError.message || 'Terjadi kesalahan';
          throw new Error(`Gagal mengupload foto gedung: ${errorMsg}`);
        }
      }

      // Update profile with all data including uploaded file URLs
      console.log('📝 Updating profile with data:', updateData);
      await puskesmasApi.updatePuskesmasProfile(token, updateData);
      
      setSuccessMessage('Profil berhasil diperbarui.');
      
      // Clear file states and revoke blob URLs before refresh
      if (skFile && skPreview && skPreview.startsWith('blob:')) {
        URL.revokeObjectURL(skPreview);
      }
      if (npwpFile && npwpPreview && npwpPreview.startsWith('blob:')) {
        URL.revokeObjectURL(npwpPreview);
      }
      if (photoFile && photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      
      setSkFile(null);
      setNpwpFile(null);
      setPhotoFile(null);
      
      await fetchProfile(); // Refresh data (this will set new previews from server)
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      // Use the error message from the Error object if it was thrown from upload functions
      const errorMessage = err.message || err.response?.data?.detail || err.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]"></div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Profil</h1>
            <p className="text-gray-600">Kelola informasi dan data Puskesmas Anda</p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Dasar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Informasi Dasar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Nama Puskesmas</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Masukkan nama puskesmas"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Masukkan email"
                className="mt-2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Masukkan alamat lengkap"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Masukkan nomor telepon"
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Informasi Kepala Puskesmas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Informasi Kepala Puskesmas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="kepala_name">Nama Kepala Puskesmas</Label>
              <Input
                id="kepala_name"
                value={formData.kepala_name}
                onChange={(e) => handleInputChange('kepala_name', e.target.value)}
                placeholder="Masukkan nama kepala puskesmas"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="kepala_nip">NIP</Label>
              <Input
                id="kepala_nip"
                value={formData.kepala_nip}
                onChange={(e) => handleInputChange('kepala_nip', e.target.value)}
                placeholder="Masukkan NIP"
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Informasi Dokumen */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Informasi Dokumen</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="npwp">NPWP</Label>
              <Input
                id="npwp"
                value={formData.npwp}
                onChange={(e) => handleInputChange('npwp', e.target.value)}
                placeholder="Masukkan NPWP"
                className="mt-2"
              />
            </div>

            {/* SK Pendirian */}
            <div>
              <Label>Dokumen SK Pendirian</Label>
              <div className="mt-2 space-y-3">
                {skPreview && (
                  <div key={skFile ? `sk-new-${skFile.name}` : `sk-existing-${skPreview}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {skFile ? `SK Pendirian (Baru: ${skFile.name})` : 'SK Pendirian'}
                      </p>
                      <p className="text-xs text-gray-500">Klik untuk melihat dokumen</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (skPreview.startsWith('blob:')) {
                            // For blob URLs, we can't open directly, so we'll show a message
                            alert('File baru akan diupload saat Anda menekan "Simpan Perubahan"');
                          } else {
                            openDocument(skPreview);
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Dokumen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {skFile && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('sk')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus File Baru"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <input
                  ref={skInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileSelect('sk', e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => skInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {skPreview ? 'Ganti File SK' : 'Upload SK Pendirian'}
                </Button>
                {skFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>File siap diupload: {skFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* NPWP Document */}
            <div>
              <Label>Dokumen NPWP</Label>
              <div className="mt-2 space-y-3">
                {npwpPreview && (
                  <div key={npwpFile ? `npwp-new-${npwpFile.name}` : `npwp-existing-${npwpPreview}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {npwpFile ? `NPWP (Baru: ${npwpFile.name})` : 'NPWP'}
                      </p>
                      <p className="text-xs text-gray-500">Klik untuk melihat dokumen</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (npwpPreview.startsWith('blob:')) {
                            // For blob URLs, we can't open directly, so we'll show a message
                            alert('File baru akan diupload saat Anda menekan "Simpan Perubahan"');
                          } else {
                            openDocument(npwpPreview);
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Dokumen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {npwpFile && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('npwp')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus File Baru"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <input
                  ref={npwpInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/jpg"
                  onChange={(e) => {
                    handleFileSelect('npwp', e.target.files?.[0] || null);
                    // Reset input to allow selecting the same file again
                    if (e.target) {
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => npwpInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {npwpPreview ? 'Ganti File NPWP' : 'Upload Dokumen NPWP'}
                </Button>
                {npwpFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>File siap diupload: {npwpFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Foto Gedung */}
            <div>
              <Label>Foto Gedung Puskesmas</Label>
              <div className="mt-2 space-y-3">
                {photoPreview && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <ImageIcon className="w-8 h-8 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {photoFile ? `Foto Gedung (Baru: ${photoFile.name})` : 'Foto Gedung Puskesmas'}
                      </p>
                      <p className="text-xs text-gray-500">Klik ikon mata untuk melihat foto</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (photoPreview.startsWith('blob:')) {
                            // For blob URLs (newly selected files), show a message
                            alert('File baru akan diupload saat Anda menekan "Simpan Perubahan"');
                          } else {
                            // For server URLs, open directly like NPWP does
                            openDocument(photoPreview);
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Foto"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {photoFile && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('photo')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus File Baru"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleFileSelect('photo', e.target.files?.[0] || null);
                    // Reset input to allow selecting the same file again
                    if (e.target) {
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {photoPreview ? 'Ganti Foto Gedung' : 'Upload Foto Gedung'}
                </Button>
                {photoFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Foto siap diupload: {photoFile.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Lokasi */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Informasi Lokasi</h2>
              <p className="text-sm text-gray-500">Pilih lokasi Puskesmas pada peta</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Map Component */}
            <LocationMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(lat, lng) => {
                setFormData(prev => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }));
              }}
            />

            {/* Display coordinates */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-xs text-gray-500">Latitude</Label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formData.latitude ? formData.latitude.toFixed(6) : '-'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Longitude</Label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formData.longitude ? formData.longitude.toFixed(6) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Status (Read-only) */}
        {profile && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Informasi Status</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-gray-500">Status Registrasi</Label>
                <p className="text-sm font-medium text-gray-900 mt-2 capitalize">
                  {profile.registration_status}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">Status Aktivasi</Label>
                <p className="text-sm font-medium text-gray-900 mt-2">
                  {profile.is_active ? 'Aktif' : 'Nonaktif'}
                </p>
              </div>
              {profile.active_perawat_count !== undefined && (
                <div>
                  <Label className="text-gray-500">Jumlah Perawat Aktif</Label>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {profile.active_perawat_count}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
