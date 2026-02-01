'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useChatStore } from '@/lib/stores/chat-store';
import { nurseApi } from '@/lib/api/nurse';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { MessageInput } from './MessageInput';
import type { ConversationWithDetails } from '@/lib/types/chat';

interface ChatContainerProps {
  currentUserId: number;
  authToken: string;
  className?: string;
  /** Pre-select conversation with this ibu_hamil_id (e.g. from query ?ibu_hamil_id=...) */
  initialIbuHamilId?: number;
}

export function ChatContainer({
  currentUserId,
  authToken,
  className,
  initialIbuHamilId,
}: ChatContainerProps) {
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithDetails | null>(null);
  const [composeIbuHamilName, setComposeIbuHamilName] = useState<string | null>(null);
  const token = useAuthStore((s) => s.token);
  const conversations = useChatStore((s) => s.conversations);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isSending = useChatStore((s) => s.isSendingMessage);
  const fetchConversations = useChatStore((s) => s.fetchConversations);

  // Auto-select conversation when initialIbuHamilId matches and list has loaded
  useEffect(() => {
    if (initialIbuHamilId == null || conversations.length === 0) return;
    const match = conversations.find((c) => c.ibu_hamil_id === initialIbuHamilId);
    if (match) {
      setSelectedConversation(match);
    }
  }, [initialIbuHamilId, conversations]);

  // Fetch nama ibu hamil saat compose view (agar tampil nama, bukan ID)
  useEffect(() => {
    if (initialIbuHamilId == null || !token) return;
    let cancelled = false;
    nurseApi
      .getIbuHamilDetail(token, initialIbuHamilId)
      .then((data) => {
        if (!cancelled) setComposeIbuHamilName(data.nama_lengkap);
      })
      .catch(() => {
        if (!cancelled) setComposeIbuHamilName(null);
      });
    return () => {
      cancelled = true;
    };
  }, [initialIbuHamilId, token]);

  const handleComposeSend = (messageText: string) => {
    if (initialIbuHamilId == null) return;
    sendMessage(initialIbuHamilId, messageText).then(() => {
      fetchConversations();
    });
  };

  const showComposeView =
    initialIbuHamilId != null &&
    !selectedConversation &&
    !conversations.some((c) => c.ibu_hamil_id === initialIbuHamilId);

  const displayComposeName = composeIbuHamilName ?? 'Memuat nama...';

  return (
    <div className={`${className ?? ''} flex min-h-0 overflow-hidden`}>
      {/* Sidebar: daftar percakapan */}
      <aside className="w-80 min-w-0 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 shrink-0 bg-gray-50/80">
          <h2 className="font-semibold text-gray-900">Percakapan</h2>
          <p className="text-xs text-gray-500 mt-0.5">Pilih percakapan untuk melihat chat</p>
        </div>
        <ConversationList
          onConversationClick={setSelectedConversation}
          selectedConversationId={selectedConversation?.id}
          className="flex-1 min-h-0"
        />
      </aside>

      {/* Area utama: chat atau empty state */}
      <main className="flex-1 min-w-0 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUserId={currentUserId}
            authToken={authToken}
          />
        ) : showComposeView ? (
          <div className="flex-1 flex flex-col h-full bg-white">
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <h2 className="font-semibold text-gray-900 text-lg">
                Mulai percakapan dengan {displayComposeName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Kirim pesan pertama untuk memulai chat.
              </p>
            </div>
            <div className="flex-1 overflow-auto p-4" />
            <div className="p-4 border-t border-gray-200 bg-white">
              <MessageInput
                onSend={handleComposeSend}
                isSending={isSending}
                placeholder="Ketik pesan..."
              />
            </div>
          </div>
        ) : (
          <div
            data-no-conversation-selected
            role="status"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg m-4 border border-gray-100"
          >
            <p className="text-gray-600 mb-3">
              Belum ada percakapan. Pilih percakapan di sebelah kiri atau mulai chat dari Daftar Pasien.
            </p>
            <Link
              href="/perawat/pasien"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B9ECF] text-white font-medium hover:bg-[#2d8ab8] transition-colors"
            >
              Buka Daftar Pasien →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
