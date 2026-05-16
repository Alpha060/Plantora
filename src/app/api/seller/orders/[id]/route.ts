import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type SellerOrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "rider_assigned"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_initiated"
  | "returned"
  | "refunded";

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

    const supabaseAdmin = createAdminClient();

    // Fetch the main order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Fetch items belonging specifically to this seller
    const { data: orderSeller } = await supabaseAdmin
      .from("order_sellers")
      .select("id, status")
      .eq("order_id", orderId)
      .eq("store_id", store.id)
      .single();

    if (!orderSeller) {
      return NextResponse.json({ error: "No items found for your store in this order." }, { status: 403 });
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_seller_id", orderSeller.id);

    if (itemsError || !items || items.length === 0) {
      return NextResponse.json({ error: "No items found for your store in this order." }, { status: 403 });
    }

    // Override the global order status with the seller's specific sub-order status
    const orderWithSellerStatus = {
      ...order,
      status: orderSeller.status
    };

    return NextResponse.json({ order: orderWithSellerStatus, items }, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });

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

    const supabaseAdmin = createAdminClient();

    // Verify they actually own items in this order
    const { data: orderSeller } = await supabaseAdmin
      .from("order_sellers")
      .select("id")
      .eq("order_id", orderId)
      .eq("store_id", store.id)
      .single();

    if (!orderSeller) {
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
        "placed",
        "confirmed",
        "packed",
        "rider_assigned",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "return_initiated",
        "returned",
        "refunded"
      ].includes(status)
    ) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    // Update the seller's specific sub-order status
    const { error: updateError } = await supabaseAdmin
      .from("order_sellers")
      .update({
        status: status as SellerOrderStatus,
        updated_at: new Date().toISOString()
      })
      .eq("order_id", orderId)
      .eq("store_id", store.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });

  } catch (error: unknown) {
    console.error("Order PUT Error:", getErrorMessage(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
