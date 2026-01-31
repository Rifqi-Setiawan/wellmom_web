"use strict";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ibuHamilProfileApi } from "@/lib/api/ibu-hamil-profile";
import type { IbuHamil } from "@/lib/types/ibu-hamil";
import { useAuthStore } from "@/lib/stores/auth-store";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("@/components/maps/interactive-map"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">
        Memuat Peta...
      </div>
    ) 
  }
);

const profileSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama lengkap harus diisi"),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
  date_of_birth: z.string().min(1, "Tanggal lahir harus diisi"),
  address: z.string().min(1, "Alamat harus diisi"),
  provinsi: z.string().min(1, "Provinsi harus diisi"),
  kota_kabupaten: z.string().min(1, "Kota/Kabupaten harus diisi"),
  kecamatan: z.string().min(1, "Kecamatan harus diisi"),
  kelurahan: z.string().min(1, "Kelurahan harus diisi"),
  location: z.tuple([z.number(), z.number()]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  ibuHamil: IbuHamil;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function EditProfileModal({ ibuHamil, onSuccess, trigger }: EditProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const token = useAuthStore((state) => state.token);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nama_lengkap: ibuHamil.nama_lengkap,
      nik: ibuHamil.nik,
      date_of_birth: ibuHamil.date_of_birth,
      address: ibuHamil.address,
      provinsi: ibuHamil.provinsi,
      kota_kabupaten: ibuHamil.kota_kabupaten,
      kecamatan: ibuHamil.kecamatan,
      kelurahan: ibuHamil.kelurahan,
      location: ibuHamil.location,
    },
  });

  // Update form values if ibuHamil prop changes
  useEffect(() => {
    if (open) {
        form.reset({
            nama_lengkap: ibuHamil.nama_lengkap,
            nik: ibuHamil.nik,
            date_of_birth: ibuHamil.date_of_birth,
            address: ibuHamil.address,
            provinsi: ibuHamil.provinsi,
            kota_kabupaten: ibuHamil.kota_kabupaten,
            kecamatan: ibuHamil.kecamatan,
            kelurahan: ibuHamil.kelurahan,
            location: ibuHamil.location,
        });
    }
  }, [ibuHamil, open, form]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!token) return;

    setLoading(true);
    try {
      await ibuHamilProfileApi.updateProfile(token, data);
      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbaharui",
        variant: "default",
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal",
        description: "Gagal memperbaharui profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    form.setValue("location", [lat, lng]);
    
    // Reverse geocoding logic could go here if needed to auto-fill address
    // For now we just update the coordinates
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          form.setValue("location", [latitude, longitude]);
          // Would be ideal to pan map here or trigger reverse geocoding
          toast({
             title: "Lokasi Ditemukan",
             description: `Koordinat: ${latitude}, ${longitude}`,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
           toast({
             title: "Gagal Deteksi Lokasi",
             description: "Pastikan izin lokasi diaktifkan pada browser Anda.",
             variant: "destructive",
          });
        }
      );
    } else {
       toast({
         title: "Tidak Didukung",
         description: "Browser Anda tidak mendukung geolokasi.",
         variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Personal Information</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Informasi Pribadi</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nama_lengkap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIK</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={16} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                     <h3 className="text-sm font-medium">Alamat & Lokasi</h3>
                     <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation}>
                         <MapPin className="mr-2 h-4 w-4" />
                         Deteksi Lokasi Saya
                     </Button>
                </div>
                
                <div className="h-[300px] rounded-lg overflow-hidden border">
                    <MapComponent 
                        latitude={form.watch("location")[0]}
                        longitude={form.watch("location")[1]}
                        zoom={15}
                        onLocationChange={handleLocationSelect}
                        height="300px"
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Alamat Lengkap</FormLabel>
                        <FormControl>
                        <Input {...field} placeholder="Nama Jalan, No. Rumah, RT/RW" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="provinsi"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Provinsi</FormLabel>
                            <FormControl>
                            <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="kota_kabupaten"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kota/Kabupaten</FormLabel>
                            <FormControl>
                            <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="kecamatan"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kecamatan</FormLabel>
                            <FormControl>
                            <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="kelurahan"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kelurahan</FormLabel>
                            <FormControl>
                            <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#3B9ECF] hover:bg-[#2d7ba8]">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
