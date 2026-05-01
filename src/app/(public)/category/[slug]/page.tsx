import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductGrid } from "@/components/shared/product-grid";
import type { ProductCardData } from "@/types";

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !category) return notFound();

  // Subcategories and Products in parallel
  const [{ data: subcategories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("parent_id", category.id)
      .order("sort_order"),
    supabase
      .from("products")
      .select(
        "id, name, slug, price, sale_price, avg_rating, total_reviews, is_featured, store_id, product_images(image_url, is_primary), stores(store_name)"
      )
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const productItems: ProductCardData[] = (products || []).map((p) => ({
    id: p.id, name: p.name, slug: p.slug, price: p.price,
    sale_price: p.sale_price, avg_rating: p.avg_rating ?? 0,
    total_reviews: p.total_reviews ?? 0, is_featured: p.is_featured,
    store_id: p.store_id,
    primary_image: (p.product_images as { image_url: string; is_primary: boolean }[])?.find((i) => i.is_primary)?.image_url || null,
    store_name: (p.stores as unknown as { store_name: string })?.store_name || null,
  }));

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: category.name }]} />

        {/* Category Header */}
        <div className="mt-6 mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Subcategory Pills */}
        {subcategories && subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.slug}`}
                className="px-4 py-2 rounded-full bg-surface-lowest shadow-ambient-sm text-sm font-medium text-on-surface-variant hover:text-botanical hover:shadow-ambient transition-all"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid products={productItems} columns={4} />
      </div>
    </div>
  );
}
