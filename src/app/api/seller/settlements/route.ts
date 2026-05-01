import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/seller/settlements
 * Returns settlement history for the authenticated seller
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
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Get all settlements for this store
    const { data: settlements, error } = await supabase
      .from("seller_settlements")
      .select(`
        id,
        settlement_number,
        period_start,
        period_end,
        total_orders,
        total_delivered,
        total_returned,
        gross_sales,
        total_commission,
        total_returns_deduction,
        net_amount,
        status,
        payment_method,
        payment_reference,
        paid_at,
        created_at
      `)
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Settlements DB Error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Calculate summary
    let totalPaid = 0;
    let totalPending = 0;

    if (settlements) {
      for (const s of settlements) {
        if (s.status === "paid") {
          totalPaid += Number(s.net_amount);
        } else if (["calculated", "pending_approval", "approved", "processing"].includes(s.status)) {
          totalPending += Number(s.net_amount);
        }
      }
    }

    return NextResponse.json({
      summary: {
        totalPaid,
        totalPending,
        totalSettlements: settlements?.length || 0,
      },
      settlements: (settlements || []).map((s) => ({
        ...s,
        gross_sales: Number(s.gross_sales),
        total_commission: Number(s.total_commission),
        total_returns_deduction: Number(s.total_returns_deduction),
        net_amount: Number(s.net_amount),
      })),
    });
  } catch (err) {
    console.error("Settlements API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
