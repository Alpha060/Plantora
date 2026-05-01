"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductGrid } from "@/components/shared/product-grid";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import type { ProductCardData } from "@/types";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const hasQuery = q.trim().length > 0;
  const [result, setResult] = useState<{
    query: string;
    products: ProductCardData[];
  }>({
    query: "",
    products: [],
  });

  useEffect(() => {
    if (!hasQuery) {
      return;
    }

    let isCancelled = false;
    const supabase = createClient();

    (async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, slug, price, sale_price, avg_rating, total_reviews, is_featured, store_id, product_images!inner(image_url, is_primary), stores!inner(store_name)"
          )
          .eq("is_active", true)
          .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
          .order("avg_rating", { ascending: false })
          .limit(20);

        if (isCancelled) return;

        if (data && !error) {
          const items: ProductCardData[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            sale_price: p.sale_price,
            avg_rating: p.avg_rating ?? 0,
            total_reviews: p.total_reviews ?? 0,
            is_featured: p.is_featured ?? false,
            store_id: p.store_id,
            primary_image:
              p.product_images?.find((img: any) => img.is_primary)
                ?.image_url ||
              p.product_images?.[0]?.image_url ||
              null,
            store_name: p.stores?.store_name || null,
          }));
          setResult({ query: q, products: items });
        } else {
          setResult({ query: q, products: [] });
        }
      } catch {
        if (!isCancelled) {
          setResult({ query: q, products: [] });
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [hasQuery, q]);

  const isLoading = hasQuery && result.query !== q;
  const visibleProducts = hasQuery && result.query === q ? result.products : [];

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
              {hasQuery && (
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {visibleProducts.length} {visibleProducts.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20"><LoadingSpinner text="Searching..." /></div>
        ) : visibleProducts.length > 0 ? (
          <ProductGrid products={visibleProducts} columns={4} />
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
