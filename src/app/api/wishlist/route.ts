import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/wishlist — Get user wishlist
 * POST /api/wishlist — Add product to wishlist
 * DELETE /api/wishlist?product_id=xxx — Remove from wishlist
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("wishlists")
      .select(
        "id, product_id, products!inner(id, name, slug, price, sale_price, avg_rating, total_reviews, is_featured, store_id, product_images!inner(image_url, is_primary), stores!inner(store_name))"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { product_id } = await request.json();
    if (!product_id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    // Check if already wishlisted
    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product_id)
      .single();

    if (existing) return NextResponse.json({ data: existing }, { status: 200 });

    const { data, error } = await supabase
      .from("wishlists")
      .insert({ user_id: user.id, product_id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
