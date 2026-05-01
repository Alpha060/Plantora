import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/settlements/[id] — Update settlement status (admin)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userData?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.status) updateData.status = body.status;
    if (body.payment_method) updateData.payment_method = body.payment_method;
    if (body.payment_reference) updateData.payment_reference = body.payment_reference;
    if (body.paid_at) updateData.paid_at = body.paid_at;

    const { data, error } = await supabase
      .from("seller_settlements")
      .update(updateData)
      .eq("id", id)
      .select("id, settlement_number, status")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // If marked as paid, notify seller
    if (body.status === "paid") {
      const { data: settlement } = await supabase
        .from("seller_settlements")
        .select("store_id, net_amount, settlement_number")
        .eq("id", id)
        .single();

      if (settlement) {
        await supabase.from("seller_notifications").insert({
          store_id: settlement.store_id,
          type: "settlement_paid",
          title: "Settlement Paid!",
          message: `Settlement ${settlement.settlement_number} — ₹${settlement.net_amount} has been paid to your account.`,
          data: { settlement_id: id },
        });
      }
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Settlement update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
