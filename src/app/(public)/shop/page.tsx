import ShopPageClient from "./page-client";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import type { ProductCardData, Category } from "@/types";

export default async function ShopPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const supabase = await createClient();
  
  const pageStr = typeof params.page === "string" ? params.page : "1";
  const page = parseInt(pageStr) || 1;
  const categorySlug = typeof params.category === "string" ? params.category : "";
  const sortBy = typeof params.sort === "string" ? params.sort : "created_at";
  const sortOrder = typeof params.order === "string" ? params.order : "desc";
  const occasion = typeof params.occasion === "string" ? params.occasion : "";
  const minPrice = typeof params.min_price === "string" ? params.min_price : "";
  const maxPrice = typeof params.max_price === "string" ? params.max_price : "";

  // Fetch categories and products in parallel for lightning speed
  const categoriesPromise = supabase.from("categories").select("*").order("name");

  // Build product query
  let productQuery = supabase
    .from("products")
    .select(
      "id, name, slug, price, sale_price, avg_rating, total_reviews, is_featured, store_id, product_images!inner(image_url, is_primary), stores!inner(store_name), categories(slug)",
      { count: "exact" }
    )
    .eq("is_active", true);

  if (occasion) {
    productQuery = productQuery.contains("occasion", [occasion]);
  }
  if (minPrice) {
    productQuery = productQuery.gte("price", parseFloat(minPrice));
  }
  if (maxPrice) {
    productQuery = productQuery.lte("price", parseFloat(maxPrice));
  }

  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  productQuery = productQuery
    .order(sortBy as any, { ascending: sortOrder === "asc" })
    .range(from, to);

  // Execute categories fetch first (needed for category filter)
  const { data: categoryData } = await categoriesPromise;
  const categories: Category[] = categoryData || [];

  // Apply category filter if needed
  if (categorySlug && categories.length > 0) {
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) {
      const childCatIds = categories.filter((c) => c.parent_id === cat.id).map((c) => c.id);
      const allIds = [cat.id, ...childCatIds];
      productQuery = productQuery.in("category_id", allIds);
    }
  }

  const { data: productData, count } = await productQuery;
  
  let initialProducts: ProductCardData[] = [];
  if (productData) {
    initialProducts = productData.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      sale_price: p.sale_price,
      avg_rating: p.avg_rating ?? 0,
      total_reviews: p.total_reviews ?? 0,
      is_featured: p.is_featured ?? false,
      store_id: p.store_id,
      primary_image: p.product_images?.find((img: any) => img.is_primary)?.image_url || p.product_images?.[0]?.image_url || null,
      store_name: p.stores?.store_name || null,
      category_slug: p.categories?.slug || null,
    }));
  }

  return (
    <Suspense>
      <ShopPageClient 
        initialProducts={initialProducts}
        initialTotalCount={count || 0}
        initialCategories={categories}
      />
    </Suspense>
  );
}
