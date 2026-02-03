'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, MessageCircle, Send } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { forumApi } from '@/lib/api/forum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ForumPostDetail, ForumReply } from '@/lib/types/forum';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function PerawatForumPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params?.postId);
  const { token } = useAuthStore();
  const [post, setPost] = useState<ForumPostDetail | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!token || !postId || Number.isNaN(postId)) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await forumApi.getPost(token, postId);
      setPost(data);
      setReplies(data.replies ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat postingan.';
      setError(message);
      setPost(null);
      setReplies([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, postId]);

  useEffect(() => {
    if (token) fetchPost();
  }, [token, fetchPost]);

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  const handleLike = async () => {
    if (!token || !postId || isTogglingLike) return;
    setIsTogglingLike(true);
    try {
      const res = await forumApi.likePost(token, postId);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              like_count: res.like_count,
              is_liked: res.is_liked,
            }
          : null
      );
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!token || !postId || !text || isSendingReply) return;
    setIsSendingReply(true);
    setReplyText('');
    try {
      const newReply = await forumApi.createReply(token, postId, { reply_text: text });
      setReplies((prev) => [...prev, newReply]);
      setPost((prev) =>
        prev ? { ...prev, reply_count: prev.reply_count + 1 } : null
      );
    } catch {
      setReplyText(text);
    } finally {
      setIsSendingReply(false);
    }
  };

  if (Number.isNaN(postId)) {
    return (
      <div className="p-8">
        <p className="text-red-600">ID postingan tidak valid.</p>
        <Link href="/perawat/forum">
          <Button variant="outline" className="mt-4">
            Kembali ke Forum
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B9ECF]" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error ?? 'Postingan tidak ditemukan.'}</p>
        <Link href="/perawat/forum">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Forum
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 pt-8 pb-4">
        <Link
          href="/perawat/forum"
          className="inline-flex items-center gap-2 text-sm text-[#3B9ECF] hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Forum
        </Link>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
              <span>{post.author_name ?? 'Anonim'}</span>
              <span>·</span>
              <span>{format(new Date(post.created_at), 'd MMM yyyy, HH:mm', { locale: id })}</span>
              {(post.category_display_name || post.category_name) && (
                <>
                  <span>·</span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {post.category_display_name || post.category_name}
                  </Badge>
                </>
              )}
            </div>
            <CardTitle className="text-xl">{post.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 whitespace-pre-wrap">{post.details}</p>
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleLike}
                disabled={isTogglingLike}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-500 disabled:opacity-50"
              >
                <Heart
                  className={`w-5 h-5 ${post.is_liked ? 'fill-red-500 text-red-500' : ''}`}
                />
                {post.like_count}
              </button>
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <MessageCircle className="w-5 h-5" />
                {post.reply_count}
              </span>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Balasan</h2>

        <form onSubmit={handleSubmitReply} className="mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Tulis balasan..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1"
              maxLength={2000}
            />
            <Button
              type="submit"
              disabled={!replyText.trim() || isSendingReply}
              className="bg-[#3B9ECF] hover:bg-[#2d8ab8] gap-2"
            >
              <Send className="w-4 h-4" />
              Kirim
            </Button>
          </div>
        </form>

        <ul className="space-y-4">
          {replies.length === 0 ? (
            <li className="text-sm text-gray-500 py-4">Belum ada balasan.</li>
          ) : (
            replies.map((reply) => (
              <li key={reply.id}>
                <Card>
                  <CardHeader className="py-3 pb-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-900">
                        {reply.author_name ?? 'Anonim'}
                      </span>
                      <span>·</span>
                      <span>
                        {format(new Date(reply.created_at), 'd MMM yyyy, HH:mm', {
                          locale: id,
                        })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 pb-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {reply.reply_text}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
