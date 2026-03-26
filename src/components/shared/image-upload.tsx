"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MAX_IMAGE_SIZE_MB, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  bucket: string;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 8,
  bucket,
  folder = "",
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = maxImages - value.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remaining);

      // Validate files
      for (const file of filesToUpload) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`${file.name}: Invalid format. Use JPEG, PNG, or WebP`);
          return;
        }
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name}: File too large. Max ${MAX_IMAGE_SIZE_MB}MB`);
          return;
        }
      }

      setUploading(true);
      const uploadedUrls: string[] = [];

      try {
        for (const file of filesToUpload) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("bucket", bucket);
          if (folder) formData.append("folder", folder);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();

          if (!response.ok) {
            toast.error(result.error || `Failed to upload ${file.name}`);
            continue;
          }

          uploadedUrls.push(result.url);
        }

        if (uploadedUrls.length > 0) {
          onChange([...value, ...uploadedUrls]);
          toast.success(
            `${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} uploaded`
          );
        }
      } catch {
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, maxImages, bucket, folder]
  );

  const handleRemove = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg border overflow-hidden group bg-gray-50"
            >
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-medium">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {value.length < maxImages && (
        <label
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors py-8",
            uploading
              ? "border-emerald-300 bg-emerald-50"
              : "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50"
          )}
        >
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-2" />
              <p className="text-sm text-emerald-600 font-medium">
                Uploading...
              </p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-2">
                <Upload className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload images
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, WebP • Max {MAX_IMAGE_SIZE_MB}MB •{" "}
                {value.length}/{maxImages} uploaded
              </p>
            </>
          )}
        </label>
      )}
    </div>
  );
}
