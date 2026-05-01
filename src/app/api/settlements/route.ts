import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSettlementNumber } from "@/lib/helpers/order";

/**
 * POST /api/settlements/generate — Generate weekly settlement for a seller (admin)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userData?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const body = await request.json();
    const { store_id, period_start, period_end } = body;

    if (!store_id || !period_start || !period_end) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get all delivered sub-orders for this seller in the period
    const { data: subOrders, error: subErr } = await supabase
      .from("order_sellers")
      .select("id, subtotal, commission_amount, seller_amount, order_id, orders!inner(created_at, status)")
      .eq("store_id", store_id)
      .eq("status", "delivered")
      .gte("orders.created_at", period_start)
      .lte("orders.created_at", period_end);

    if (subErr) return NextResponse.json({ error: subErr.message }, { status: 500 });
    if (!subOrders || subOrders.length === 0) {
      return NextResponse.json({ error: "No delivered orders in this period" }, { status: 400 });
    }

    const totalAmount = subOrders.reduce((s, o) => s + (o.subtotal || 0), 0);
    const totalCommission = subOrders.reduce((s, o) => s + (o.commission_amount || 0), 0);
    const totalSellerAmount = subOrders.reduce((s, o) => s + (o.seller_amount || 0), 0);

    const settlementNumber = generateSettlementNumber();

    const { data: settlement, error: stlErr } = await supabase
      .from("seller_settlements")
      .insert({
        settlement_number: settlementNumber,
        store_id,
        period_start,
        period_end,
        total_orders: subOrders.length,
        gross_sales: totalAmount,
        total_commission: totalCommission,
        net_amount: totalSellerAmount,
        status: "calculated",
      })
      .select("id, settlement_number")
      .single();

    if (stlErr) return NextResponse.json({ error: stlErr.message }, { status: 500 });

    // Create settlement items
    const items = subOrders.map((so) => ({
      settlement_id: settlement.id,
      order_seller_id: so.id,
      order_id: so.order_id,
      gross_amount: so.subtotal,
      commission_amount: so.commission_amount,
      net_amount: so.seller_amount,
    }));

    await supabase.from("settlement_items").insert(items);

    return NextResponse.json({ data: settlement }, { status: 201 });
  } catch (error) {
    console.error("Settlement generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/settlements — List settlements
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("store_id");

    let query = supabase
      .from("seller_settlements")
      .select("*, stores(id, store_name)", { count: "exact" })
      .order("created_at", { ascending: false });

    // Seller sees only their own
    if (userData?.role === "seller" && storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data || [], count: count || 0 });
  } catch (error) {
    console.error("Settlements GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
