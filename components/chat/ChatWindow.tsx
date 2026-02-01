'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@/hooks/use-chat';
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

  const [fetchedName, setFetchedName] = useState<string | null>(null);

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
        className="shrink-0 px-6 py-4 border-b border-gray-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#3B9ECF] flex items-center justify-center text-white font-semibold text-lg shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-gray-900 text-lg truncate">
                {displayName}
              </h1>
            </div>
          </div>
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
