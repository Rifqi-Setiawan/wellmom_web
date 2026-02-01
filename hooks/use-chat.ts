'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useChatStore } from '@/lib/stores/chat-store';

/**
 * Hook for conversation list: fetches on mount when token is available,
 * returns conversations, loading, error, and refresh.
 */
export function useConversations() {
  const token = useAuthStore((s) => s.token);
  const conversations = useChatStore((s) => s.conversations);
  const isLoading = useChatStore((s) => s.isLoadingConversations);
  const error = useChatStore((s) => s.error);
  const fetchConversations = useChatStore((s) => s.fetchConversations);

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token, fetchConversations]);

  const refresh = () => {
    useChatStore.getState().fetchConversations();
  };

  return { conversations, isLoading, error, refresh };
}

/**
 * Hook for a single conversation: fetches messages, connects WebSocket,
 * returns messages, loading, sending, error, connection status, sendMessage.
 * Cleanup: disconnects WebSocket on unmount.
 */
export function useConversation(conversationId: number, authToken: string) {
  const {
    messages,
    isLoadingMessages,
    isSendingMessage,
    error,
    isConnected,
    setCurrentConversation,
    fetchMessages,
    connectWebSocket,
    disconnectWebSocket,
    sendMessage: storeSendMessage,
  } = useChatStore();

  useEffect(() => {
    if (!conversationId || !authToken) return;

    setCurrentConversation(conversationId);
    fetchMessages(conversationId);
    connectWebSocket(conversationId, authToken);

    return () => {
      disconnectWebSocket();
    };
  }, [
    conversationId,
    authToken,
    setCurrentConversation,
    fetchMessages,
    connectWebSocket,
    disconnectWebSocket,
  ]);

  const sendMessage = (ibuHamilId: number, messageText: string) => {
    storeSendMessage(ibuHamilId, messageText);
  };

  return {
    messages,
    isLoading: isLoadingMessages,
    isSending: isSendingMessage,
    error,
    isConnected,
    sendMessage,
  };
}
