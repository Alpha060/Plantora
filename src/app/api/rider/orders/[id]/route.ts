import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: rider } = await supabase.from("riders").select("id").eq("user_id", user.id).single();
    if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

    const { data: orderSeller, error } = await supabase
      .from("order_sellers")
      .select("id, status, subtotal, created_at, updated_at, order_id, orders(order_number, delivery_address, total, payment_method), stores(store_name, address, phone)")
      .eq("id", id)
      .eq("rider_id", rider.id)
      .single();

    if (error || !orderSeller) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const orderData = orderSeller.orders as { order_number: string; delivery_address: Record<string, string>; total: number; payment_method: string } | null;
    const storeData = orderSeller.stores as { store_name: string; address: string; phone: string } | null;

    // Fetch order items
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit_price")
      .eq("order_seller_id", orderSeller.id);

    return NextResponse.json({
      order: {
        id: orderSeller.id,
        status: orderSeller.status,
        subtotal: Number(orderSeller.subtotal),
        order_number: orderData?.order_number || "N/A",
        delivery_address: orderData?.delivery_address || {},
        order_total: orderData ? Number(orderData.total) : 0,
        payment_method: orderData?.payment_method || "upi",
        store_name: storeData?.store_name || "Unknown",
        store_address: storeData?.address || "",
        store_phone: storeData?.phone || "",
        items: (items || []).map((i) => ({
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: Number(i.unit_price),
        })),
        created_at: orderSeller.created_at,
        updated_at: orderSeller.updated_at,
      },
    });
  } catch (err) {
    console.error("Rider Order Detail API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
