import axios from 'axios';
import type {
  ForumCategory,
  ForumPost,
  ForumPostDetail,
  ForumPostListResponse,
  ForumReply,
  ForumReplyListResponse,
  CreateForumPostRequest,
  CreateForumReplyRequest,
  LikePostResponse,
} from '@/lib/types/forum';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const forumApi = {
  /**
   * GET /api/v1/forum/categories — Daftar kategori forum (untuk filter & form buat post).
   */
  getCategories: async (token: string): Promise<ForumCategory[]> => {
    const response = await api.get<ForumCategory[]>(
      '/api/v1/forum/categories',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * GET /api/v1/forum — Daftar post. Query: search?, category_id?, skip, limit.
   */
  getPosts: async (
    token: string,
    params?: { search?: string; category_id?: number; skip?: number; limit?: number }
  ): Promise<ForumPostListResponse> => {
    const response = await api.get<ForumPostListResponse>('/api/v1/forum', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        skip: params?.skip ?? 0,
        limit: params?.limit ?? 20,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.category_id != null ? { category_id: params.category_id } : {}),
      },
    });
    return response.data;
  },

  /**
   * GET /api/v1/forum/recent — Postingan terbaru (opsional).
   */
  getRecentPosts: async (
    token: string,
    limit: number = 10
  ): Promise<ForumPost[]> => {
    try {
      const response = await api.get<ForumPost[] | ForumPostListResponse>(
        '/api/v1/forum/recent',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit },
        }
      );
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'posts' in data) {
        return (data as ForumPostListResponse).posts;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * GET /api/v1/forum/{post_id} — Detail satu post beserta replies.
   */
  getPost: async (
    token: string,
    postId: number
  ): Promise<ForumPostDetail> => {
    const response = await api.get<ForumPostDetail>(
      `/api/v1/forum/${postId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * GET /api/v1/forum/{post_id}/replies — Daftar balasan suatu post.
   */
  getReplies: async (
    token: string,
    postId: number,
    params?: { skip?: number; limit?: number }
  ): Promise<ForumReplyListResponse> => {
    const response = await api.get<ForumReplyListResponse>(
      `/api/v1/forum/${postId}/replies`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { skip: params?.skip ?? 0, limit: params?.limit ?? 50 },
      }
    );
    return response.data;
  },

  /**
   * POST /api/v1/forum — Buat post. Body: title, details, category_id.
   */
  createPost: async (
    token: string,
    data: CreateForumPostRequest
  ): Promise<ForumPost> => {
    const response = await api.post<ForumPost>('/api/v1/forum', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * POST /api/v1/forum/{post_id}/replies — Kirim balasan. Body: reply_text.
   */
  createReply: async (
    token: string,
    postId: number,
    data: CreateForumReplyRequest
  ): Promise<ForumReply> => {
    const response = await api.post<ForumReply>(
      `/api/v1/forum/${postId}/replies`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * POST /api/v1/forum/{post_id}/like — Like/unlike post.
   */
  likePost: async (
    token: string,
    postId: number
  ): Promise<LikePostResponse> => {
    const response = await api.post<LikePostResponse>(
      `/api/v1/forum/${postId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};
