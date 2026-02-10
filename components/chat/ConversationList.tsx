'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useConversations } from '@/hooks/use-chat';
import { useIbuHamilNames } from '@/hooks/use-ibu-hamil-names';
import { useAuthStore } from '@/lib/stores/auth-store';
import { nurseApi } from '@/lib/api/nurse';
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
  const token = useAuthStore((s) => s.token);
  const idsNeedName = conversations
    .filter((c) => !c.ibu_hamil_name?.trim())
    .map((c) => c.ibu_hamil_id);
  const ibuHamilNames = useIbuHamilNames(idsNeedName);
  
  // ✅ State untuk menyimpan foto profil yang di-fetch
  const [photoUrls, setPhotoUrls] = useState<Record<number, string | null>>({});
  // ✅ Ref untuk tracking foto yang sedang di-fetch (hindari duplicate fetch)
  const fetchingRef = useRef<Set<number>>(new Set());

  /** Nama ibu hamil: dari API chat jika ada, else dari API daftar pasien (getIbuHamilDetail) */
  function getDisplayName(conv: ConversationWithDetails): string {
    return (
      conv.ibu_hamil_name?.trim() ||
      ibuHamilNames[conv.ibu_hamil_id] ||
      (idsNeedName.includes(conv.ibu_hamil_id) ? 'Memuat...' : 'Ibu Hamil')
    );
  }

  // ✅ Fetch foto profil untuk conversation yang belum punya foto
  useEffect(() => {
    if (!token || conversations.length === 0) return;

    const fetchPhotos = async () => {
      const photosToFetch = conversations
        .filter((conv) => {
          // Hanya fetch jika belum ada foto di conversation dan belum di-fetch sebelumnya
          const existingPhoto = getPhotoUrl(conv);
          const alreadyFetched = photoUrls[conv.ibu_hamil_id] !== undefined;
          const isFetching = fetchingRef.current.has(conv.ibu_hamil_id);
          return !existingPhoto && !alreadyFetched && !isFetching;
        })
        .map((conv) => conv.ibu_hamil_id);

      if (photosToFetch.length === 0) return;

      // Mark sebagai sedang di-fetch
      photosToFetch.forEach((id) => fetchingRef.current.add(id));

      // Fetch foto untuk semua conversation yang perlu
      const photoPromises = photosToFetch.map(async (ibuHamilId) => {
        try {
          const detail = await nurseApi.getIbuHamilDetail(token, ibuHamilId);
          return {
            ibuHamilId,
            photoUrl: detail?.profile_photo_url || null,
          };
        } catch (error) {
          console.error(`Failed to fetch photo for ibu hamil ${ibuHamilId}:`, error);
          return { ibuHamilId, photoUrl: null };
        } finally {
          // Hapus dari fetching set setelah selesai
          fetchingRef.current.delete(ibuHamilId);
        }
      });

      const results = await Promise.all(photoPromises);
      const newPhotoUrls: Record<number, string | null> = {};
      results.forEach(({ ibuHamilId, photoUrl }) => {
        newPhotoUrls[ibuHamilId] = photoUrl;
      });

      setPhotoUrls((prev) => ({ ...prev, ...newPhotoUrls }));
    };

    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, conversations]);

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
        
        // ✅ Prioritas: dari conversation -> dari fetched photos -> null
        const photoUrl = getPhotoUrl(conv) || photoUrls[conv.ibu_hamil_id] || null;
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
            {/* ✅ Avatar dengan struktur sama seperti sidebar perawat */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden shrink-0 relative ${
              isSelected ? 'bg-white/20' : 'bg-[#3B9ECF]'
            }`}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={displayName}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={() => {
                    // Hapus dari state jika gambar gagal load
                    setPhotoUrls((prev) => {
                      const updated = { ...prev };
                      updated[conv.ibu_hamil_id] = null;
                      return updated;
                    });
                  }}
                />
              ) : null}
              <span className={imageUrl ? 'invisible' : 'visible'}>
                {initial}
              </span>
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
