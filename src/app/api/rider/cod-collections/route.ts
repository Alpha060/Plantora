import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: rider } = await supabase.from("riders").select("id").eq("user_id", user.id).single();
    if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

    const { data: collections, error } = await supabase
      .from("cod_collections")
      .select("id, amount, status, collected_at, deposited_at, deposit_method, created_at, orders(order_number)")
      .eq("rider_id", rider.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("COD collections error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const formatted = (collections || []).map((c) => {
      const orderData = c.orders as { order_number: string } | null;
      return {
        id: c.id,
        amount: Number(c.amount),
        status: c.status,
        collected_at: c.collected_at,
        deposited_at: c.deposited_at,
        deposit_method: c.deposit_method,
        order_number: orderData?.order_number || "N/A",
        created_at: c.created_at,
      };
    });

    return NextResponse.json({ collections: formatted });
  } catch (err) {
    console.error("Rider COD API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
