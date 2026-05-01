import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/dashboard
 * Returns platform-wide metrics for the admin dashboard
 * Optimized: all independent queries run in parallel via Promise.all
 */
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    // Run ALL independent queries in parallel
    const [
      ordersResult,
      orderSellersResult,
      buyersResult,
      sellersResult,
      pendingSellersResult,
      ridersResult,
      pendingRidersResult,
      productsResult,
      landscapeResult,
      pendingLandscapeResult,
      recentOrdersResult,
    ] = await Promise.all([
      supabase.from("orders").select("id, total, status, payment_method, created_at"),
      supabase.from("order_sellers").select("commission_amount, status"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "buyer"),
      supabase.from("stores").select("*", { count: "exact", head: true }),
      supabase.from("stores").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("riders").select("*", { count: "exact", head: true }),
      supabase.from("riders").select("*", { count: "exact", head: true }).eq("is_active", false),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("service_bookings").select("*", { count: "exact", head: true }),
      supabase.from("service_bookings").select("*", { count: "exact", head: true }).eq("status", "inquiry"),
      supabase.from("orders").select("id, order_number, total, status, payment_method, created_at, delivery_address").order("created_at", { ascending: false }).limit(10),
    ]);

    // Process orders
    const orders = ordersResult.data;
    let totalOrders = 0;
    let totalRevenue = 0;
    let todayOrders = 0;
    let todayRevenue = 0;
    let pendingOrders = 0;
    const statusCounts: Record<string, number> = {};
    const today = new Date().toISOString().split("T")[0];

    if (orders) {
      totalOrders = orders.length;
      for (const o of orders) {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        if (!["cancelled", "returned", "refunded"].includes(o.status)) {
          totalRevenue += Number(o.total);
        }
        if (["placed", "confirmed", "processing"].includes(o.status)) {
          pendingOrders++;
        }
        const orderDate = o.created_at.split("T")[0];
        if (orderDate === today) {
          todayOrders++;
          if (!["cancelled", "returned", "refunded"].includes(o.status)) {
            todayRevenue += Number(o.total);
          }
        }
      }
    }

    // Process commission
    let totalCommission = 0;
    if (orderSellersResult.data) {
      for (const os of orderSellersResult.data) {
        if (os.status !== "cancelled") {
          totalCommission += Number(os.commission_amount);
        }
      }
    }

    // Revenue chart (last 7 days) — computed from already-fetched orders
    const chartData: Array<{ date: string; revenue: number; orders: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const displayDate = d.toLocaleDateString("en-US", { weekday: "short" });

      let dayRevenue = 0;
      let dayOrders = 0;
      if (orders) {
        for (const o of orders) {
          if (o.created_at.split("T")[0] === dateStr && !["cancelled", "returned", "refunded"].includes(o.status)) {
            dayRevenue += Number(o.total);
            dayOrders++;
          }
        }
      }
      chartData.push({ date: displayDate, revenue: dayRevenue, orders: dayOrders });
    }

    return NextResponse.json({
      metrics: {
        totalOrders,
        totalRevenue,
        totalCommission,
        todayOrders,
        todayRevenue,
        pendingOrders,
        totalBuyers: buyersResult.count || 0,
        totalSellers: sellersResult.count || 0,
        pendingSellers: pendingSellersResult.count || 0,
        totalRiders: ridersResult.count || 0,
        pendingRiders: pendingRidersResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalLandscapeBookings: landscapeResult.count || 0,
        pendingLandscapeBookings: pendingLandscapeResult.count || 0,
      },
      statusCounts,
      chartData,
      recentOrders: (recentOrdersResult.data || []).map((o) => ({
        id: o.id,
        order_number: o.order_number,
        total: Number(o.total),
        status: o.status,
        payment_method: o.payment_method,
        customer_name: (o.delivery_address as Record<string, string>)?.fullName || "N/A",
        date: o.created_at,
      })),
    });
  } catch (err) {
    console.error("Admin Dashboard API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
