"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductGrid } from "@/components/shared/product-grid";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import type { ProductCardData } from "@/types";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!q) { setProducts([]); setIsLoading(false); return; }
    setIsLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((json) => {
        const items: ProductCardData[] = (json.data || []).map(
          (p: Record<string, unknown>) => ({
            id: p.id, name: p.name, slug: p.slug, price: p.price,
            sale_price: p.sale_price, avg_rating: (p.avg_rating as number) ?? 0,
            total_reviews: (p.total_reviews as number) ?? 0,
            is_featured: (p.is_featured as boolean) ?? false,
            store_id: p.store_id,
            primary_image: (p.product_images as { image_url: string; is_primary: boolean }[])?.find((i) => i.is_primary)?.image_url || null,
            store_name: (p.stores as unknown as { store_name: string })?.store_name || null,
          })
        );
        setProducts(items);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [q]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: "Search" }]} />

        <div className="mt-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-botanical-gradient flex items-center justify-center">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
                Search Results
              </h1>
              {q && (
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {products.length} {products.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20"><LoadingSpinner text="Searching..." /></div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} columns={4} />
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={Search}
              title={`No products found for "${q}"`}
              description="Try different search terms or browse our collection"
              actionLabel="Browse Collection"
              onAction={() => window.location.href = "/shop"}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface py-20"><LoadingSpinner text="Loading..." /></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
