"use client";

import { useMemo, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { sanitizeImageUrl } from "@/lib/utils";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallbackSrc?: string;
}

export function SafeImage({
  src,
  fallbackSrc = "/placeholder-product.svg",
  alt,
  onError,
  ...props
}: SafeImageProps) {
  const cleanedSrc = useMemo(() => sanitizeImageUrl(src), [src]);
  const initialSrc = cleanedSrc ?? fallbackSrc;

  return (
    <SafeImageInner
      key={initialSrc}
      {...props}
      src={initialSrc}
      alt={alt}
      fallbackSrc={fallbackSrc}
      onError={onError}
    />
  );
}

interface SafeImageInnerProps extends Omit<ImageProps, "src"> {
  src: string;
  fallbackSrc: string;
}

function SafeImageInner({
  src,
  fallbackSrc,
  alt,
  onError,
  ...props
}: SafeImageInnerProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        onError?.(event);
      }}
    />
  );
}
