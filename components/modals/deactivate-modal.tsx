'use client';

import { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface DeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeactivate: (reason: string) => Promise<void>;
  puskesmasName: string;
  isProcessing?: boolean;
}

export default function DeactivateModal({
  isOpen,
  onClose,
  onDeactivate,
  puskesmasName,
  isProcessing = false,
}: DeactivateModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDeactivate = async () => {
    setError('');
    
    if (!reason.trim()) {
      setError('Alasan penonaktifan harus diisi');
      return;
    }

    if (reason.trim().length < 5) {
      setError('Alasan penonaktifan minimal 5 karakter');
      return;
    }

    setIsSubmitting(true);
    try {
      await onDeactivate(reason.trim());
      setReason('');
      onClose();
    } catch (error) {
      console.error('Deactivate error:', error);
      setError(error instanceof Error ? error.message : 'Gagal menonaktifkan puskesmas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isProcessing) {
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Nonaktifkan Puskesmas?
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting || isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Anda akan menonaktifkan <strong>{puskesmasName}</strong>.
          </p>

          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  PERHATIAN: Tindakan ini akan:
                </p>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Menghapus semua relasi ibu hamil</li>
                  <li>Menghapus semua perawat</li>
                  <li>Menonaktifkan akun admin</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="deactivate-reason">
              Alasan Penonaktifan <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="deactivate-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Masukkan alasan penonaktifan puskesmas..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting || isProcessing}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <p className="text-xs text-gray-500">
              Minimal 5 karakter. {reason.length}/5
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || isProcessing}
          >
            Batal
          </Button>
          <Button
            onClick={handleDeactivate}
            disabled={isSubmitting || isProcessing || !reason.trim() || reason.trim().length < 5}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting || isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Nonaktifkan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
