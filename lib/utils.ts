import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://103.191.92.29:8000";

/**
 * Membangun URL gambar lengkap dari profile_photo_url API response
 * @param photoUrl - URL dari API response (bisa path relatif atau URL lengkap)
 * @returns URL gambar yang siap digunakan di <img src>
 */
export function buildImageUrl(photoUrl?: string | null): string {
  // Jika tidak ada URL, kembalikan default avatar
  if (!photoUrl) {
    return "/default-avatar.png";
  }

  // Jika sudah URL lengkap (http/https), gunakan langsung
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
    return photoUrl;
  }

  // Jika path relatif (dimulai /), gabungkan dengan API_BASE_URL
  if (photoUrl.startsWith("/")) {
    return `${API_BASE_URL}${photoUrl}`;
  }

  // Jika hanya nama file (tidak ada /), asumsikan ada di /uploads/ atau path default
  return `${API_BASE_URL}/uploads/${photoUrl}`;
}
