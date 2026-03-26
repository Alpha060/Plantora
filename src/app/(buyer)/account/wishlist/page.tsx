"use client";

import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductGrid } from "@/components/shared/product-grid";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import type { ProductCardData } from "@/types";

export default function WishlistPage() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const json = await res.json();
      if (res.ok && json.data) {
        const items: ProductCardData[] = json.data.map(
          (w: Record<string, unknown>) => {
            const p = w.products as Record<string, unknown>;
            return {
              id: p.id, name: p.name, slug: p.slug, price: p.price,
              sale_price: p.sale_price, avg_rating: (p.avg_rating as number) ?? 0,
              total_reviews: (p.total_reviews as number) ?? 0,
              is_featured: (p.is_featured as boolean) ?? false,
              store_id: p.store_id,
              primary_image: (p.product_images as { image_url: string; is_primary: boolean }[])?.find((i: { is_primary: boolean }) => i.is_primary)?.image_url || null,
              store_name: (p.stores as unknown as { store_name: string })?.store_name || null,
            };
          }
        );
        setProducts(items);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (productId: string) => {
    setRemovingIds((prev) => new Set(prev).add(productId));
    try {
      await fetch(`/api/wishlist?product_id=${productId}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    } finally {
      setRemovingIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumbs items={[{ label: "Account" }, { label: "Wishlist" }]} />

        <div className="flex items-center gap-3 mt-6 mb-8">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
            <Heart className="h-5 w-5 text-red-400 fill-red-400" />
          </div>
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              My Wishlist
            </h1>
            <p className="text-sm text-on-surface-variant">{products.length} saved items</p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20"><LoadingSpinner text="Loading wishlist..." /></div>
        ) : products.length > 0 ? (
          <ProductGrid
            products={products}
            columns={4}
            wishlistedIds={new Set(products.map((p) => p.id))}
            onToggleWishlist={handleRemove}
          />
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Save products you love to easily find them later"
              actionLabel="Browse Collection"
              onAction={() => window.location.href = "/shop"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
