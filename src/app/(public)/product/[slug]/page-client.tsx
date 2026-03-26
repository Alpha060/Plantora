"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Store, Truck, Shield } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "@/components/shared/image-gallery";
import { PriceDisplay } from "@/components/shared/price-display";
import { RatingStars } from "@/components/shared/rating-stars";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { ProductGrid } from "@/components/shared/product-grid";
import { useCartStore } from "@/stores/cart-store";
import type { ProductCardData } from "@/types";

interface ProductDetailProps {
  product: Record<string, unknown>;
  relatedProducts: Record<string, unknown>[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  const images = (product.product_images as { image_url: string; is_primary: boolean; sort_order: number }[]) || [];
  const variants = (product.product_variants as { id: string; variant_name: string; price: number; sale_price: number | null; stock_qty: number }[]) || [];
  const store = product.stores as { id: string; store_name: string; slug: string; rating: number } | null;

  const activeVariant = variants.find((v) => v.id === selectedVariant);
  const displayPrice = activeVariant ? activeVariant.price : (product.price as number);
  const displaySalePrice = activeVariant?.sale_price ?? (product.sale_price as number | null);
  const inStock = activeVariant ? activeVariant.stock_qty > 0 : (product.stock_qty as number) > 0;

  const handleAddToCart = () => {
    addItem({
      product_id: product.id as string,
      variant_id: selectedVariant,
      quantity,
      price: displaySalePrice && displaySalePrice < displayPrice ? displaySalePrice : displayPrice,
      name: product.name as string,
      image: images.find((i) => i.is_primary)?.image_url || images[0]?.image_url || null,
      store_id: store?.id || "",
      store_name: store?.store_name || "",
    });
    toast.success("Added to cart! 🌿");
  };

  const relatedItems: ProductCardData[] = relatedProducts.map((p) => ({
    id: p.id as string, name: p.name as string, slug: p.slug as string,
    price: p.price as number, sale_price: p.sale_price as number | null,
    avg_rating: (p.avg_rating as number) ?? 0, total_reviews: (p.total_reviews as number) ?? 0,
    is_featured: (p.is_featured as boolean) ?? false, store_id: p.store_id as string,
    primary_image: (p.product_images as { image_url: string; is_primary: boolean }[])?.find((i) => i.is_primary)?.image_url || null,
    store_name: (p.stores as unknown as { store_name: string })?.store_name || null,
  }));

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div className="bg-surface-lowest rounded-2xl p-4 shadow-ambient-sm">
            <ImageGallery images={images} productName={product.name as string} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-on-surface tracking-tight leading-tight">
                {product.name as string}
              </h1>
              {store && (
                <Link
                  href={`/store/${store.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-botanical transition-colors mt-2"
                >
                  <Store className="h-3.5 w-3.5" />
                  {store.store_name}
                </Link>
              )}
            </div>

            {/* Rating */}
            {(product.avg_rating as number) > 0 && (
              <RatingStars rating={product.avg_rating as number} showValue totalReviews={product.total_reviews as number} />
            )}

            {/* Price */}
            <PriceDisplay price={displayPrice} salePrice={displaySalePrice} size="lg" />

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <p className="font-heading text-sm font-semibold text-on-surface tracking-wide uppercase">Variants</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(selectedVariant === v.id ? null : v.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedVariant === v.id
                          ? "bg-botanical-gradient text-white shadow-ambient-sm"
                          : "bg-surface-high text-on-surface-variant hover:bg-surface-highest"
                      } ${v.stock_qty === 0 ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                      disabled={v.stock_qty === 0}
                    >
                      {v.variant_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock_qty as number} />
              <button
                className="flex-1 h-12 rounded-full bg-botanical-gradient text-white font-medium text-sm flex items-center justify-center gap-2 shadow-ambient-sm hover:shadow-ambient transition-shadow disabled:opacity-40"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart className="h-4 w-4" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button className="h-12 w-12 rounded-full bg-surface-lowest shadow-ambient-sm flex items-center justify-center shrink-0 hover:shadow-ambient transition-shadow">
                <Heart className="h-5 w-5 text-on-surface-variant" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-low">
                <div className="h-9 w-9 rounded-full bg-botanical-gradient flex items-center justify-center shrink-0">
                  <Truck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-on-surface">Same-day delivery</p>
                  <p className="text-xs text-on-surface-variant">In Daltonganj</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-low">
                <div className="h-9 w-9 rounded-full bg-botanical-gradient flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-on-surface">Fresh guarantee</p>
                  <p className="text-xs text-on-surface-variant">7-day return</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {(product.description as string) && (
              <div className="space-y-2 pt-2">
                <h3 className="font-heading font-semibold text-on-surface">Description</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {product.description as string}
                </p>
              </div>
            )}

            {/* Care */}
            {(product.care_instructions as string) && (
              <div className="space-y-2">
                <h3 className="font-heading font-semibold text-on-surface">Care Instructions</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {product.care_instructions as string}
                </p>
              </div>
            )}

            {/* Tags */}
            {(product.tags as string[])?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(product.tags as string[]).map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-surface-highest text-on-surface-variant text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {relatedItems.length > 0 && (
          <div className="mt-20">
            <h2 className="font-heading text-2xl font-bold text-on-surface mb-8">You May Also Love</h2>
            <ProductGrid products={relatedItems} columns={4} />
          </div>
        )}
      </div>
    </div>
  );
}
