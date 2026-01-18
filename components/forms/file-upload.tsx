"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, Camera, X } from "lucide-react";

interface FileUploadProps {
  onUpload?: (url: string) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  uploadText?: string;
  subtitle?: string;
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
  acceptedTypes = "*/*",
  maxSize = 5,
  uploadText = "Upload File",
  subtitle = "Select a file to upload",
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptAttribute = acceptedTypes || accept || "*/*";

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File terlalu besar. Maksimal ${maxSize}MB`);
      return;
    }

    setUploadedFile(file);

    // Handle different callback types
    if (onUpload) {
      // Simulate upload and return URL
      const mockUrl = `/files/${file.name}`;
      onUpload(mockUrl);
    }

    if (onChange) {
      onChange(file);
    }

    if (onFileSelect) {
      onFileSelect(file);
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
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
          ${isDragging ? "border-[#3B9ECF] bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"}
          ${error ? "border-red-300 dark:border-red-600" : ""}
          bg-white dark:bg-gray-800
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {value ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {getIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {value.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(value.size)}
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
        ) : (
          <div className="text-center">
            {getIcon()}
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
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
