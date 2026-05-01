import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SellerOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: store } = await supabase.from("stores").select("id").eq("user_id", user.id).single();
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    // Fetch the main order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Fetch items belonging specifically to this seller
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .eq("order_seller_id", store.id);

    if (itemsError || !items || items.length === 0) {
      return NextResponse.json({ error: "No items found for your store in this order." }, { status: 403 });
    }

    return NextResponse.json({ order, items });

  } catch (error: unknown) {
    console.error("Order GET Error:", getErrorMessage(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: store } = await supabase.from("stores").select("id").eq("user_id", user.id).single();
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    // Verify they actually own items in this order
    const { data: items } = await supabase
      .from("order_items")
      .select("id")
      .eq("order_id", orderId)
      .eq("order_seller_id", store.id)
      .limit(1);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    const { status } = payload as { status?: unknown };

    if (
      typeof status !== "string" ||
      ![
        "pending",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ].includes(status)
    ) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    // Update the main order status
    // Note: In a multi-vendor cart, updating orders.status updates it for ALL sellers.
    // Given the current simple schema, applying it to orders is the correct path.
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: status as SellerOrderStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });

  } catch (error: unknown) {
    console.error("Order PUT Error:", getErrorMessage(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
