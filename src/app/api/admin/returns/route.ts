import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/returns — All returns for review
 */
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: returns, error } = await supabase
      .from("returns")
      .select(`
        id,
        return_number,
        reason,
        description,
        photos,
        status,
        resolution_type,
        refund_amount,
        admin_notes,
        created_at,
        orders(order_number, total),
        users!returns_user_id_fkey(full_name, phone)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin returns error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const formatted = (returns || []).map((r) => {
      const orderData = r.orders as { order_number: string; total: number } | null;
      const customerData = r.users as { full_name: string; phone: string } | null;
      return {
        id: r.id,
        return_number: r.return_number,
        reason: r.reason,
        description: r.description,
        photos: r.photos,
        status: r.status,
        resolution_type: r.resolution_type,
        refund_amount: r.refund_amount ? Number(r.refund_amount) : null,
        admin_notes: r.admin_notes,
        order_number: orderData?.order_number || "N/A",
        order_total: orderData ? Number(orderData.total) : 0,
        customer_name: customerData?.full_name || "Unknown",
        customer_phone: customerData?.phone || "",
        date: r.created_at,
      };
    });

    return NextResponse.json({ returns: formatted });
  } catch (err) {
    console.error("Admin Returns API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
