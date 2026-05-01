import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/rider/orders — Rider's assigned orders
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: rider } = await supabase.from("riders").select("id").eq("user_id", user.id).single();
    if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";

    let query = supabase
      .from("order_sellers")
      .select("id, status, subtotal, created_at, updated_at, orders(order_number, delivery_address, total, payment_method), stores(store_name, address, phone)")
      .eq("rider_id", rider.id)
      .order("created_at", { ascending: false });

    if (status === "active") {
      query = query.in("status", ["rider_assigned", "picked_up", "out_for_delivery"]);
    } else if (status === "completed") {
      query = query.eq("status", "delivered");
    } else if (status === "all") {
      // no filter
    }

    const { data: orders, error } = await query.limit(50);

    if (error) {
      console.error("Rider orders error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const formatted = (orders || []).map((o) => {
      const orderData = o.orders as { order_number: string; delivery_address: Record<string, string>; total: number; payment_method: string } | null;
      const storeData = o.stores as { store_name: string; address: string; phone: string } | null;
      return {
        id: o.id,
        status: o.status,
        subtotal: Number(o.subtotal),
        order_number: orderData?.order_number || "N/A",
        delivery_address: orderData?.delivery_address || {},
        order_total: orderData ? Number(orderData.total) : 0,
        payment_method: orderData?.payment_method || "upi",
        store_name: storeData?.store_name || "Unknown",
        store_address: storeData?.address || "",
        store_phone: storeData?.phone || "",
        created_at: o.created_at,
        updated_at: o.updated_at,
      };
    });

    return NextResponse.json({ orders: formatted });
  } catch (err) {
    console.error("Rider Orders API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
