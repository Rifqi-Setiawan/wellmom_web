import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, User, Search, ChevronDown, Check } from 'lucide-react';
import type { HealthPersonnel } from '@/lib/types/health-personnel';

interface TransferPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceNurse: HealthPersonnel | null;
  targetNurses: HealthPersonnel[];
  onTransfer: (sourceId: number, targetId: number) => Promise<void>;
}

export function TransferPatientModal({
  isOpen,
  onClose,
  sourceNurse,
  targetNurses,
  onTransfer,
}: TransferPatientModalProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!sourceNurse || !selectedTargetId) return;

    setIsLoading(true);
    try {
      await onTransfer(sourceNurse.id, Number(selectedTargetId));
      onClose();
      setSelectedTargetId('');
    } catch (error) {
      console.error('Failed to transfer patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!sourceNurse) return null;

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
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
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
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900"
                  >
                    Pindahkan Pendampingan Pasien
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Patient Information Section */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Informasi Pasien
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-gray-900">
                        {sourceNurse.workload} Pasien
                      </p>
                      <p className="text-sm text-gray-600">
                        Pendamping saat ini: <span className="font-medium text-gray-900">{sourceNurse.name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Select New Healthcare Professional Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Pilih Tenaga Kesehatan Baru
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={selectedTargetId}
                        onChange={(e) => setSelectedTargetId(Number(e.target.value))}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent outline-none text-sm appearance-none bg-white"
                      >
                        <option value="" disabled>
                          Pilih tenaga kesehatan...
                        </option>
                        {targetNurses
                          .filter(nurse => nurse.workload < nurse.max_capacity)
                          .length === 0 ? (
                            <option value="" disabled>
                              Tidak ada tenaga kesehatan yang tersedia
                            </option>
                          ) : (
                            targetNurses
                              .filter(nurse => nurse.workload < nurse.max_capacity)
                              .map((nurse) => (
                                <option key={nurse.id} value={nurse.id}>
                                  {nurse.name} - {nurse.workload}/{nurse.max_capacity} pasien
                                </option>
                              ))
                          )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 italic">
                      Hanya menampilkan nakes dengan beban kerja di bawah kapasitas.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#3B9ECF] border border-transparent rounded-lg hover:bg-[#2d7ba8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B9ECF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    onClick={handleSubmit}
                    disabled={!selectedTargetId || isLoading}
                  >
                    {isLoading ? (
                      'Memproses...'
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Konfirmasi Pemindahan
                      </>
                    )}
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
