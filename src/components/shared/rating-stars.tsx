"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  totalReviews?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

const starSizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function RatingStars({
  rating,
  maxStars = 5,
  size = "md",
  showValue = false,
  totalReviews,
  interactive = false,
  onRate,
  className,
}: RatingStarsProps) {
  const starSize = starSizes[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= Math.floor(rating);
          const isHalf =
            !isFilled &&
            starIndex === Math.ceil(rating) &&
            rating % 1 >= 0.25;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate?.(starIndex)}
              className={cn(
                "relative transition-colors",
                interactive && "cursor-pointer hover:scale-110"
              )}
            >
              <Star
                className={cn(
                  starSize,
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : isHalf
                    ? "fill-amber-400/50 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
      {totalReviews !== undefined && (
        <span className="text-xs text-muted-foreground">
          ({totalReviews})
        </span>
      )}
    </div>
  );
}
