import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/reviews — All reviews for moderation
 */
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        review_text,
        is_verified_purchase,
        is_visible,
        hidden_reason,
        created_at,
        users!reviews_user_id_fkey(full_name),
        products!reviews_product_id_fkey(name, slug),
        stores(store_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin reviews error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const formatted = (reviews || []).map((r) => {
      const userData = r.users as { full_name: string } | null;
      const productData = r.products as { name: string; slug: string } | null;
      const storeData = r.stores as { store_name: string } | null;
      return {
        id: r.id,
        rating: r.rating,
        review_text: r.review_text,
        is_verified_purchase: r.is_verified_purchase,
        is_visible: r.is_visible,
        hidden_reason: r.hidden_reason,
        customer_name: userData?.full_name || "Unknown",
        product_name: productData?.name || "Unknown",
        store_name: storeData?.store_name || "Unknown",
        date: r.created_at,
      };
    });

    return NextResponse.json({ reviews: formatted });
  } catch (err) {
    console.error("Admin Reviews API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/reviews — Hide/Restore a review
 */
export async function PUT(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const body = await request.json();
    const { review_id, action, reason } = body;

    if (!review_id || !["hide", "restore"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const update =
      action === "hide"
        ? { is_visible: false, hidden_reason: reason || "Hidden by admin", hidden_by: guard.ctx.userId }
        : { is_visible: true, hidden_reason: null, hidden_by: null };

    const { error } = await supabase
      .from("reviews")
      .update(update)
      .eq("id", review_id);

    if (error) {
      console.error("Update review error:", error);
      return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin Reviews PUT Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
