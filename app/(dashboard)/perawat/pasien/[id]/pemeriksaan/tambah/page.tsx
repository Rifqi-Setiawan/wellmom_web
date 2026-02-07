"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Loader2, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/stores/auth-store";
import { nurseApi } from "@/lib/api/nurse";
import { healthRecordsApi } from "@/lib/api/health-records";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { IbuHamil } from "@/lib/types/ibu-hamil";

const healthRecordSchema = z.object({
  checkup_date: z.string().min(1, "Tanggal pemeriksaan harus diisi"),
  gestational_age_weeks: z.coerce.number().min(0, "Minggu harus >= 0").max(45, "Minggu tidak valid"),
  gestational_age_days: z.coerce.number().min(0, "Hari harus >= 0").max(6, "Hari harus < 7"),
  weight: z.coerce.number().min(30, "Berat badan tidak valid (min 30kg)"),
  blood_pressure_systolic: z.coerce.number().min(60, "Sistolik tidak valid"),
  blood_pressure_diastolic: z.coerce.number().min(40, "Diastolik tidak valid"),
  heart_rate: z.coerce.number().min(40, "Detak jantung tidak valid"),
  body_temperature: z.coerce.number().min(30, "Suhu tubuh tidak valid").max(45, "Suhu tubuh tidak valid"),
  blood_glucose: z.coerce.number().min(0, "Gula darah tidak valid"),
  hemoglobin: z.coerce.number().min(0, "Hb tidak valid"),
  upper_arm_circumference: z.coerce.number().min(10, "LILA tidak valid"),
  fundal_height: z.coerce.number().min(0, "TFU tidak valid"),
  fetal_heart_rate: z.coerce.number().min(0, "DJJ tidak valid"),
  protein_urin: z.string().min(1, "Pilih hasil protein urin"),
  complaints: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

type HealthRecordFormData = z.infer<typeof healthRecordSchema>;

export default function AddHealthRecordPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, perawatInfo } = useAuthStore();
  const { toast } = useToast();
  const [patient, setPatient] = useState<IbuHamil | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const patientId = Number(params.id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<HealthRecordFormData>({
    resolver: zodResolver(healthRecordSchema) as any,
    defaultValues: {
      checkup_date: new Date().toISOString().split("T")[0],
      complaints: "Tidak ada keluhan",
      notes: "Ibu dalam kondisi sehat",
      gestational_age_days: 0,
      gestational_age_weeks: 0,
      protein_urin: "negatif",
      // Initialize number fields to avoid uncontrolled input warnings if needed, 
      // but 'register' handles it. 
    },
  });

  useEffect(() => {
    if (token && patientId) {
      nurseApi
        .getIbuHamilDetail(token, patientId)
        .then((data) => {
          setPatient(data);
          // Auto-fill gestational age if available from patient data logic
           if(data.usia_kehamilan) {
               setValue("gestational_age_weeks", data.usia_kehamilan);
           }
        })
        .catch((err) => console.error("Failed to fetch patient:", err))
        .finally(() => setIsDataLoading(false));
    }
  }, [token, patientId, setValue]);

  const onSubmit = async (data: HealthRecordFormData) => {
    if (!token || !user) return;
    
    // Ensure we have perawat info
    if (!perawatInfo?.id) {
       alert("Data perawat tidak ditemukan. Silakan login ulang.");
       return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...data,
        complaints: data.complaints || "",
        notes: data.notes || "",
        ibu_hamil_id: patientId,
        perawat_id: perawatInfo.id,
        checked_by: "perawat",
      };

      await healthRecordsApi.createHealthRecord(token, payload);
      
      // Show success toast
      toast({
        title: "Data berhasil disimpan",
        description: "Data berhasil disimpan & Notifikasi risiko telah dikirim ke pasien.",
      });
      
      // Navigate after a short delay to allow toast to be visible
      setTimeout(() => {
        router.push(`/perawat/pasien/${patientId}`);
      }, 500);
    } catch (error) {
      console.error("Submission failed", error);
      toast({
        variant: "destructive",
        title: "Gagal menyimpan data",
        description: "Gagal menyimpan data pemeriksaan. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B9ECF]" />
      </div>
    );
  }

  if (!patient) {
    return <div>Pasien tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-20">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Input Pemeriksaan Kehamilan
          </h1>
          <p className="text-gray-600">
            Pasien: <span className="font-semibold">{patient.nama_lengkap}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Data Umum */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Data Umum Pemeriksaan
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="checkup_date">Tanggal Pemeriksaan</Label>
                <div className="relative">
                  <Input
                    id="checkup_date"
                    type="date"
                    {...register("checkup_date")}
                  />
                </div>
                {errors.checkup_date && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.checkup_date.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gestational_age_weeks">Usia Kehamilan (Minggu)</Label>
                  <Input
                    id="gestational_age_weeks"
                    type="number"
                    {...register("gestational_age_weeks")}
                  />
                  {errors.gestational_age_weeks && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.gestational_age_weeks.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="gestational_age_days">Lebih (Hari)</Label>
                  <Input
                    id="gestational_age_days"
                    type="number"
                    {...register("gestational_age_days")}
                  />
                  {errors.gestational_age_days && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.gestational_age_days.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Tanda Vital */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Tanda-Tanda Vital</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <Label htmlFor="blood_pressure_systolic">Tekanan Darah (Sistolik)</Label>
                <div className="relative">
                  <Input
                    id="blood_pressure_systolic"
                    type="number"
                    placeholder="120"
                    {...register("blood_pressure_systolic")}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    mmHg
                  </span>
                </div>
                {errors.blood_pressure_systolic && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.blood_pressure_systolic.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="blood_pressure_diastolic">Tekanan Darah (Diastolik)</Label>
                <div className="relative">
                  <Input
                    id="blood_pressure_diastolic"
                    type="number"
                    placeholder="80"
                    {...register("blood_pressure_diastolic")}
                    className="pr-12"
                  />
                   <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    mmHg
                  </span>
                </div>
                {errors.blood_pressure_diastolic && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.blood_pressure_diastolic.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="heart_rate">Detak Jantung</Label>
                <div className="relative">
                  <Input
                    id="heart_rate"
                    type="number"
                    placeholder="80"
                    {...register("heart_rate")}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    bpm
                  </span>
                </div>
                {errors.heart_rate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.heart_rate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="body_temperature">Suhu Tubuh</Label>
                <div className="relative">
                  <Input
                    id="body_temperature"
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    {...register("body_temperature")}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    °C
                  </span>
                </div>
                {errors.body_temperature && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.body_temperature.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="weight">Berat Badan</Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="60"
                    {...register("weight")}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    kg
                  </span>
                </div>
                 {errors.weight && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.weight.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Data Klinis & Laboratorium */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Data Klinis & Laboratorium</h2>
             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="hemoglobin">Hemoglobin (Hb)</Label>
                <div className="relative">
                  <Input
                    id="hemoglobin"
                    type="number"
                    step="0.1"
                    placeholder="12.0"
                    {...register("hemoglobin")}
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    g/dL
                  </span>
                </div>
                {errors.hemoglobin && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.hemoglobin.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="blood_glucose">Gula Darah (GDS)</Label>
                <div className="relative">
                  <Input
                    id="blood_glucose"
                    type="number"
                    placeholder="100"
                    {...register("blood_glucose")}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    mg/dL
                  </span>
                </div>
                 {errors.blood_glucose && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.blood_glucose.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="protein_urin">Protein Urin</Label>
                <div className="relative">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    {...register("protein_urin")}
                  >
                    <option value="negatif">Negatif</option>
                    <option value="+1">Positif (+1)</option>
                    <option value="+2">Positif (+2)</option>
                    <option value="+3">Positif (+3)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
                 {errors.protein_urin && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.protein_urin.message}
                  </p>
                )}
              </div>
             </div>
          </section>

           {/* Section 4: Data Janin & Kandungan */}
           <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Data Janin & Kandungan</h2>
             <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <Label htmlFor="fundal_height">Tinggi Fundus Uteri (TFU)</Label>
                <div className="relative">
                  <Input
                    id="fundal_height"
                    type="number"
                    placeholder="25"
                    {...register("fundal_height")}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    cm
                  </span>
                </div>
                 {errors.fundal_height && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.fundal_height.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="upper_arm_circumference">Lingkar Lengan Atas (LILA)</Label>
                <div className="relative">
                  <Input
                    id="upper_arm_circumference"
                    type="number"
                    step="0.1"
                    placeholder="24"
                    {...register("upper_arm_circumference")}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    cm
                  </span>
                </div>
                 {errors.upper_arm_circumference && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.upper_arm_circumference.message}
                  </p>
                )}
              </div>

               <div>
                <Label htmlFor="fetal_heart_rate">Denyut Jantung Janin (DJJ)</Label>
                <div className="relative">
                  <Input
                    id="fetal_heart_rate"
                    type="number"
                    placeholder="140"
                    {...register("fetal_heart_rate")}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    bpm
                  </span>
                </div>
                 {errors.fetal_heart_rate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.fetal_heart_rate.message}
                  </p>
                )}
              </div>
             </div>
          </section>

          {/* Section 5: Catatan Tambahan */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Catatan Tambahan</h2>
             <div className="space-y-4">
               <div>
                <Label htmlFor="complaints">Keluhan Pasien</Label>
                <Textarea
                  id="complaints"
                  placeholder="Tuliskan keluhan yang dirasakan pasien..."
                  {...register("complaints")}
                />
               </div>
               <div>
                <Label htmlFor="notes">Catatan Pemeriksaan</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tambahan hasil pemeriksaan..."
                  {...register("notes")}
                />
               </div>
             </div>
          </section>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
             <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-[#3B9ECF] hover:bg-[#2d7ba8]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Data Pemeriksaan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
