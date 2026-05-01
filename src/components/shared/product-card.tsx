"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";
import { SafeImage } from "@/components/shared/safe-image";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import type { ProductCardData } from "@/types";

interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
  className?: string;
  imageLoading?: "eager" | "lazy";
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  className,
  imageLoading = "lazy",
}: ProductCardProps) {
  const hasDiscount =
    product.sale_price != null &&
    product.sale_price > 0 &&
    product.sale_price < product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - (product.sale_price ?? 0)) / product.price) * 100
      )
    : 0;

  const isFlower =
    product.category_slug?.includes("flower") ||
    product.category_slug?.includes("bouquet");

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-white shadow-sm overflow-hidden transition-all hover:shadow-md",
        className
      )}
    >
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        {product.primary_image ? (
          <SafeImage
            src={product.primary_image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
            loading={imageLoading}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5">
            {discountPercentage}% OFF
          </Badge>
        )}

        {/* Featured Badge */}
        {product.is_featured && (
          <Badge className="absolute top-2 right-10 bg-amber-500 hover:bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5">
            Featured
          </Badge>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist?.(product.id);
          }}
          className={cn(
            "absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm",
            isWishlisted
              ? "text-red-500"
              : "text-gray-400 hover:text-red-400"
          )}
        >
          <Heart
            className={cn("h-4 w-4", isWishlisted && "fill-current")}
          />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3 space-y-2">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 hover:text-emerald-600 transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {(product.avg_rating ?? 0) > 0 && (
          <RatingStars
            rating={product.avg_rating ?? 0}
            size="sm"
            showValue
            totalReviews={product.total_reviews ?? 0}
          />
        )}

        {/* Price */}
        <PriceDisplay
          price={product.price}
          salePrice={product.sale_price}
          size="sm"
        />

        {/* Store Name */}
        {product.store_name && (
          <p className="text-xs text-muted-foreground">
            Sold by {product.store_name}
          </p>
        )}

        {/* Add to Cart */}
        <Button
          size="sm"
          className={cn(
            "w-full text-white mt-1",
            isFlower
              ? "bg-rose-500 hover:bg-rose-600"
              : "bg-emerald-600 hover:bg-emerald-700"
          )}
          onClick={(e) => {
            e.preventDefault();
            if (onAddToCart) {
              onAddToCart(product.id);
            } else {
              useCartStore.getState().addItem({
                product_id: product.id,
                variant_id: null,
                quantity: 1,
                price: product.sale_price ?? product.price,
                name: product.name,
                image: product.primary_image ?? null,
                store_id: product.store_id || "default",
                store_name: product.store_name || "Plantora Store",
              });
              toast.success(`${product.name} added to cart!`);
            }
          }}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
