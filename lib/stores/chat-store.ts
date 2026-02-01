import { create } from 'zustand';
import { chatApi } from '@/lib/api/chat';
import { chatWebSocket } from '@/lib/chat-websocket-manager';
import { useAuthStore } from '@/lib/stores/auth-store';
import type {
  ConversationWithDetails,
  Message,
} from '@/lib/types/chat';

/** Pastikan tidak ada duplikat id (race: API response + WebSocket bisa kirim pesan yang sama). */
function dedupeMessagesById(messages: Message[]): Message[] {
  const seen = new Set<number>();
  return messages.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

// ============================================
// CHAT STORE
// ============================================

interface ChatStore {
  // State
  conversations: ConversationWithDetails[];
  currentConversation: ConversationWithDetails | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;

  // WebSocket
  isConnected: boolean;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: number) => Promise<void>;
  sendMessage: (ibuHamilId: number, messageText: string) => Promise<void>;
  markAsRead: (
    conversationId: number,
    messageIds?: number[]
  ) => Promise<void>;

  // WebSocket actions
  connectWebSocket: (conversationId: number, token: string) => void;
  disconnectWebSocket: () => void;

  // Helpers
  setCurrentConversation: (conversationId: number | null) => void;
  addMessage: (message: Message) => void;
  updateUnreadCount: (conversationId: number, count: number) => void;
  clearError: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,
  isConnected: false,

  fetchConversations: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Unauthorized', isLoadingConversations: false });
      return;
    }

    set({ isLoadingConversations: true, error: null });
    try {
      const response = await chatApi.getConversations(token, 0, 50);
      set({
        conversations: response.conversations,
        isLoadingConversations: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch conversations',
        isLoadingConversations: false,
      });
    }
  },

  fetchMessages: async (conversationId: number) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Unauthorized', isLoadingMessages: false });
      return;
    }

    set({ messages: [], isLoadingMessages: true, error: null });
    try {
      const response = await chatApi.getMessages(
        token,
        conversationId,
        0,
        50
      );
      set({
        messages: dedupeMessagesById(response.messages),
        isLoadingMessages: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch messages',
        isLoadingMessages: false,
      });
    }
  },

  sendMessage: async (ibuHamilId: number, messageText: string) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: 'Unauthorized', isSendingMessage: false });
      return;
    }

    set({ isSendingMessage: true, error: null });
    try {
      const newMessage = await chatApi.sendMessage(token, {
        ibu_hamil_id: ibuHamilId,
        message_text: messageText,
      });

      set((state) => ({
        messages: dedupeMessagesById([...state.messages, newMessage]),
        isSendingMessage: false,
      }));

      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.ibu_hamil_id === ibuHamilId
            ? {
                ...conv,
                last_message_text: messageText,
                last_message_sender_id: newMessage.sender_user_id,
                last_message_at: newMessage.created_at,
              }
            : conv
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to send message',
        isSendingMessage: false,
      });
    }
  },

  markAsRead: async (conversationId: number, messageIds?: number[]) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      await chatApi.markMessagesAsRead(token, conversationId, messageIds);

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.conversation_id === conversationId && !msg.is_read
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        ),
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        ),
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  connectWebSocket: (conversationId: number, token: string) => {
    get().disconnectWebSocket();

    chatWebSocket.onMessage = (message: Message) => {
      get().addMessage(message);
    };

    chatWebSocket.onReadReceipt = (data) => {
      get().updateUnreadCount(data.conversation_id, 0);
    };

    chatWebSocket.onConnect = () => {
      set({ isConnected: true });
    };

    chatWebSocket.onDisconnect = () => {
      set({ isConnected: false });
    };

    chatWebSocket.onError = () => {
      set({ isConnected: false });
    };

    chatWebSocket.connect(conversationId, token);
    set({ isConnected: true });
  },

  disconnectWebSocket: () => {
    chatWebSocket.disconnect();
    chatWebSocket.onMessage = null;
    chatWebSocket.onReadReceipt = null;
    chatWebSocket.onConnect = null;
    chatWebSocket.onDisconnect = null;
    chatWebSocket.onError = null;
    set({ isConnected: false });
  },

  setCurrentConversation: (conversationId: number | null) => {
    if (conversationId === null) {
      set({ currentConversation: null });
      return;
    }

    const conv = get().conversations.find((c) => c.id === conversationId);
    set({ currentConversation: conv ?? null });
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: dedupeMessagesById([...state.messages, message]),
    }));
  },

  updateUnreadCount: (conversationId: number, count: number) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unread_count: count } : conv
      ),
    }));
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      isLoadingConversations: false,
      isLoadingMessages: false,
      isSendingMessage: false,
      error: null,
      isConnected: false,
    }),
}));

export default useChatStore;
