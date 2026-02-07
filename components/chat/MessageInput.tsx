'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => void;
  isSending?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  isSending,
  disabled,
  className,
  placeholder = 'Ketik pesan...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ✅ Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || isSending || disabled) return;

    onSend(trimmed);
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // ✅ Handling keyboard: Enter = kirim, Shift+Enter = baris baru
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter akan membuat baris baru secara default
  };

  const isDisabled = disabled || isSending;
  const canSend = !isDisabled && message.trim().length > 0;

  return (
    <div className={`flex gap-2 items-end ${className ?? ''}`}>
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          style={{ resize: 'none', minHeight: '44px', maxHeight: '120px' }}
          aria-label="Input pesan"
          aria-disabled={isDisabled}
          className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-[#3B9ECF] disabled:bg-gray-100 disabled:cursor-not-allowed text-sm overflow-y-auto"
        />
        {/* Hint text hanya muncul saat ada teks */}
        {message.trim().length > 0 && (
          <div className="absolute bottom-1 right-2 text-[10px] text-gray-400 pointer-events-none">
            Shift+Enter untuk baris baru
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        aria-label={isSending ? 'Mengirim pesan' : 'Kirim pesan'}
        className="shrink-0 h-[44px] w-[44px] rounded-xl bg-[#3B9ECF] text-white hover:bg-[#2d8ab8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:ring-offset-2 flex items-center justify-center"
      >
        {isSending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
