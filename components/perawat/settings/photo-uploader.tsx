"use client";

import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Loader2, X } from "lucide-react";
import { cn, buildImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PhotoUploaderProps {
  currentPhoto?: string;
  onPhotoChange: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export function PhotoUploader({
  currentPhoto,
  onPhotoChange,
  isUploading = false,
}: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation (Max 2MB, Image only)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File harus masukan gambar format JPG/PNG");
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Call callback
    try {
      await onPhotoChange(file);
    } catch (error) {
      console.error("Upload failed", error);
      // Revert preview on failure
      setPreview(null);
    }
  };

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  const displaySrc = preview || buildImageUrl(currentPhoto);

  return (
    <div className="flex items-center gap-6">
      <div className="relative group">
        <div
          className={cn(
            "w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50",
            isUploading && "opacity-50",
          )}
        >
          {displaySrc && displaySrc !== "/default-avatar.png" ? (
            <img
              src={displaySrc}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Failed to load image:", displaySrc);
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-300" />
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleTriggerClick}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-1.5 bg-[#3B9ECF] text-white rounded-full shadow-lg hover:bg-[#2d7ba8] transition-colors disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Foto Profil</h3>
        <p className="text-xs text-gray-500 mb-3">
          Gunakan foto profesional untuk profil Anda.
          <br />
          Format JPG atau PNG, maksimal 2MB.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTriggerClick}
            disabled={isUploading}
          >
            Ubah Foto
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Batal
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
