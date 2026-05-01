import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/finance/revenue — Revenue analytics
 */
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get orders in period
    const { data: orders } = await supabase
      .from("orders")
      .select("total, subtotal, delivery_fee, discount, payment_method, payment_status, status, created_at")
      .gte("created_at", startDate.toISOString())
      .neq("status", "cancelled");

    const allOrders = orders || [];
    const delivered = allOrders.filter((o) => o.status === "delivered");

    // Calculate stats
    const total_revenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);
    const total_delivery_fees = allOrders.reduce((s, o) => s + (o.delivery_fee || 0), 0);
    const total_refunds = 0; // TODO: sum from refunds table
    const upi_revenue = allOrders.filter((o) => o.payment_method === "upi").reduce((s, o) => s + (o.total || 0), 0);
    const cod_revenue = allOrders.filter((o) => o.payment_method === "cod").reduce((s, o) => s + (o.total || 0), 0);

    // Commission from order_sellers
    const { data: subOrders } = await supabase
      .from("order_sellers")
      .select("commission_amount, orders!inner(created_at, status)")
      .gte("orders.created_at", startDate.toISOString());

    const total_commission = (subOrders || []).reduce((s, so) => s + (so.commission_amount || 0), 0);
    const net_profit = total_commission + total_delivery_fees - total_refunds;

    // Daily revenue
    const dailyMap: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = { revenue: 0, orders: 0 };
    }

    allOrders.forEach((o) => {
      const key = o.created_at.split("T")[0];
      if (dailyMap[key]) {
        dailyMap[key].revenue += o.total || 0;
        dailyMap[key].orders += 1;
      }
    });

    const daily = Object.entries(dailyMap).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));

    return NextResponse.json({
      stats: {
        total_revenue,
        total_commission,
        total_delivery_fees,
        total_refunds,
        net_profit,
        total_orders: allOrders.length,
        upi_revenue,
        cod_revenue,
      },
      daily,
    });
  } catch (error) {
    console.error("Revenue API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
