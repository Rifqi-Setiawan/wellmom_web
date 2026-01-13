import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email harus diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password harus diisi')
    .min(8, 'Password minimal 8 karakter'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    nama_puskesmas: z
      .string()
      .min(1, 'Nama Puskesmas harus diisi')
      .min(3, 'Nama Puskesmas minimal 3 karakter'),
    email: z
      .string()
      .min(1, 'Email harus diisi')
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(1, 'Password harus diisi')
      .min(8, 'Password minimal 8 karakter')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password harus mengandung huruf besar, huruf kecil, dan angka'
      ),
    password_confirmation: z.string().min(1, 'Konfirmasi password harus diisi'),
    alamat: z
      .string()
      .min(1, 'Alamat harus diisi')
      .min(10, 'Alamat minimal 10 karakter'),
    no_telepon: z
      .string()
      .min(1, 'Nomor telepon harus diisi')
      .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid'),
    nama_kepala_puskesmas: z
      .string()
      .min(1, 'Nama Kepala Puskesmas harus diisi')
      .min(3, 'Nama Kepala Puskesmas minimal 3 karakter'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Password tidak cocok',
    path: ['password_confirmation'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
