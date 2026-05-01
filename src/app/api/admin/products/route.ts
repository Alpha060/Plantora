import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/products
 * Returns all products for admin moderation with store info
 */
export async function GET(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const status = searchParams.get("status"); // active, inactive
    const perPage = 20;
    const offset = (page - 1) * perPage;

    let query = supabase
      .from("products")
      .select(
        "id, name, slug, price, sale_price, stock_qty, is_active, is_featured, is_deleted, created_at, stores(store_name), categories(name), product_images(image_url, is_primary)",
        { count: "exact" }
      )
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);

    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error("Admin products error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const formattedProducts = (products || []).map((p) => {
      const storeData = p.stores as { store_name: string } | null;
      const categoryData = p.categories as { name: string } | null;
      const images = (p.product_images as Array<{ image_url: string; is_primary: boolean }>) || [];
      const primaryImage = images.find((i) => i.is_primary)?.image_url || images[0]?.image_url || null;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        sale_price: p.sale_price ? Number(p.sale_price) : null,
        stock_qty: p.stock_qty,
        is_active: p.is_active,
        is_featured: p.is_featured,
        store_name: storeData?.store_name || "Unknown",
        category_name: categoryData?.name || "Uncategorized",
        image: primaryImage,
        date: p.created_at,
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      total: count || 0,
      page,
      perPage,
    });
  } catch (err) {
    console.error("Admin Products API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
