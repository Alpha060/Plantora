import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/finance/settlements — All settlements with store info
 */
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: settlements, error } = await supabase
      .from("seller_settlements")
      .select("*, stores(store_name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Settlements error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const formatted = (settlements || []).map((s) => {
      const storeData = s.stores as { store_name: string } | null;
      return {
        id: s.id,
        settlement_number: s.settlement_number,
        period_start: s.period_start,
        period_end: s.period_end,
        total_orders: s.total_orders,
        total_delivered: s.total_delivered,
        gross_sales: Number(s.gross_sales),
        total_commission: Number(s.total_commission),
        net_amount: Number(s.net_amount),
        status: s.status,
        store_name: storeData?.store_name || "Unknown",
        paid_at: s.paid_at,
        created_at: s.created_at,
      };
    });

    return NextResponse.json({ settlements: formatted });
  } catch (err) {
    console.error("Admin Settlements API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
