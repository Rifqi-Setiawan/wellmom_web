'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, Heart, MessageCircle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { forumApi } from '@/lib/api/forum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ForumCategory, ForumPost } from '@/lib/types/forum';
import { FALLBACK_FORUM_CATEGORIES } from '@/lib/constants/forum';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const PAGE_SIZE = 10;

export default function PerawatForumPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null); // null = Semua
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setIsLoadingCategories(true);
    try {
      const data = await forumApi.getCategories(token);
      const list = Array.isArray(data) ? data.filter((c) => c.is_active) : [];
      setCategories(list.length > 0 ? list : FALLBACK_FORUM_CATEGORIES);
    } catch {
      setCategories(FALLBACK_FORUM_CATEGORIES);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [token]);

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setIsLoadingPosts(true);
    setError(null);
    try {
      const skip = (currentPage - 1) * PAGE_SIZE;
      const res = await forumApi.getPosts(token, {
        skip,
        limit: PAGE_SIZE,
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
        ...(categoryId != null ? { category_id: categoryId } : {}),
      });
      setPosts(res.posts ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat forum.';
      setError(message);
      setPosts([]);
      setTotal(0);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [token, currentPage, searchQuery, categoryId]);

  useEffect(() => {
    if (token) fetchCategories();
  }, [token, fetchCategories]);

  useEffect(() => {
    if (token) fetchPosts();
  }, [token, fetchPosts]);

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const previewDetails = (text: string, maxLength: number = 120) => {
    const stripped = text.replace(/\s+/g, ' ').trim();
    if (stripped.length <= maxLength) return stripped;
    return stripped.slice(0, maxLength) + '…';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Forum Diskusi</h1>
            <p className="text-sm text-gray-600 mt-1">
              Diskusi dan berbagi dengan sesama perawat.
            </p>
          </div>
          <Link href="/perawat/forum/buat">
            <Button className="bg-[#3B9ECF] hover:bg-[#2d8ab8] text-white gap-2">
              <Plus className="w-4 h-4" />
              Buat Postingan
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-8 pt-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Cari postingan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setCurrentPage(1); } }}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <label htmlFor="forum-filter-category" className="text-sm font-medium text-gray-700 shrink-0">
                Kategori
              </label>
              <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
                <select
                  id="forum-filter-category"
                  value={categoryId ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCategoryId(v === '' ? null : Number(v));
                    setCurrentPage(1);
                  }}
                  disabled={isLoadingCategories}
                  className="w-full h-10 pl-4 pr-10 appearance-none rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#3B9ECF] focus:outline-none focus:ring-2 focus:ring-[#3B9ECF]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                >
                  <option value="">Semua kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name || c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                className="shrink-0"
              >
                Terapkan
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchPosts}>
              Coba lagi
            </Button>
          </div>
        )}

        {isLoadingPosts ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]" />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">Belum ada postingan.</p>
              <Link href="/perawat/forum/buat">
                <Button className="mt-4 bg-[#3B9ECF] hover:bg-[#2d8ab8]">
                  Buat postingan pertama
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <Link href={`/perawat/forum/${post.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                          <span>{post.author_name ?? 'Anonim'}</span>
                          <span>·</span>
                          <span>
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </span>
                          {(post.category_display_name || post.category_name) && (
                            <>
                              <span>·</span>
                              <Badge variant="secondary" className="text-xs font-normal">
                                {post.category_display_name || post.category_name}
                              </Badge>
                            </>
                          )}
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {previewDetails(post.details)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart
                            className={`w-4 h-4 ${post.is_liked ? 'fill-red-500 text-red-500' : ''}`}
                          />
                          {post.like_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.reply_count}
                        </span>
                      </CardContent>
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
