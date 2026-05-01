import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/seller/reviews
 * Returns all reviews for the authenticated seller's products
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get seller's store
    const { data: store } = await supabase
      .from("stores")
      .select("id, rating")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Get all reviews for this store
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        review_text,
        is_verified_purchase,
        is_visible,
        created_at,
        users!reviews_user_id_fkey(full_name, avatar_url),
        products!reviews_product_id_fkey(name, slug)
      `)
      .eq("store_id", store.id)
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews DB Error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Calculate rating distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    if (reviews) {
      for (const review of reviews) {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        totalRating += review.rating;
      }
    }

    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    // Format reviews for frontend
    const formattedReviews = (reviews || []).map((r) => {
      const userData = r.users as { full_name: string; avatar_url: string | null };
      const productData = r.products as { name: string; slug: string };
      return {
        id: r.id,
        rating: r.rating,
        review_text: r.review_text,
        is_verified_purchase: r.is_verified_purchase,
        customer_name: userData.full_name,
        customer_avatar: userData.avatar_url,
        product_name: productData.name,
        product_slug: productData.slug,
        date: r.created_at,
      };
    });

    return NextResponse.json({
      summary: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        distribution,
      },
      reviews: formattedReviews,
    });
  } catch (err) {
    console.error("Reviews API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
