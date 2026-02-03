import type { ForumCategory } from '@/lib/types/forum';

/**
 * Kategori fallback saat API /api/v1/forum/categories belum tersedia atau mengembalikan kosong.
 * Digunakan di halaman Forum (filter) dan Buat Post (dropdown kategori).
 */
export const FALLBACK_FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: 1,
    name: 'umum',
    display_name: 'Umum',
    description: 'Diskusi umum',
    icon: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'kesehatan_ibu',
    display_name: 'Kesehatan Ibu',
    description: 'Kesehatan ibu hamil dan menyusui',
    icon: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'kesehatan_anak',
    display_name: 'Kesehatan Anak',
    description: 'Kesehatan bayi dan anak',
    icon: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'nutrisi',
    display_name: 'Nutrisi',
    description: 'Gizi dan pola makan',
    icon: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'lainnya',
    display_name: 'Lainnya',
    description: 'Topik lainnya',
    icon: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
