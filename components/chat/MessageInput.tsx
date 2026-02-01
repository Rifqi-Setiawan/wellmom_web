'use client';

import { useState, KeyboardEvent } from 'react';

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

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    onSend(trimmed);
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = disabled || isSending;
  const canSend = !isDisabled && message.trim().length > 0;

  return (
    <div className={`flex gap-2 items-end ${className ?? ''}`}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        rows={1}
        style={{ resize: 'none' }}
        aria-label="Input pesan"
        aria-disabled={isDisabled}
        className="flex-1 min-h-[44px] max-h-32 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-[#3B9ECF] disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        aria-label={isSending ? 'Mengirim pesan' : 'Kirim pesan'}
        className="shrink-0 h-[44px] px-5 rounded-xl bg-[#3B9ECF] text-white font-medium text-sm hover:bg-[#2d8ab8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:ring-offset-2"
      >
        {isSending ? 'Mengirim...' : 'Kirim'}
      </button>
    </div>
  );
}
