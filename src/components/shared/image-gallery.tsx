"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: { image_url: string; is_primary: boolean; sort_order: number }[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentImage = sorted[selectedIndex];

  const goTo = (dir: "prev" | "next") => {
    setSelectedIndex((i) =>
      dir === "prev"
        ? (i - 1 + sorted.length) % sorted.length
        : (i + 1) % sorted.length
    );
  };

  if (sorted.length === 0) {
    return (
      <div className="aspect-square rounded-xl border bg-gray-100 flex items-center justify-center text-gray-400">
        No images
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-square rounded-xl border overflow-hidden bg-gray-50 group">
        <Image
          src={currentImage.image_url}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {sorted.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 shadow opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => goTo("prev")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 shadow opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => goTo("next")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-md">
          {selectedIndex + 1}/{sorted.length}
        </div>
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, index) => (
            <button
              key={img.image_url}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-16 w-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all",
                index === selectedIndex
                  ? "border-emerald-500 ring-1 ring-emerald-500"
                  : "border-transparent hover:border-gray-300"
              )}
            >
              <Image
                src={img.image_url}
                alt={`thumb ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
