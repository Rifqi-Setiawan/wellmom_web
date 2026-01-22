'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, UserPlus } from 'lucide-react';
import type { HealthPersonnel } from '@/lib/types/health-personnel';
import type { Patient } from '@/lib/types/patient';

interface TransferSinglePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  sourceNurse: HealthPersonnel | null;
  targetNurses: HealthPersonnel[];
  onTransfer: (sourcePerawatId: number, ibuHamilId: number, targetPerawatId: number) => Promise<void>;
}

export function TransferSinglePatientModal({
  isOpen,
  onClose,
  patient,
  sourceNurse,
  targetNurses,
  onTransfer,
}: TransferSinglePatientModalProps) {
  const [selectedNurseId, setSelectedNurseId] = useState<number | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!selectedNurseId || !patient || !sourceNurse) return;

    setIsTransferring(true);
    try {
      await onTransfer(sourceNurse.id, patient.id, selectedNurseId);
      onClose();
      setSelectedNurseId(null);
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Gagal memindahkan pasien. Silakan coba lagi.');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-gray-900"
                  >
                    Pindahkan Pasien
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Pindahkan pasien <span className="font-semibold text-gray-900">{patient?.nama_lengkap}</span> dari{' '}
                    <span className="font-semibold text-gray-900">{sourceNurse?.name}</span> ke:
                  </p>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Perawat Tujuan
                  </label>
                  <select
                    value={selectedNurseId || ''}
                    onChange={(e) => setSelectedNurseId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent"
                  >
                    <option value="">Pilih perawat...</option>
                    {targetNurses.map((nurse) => (
                      <option key={nurse.id} value={nurse.id}>
                        {nurse.name} ({nurse.workload} pasien)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isTransferring}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={!selectedNurseId || isTransferring}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#3B9ECF] rounded-lg hover:bg-[#2d7ba8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isTransferring ? 'Memindahkan...' : 'Pindahkan'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
