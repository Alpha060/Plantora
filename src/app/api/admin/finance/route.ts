import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/finance — Revenue overview + settlement summary
 */
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    // Revenue from orders
    const { data: orders } = await supabase
      .from("orders")
      .select("total, payment_method, status, created_at");

    let totalRevenue = 0, upiRevenue = 0, codRevenue = 0, totalRefunds = 0;
    const monthlyRevenue: Record<string, number> = {};

    if (orders) {
      for (const o of orders) {
        const amt = Number(o.total);
        if (["refunded"].includes(o.status)) { totalRefunds += amt; continue; }
        if (["cancelled", "returned"].includes(o.status)) continue;
        totalRevenue += amt;
        if (o.payment_method === "upi") upiRevenue += amt;
        else codRevenue += amt;

        const month = o.created_at.substring(0, 7);
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + amt;
      }
    }

    // Commission
    const { data: orderSellers } = await supabase
      .from("order_sellers")
      .select("commission_amount, status");

    let totalCommission = 0;
    if (orderSellers) {
      for (const os of orderSellers) {
        if (os.status !== "cancelled") totalCommission += Number(os.commission_amount);
      }
    }

    // Settlements
    const { data: settlements } = await supabase
      .from("seller_settlements")
      .select("net_amount, status");

    let totalSettled = 0, pendingSettlements = 0;
    if (settlements) {
      for (const s of settlements) {
        if (s.status === "paid") totalSettled += Number(s.net_amount);
        else pendingSettlements += Number(s.net_amount);
      }
    }

    // Chart data (last 6 months)
    const chartData: Array<{ month: string; revenue: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      chartData.push({ month: label, revenue: monthlyRevenue[key] || 0 });
    }

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalCommission,
        upiRevenue,
        codRevenue,
        totalRefunds,
        totalSettled,
        pendingSettlements,
        netProfit: totalCommission - totalRefunds,
      },
      chartData,
    });
  } catch (err) {
    console.error("Admin Finance API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
