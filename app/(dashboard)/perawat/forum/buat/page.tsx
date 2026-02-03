'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { forumApi } from '@/lib/api/forum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { ForumCategory } from '@/lib/types/forum';
import { FALLBACK_FORUM_CATEGORIES } from '@/lib/constants/forum';

export default function PerawatForumBuatPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    const load = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await forumApi.getCategories(token);
        const list = Array.isArray(data) ? data.filter((c) => c.is_active) : [];
        const final = list.length > 0 ? list : FALLBACK_FORUM_CATEGORIES;
        setCategories(final);
        if (categoryId === null && final.length > 0) {
          setCategoryId(final[0].id);
        }
      } catch {
        setCategories(FALLBACK_FORUM_CATEGORIES);
        if (categoryId === null && FALLBACK_FORUM_CATEGORIES.length > 0) {
          setCategoryId(FALLBACK_FORUM_CATEGORIES[0].id);
        }
      } finally {
        setIsLoadingCategories(false);
      }
    };
    load();
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const d = details.trim();
    if (!t || !d) {
      setError('Judul dan isi postingan wajib diisi.');
      return;
    }
    if (categoryId == null) {
      setError('Pilih kategori.');
      return;
    }
    if (!token || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await forumApi.createPost(token, {
        title: t,
        details: d,
        category_id: categoryId,
      });
      router.push('/perawat/forum');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat postingan.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 md:p-8 pt-8 pb-4 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <Link
            href="/perawat/forum"
            className="inline-flex items-center gap-2 text-sm text-[#3B9ECF] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Forum
          </Link>

          <Card className="w-full">
          <CardHeader>
            <CardTitle>Buat Postingan</CardTitle>
            <CardDescription>
              Judul, isi, dan kategori wajib diisi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="forum-title">Judul</Label>
                <Input
                  id="forum-title"
                  placeholder="Judul postingan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forum-details">Isi</Label>
                <textarea
                  id="forum-details"
                  placeholder="Tulis isi postingan..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#3B9ECF] focus:outline-none focus:ring-1 focus:ring-[#3B9ECF]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forum-category">Kategori</Label>
                <div className="relative">
                  <select
                    id="forum-category"
                    value={categoryId ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCategoryId(v === '' ? null : Number(v));
                    }}
                    required
                    disabled={isLoadingCategories}
                    className="w-full h-10 pl-4 pr-10 appearance-none rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#3B9ECF] focus:outline-none focus:ring-2 focus:ring-[#3B9ECF]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.display_name || c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {isLoadingCategories && (
                  <p className="text-xs text-gray-500">Memuat kategori...</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoadingCategories}
                  className="bg-[#3B9ECF] hover:bg-[#2d8ab8]"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Postingan'}
                </Button>
                <Link href="/perawat/forum">
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
