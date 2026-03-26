"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PRODUCTS_PER_PAGE, OCCASIONS } from "@/lib/constants";
import type { ProductCardData, Category } from "@/types";

export default function ShopPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

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
      if (!updates.page) params.set("page", "1");
      router.push(`/shop?${params.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const flat: Category[] = [];
          for (const p of json.data) {
            flat.push(p);
            if (p.children) flat.push(...p.children);
          }
          setCategories(flat);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(PRODUCTS_PER_PAGE));
        params.set("status", "active");
        params.set("sort_by", sortBy);
        params.set("sort_order", sortOrder);
        if (categorySlug) {
          const cat = categories.find((c) => c.slug === categorySlug);
          if (cat) params.set("category_id", cat.id);
        }
        const res = await fetch(`/api/products?${params.toString()}`);
        const json = await res.json();
        if (res.ok) {
          const items: ProductCardData[] = (json.data || []).map(
            (p: Record<string, unknown>) => ({
              id: p.id, name: p.name, slug: p.slug, price: p.price,
              sale_price: p.sale_price, avg_rating: (p.avg_rating as number) ?? 0,
              total_reviews: (p.total_reviews as number) ?? 0,
              is_featured: (p.is_featured as boolean) ?? false,
              store_id: p.store_id,
              primary_image: (p.product_images as { image_url: string; is_primary: boolean }[])?.find((i) => i.is_primary)?.image_url || null,
              store_name: (p.stores as { store_name: string } | null)?.store_name || null,
            })
          );
          setProducts(items);
          setTotalCount(json.count || 0);
        }
      } catch { /* silent */ } finally { setIsLoading(false); }
    };
    fetchProducts();
  }, [page, categorySlug, occasion, sortBy, sortOrder, categories, minPrice, maxPrice]);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const hasActiveFilters = !!(categorySlug || occasion || minPrice || maxPrice);

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div className="space-y-3">
        <p className="font-heading text-sm font-semibold text-on-surface tracking-wide uppercase">Categories</p>
        {categories.filter((c) => !c.parent_id).map((cat) => (
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
        <div className="flex items-end justify-between mt-6 mb-8">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
              The Collection
            </h1>
            <p className="text-sm text-on-surface-variant mt-1.5">
              {totalCount} curated specimens
            </p>
          </div>
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
                <SelectValue placeholder="Sort by" />
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
            {isLoading ? (
              <div className="py-20"><LoadingSpinner text="Loading collection..." /></div>
            ) : (
              <>
                <ProductGrid products={products} columns={3} />
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
