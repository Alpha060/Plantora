import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/orders
 * Returns all orders for admin with filtering by status
 */
export async function GET(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = 20;
    const offset = (page - 1) * perPage;

    let query = supabase
      .from("orders")
      .select(
        "id, order_number, total, status, payment_method, payment_status, delivery_address, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error("Admin orders error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const formattedOrders = (orders || []).map((o) => {
      const addr = o.delivery_address as Record<string, string> | null;
      return {
        id: o.id,
        order_number: o.order_number,
        total: Number(o.total),
        status: o.status,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        customer_name: addr?.fullName || "N/A",
        customer_phone: addr?.phone || "",
        city: addr?.city || "",
        date: o.created_at,
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
      total: count || 0,
      page,
      perPage,
    });
  } catch (err) {
    console.error("Admin Orders API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
