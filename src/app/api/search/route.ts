import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/search?q=keyword — Full-text search across products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (query.length < 2) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, price, sale_price, avg_rating, total_reviews, is_featured, store_id, product_images!inner(image_url, is_primary), stores!inner(store_name)"
      )
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("avg_rating", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
