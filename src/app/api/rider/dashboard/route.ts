import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/rider/dashboard — Dashboard metrics for the logged-in rider
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get rider record
    const { data: rider } = await supabase
      .from("riders")
      .select("id, name, is_available, total_deliveries")
      .eq("user_id", user.id)
      .single();

    if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

    // Active orders assigned to this rider
    const { data: activeOrders } = await supabase
      .from("order_sellers")
      .select("id, status, orders(order_number, delivery_address, total)")
      .eq("rider_id", rider.id)
      .in("status", ["rider_assigned", "picked_up", "out_for_delivery"]);

    // Today's deliveries
    const today = new Date().toISOString().split("T")[0];
    const { data: todayDeliveries } = await supabase
      .from("order_sellers")
      .select("id")
      .eq("rider_id", rider.id)
      .eq("status", "delivered")
      .gte("updated_at", `${today}T00:00:00`);

    // Today's earnings
    const { data: todayEarnings } = await supabase
      .from("rider_earnings")
      .select("amount, type")
      .eq("rider_id", rider.id)
      .gte("created_at", `${today}T00:00:00`);

    let todayEarned = 0;
    if (todayEarnings) {
      for (const e of todayEarnings) {
        todayEarned += e.type === "penalty" ? -Number(e.amount) : Number(e.amount);
      }
    }

    // Pending COD
    const { data: pendingCod } = await supabase
      .from("cod_collections")
      .select("amount")
      .eq("rider_id", rider.id)
      .eq("status", "collected");

    const codPending = (pendingCod || []).reduce((s, c) => s + Number(c.amount), 0);

    return NextResponse.json({
      rider: { id: rider.id, name: rider.name, is_available: rider.is_available },
      metrics: {
        totalDeliveries: rider.total_deliveries,
        todayDeliveries: todayDeliveries?.length || 0,
        activeOrders: activeOrders?.length || 0,
        todayEarnings: todayEarned,
        codPending,
      },
      activeOrders: (activeOrders || []).map((o) => {
        const orderData = o.orders as { order_number: string; delivery_address: Record<string, string>; total: number } | null;
        return {
          id: o.id,
          status: o.status,
          order_number: orderData?.order_number || "N/A",
          delivery_address: orderData?.delivery_address || {},
          total: orderData ? Number(orderData.total) : 0,
        };
      }),
    });
  } catch (err) {
    console.error("Rider Dashboard API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
