import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PackageOpen } from "lucide-react";
import type { ProductCardData } from "@/types";

interface ProductGridProps {
  products: ProductCardData[];
  columns?: 2 | 3 | 4;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  wishlistedIds?: Set<string>;
  emptyMessage?: string;
  className?: string;
}

const gridCols = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

export function ProductGrid({
  products,
  columns = 4,
  onAddToCart,
  onToggleWishlist,
  wishlistedIds = new Set(),
  emptyMessage = "No products found",
  className,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title={emptyMessage}
        description="Try adjusting your filters or check back later."
      />
    );
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistedIds.has(product.id)}
          imageLoading={index === 0 ? "eager" : "lazy"}
        />
      ))}
    </div>
  );
}
