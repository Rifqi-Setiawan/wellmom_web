// ============================================
// FORUM CATEGORY TYPES
// ============================================

export interface ForumCategory {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// FORUM POST TYPES
// ============================================

export interface ForumPost {
  id: number;
  author_user_id: number;
  author_name: string | null;
  author_role: string | null;
  author_photo_url?: string | null;
  title: string;
  details: string;
  category_id: number;
  category_name?: string | null;
  category_display_name?: string | null;
  like_count: number;
  reply_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForumPostListResponse {
  posts: ForumPost[];
  total: number;
  has_more?: boolean;
}

// ============================================
// FORUM REPLY TYPES
// ============================================

export interface ForumReply {
  id: number;
  post_id: number;
  author_user_id: number;
  author_name: string | null;
  author_role: string | null;
  reply_text: string;
  parent_reply_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ForumPostDetail extends ForumPost {
  replies?: ForumReply[];
}

export interface ForumReplyListResponse {
  replies: ForumReply[];
  total: number;
  has_more?: boolean;
}

// ============================================
// REQUEST TYPES
// ============================================

export interface CreateForumPostRequest {
  title: string;
  details: string;
  category_id: number;
}

export interface CreateForumReplyRequest {
  reply_text: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface LikePostResponse {
  like_count: number;
  is_liked: boolean;
  message?: string;
}
