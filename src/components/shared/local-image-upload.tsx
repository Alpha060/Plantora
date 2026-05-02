"use client";

import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MAX_IMAGE_SIZE_MB, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

interface LocalImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxImages?: number;
  className?: string;
  existingUrls?: string[];
  onRemoveExisting?: (index: number) => void;
}

export function LocalImageUpload({
  value = [],
  onChange,
  maxImages = 8,
  className,
  existingUrls = [],
  onRemoveExisting,
}: LocalImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  // Generate previews for local files
  useEffect(() => {
    const objectUrls = value.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);

    // Cleanup URLs on unmount or when files change
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [value]);

  const handleSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const currentTotal = existingUrls.length + value.length;
      const remaining = maxImages - currentTotal;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const filesToAdd = Array.from(files).slice(0, remaining);

      // Validate files
      for (const file of filesToAdd) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`${file.name}: Invalid format. Use JPEG, PNG, or WebP`);
          return;
        }
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name}: File too large. Max ${MAX_IMAGE_SIZE_MB}MB`);
          return;
        }
      }

      onChange([...value, ...filesToAdd]);
    },
    [value, existingUrls.length, onChange, maxImages]
  );

  const handleRemoveLocal = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  const totalImages = existingUrls.length + value.length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preview Grid */}
      {totalImages > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {/* Existing uploaded images */}
          {existingUrls.map((url, index) => (
            <div
              key={`existing-${index}`}
              className="relative aspect-square rounded-lg border overflow-hidden group bg-gray-50"
            >
              <Image
                src={url}
                alt={`Existing ${index + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(index)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-medium">
                  Primary
                </span>
              )}
            </div>
          ))}

          {/* New local files */}
          {previews.map((url, index) => (
            <div
              key={`local-${index}`}
              className="relative aspect-square rounded-lg border overflow-hidden group bg-gray-50"
            >
              <Image
                src={url}
                alt={`New ${index + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              <button
                type="button"
                onClick={() => handleRemoveLocal(index)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <span className="absolute bottom-1 left-1 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium shadow-sm">
                New
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {totalImages < maxImages && (
        <label
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer transition-colors py-8"
        >
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(e) => handleSelect(e.target.files)}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-2">
            <Upload className="h-5 w-5 text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            Click to select images
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPEG, PNG, WebP • Max {MAX_IMAGE_SIZE_MB}MB •{" "}
            {totalImages}/{maxImages} selected
          </p>
        </label>
      )}
    </div>
  );
}
