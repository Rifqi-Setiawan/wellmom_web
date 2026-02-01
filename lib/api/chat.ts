import axios from 'axios';
import type {
  Conversation,
  ConversationListResponse,
  Message,
  MessageListResponse,
  SendMessageRequest,
  UnreadCountResponse,
  MarkReadResponse,
} from '@/lib/types/chat';

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// CHAT API SERVICE
// ============================================

export const chatApi = {
  /**
   * Get list of conversations for current perawat
   */
  getConversations: async (
    token: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<ConversationListResponse> => {
    const response = await api.get<ConversationListResponse>(
      '/api/v1/chat/conversations',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { skip, limit },
      }
    );
    return response.data;
  },

  /**
   * Get single conversation detail
   */
  getConversation: async (
    token: string,
    conversationId: number
  ): Promise<Conversation> => {
    const response = await api.get<Conversation>(
      `/api/v1/chat/conversations/${conversationId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (
    token: string,
    conversationId: number,
    skip: number = 0,
    limit: number = 50
  ): Promise<MessageListResponse> => {
    const response = await api.get<MessageListResponse>(
      `/api/v1/chat/conversations/${conversationId}/messages`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { skip, limit },
      }
    );
    return response.data;
  },

  /**
   * Send message to ibu hamil
   */
  sendMessage: async (
    token: string,
    data: SendMessageRequest
  ): Promise<Message> => {
    const response = await api.post<Message>(
      '/api/v1/chat/messages',
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Mark messages as read
   */
  markMessagesAsRead: async (
    token: string,
    conversationId: number,
    messageIds?: number[]
  ): Promise<MarkReadResponse> => {
    const response = await api.post<MarkReadResponse>(
      `/api/v1/chat/conversations/${conversationId}/mark-read`,
      { message_ids: messageIds },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Get unread message count for conversation
   */
  getUnreadCount: async (
    token: string,
    conversationId: number
  ): Promise<UnreadCountResponse> => {
    const response = await api.get<UnreadCountResponse>(
      `/api/v1/chat/conversations/${conversationId}/unread-count`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
