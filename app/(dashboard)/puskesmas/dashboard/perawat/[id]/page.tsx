"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, ChevronDown, UserPlus, Info } from "lucide-react";
import { nurseApi } from "@/lib/api/nurse";
import { useAuthStore } from "@/lib/stores/auth-store";
import { TransferSinglePatientModal } from "@/components/transfer-single-patient-modal";
import type { IbuHamil } from "@/lib/types/ibu-hamil";
import type { HealthPersonnel } from "@/lib/types/health-personnel";

export default function NurseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  // Ensure proper conversion to number - handle string, number, or array
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const nurseId =
    typeof idParam === "string" ? parseInt(idParam, 10) : Number(idParam);

  const [nurse, setNurse] = useState<HealthPersonnel | null>(null);
  const [patients, setPatients] = useState<IbuHamil[]>([]);
  const [allNurses, setAllNurses] = useState<HealthPersonnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<IbuHamil | null>(null);

  const itemsPerPage = 4;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!token) {
        console.error("No token found in auth store");
        setIsLoading(false);
        return;
      }

      if (!nurseId || isNaN(nurseId)) {
        console.error("Invalid nurse ID:", params.id, nurseId);
        setIsLoading(false);
        return;
      }

      console.log("🔍 Fetching data for nurse ID:", nurseId);

      // Fetch all nurses first to find the current nurse
      const nursesResponse = await nurseApi.getNurses(token);
      console.log("📋 Nurses response:", nursesResponse);
      console.log("📋 Nurses list:", nursesResponse.perawat_list);

      const mappedNurses: HealthPersonnel[] = nursesResponse.perawat_list.map(
        (n: any) => {
          const colors = [
            "bg-blue-100 text-blue-700",
            "bg-pink-100 text-pink-700",
            "bg-teal-100 text-teal-700",
            "bg-purple-100 text-purple-700",
            "bg-orange-100 text-orange-700",
          ];
          const colorIndex = n.id % colors.length;
          const initials = n.nama_lengkap
            .split(" ")
            .map((name: string) => name[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return {
            id: n.id, // perawat_id
            name: n.nama_lengkap,
            str_number: n.nip || "-",
            role: "Perawat" as const,
            workload: n.current_patients,
            max_capacity: 50,
            status: (n.is_active ? "Aktif" : "Nonaktif") as
              | "Aktif"
              | "Nonaktif",
            avatar_initials: initials,
            avatar_color: colors[colorIndex],
          };
        },
      );

      console.log("🗺️ Mapped nurses:", mappedNurses);
      console.log(
        "🔎 Looking for nurse with ID:",
        nurseId,
        "Type:",
        typeof nurseId,
      );

      setAllNurses(mappedNurses);

      // Find current nurse - compare with strict equality and also check type
      const currentNurse = mappedNurses.find((n) => {
        const match = n.id === nurseId;
        console.log(
          `  Comparing: n.id=${n.id} (${typeof n.id}) === nurseId=${nurseId} (${typeof nurseId}) = ${match}`,
        );
        return match;
      });

      console.log("✅ Found nurse:", currentNurse);

      if (currentNurse) {
        setNurse(currentNurse);

        // Fetch patients for this nurse
        try {
          const patientsData = await nurseApi.getPatientsByNurse(
            token,
            nurseId,
          );
          console.log("👥 Patients data:", patientsData);
          setPatients(Array.isArray(patientsData) ? patientsData : []);
        } catch (patientError) {
          console.error("Failed to fetch patients:", patientError);
          setPatients([]);
        }
      } else {
        console.error(
          "❌ Nurse not found! Available IDs:",
          mappedNurses.map((n) => n.id),
        );
        setNurse(null);
      }
    } catch (error) {
      console.error("❌ Failed to fetch data:", error);
      setNurse(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && nurseId) {
      fetchData();
    }
  }, [nurseId, token]);

  // Calculate pregnancy weeks from date_of_birth (assuming it's conception date for demo)
  const calculatePregnancyWeeks = (dateOfBirth: string): string => {
    const today = new Date();
    const dob = new Date(dateOfBirth);
    const diffTime = Math.abs(today.getTime() - dob.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    const weeks = diffWeeks % 40; // Pregnancy is ~40 weeks
    const days = Math.floor((diffTime / (1000 * 60 * 60 * 24)) % 7);
    return `${weeks} Minggu ${days} Hari`;
  };

  // Mock risk score calculation
  const getRiskScore = (
    patient: IbuHamil,
  ): "Low Risk" | "Medium Risk" | "High Risk" => {
    const hash = patient.id % 3;
    if (hash === 0) return "Low Risk";
    if (hash === 1) return "Medium Risk";
    return "High Risk";
  };

  const getRiskBadgeColor = (risk: string): string => {
    switch (risk) {
      case "Low Risk":
        return "bg-green-100 text-green-700";
      case "Medium Risk":
        return "bg-yellow-100 text-yellow-700";
      case "High Risk":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Filter patients
  const filteredPatients = patients.filter(
    (patient) =>
      patient.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.nik.includes(searchQuery),
  );

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleOpenTransferModal = (patient: IbuHamil) => {
    setSelectedPatient(patient);
    setIsTransferModalOpen(true);
  };

  const handleTransferPatient = async (
    sourcePerawatId: number,
    ibuHamilId: number,
    targetPerawatId: number,
  ) => {
    if (!token) {
      console.error("No token found for transfer");
      return;
    }
    await nurseApi.transferSinglePatient(
      token,
      sourcePerawatId,
      ibuHamilId,
      targetPerawatId,
    );
    await fetchData(); // Refresh data
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (!nurse && !isLoading) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.push("/puskesmas/dashboard/perawat")}
          className="flex items-center gap-2 text-[#3B9ECF] hover:text-[#2d7ba8] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali ke Kelola Perawat</span>
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-lg font-semibold text-red-900 mb-2">
            Perawat tidak ditemukan
          </p>
          <p className="text-sm text-red-700 mb-4">
            Perawat dengan ID {nurseId} tidak ditemukan dalam sistem.
          </p>
          <button
            onClick={() => router.push("/puskesmas/dashboard/perawat")}
            className="px-4 py-2 bg-[#3B9ECF] text-white rounded-lg hover:bg-[#2d7ba8] transition-colors"
          >
            Kembali ke Daftar Perawat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/puskesmas/dashboard/perawat")}
        className="flex items-center gap-2 text-[#3B9ECF] hover:text-[#2d7ba8] mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Kembali ke Kelola Perawat</span>
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
              Perawat
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {nurse?.name}
          </h1>
          <p className="text-gray-600">
            Daftar ibu hamil yang didampingi di wilayah kerja Puskesmas.
          </p>
        </div>

        {/* Total Patient Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-[180px]">
          <p className="text-sm text-gray-600 mb-1">TOTAL PASIEN</p>
          <p className="text-3xl font-bold text-[#3B9ECF]">
            {patients.length}{" "}
            <span className="text-base font-normal text-gray-600">
              Ibu Hamil
            </span>
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9ECF] focus:border-transparent text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm text-gray-700">Filter</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  NAMA PASIEN
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  USIA KEHAMILAN
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  SKOR RISIKO
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((patient) => {
                  const initials = patient.nama_lengkap
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const colors = [
                    "bg-blue-100 text-blue-700",
                    "bg-pink-100 text-pink-700",
                    "bg-teal-100 text-teal-700",
                    "bg-purple-100 text-purple-700",
                  ];
                  const colorIndex = patient.id % colors.length;
                  const riskScore = getRiskScore(patient);

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${colors[colorIndex]}`}
                          >
                            {initials}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {patient.nama_lengkap}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {calculatePregnancyWeeks(patient.date_of_birth)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadgeColor(
                            riskScore,
                          )}`}
                        >
                          {riskScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenTransferModal(patient)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          Pindahkan Pasien
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    Belum ada pasien terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPatients.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredPatients.length)}{" "}
              dari {filteredPatients.length} Pasien
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-[#3B9ECF] border border-[#3B9ECF] rounded-lg hover:bg-[#2d7ba8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Petunjuk:
            </p>
            <p className="text-sm text-blue-800">
              Klik tombol &quot;Pindahkan Pasien&quot; untuk mendelegasikan
              pendampingan ibu hamil kepada tenaga kesehatan lain yang tersedia.
              Hal ini biasanya dilakukan jika nakes bersangkutan sedang cuti
              atau beban kerja melebihi kapasitas.
            </p>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <TransferSinglePatientModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        patient={selectedPatient}
        sourceNurse={nurse}
        targetNurses={allNurses.filter(
          (n) => n.id !== nurseId && n.status === "Aktif",
        )}
        onTransfer={handleTransferPatient}
      />
    </div>
  );
}
