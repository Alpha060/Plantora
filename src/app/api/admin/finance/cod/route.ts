import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/finance/cod — All COD collections
 */
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: collections, error } = await supabase
      .from("cod_collections")
      .select("*, riders(name, phone), orders(order_number)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("COD collections error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const formatted = (collections || []).map((c) => {
      const riderData = c.riders as { name: string; phone: string } | null;
      const orderData = c.orders as { order_number: string } | null;
      return {
        id: c.id,
        amount: Number(c.amount),
        status: c.status,
        collected_at: c.collected_at,
        deposited_at: c.deposited_at,
        deposit_method: c.deposit_method,
        deposit_reference: c.deposit_reference,
        discrepancy_amount: c.discrepancy_amount ? Number(c.discrepancy_amount) : null,
        discrepancy_note: c.discrepancy_note,
        rider_name: riderData?.name || "Unknown",
        rider_phone: riderData?.phone || "",
        order_number: orderData?.order_number || "N/A",
        created_at: c.created_at,
      };
    });

    return NextResponse.json({ collections: formatted });
  } catch (err) {
    console.error("Admin COD API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
