import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/rider/earnings — Rider's earnings history
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: rider } = await supabase.from("riders").select("id").eq("user_id", user.id).single();
    if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

    const { data: earnings, error } = await supabase
      .from("rider_earnings")
      .select("id, amount, type, status, created_at, orders(order_number)")
      .eq("rider_id", rider.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Rider earnings error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    let totalEarned = 0, totalPending = 0, totalPaid = 0;
    const formatted = (earnings || []).map((e) => {
      const amt = Number(e.amount);
      const orderData = e.orders as { order_number: string } | null;
      if (e.type !== "penalty") {
        totalEarned += amt;
        if (e.status === "paid") totalPaid += amt;
        else totalPending += amt;
      }
      return {
        id: e.id,
        amount: amt,
        type: e.type,
        status: e.status,
        order_number: orderData?.order_number || null,
        date: e.created_at,
      };
    });

    return NextResponse.json({
      earnings: formatted,
      summary: { totalEarned, totalPending, totalPaid },
    });
  } catch (err) {
    console.error("Rider Earnings API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
