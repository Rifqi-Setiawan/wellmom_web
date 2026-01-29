import { z } from "zod";

export const profileUpdateSchema = z.object({
  nama_lengkap: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(255, "Nama maksimal 255 karakter")
    .optional(),
  nomor_hp: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, "Format nomor HP tidak valid")
    .optional(),
  profile_photo_url: z.string().url("Format URL foto tidak valid").optional(),
});

export const emailUpdateSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  current_password: z.string().min(1, "Password wajib diisi"),
});

export const passwordUpdateSchema = z
  .object({
    current_password: z.string().min(1, "Password saat ini wajib diisi"),
    new_password: z.string().min(6, "Password minimal 6 karakter"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirm_password"],
  });
