"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, ChevronDown, User, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { puskesmasApi } from "@/lib/api/puskesmas";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { IbuHamil } from "@/lib/types/ibu-hamil";
import type { NurseListItem } from "@/lib/types/nurse";
import { nurseApi } from "@/lib/api/nurse";

interface AssignBidanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: IbuHamil | null;
  onSuccess: () => void;
}

export function AssignBidanModal({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: AssignBidanModalProps) {
  const { token } = useAuthStore();
  const [nurses, setNurses] = useState<NurseListItem[]>([]);
  const [filteredNurses, setFilteredNurses] = useState<NurseListItem[]>([]);
  const [selectedNurseId, setSelectedNurseId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingNurses, setIsLoadingNurses] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch nurses
  useEffect(() => {
    if (isOpen && token) {
      setIsLoadingNurses(true);
      nurseApi
        .getNurses(token)
        .then((data) => {
          // Filter only active nurses
          const activeNurses = data.perawat_list.filter((n) => n.is_active);
          setNurses(activeNurses);
          setFilteredNurses(activeNurses);
        })
        .catch((error) => {
          console.error("Failed to fetch nurses:", error);
        })
        .finally(() => {
          setIsLoadingNurses(false);
        });
    }
  }, [isOpen, token]);

  // Filter nurses based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNurses(nurses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = nurses.filter(
        (nurse) =>
          nurse.nama_lengkap.toLowerCase().includes(query) ||
          nurse.nip.includes(query) ||
          nurse.email.toLowerCase().includes(query)
      );
      setFilteredNurses(filtered);
    }
  }, [searchQuery, nurses]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNurseId(null);
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  const selectedNurse = nurses.find((n) => n.id === selectedNurseId);

  const handleSelectNurse = (nurse: NurseListItem) => {
    setSelectedNurseId(nurse.id);
    setSearchQuery(nurse.nama_lengkap);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedNurseId || !patient || !token || !patient.puskesmas_id) return;

    setIsLoading(true);
    try {
      await puskesmasApi.assignIbuHamilToPerawat(
        token,
        patient.puskesmas_id,
        patient.id,
        selectedNurseId
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to assign bidan:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal menugaskan bidan. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Tugaskan Bidan Pendamping
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  NAMA PASIEN
                </p>
                <p className="text-base font-bold text-gray-900 mb-2">
                  {patient.nama_lengkap}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-xs text-gray-600">
                    Status: Belum Ditugaskan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Midwife Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Pilih Bidan Pendamping
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari bidan..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="pl-10 pr-10"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isLoadingNurses ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Memuat data...
                    </div>
                  ) : filteredNurses.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Tidak ada bidan ditemukan
                    </div>
                  ) : (
                    filteredNurses.map((nurse) => (
                      <button
                        key={nurse.id}
                        type="button"
                        onClick={() => handleSelectNurse(nurse)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          selectedNurseId === nurse.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {nurse.nama_lengkap}
                        </p>
                        <p className="text-xs text-gray-500">
                          NIP: {nurse.nip} • {nurse.current_patients} pasien
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Informasi beban kerja membantu pemerataan penugasan tenaga
              kesehatan.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-300"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedNurseId || isLoading}
            className="bg-[#3B9ECF] hover:bg-[#2d7ba8] text-white"
          >
            {isLoading ? "Memproses..." : "Konfirmasi Penugasan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
