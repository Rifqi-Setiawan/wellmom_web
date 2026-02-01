'use client';

import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ChatContainer } from '@/components/chat/ChatContainer';

/**
 * Chat page for perawat.
 * Route: /perawat/chat
 * Query: ?ibu_hamil_id=123 — auto-select conversation with that ibu hamil (from daftar pasien / detail pasien).
 * Auth: Protected by perawat layout (redirect to /login if not perawat).
 */
export default function PerawatChatPage() {
  const searchParams = useSearchParams();
  const { user, token } = useAuthStore();

  const ibuHamilIdParam = searchParams.get('ibu_hamil_id');
  const initialIbuHamilId =
    ibuHamilIdParam != null ? parseInt(ibuHamilIdParam, 10) : undefined;
  const validIbuHamilId =
    initialIbuHamilId != null && !Number.isNaN(initialIbuHamilId)
      ? initialIbuHamilId
      : undefined;

  if (!token || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#3B9ECF]"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <ChatContainer
        currentUserId={user.id}
        authToken={token}
        className="flex-1 min-h-0 flex"
        initialIbuHamilId={validIbuHamilId}
      />
    </div>
  );
}
