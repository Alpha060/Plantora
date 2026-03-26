import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/helpers/format";

interface PriceDisplayProps {
  price: number;
  salePrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const textSizes = {
  sm: { main: "text-sm", strike: "text-xs", badge: "text-[10px] px-1 py-0.5" },
  md: { main: "text-base", strike: "text-sm", badge: "text-xs px-1.5 py-0.5" },
  lg: { main: "text-xl", strike: "text-sm", badge: "text-xs px-2 py-1" },
};

export function PriceDisplay({
  price,
  salePrice,
  size = "md",
  className,
}: PriceDisplayProps) {
  const hasDiscount = salePrice != null && salePrice > 0 && salePrice < price;
  const discountPercentage = hasDiscount
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  const styles = textSizes[size];

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className={cn("font-bold text-gray-900", styles.main)}>
        {formatPrice(hasDiscount ? salePrice : price)}
      </span>
      {hasDiscount && (
        <>
          <span
            className={cn(
              "text-muted-foreground line-through",
              styles.strike
            )}
          >
            {formatPrice(price)}
          </span>
          <span
            className={cn(
              "font-semibold bg-emerald-100 text-emerald-700 rounded-md",
              styles.badge
            )}
          >
            {discountPercentage}% off
          </span>
        </>
      )}
    </div>
  );
}
