import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import ProductDetailClient from "./page-client";

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "*, product_images(*), product_variants(*), stores(id, store_name, slug, rating), categories(id, name, slug)"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) return notFound();

  // Related products (same category)
  let related: Record<string, unknown>[] = [];
  if (product.category_id) {
    const { data } = await supabase
      .from("products")
      .select(
        "id, name, slug, price, sale_price, avg_rating, total_reviews, is_featured, store_id, product_images(image_url, is_primary), stores(store_name)"
      )
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .eq("is_active", true)
      .limit(4);
    related = (data as Record<string, unknown>[]) || [];
  }

  const categoryName = (product.categories as unknown as { name: string } | null)?.name || "Shop";
  const categorySlug = (product.categories as unknown as { slug: string } | null)?.slug || "";

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: "Shop", href: "/shop" },
          ...(categorySlug
            ? [{ label: categoryName, href: `/category/${categorySlug}` }]
            : []),
          { label: product.name },
        ]}
      />
      <ProductDetailClient product={product} relatedProducts={related || []} />
    </div>
  );
}
