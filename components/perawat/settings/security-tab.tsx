"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2, Key, Mail, Shield, Eye, EyeOff, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailUpdateSchema, passwordUpdateSchema } from "@/lib/schemas/perawat-profile";

interface SecurityTabProps {
  email: string;
  onUpdateCredentials: (data: any) => Promise<void>;
  isUpdating: boolean;
}

export function SecurityTab({ email, onUpdateCredentials, isUpdating }: SecurityTabProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail, isDirty: isDirtyEmail },
    reset: resetEmail
  } = useForm({
    resolver: zodResolver(emailUpdateSchema),
    defaultValues: {
      email: email,
      current_password: ""
    }
  });

  // Password form
  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    formState: { errors: errorsPwd },
    reset: resetPwd
  } = useForm({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: ""
    }
  });

  const onEmailSubmit = async (data: any) => {
    await onUpdateCredentials(data);
    resetEmail({ email: data.email, current_password: "" });
  };

  const onPasswordSubmit = async (data: any) => {
    await onUpdateCredentials({
      current_password: data.current_password,
      new_password: data.new_password
    });
    resetPwd();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        
        {/* Update Email Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#3B9ECF]" />
            Ubah Email
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Pastikan email yang Anda gunakan aktif untuk keperluan reset password dan notifikasi.
          </p>

          <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="email">Email Baru</Label>
                <Input 
                  id="email" 
                  {...registerEmail("email")} 
                  disabled={isUpdating}
                />
                {errorsEmail.email && (
                  <p className="text-xs text-red-500">{errorsEmail.email.message as string}</p>
                )}
             </div>

             {isDirtyEmail && (
               <div className="space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <Label htmlFor="email_current_pass" className="text-yellow-800">Verifikasi Password Saat Ini</Label>
                  <p className="text-xs text-yellow-700 mb-2">Untuk keamanan, masukkan password Anda untuk mengubah email.</p>
                  <Input 
                    id="email_current_pass" 
                    type="password"
                    {...registerEmail("current_password")} 
                    disabled={isUpdating}
                  />
                  {errorsEmail.current_password && (
                    <p className="text-xs text-red-500">{errorsEmail.current_password.message as string}</p>
                  )}
               </div>
             )}

             <div className="pt-2">
               <Button 
                type="submit" 
                disabled={isUpdating || !isDirtyEmail}
                variant="outline"
               >
                 {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                 Ubah Email
               </Button>
             </div>
          </form>
        </section>

        {/* Update Password Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
           <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#3B9ECF]" />
            Ubah Password
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Gunakan password minimal 6 karakter dengan kombinasi huruf dan angka.
          </p>

          <form onSubmit={handleSubmitPwd(onPasswordSubmit)} className="space-y-4 max-w-md">
            <div className="space-y-2">
               <Label htmlFor="pwd_current">Password Saat Ini</Label>
               <div className="relative">
                 <Input 
                    id="pwd_current" 
                    type={showCurrentPassword ? "text" : "password"}
                    {...registerPwd("current_password")} 
                    disabled={isUpdating}
                 />
                 <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                 >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
               {errorsPwd.current_password && (
                  <p className="text-xs text-red-500">{errorsPwd.current_password.message as string}</p>
               )}
            </div>

            <div className="space-y-2">
               <Label htmlFor="pwd_new">Password Baru</Label>
               <div className="relative">
                 <Input 
                    id="pwd_new" 
                    type={showNewPassword ? "text" : "password"}
                    {...registerPwd("new_password")} 
                    disabled={isUpdating}
                 />
                 <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                 >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
               {errorsPwd.new_password && (
                  <p className="text-xs text-red-500">{errorsPwd.new_password.message as string}</p>
               )}
            </div>

            <div className="space-y-2">
               <Label htmlFor="pwd_confirm">Konfirmasi Password Baru</Label>
               <div className="relative">
                 <Input 
                    id="pwd_confirm" 
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerPwd("confirm_password")} 
                    disabled={isUpdating}
                 />
                 <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                 >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
               {errorsPwd.confirm_password && (
                  <p className="text-xs text-red-500">{errorsPwd.confirm_password.message as string}</p>
               )}
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="w-full bg-[#3B9ECF] hover:bg-[#2d7ba8]"
              >
                 {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Ubah Password"
                  )}
              </Button>
            </div>
          </form>
        </section>
      </div>

      {/* Security Tips Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 sticky top-6">
           <h4 className="text-blue-900 font-semibold flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" />
              Tips Keamanan
           </h4>
           <ul className="space-y-3 text-sm text-blue-800">
             <li className="flex gap-2">
               <span className="text-blue-500">•</span>
               Gunakan password yang unik dan panjang.
             </li>
             <li className="flex gap-2">
               <span className="text-blue-500">•</span>
               Jangan pernah membagikan password Anda kepada siapapun, termasuk staf IT.
             </li>
             <li className="flex gap-2">
               <span className="text-blue-500">•</span>
               Pastikan email Anda dapat diakses untuk menerima notifikasi penting.
             </li>
             <li className="flex gap-2">
               <span className="text-blue-500">•</span>
               Segera ubah password jika Anda mencurigai adanya aktivitas yang tidak wajar.
             </li>
           </ul>
        </div>
      </div>
    </div>
  );
}
