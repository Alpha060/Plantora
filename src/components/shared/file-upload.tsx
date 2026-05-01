"use client";

import { useCallback, useState } from "react";
import { Upload, X, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_FILE_TYPES = [
  "application/pdf", 
  "image/jpeg", 
  "image/png", 
  "image/webp"
];

interface FileUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket: string;
  folder?: string;
  title: string;
  description: string;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  bucket,
  folder = "",
  title,
  description,
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      // Validate
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Invalid format. Use PDF, JPEG, or PNG`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name}: File too large. Max ${MAX_FILE_SIZE_MB}MB`);
        return;
      }

      setUploading(true);

      try {
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
          return;
        }

        onChange(result.url);
        toast.success("Document uploaded successfully");
      } catch {
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, onChange]
  );

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className={cn("p-5 rounded-xl border border-surface-container-high bg-surface-lowest", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-on-surface">{title}</h4>
          <p className="text-xs text-on-surface-variant mt-1">{description}</p>
        </div>
        {value && (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        )}
      </div>

      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-surface-container">
          <div className="h-10 w-10 shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">Document Attached</p>
            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
              View File
            </a>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={handleRemove} className="text-error hover:text-error hover:bg-error/10 shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className={cn(
          "flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors bg-surface-container-lowest",
          uploading 
            ? "border-primary/50 bg-primary/5" 
            : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-low"
        )}>
          <input
            type="file"
            accept={ACCEPTED_FILE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
              <p className="text-xs font-medium text-primary">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-on-surface-variant group">
              <div className="h-8 w-8 rounded-full bg-surface-container flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Upload className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium">Click to browse or drag file here</p>
              <p className="text-[10px] mt-1">PDF, JPG, PNG (Max {MAX_FILE_SIZE_MB}MB)</p>
            </div>
          )}
        </label>
      )}
    </div>
  );
}
