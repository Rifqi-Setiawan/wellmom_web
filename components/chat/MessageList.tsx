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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Auto scroll ke bawah saat pesan baru masuk
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      // Hanya scroll jika user sudah di bagian bawah (tidak sedang scroll ke atas)
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // ✅ Scroll ke bawah saat pertama kali load
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [isLoading]);

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
      ref={messagesContainerRef}
      className={`flex flex-col gap-3 overflow-y-auto ${className ?? ''}`}
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
            className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex flex-col max-w-[75%] sm:max-w-[70%] md:max-w-[65%] ${
                isOwnMessage ? 'items-end' : 'items-start'
              }`}
            >
              {/* ✅ Bubble Chat dengan styling modern */}
              <div
                className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                  isOwnMessage
                    ? 'bg-[#3B9ECF] text-white rounded-br-md' // ✅ Sudut tumpul kecuali pojok kanan bawah
                    : 'bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200' // ✅ Sudut tumpul kecuali pojok kiri bawah
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {msg.message_text}
                </p>
                {/* ✅ Timestamp di pojok bawah */}
                <p
                  className={`text-xs mt-1.5 flex justify-end ${
                    isOwnMessage ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {format(new Date(msg.created_at), 'HH:mm', { locale: id })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}
