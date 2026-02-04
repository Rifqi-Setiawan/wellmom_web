'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@/hooks/use-chat';
import { useChatStore } from '@/lib/stores/chat-store';
import { nurseApi } from '@/lib/api/nurse';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { ConversationWithDetails } from '@/lib/types/chat';

interface ChatWindowProps {
  conversation: ConversationWithDetails;
  currentUserId: number;
  authToken: string;
  className?: string;
}

export function ChatWindow({
  conversation,
  currentUserId,
  authToken,
  className,
}: ChatWindowProps) {
  const {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
  } = useConversation(conversation.id, authToken);

  const markAsRead = useChatStore((s) => s.markAsRead);
  const [fetchedName, setFetchedName] = useState<string | null>(null);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (conversation.unread_count > 0 && messages.length > 0) {
      markAsRead(conversation.id);
    }
  }, [conversation.id, conversation.unread_count, messages.length, markAsRead]);

  /** Nama ibu hamil: dari API chat jika ada, else dari API daftar pasien (getIbuHamilDetail) */
  useEffect(() => {
    if (conversation.ibu_hamil_name?.trim()) {
      setFetchedName(null);
      return;
    }
    if (!authToken || !conversation.ibu_hamil_id) return;

    let cancelled = false;
    nurseApi
      .getIbuHamilDetail(authToken, conversation.ibu_hamil_id)
      .then((data) => {
        if (!cancelled && data?.nama_lengkap) setFetchedName(data.nama_lengkap);
      })
      .catch(() => {
        if (!cancelled) setFetchedName(null);
      });
    return () => {
      cancelled = true;
    };
  }, [authToken, conversation.ibu_hamil_id, conversation.ibu_hamil_name]);

  const displayName =
    conversation.ibu_hamil_name?.trim() || fetchedName || 'Memuat nama...';

  const handleSend = (messageText: string) => {
    sendMessage(conversation.ibu_hamil_id, messageText);
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className ?? ''}`}>
      {/* Header: nama ibu hamil (sesuai Swagger, tanpa status online/offline) */}
      <header
        data-chat-header
        className={`shrink-0 px-6 py-4 border-b bg-white shadow-sm relative ${
          conversation.unread_count > 0 ? 'border-red-300' : 'border-gray-200'
        }`}
      >
        {/* Bar merah indikator unread messages */}
        {conversation.unread_count > 0 && (
          <div 
            className="absolute top-0 left-0 right-0 h-1 bg-red-500"
            aria-label={`${conversation.unread_count} pesan belum dibaca`}
            title={`${conversation.unread_count} pesan belum dibaca`}
          />
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#3B9ECF] flex items-center justify-center text-white font-semibold text-lg shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-gray-900 text-lg truncate">
                {displayName}
              </h1>
              {conversation.unread_count > 0 && (
                <p className="text-xs text-red-600 mt-0.5">
                  {conversation.unread_count} pesan belum dibaca
                </p>
              )}
            </div>
          </div>
          {conversation.unread_count > 0 && (
            <div className="flex items-center gap-2">
              <span
                aria-label={`${conversation.unread_count} belum dibaca`}
                className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-medium bg-red-500 text-white"
              >
                {conversation.unread_count}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div
            data-error
            role="alert"
            className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
          >
            {error}
          </div>
        )}
      </header>

      {/* Daftar pesan */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoading}
        className="flex-1 min-h-0 overflow-auto p-4"
      />

      {/* Input kirim pesan */}
      <div className="shrink-0 p-4 border-t border-gray-200 bg-gray-50/80">
        <MessageInput
          onSend={handleSend}
          isSending={isSending}
        />
      </div>
    </div>
  );
}
