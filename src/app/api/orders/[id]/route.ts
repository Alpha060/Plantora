import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/orders/[id] — Get order detail with sub-orders, items, store, rider info
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `*,
         order_sellers(
           *,
           stores(id, store_name, phone, address),
           riders(id, name, phone),
           order_items(*)
         ),
         order_status_history(status, created_at, note)`
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Rename riders -> rider in each sub-order for cleaner API
    const sanitized = {
      ...data,
      order_sellers: data.order_sellers.map(
        (sub: Record<string, unknown>) => ({
          ...sub,
          rider: sub.riders || null,
          riders: undefined,
        })
      ),
    };

    return NextResponse.json({ data: sanitized }, { status: 200 });
  } catch (error) {
    console.error("Order detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
