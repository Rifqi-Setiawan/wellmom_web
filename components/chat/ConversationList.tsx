'use client';

import Link from 'next/link';
import { useConversations } from '@/hooks/use-chat';
import { useIbuHamilNames } from '@/hooks/use-ibu-hamil-names';
import type { ConversationWithDetails } from '@/lib/types/chat';

/** Inisial dari nama (untuk avatar) */
function getInitial(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return first || '?';
}

interface ConversationListProps {
  onConversationClick?: (conversation: ConversationWithDetails) => void;
  className?: string;
  selectedConversationId?: number | null;
}

export function ConversationList({
  onConversationClick,
  className,
  selectedConversationId,
}: ConversationListProps) {
  const { conversations, isLoading, error, refresh } = useConversations();
  const idsNeedName = conversations
    .filter((c) => !c.ibu_hamil_name?.trim())
    .map((c) => c.ibu_hamil_id);
  const ibuHamilNames = useIbuHamilNames(idsNeedName);

  /** Nama ibu hamil: dari API chat jika ada, else dari API daftar pasien (getIbuHamilDetail) */
  function getDisplayName(conv: ConversationWithDetails): string {
    return (
      conv.ibu_hamil_name?.trim() ||
      ibuHamilNames[conv.ibu_hamil_id] ||
      (idsNeedName.includes(conv.ibu_hamil_id) ? 'Memuat...' : 'Ibu Hamil')
    );
  }

  if (isLoading) {
    return (
      <div className={`p-4 ${className ?? ''}`} role="status" aria-live="polite">
        <p className="text-sm text-gray-500">Memuat percakapan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className ?? ''}`} role="alert">
        <p className="text-sm text-red-600 mb-2">{error}</p>
        <button
          type="button"
          onClick={refresh}
          className="text-sm text-[#3B9ECF] font-medium hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={`p-4 flex flex-col gap-3 ${className ?? ''}`}>
        <p className="text-sm text-gray-600">Belum ada percakapan.</p>
        <Link
          href="/perawat/pasien"
          className="text-sm text-[#3B9ECF] font-medium hover:underline"
        >
          Buka Daftar Pasien →
        </Link>
      </div>
    );
  }

  return (
    <div className={`overflow-auto flex-1 min-h-0 ${className ?? ''}`} role="list">
      {conversations.map((conv) => {
        const displayName = getDisplayName(conv);
        const initial = getInitial(displayName);
        const isSelected = conv.id === selectedConversationId;

        return (
          <div
            key={conv.id}
            onClick={() => onConversationClick?.(conv)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onConversationClick?.(conv);
              }
            }}
            data-selected={isSelected}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`Percakapan dengan ${displayName}`}
            className={`flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer transition-colors ${
              isSelected ? 'bg-[#3B9ECF] text-white' : 'hover:bg-gray-50'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                isSelected ? 'bg-white/20 text-white' : 'bg-[#3B9ECF] text-white'
              }`}
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
              <div className="font-medium truncate">{displayName}</div>
              <div className={`text-sm truncate ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                {conv.last_message_text || 'Belum ada pesan'}
              </div>
              {conv.unread_count > 0 && (
                <span
                  data-unread-badge
                  aria-label={`${conv.unread_count} belum dibaca`}
                  className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-medium mt-1 ${
                    isSelected ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {conv.unread_count}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
