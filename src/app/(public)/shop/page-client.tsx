"use client";

import React, { useTransition, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductGrid } from "@/components/shared/product-grid";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { createClient } from "@/lib/supabase/client";
import { PRODUCTS_PER_PAGE, OCCASIONS } from "@/lib/constants";
import type { ProductCardData, Category } from "@/types";

const sortOptions: Record<string, string> = {
  "created_at-desc": "Newest First",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "avg_rating-desc": "Highest Rated",
  "name-asc": "Name: A-Z"
};

interface ShopPageClientProps {
  initialProducts: ProductCardData[];
  initialTotalCount: number;
  initialCategories: Category[];
}

export default function ShopPageClient({
  initialProducts,
  initialTotalCount,
  initialCategories,
}: ShopPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const page = parseInt(searchParams.get("page") || "1");
  const categorySlug = searchParams.get("category") || "";
  const occasion = searchParams.get("occasion") || "";
  const sortBy = searchParams.get("sort") || "created_at";
  const sortOrder = searchParams.get("order") || "desc";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val) params.set(key, val);
        else params.delete(key);
      }
      startTransition(() => {
        router.push(`/shop?${params.toString()}`);
      });
    },
    [searchParams, router]
  );



  const totalPages = Math.ceil(initialTotalCount / PRODUCTS_PER_PAGE);
  const hasActiveFilters = !!(categorySlug || occasion || minPrice || maxPrice);

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div className="space-y-3">
        <p className="font-heading text-sm font-semibold text-on-surface tracking-wide uppercase">Categories</p>
        {initialCategories.filter((c) => !c.parent_id).map((cat) => (
          <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={categorySlug === cat.slug}
              onCheckedChange={(checked) => updateFilters({ category: checked ? cat.slug : "" })}
            />
            <span className="text-sm text-on-surface-variant group-hover:text-botanical transition-colors">{cat.name}</span>
          </label>
        ))}
      </div>

      {/* Occasion */}
      <div className="space-y-3">
        <p className="font-heading text-sm font-semibold text-on-surface tracking-wide uppercase">Occasion</p>
        {OCCASIONS.map((o) => (
          <label key={o} className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={occasion === o}
              onCheckedChange={(checked) => updateFilters({ occasion: checked ? o : "" })}
            />
            <span className="text-sm text-on-surface-variant group-hover:text-botanical transition-colors">{o}</span>
          </label>
        ))}
      </div>

      {/* Price */}
      <div className="space-y-3">
        <p className="font-heading text-sm font-semibold text-on-surface tracking-wide uppercase">Price Range</p>
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="Min ₹" value={minPrice} onChange={(e) => updateFilters({ min_price: e.target.value })} className="bg-surface-high border-0 text-sm h-9" />
          <span className="text-on-surface-variant text-xs">to</span>
          <Input type="number" placeholder="Max ₹" value={maxPrice} onChange={(e) => updateFilters({ max_price: e.target.value })} className="bg-surface-high border-0 text-sm h-9" />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => updateFilters({ category: "", occasion: "", min_price: "", max_price: "" })}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumbs items={[{ label: "Shop" }]} />

        {/* Header */}
        <div className="mt-6 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            {/* Mobile filter */}
            <Sheet>
              <SheetTrigger className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-surface-lowest shadow-ambient-sm lg:hidden hover:shadow-ambient transition-shadow">
                <SlidersHorizontal className="h-4 w-4" />Filters
                {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-botanical-primary" />}
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-surface-low">
                <SheetHeader><SheetTitle className="font-heading">Refine</SheetTitle></SheetHeader>
                <div className="mt-6"><FilterContent /></div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(val) => { if (!val) return; const [sb, so] = val.split("-"); updateFilters({ sort: sb, order: so }); }}>
              <SelectTrigger className="w-[180px] h-10 rounded-full bg-surface-lowest shadow-ambient-sm border-0 text-sm">
                <div className="flex-1 text-left truncate">Sort by: {sortOptions[`${sortBy}-${sortOrder}`] || "Newest First"}</div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="avg_rating-desc">Highest Rated</SelectItem>
                <SelectItem value="name-asc">Name: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-on-surface-variant">
            {initialTotalCount} {initialTotalCount === 1 ? "product" : "products"} found
          </p>
        </div>

        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-surface-lowest rounded-2xl p-6 shadow-ambient-sm">
              <h3 className="font-heading font-semibold text-on-surface mb-6">Refine</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {isPending ? (
              <div className="py-20"><LoadingSpinner text="Loading collection..." /></div>
            ) : (
              <>
                <ProductGrid products={initialProducts} columns={3} />
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                      disabled={page <= 1}
                      onClick={() => updateFilters({ page: String(page - 1) })}
                      className="px-5 py-2.5 rounded-full bg-surface-lowest shadow-ambient-sm text-sm font-medium text-on-surface disabled:opacity-40 hover:shadow-ambient transition-shadow"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-on-surface-variant px-4">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => updateFilters({ page: String(page + 1) })}
                      className="px-5 py-2.5 rounded-full bg-surface-lowest shadow-ambient-sm text-sm font-medium text-on-surface disabled:opacity-40 hover:shadow-ambient transition-shadow"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
