"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const btnSize = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const textSize = size === "sm" ? "text-sm w-8" : "text-base w-10";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon"
        className={cn(btnSize, "rounded-full")}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className={iconSize} />
      </Button>
      <span className={cn("text-center font-medium", textSize)}>
        {value}
      </span>
      <Button
        variant="outline"
        size="icon"
        className={cn(btnSize, "rounded-full")}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className={iconSize} />
      </Button>
    </div>
  );
}
