"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Camera,
  X,
  Check,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface FileUploadProps {
  onUpload?: (url: string) => void;
  onFileChange?: (file: File | null) => void; // Callback untuk mendapatkan file object
  acceptedTypes?: string;
  maxSize?: number; // in MB
  uploadText?: string;
  subtitle?: string;
  uploadEndpoint?: string; // Backend endpoint for file upload
  deferUpload?: boolean; // Jika true, file tidak langsung diupload ke backend
  // Legacy props for backward compatibility
  label?: string;
  accept?: string;
  format?: string;
  constraint?: string;
  icon?: "document" | "image" | "camera";
  value?: File | null;
  onChange?: (file: File | null) => void;
  error?: string;
  onFileSelect?: (file: File) => void;
}

export function FileUpload({
  onUpload,
  onFileChange,
  acceptedTypes = "*/*",
  maxSize = 5,
  uploadText = "Upload File",
  subtitle = "Select a file to upload",
  uploadEndpoint = "/api/v1/files/upload",
  deferUpload = false,
  // Legacy props
  label,
  accept,
  format,
  constraint,
  icon = "document",
  value,
  onChange,
  onFileSelect,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(value || null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptAttribute = acceptedTypes || accept || "*/*";

  const uploadFileToBackend = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${apiBaseUrl}${uploadEndpoint}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload gagal");
    }

    const data = await response.json();
    // Assuming backend returns { url: "/files/filename.pdf" } or { file_url: "..." }
    return data.url || data.file_url || data.path || `/files/${file.name}`;
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File terlalu besar. Maksimal ${maxSize}MB`);
      return;
    }

    setUploadedFile(file);
    setUploadError("");
    setUploadSuccess(false);

    // Create preview URL for images
    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl("");
    }

    // Jika deferUpload = true, simpan file lokal saja tanpa upload ke backend
    if (deferUpload) {
      // Langsung tandai sukses tanpa upload
      setUploadSuccess(true);

      // Callback dengan file object
      if (onFileChange) {
        onFileChange(file);
      }

      if (onChange) {
        onChange(file);
      }

      if (onFileSelect) {
        onFileSelect(file);
      }

      return;
    }

    // Upload ke backend jika deferUpload = false
    setIsUploading(true);

    try {
      // Upload to backend
      const fileUrl = await uploadFileToBackend(file);
      setUploadedUrl(fileUrl);
      setUploadSuccess(true);

      // Callback with URL
      if (onUpload) {
        onUpload(fileUrl);
      }

      if (onChange) {
        onChange(file);
      }

      if (onFileSelect) {
        onFileSelect(file);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Gagal mengupload file. Silakan coba lagi.");
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setUploadedUrl("");
    setUploadSuccess(false);
    setUploadError("");
    setPreviewUrl("");
    if (onChange) {
      onChange(null);
    }
    if (onUpload) {
      onUpload("");
    }
    if (onFileChange) {
      onFileChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploadedFile) {
      if (uploadedFile.type.startsWith("image/") && previewUrl) {
        setShowPreview(true);
      } else if (uploadedFile.type === "application/pdf") {
        // Open PDF in new tab
        const objectUrl = URL.createObjectURL(uploadedFile);
        window.open(objectUrl, "_blank");
      } else {
        // Download file
        const objectUrl = URL.createObjectURL(uploadedFile);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = uploadedFile.name;
        a.click();
      }
    }
  };

  const getIcon = () => {
    switch (icon) {
      case "image":
        return <ImageIcon className="w-8 h-8 text-gray-400" />;
      case "camera":
        return <Camera className="w-8 h-8 text-gray-400" />;
      default:
        return <FileText className="w-8 h-8 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const currentFile = uploadedFile || value;
  const displayError = uploadError || error;

  return (
    <>
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div
          onClick={!isUploading ? handleClick : undefined}
          onDrop={!isUploading ? handleDrop : undefined}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 transition-colors
            ${!isUploading ? "cursor-pointer" : "cursor-wait"}
            ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}
            ${uploadSuccess ? "border-green-400 bg-green-50 dark:bg-green-900/20" : ""}
            ${displayError ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20" : ""}
            ${!isDragging && !uploadSuccess && !displayError ? "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptAttribute}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          {/* Loading State */}
          {isUploading && (
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Mengupload file...
              </p>
            </div>
          )}

          {/* Success State - File Uploaded */}
          {!isUploading && currentFile && uploadSuccess && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Success Icon */}
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {currentFile.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Berhasil diupload • {formatFileSize(currentFile.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Lihat file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title="Hapus file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image Preview Thumbnail */}
              {currentFile.type.startsWith("image/") && previewUrl && (
                <div
                  className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer"
                  onClick={handlePreview}
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Selected but not yet uploaded */}
          {!isUploading && currentFile && !uploadSuccess && !displayError && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {getIcon()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {currentFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(currentFile.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isUploading && !currentFile && !displayError && (
            <div className="text-center">
              <div className="flex justify-center">{getIcon()}</div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {icon === "camera"
                  ? "Ambil Foto atau Upload"
                  : icon === "image"
                    ? "Upload Gambar/PDF"
                    : "Drag & Drop atau Cari File"}
              </p>
              {format && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format: {format}
                </p>
              )}
              {constraint && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {constraint}
                </p>
              )}
              {!constraint && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Maks. {maxSize}MB
                </p>
              )}
            </div>
          )}

          {/* Error State */}
          {!isUploading && displayError && (
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="mt-2 text-sm text-red-600">{displayError}</p>
              <p className="mt-1 text-xs text-gray-500">Klik untuk coba lagi</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg z-10"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {currentFile && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 rounded-b-lg">
                <p className="text-sm font-medium">{currentFile.name}</p>
                <p className="text-xs text-gray-300">
                  {formatFileSize(currentFile.size)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
