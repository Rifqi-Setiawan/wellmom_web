'use client';

import Link from 'next/link';
import { useConversations } from '@/hooks/use-chat';
import { useIbuHamilNames } from '@/hooks/use-ibu-hamil-names';
import { buildImageUrl } from '@/lib/utils';
import type { ConversationWithDetails } from '@/lib/types/chat';

/** Inisial dari nama (untuk avatar) */
function getInitial(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return first || '?';
}

/** Mendapatkan photo URL dari conversation */
function getPhotoUrl(conv: ConversationWithDetails): string | null {
  // Prioritas 1: Dari field langsung ibu_hamil_photo_url
  if (conv.ibu_hamil_photo_url) {
    return conv.ibu_hamil_photo_url;
  }
  
  // Prioritas 2: Dari nested user object
  if (conv.ibu_hamil?.user?.photo_profile_url) {
    return conv.ibu_hamil.user.photo_profile_url;
  }
  
  return null;
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
        const photoUrl = getPhotoUrl(conv);
        const imageUrl = photoUrl ? buildImageUrl(photoUrl) : null;

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
            {/* Avatar dengan foto profil atau fallback */}
            <div className="relative w-12 h-12 shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    // Fallback ke initial jika gambar gagal load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full rounded-full flex items-center justify-center text-sm font-semibold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#3B9ECF] text-white'
                } ${imageUrl ? 'absolute inset-0 hidden' : ''}`}
              >
                {initial}
              </div>
            </div>
            
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <div className="font-medium truncate text-base">{displayName}</div>
              <div className={`text-sm truncate line-clamp-1 ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                {conv.last_message_text || 'Belum ada pesan'}
              </div>
              {conv.unread_count > 0 && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    data-unread-badge
                    aria-label={`${conv.unread_count} belum dibaca`}
                    className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-medium ${
                      isSelected ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {conv.unread_count}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
