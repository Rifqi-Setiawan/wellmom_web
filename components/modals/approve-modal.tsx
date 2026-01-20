'use client';

import { useState } from 'react';
import { CheckCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  puskesmasName: string;
  isProcessing?: boolean;
}

export default function ApproveModal({
  isOpen,
  onClose,
  onApprove,
  puskesmasName,
  isProcessing = false,
}: ApproveModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove();
      onClose();
    } catch (error) {
      console.error('Approve error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Approve Registrasi Puskesmas?
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting || isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Anda akan menyetujui registrasi <strong>{puskesmasName}</strong>.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Puskesmas akan aktif dan dapat mulai beroperasi.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isProcessing}
          >
            Batal
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting || isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting || isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
