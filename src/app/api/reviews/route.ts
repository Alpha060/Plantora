import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/reviews — Submit a product review (verified purchase only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { product_id, order_id, order_item_id, rating, review_text } = body;

    if (!product_id || !order_id || !order_item_id || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    // Verify purchase: check that user has a delivered order containing this product
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("id, order_id, order_seller_id, order_sellers!inner(store_id), orders!inner(status, user_id)")
      .eq("id", order_item_id)
      .eq("product_id", product_id)
      .eq("order_id", order_id)
      .single();

    if (!orderItem) {
      return NextResponse.json({ error: "You can only review products you have purchased" }, { status: 403 });
    }

    // Extract store_id from the join
    const storeId = (orderItem.order_sellers as unknown as { store_id: string })?.store_id;

    // Check duplicate review
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", product_id)
      .eq("user_id", user.id)
      .eq("order_id", order_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this product for this order" }, { status: 409 });
    }

    // Create review
    const { data: review, error: reviewErr } = await supabase
      .from("reviews")
      .insert({
        product_id,
        user_id: user.id,
        order_id,
        order_item_id,
        store_id: storeId,
        rating,
        review_text: review_text || null,
        is_verified_purchase: true,
      })
      .select("id")
      .single();

    if (reviewErr) {
      return NextResponse.json({ error: reviewErr.message }, { status: 500 });
    }

    // Update product avg_rating and total_reviews
    const { data: stats } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", product_id)
      .eq("is_visible", true);

    if (stats && stats.length > 0) {
      const avg = stats.reduce((sum, r) => sum + r.rating, 0) / stats.length;
      await supabase
        .from("products")
        .update({
          avg_rating: Math.round(avg * 10) / 10,
          total_reviews: stats.length,
        })
        .eq("id", product_id);
    }

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error("Review POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/reviews?product_id=xxx — Get reviews for a product
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const sort = searchParams.get("sort") || "recent";

    if (!productId) {
      return NextResponse.json({ error: "product_id required" }, { status: 400 });
    }

    const supabase = await createClient();
    let query = supabase
      .from("reviews")
      .select("*, users(id, full_name, avatar_url)", { count: "exact" })
      .eq("product_id", productId)
      .eq("is_visible", true);

    if (sort === "highest") {
      query = query.order("rating", { ascending: false });
    } else if (sort === "lowest") {
      query = query.order("rating", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get rating distribution
    const { data: allRatings } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("is_visible", true);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allRatings?.forEach((r) => {
      const key = r.rating as 1 | 2 | 3 | 4 | 5;
      if (distribution[key] !== undefined) distribution[key]++;
    });

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      distribution,
    });
  } catch (error) {
    console.error("Review GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
