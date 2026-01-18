import { z } from 'zod';

export const puskesmasRegistrationSchema = z.object({
  // Step 1: Data Puskesmas & Penanggung Jawab
  nama_puskesmas: z
    .string()
    .min(1, 'Nama Puskesmas harus diisi')
    .min(3, 'Nama Puskesmas minimal 3 karakter'),
  email: z
    .string()
    .min(1, 'Email harus diisi')
    .email('Format email tidak valid'),
  no_telepon: z
    .string()
    .min(1, 'Nomor telepon harus diisi')
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid'),
  alamat: z
    .string()
    .min(1, 'Alamat harus diisi')
    .min(10, 'Alamat minimal 10 karakter'),
  nama_kepala_puskesmas: z
    .string()
    .min(1, 'Nama Kepala Puskesmas harus diisi')
    .min(3, 'Nama Kepala Puskesmas minimal 3 karakter'),
  nip_kepala_puskesmas: z
    .string()
    .min(1, 'NIP Kepala Puskesmas harus diisi')
    .regex(/^[0-9]{18}$/, 'NIP harus terdiri dari 18 digit angka'),

  // Step 2: Legalitas & Dokumen
  npwp: z
    .string()
    .min(1, 'NPWP harus diisi')
    .regex(/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\.[0-9]{1}-[0-9]{3}\.[0-9]{3}$/, 'Format NPWP tidak valid (contoh: 12.345.678.9-012.345)'),
  sk_pendirian: z
    .any()
    .refine((file) => file instanceof File, 'SK Pendirian harus diupload')
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, 'File maksimal 5MB')
    .refine((file) => !file || file.type === 'application/pdf', 'File harus berupa PDF'),
  scan_npwp: z
    .any()
    .refine((file) => file instanceof File, 'Scan NPWP harus diupload')
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, 'File maksimal 5MB')
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      'File harus berupa JPG, PNG, atau PDF'
    ),
  foto_gedung: z
    .any()
    .refine((file) => file instanceof File, 'Foto Gedung harus diupload')
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, 'File maksimal 5MB')
    .refine(
      (file) => !file || ['image/jpeg', 'image/png'].includes(file.type),
      'File harus berupa JPG atau PNG'
    ),

  // Step 3: Lokasi Pelayanan
  latitude: z
    .number()
    .min(-90, 'Latitude tidak valid')
    .max(90, 'Latitude tidak valid'),
  longitude: z
    .number()
    .min(-180, 'Longitude tidak valid')
    .max(180, 'Longitude tidak valid'),

  // Step 4: Konfirmasi
  data_truth_confirmed: z
    .boolean()
    .refine((val) => val === true, 'Anda harus menyetujui pernyataan kebenaran data'),
});

export type PuskesmasRegistrationFormData = z.infer<typeof puskesmasRegistrationSchema>;
