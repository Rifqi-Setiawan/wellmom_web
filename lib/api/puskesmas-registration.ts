import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Step1RegistrationData {
  name: string;
  address: string;
  email: string;
  password: string;
  phone: string;
  kepala_name: string;
  kepala_nip: string;
  npwp?: string;
  sk_document_url?: string;
  building_photo_url?: string;
  latitude?: number;
  longitude?: number;
  data_truth_confirmed?: boolean;
  registration_status: 'draft';
}

export interface Step1Response {
  puskesmas: {
    id: number;
    name: string;
    registration_status: string;
    is_active: boolean;
  };
  message: string;
}

export interface UploadResponse {
  success: boolean;
  file_path: string;
  file_url: string;
  message: string;
}

export interface Step3UpdateData {
  latitude: number;
  longitude: number;
  data_truth_confirmed: boolean;
  registration_status: 'pending_approval';
}

export interface PuskesmasResponse {
  id: number;
  name: string;
  registration_status: string;
  latitude: number;
  longitude: number;
  sk_document_url: string;
  building_photo_url: string;
  is_active: boolean;
}

export const puskesmasRegistrationApi = {
  // Step 1: Create puskesmas with draft status
  registerStep1: async (data: Step1RegistrationData): Promise<Step1Response> => {
    console.log('📝 Step 1: Registering puskesmas with draft status...');
    console.log('📧 Email:', data.email);
    console.log('📱 Phone:', data.phone);
    
    try {
      const response = await api.post<Step1Response>('/api/v1/puskesmas/register', data);
      console.log('✅ Step 1 Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Step 1 Error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.detail || error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
        throw new Error(message);
      }
      throw new Error('Terjadi kesalahan. Silakan coba lagi.');
    }
  },

  // Step 2.1: Upload SK Pendirian
  uploadSKPendirian: async (puskesmasId: number, file: File): Promise<UploadResponse> => {
    console.log(`📄 Step 2.1: Uploading SK Pendirian for puskesmas ID: ${puskesmasId}`);
    console.log('📁 File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log('📋 File type:', file.type);
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file maksimal 5MB');
    }
    
    // Validasi tipe file dengan fallback ke ekstensi
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const isValidType = file.type === 'application/pdf' || fileName.endsWith('.pdf');
    
    if (!isValidType) {
      console.error('❌ SK Pendirian file type validation failed:', {
        mimeType: file.type,
        extension: fileExtension,
        fileName: file.name
      });
      throw new Error('File harus berupa PDF');
    }

    const formData = new FormData();
    // Pastikan filename asli terbawa saat upload
    formData.append('file', file, file.name);

    try {
      const response = await api.put<UploadResponse>(
        `/api/v1/upload/puskesmas/${puskesmasId}/sk-pendirian`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('✅ SK Pendirian uploaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Upload SK Pendirian Error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.detail || error.response?.data?.message || 'Upload SK Pendirian gagal.';
        throw new Error(message);
      }
      throw new Error('Terjadi kesalahan saat upload SK Pendirian.');
    }
  },

  // Step 2.2: Upload NPWP (Optional)
  uploadNPWP: async (puskesmasId: number, file: File): Promise<UploadResponse> => {
    console.log(`📄 Step 2.2: Uploading NPWP for puskesmas ID: ${puskesmasId}`);
    console.log('📁 File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log('📋 File type:', file.type);
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file maksimal 5MB');
    }
    
    // Validasi tipe file dengan fallback ke ekstensi
    // Backend hanya menerima PDF atau JPG/JPEG untuk NPWP (BUKAN PNG)
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg'];
    
    const isValidType = allowedMimeTypes.includes(file.type) || 
                       allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      console.error('❌ NPWP file type validation failed:', {
        mimeType: file.type,
        extension: fileExtension,
        fileName: file.name
      });
      throw new Error('NPWP harus berformat PDF atau JPG/JPEG');
    }

    const formData = new FormData();
    // Pastikan filename asli terbawa saat upload
    formData.append('file', file, file.name);

    try {
      const response = await api.put<UploadResponse>(
        `/api/v1/upload/puskesmas/${puskesmasId}/npwp`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('✅ NPWP uploaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Upload NPWP Error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.detail || error.response?.data?.message || 'Upload NPWP gagal.';
        throw new Error(message);
      }
      throw new Error('Terjadi kesalahan saat upload NPWP.');
    }
  },

  // Step 2.3: Upload Foto Gedung
  uploadFotoGedung: async (puskesmasId: number, file: File): Promise<UploadResponse> => {
    console.log(`📸 Step 2.3: Uploading Foto Gedung for puskesmas ID: ${puskesmasId}`);
    console.log('📁 File:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log('📋 File type:', file.type);
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file maksimal 5MB');
    }
    
    // Validasi tipe file dengan fallback ke ekstensi
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    
    const isValidType = allowedMimeTypes.includes(file.type) || 
                       allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      console.error('❌ Foto Gedung file type validation failed:', {
        mimeType: file.type,
        extension: fileExtension,
        fileName: file.name
      });
      throw new Error('File harus berupa JPG, JPEG, atau PNG');
    }

    const formData = new FormData();
    // Pastikan filename asli terbawa saat upload
    formData.append('file', file, file.name);

    try {
      const response = await api.put<UploadResponse>(
        `/api/v1/upload/puskesmas/${puskesmasId}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('✅ Foto Gedung uploaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Upload Foto Gedung Error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.detail || error.response?.data?.message || 'Upload Foto Gedung gagal.';
        throw new Error(message);
      }
      throw new Error('Terjadi kesalahan saat upload Foto Gedung.');
    }
  },

  // Step 3: Update location and submit for approval
  submitStep3: async (puskesmasId: number, data: Step3UpdateData): Promise<PuskesmasResponse> => {
    console.log(`📍 Step 3: Submitting puskesmas ID: ${puskesmasId} for approval...`);
    console.log('📍 Location:', data.latitude, data.longitude);
    console.log('✅ Data truth confirmed:', data.data_truth_confirmed);
    
    try {
      const response = await api.put<PuskesmasResponse>(
        `/api/v1/puskesmas/${puskesmasId}`,
        data
      );
      console.log('✅ Step 3 Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Step 3 Error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.detail || error.response?.data?.message || 'Submit gagal. Silakan coba lagi.';
        throw new Error(message);
      }
      throw new Error('Terjadi kesalahan saat submit. Silakan coba lagi.');
    }
  },
};
