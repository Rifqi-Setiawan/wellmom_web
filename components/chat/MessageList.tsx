'use client';

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Message } from '@/lib/types/chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  isLoading?: boolean;
  className?: string;
}

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  className,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center py-12 ${className ?? ''}`}
        role="status"
        aria-live="polite"
      >
        <p className="text-sm text-gray-500">Memuat pesan...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 text-center ${className ?? ''}`}
        role="status"
      >
        <p className="text-sm text-gray-500">Belum ada pesan. Kirim pesan pertama untuk memulai.</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-3 ${className ?? ''}`}
      role="log"
      aria-live="polite"
      aria-label="Daftar pesan"
    >
      {messages.map((msg) => {
        const isOwnMessage = msg.sender_user_id === currentUserId;

        return (
          <div
            key={msg.id}
            data-message-id={msg.id}
            data-own-message={isOwnMessage}
            data-sender-role={msg.sender_role}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                isOwnMessage
                  ? 'bg-[#3B9ECF] text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.message_text}</p>
              <p
                className={`text-xs mt-1 ${
                  isOwnMessage ? 'text-white/80' : 'text-gray-400'
                }`}
              >
                {format(new Date(msg.created_at), 'HH:mm', { locale: id })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}
