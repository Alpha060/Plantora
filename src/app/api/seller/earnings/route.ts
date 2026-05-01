import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/seller/earnings
 * Returns earnings summary and per-order breakdown for the authenticated seller
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
      .select("id, commission_rate")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Get all sub-orders for this seller with their parent order info
    const { data: subOrders, error } = await supabase
      .from("order_sellers")
      .select(`
        id,
        order_id,
        subtotal,
        commission_rate,
        commission_amount,
        seller_amount,
        status,
        settlement_status,
        created_at,
        orders!inner(order_number, status, payment_method, created_at)
      `)
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Earnings DB Error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Calculate summary metrics
    let totalEarnings = 0;
    let totalCommission = 0;
    let totalOrders = 0;
    let pendingSettlement = 0;
    let thisMonthEarnings = 0;
    let thisWeekEarnings = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const orderBreakdown: Array<{
      id: string;
      order_number: string;
      order_status: string;
      payment_method: string;
      subtotal: number;
      commission_rate: number;
      commission_amount: number;
      seller_amount: number;
      settlement_status: string;
      date: string;
    }> = [];

    if (subOrders) {
      for (const sub of subOrders) {
        const orderData = sub.orders as {
          order_number: string;
          status: string;
          payment_method: string;
          created_at: string;
        };

        // Only count delivered/non-cancelled orders for earnings
        if (!["cancelled", "returned", "refunded"].includes(orderData.status)) {
          totalEarnings += Number(sub.seller_amount);
          totalCommission += Number(sub.commission_amount);
          totalOrders += 1;

          const orderDate = new Date(sub.created_at);
          if (orderDate >= startOfMonth) {
            thisMonthEarnings += Number(sub.seller_amount);
          }
          if (orderDate >= startOfWeek) {
            thisWeekEarnings += Number(sub.seller_amount);
          }
          if (sub.settlement_status === "pending") {
            pendingSettlement += Number(sub.seller_amount);
          }
        }

        orderBreakdown.push({
          id: sub.id,
          order_number: orderData.order_number,
          order_status: orderData.status,
          payment_method: orderData.payment_method,
          subtotal: Number(sub.subtotal),
          commission_rate: Number(sub.commission_rate),
          commission_amount: Number(sub.commission_amount),
          seller_amount: Number(sub.seller_amount),
          settlement_status: sub.settlement_status,
          date: sub.created_at,
        });
      }
    }

    return NextResponse.json({
      summary: {
        totalEarnings,
        totalCommission,
        totalOrders,
        pendingSettlement,
        thisMonthEarnings,
        thisWeekEarnings,
      },
      orders: orderBreakdown,
    });
  } catch (err) {
    console.error("Earnings API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
