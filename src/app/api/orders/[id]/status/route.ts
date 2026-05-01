import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_TRANSITIONS: Record<string, string[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["rider_assigned", "cancelled"],
  rider_assigned: ["picked_up", "cancelled"],
  picked_up: ["out_for_delivery"],
  out_for_delivery: ["delivered", "return_initiated"],
  return_initiated: ["returned"],
};

/**
 * PATCH /api/orders/[id]/status — Update order or sub-order status
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

    const body = await request.json();
    const { status, sub_order_id, rider_id, note, cancel_reason } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Sub-order status update
    if (sub_order_id) {
      const { data: subOrder } = await supabase
        .from("order_sellers")
        .select("id, status, order_id")
        .eq("id", sub_order_id)
        .single();

      if (!subOrder) return NextResponse.json({ error: "Sub-order not found" }, { status: 404 });

      // Validate transition
      const allowed = VALID_TRANSITIONS[subOrder.status];
      if (allowed && !allowed.includes(status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${subOrder.status} to ${status}` },
          { status: 400 }
        );
      }

      const updateData: Record<string, unknown> = { status };
      if (rider_id) updateData.rider_id = rider_id;

      await supabase
        .from("order_sellers")
        .update(updateData)
        .eq("id", sub_order_id);

      // Record status history
      await supabase.from("order_status_history").insert({
        order_id: subOrder.order_id,
        order_seller_id: sub_order_id,
        status,
        changed_by: user.id,
        note: note || cancel_reason || `Status updated to ${status}`,
      });

      // Auto-update master order status based on sub-orders
      await updateMasterOrderStatus(supabase, subOrder.order_id);

      return NextResponse.json({ data: { sub_order_id, status } });
    }

    // Master order status update (admin override)
    const { data: order } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", id)
      .single();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    await supabase.from("orders").update({ status }).eq("id", id);

    await supabase.from("order_status_history").insert({
      order_id: id,
      status,
      changed_by: user.id,
      note: note || cancel_reason || `Master order status set to ${status}`,
    });

    return NextResponse.json({ data: { order_id: id, status } });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function updateMasterOrderStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string
) {
  const { data: subOrders } = await supabase
    .from("order_sellers")
    .select("status")
    .eq("order_id", orderId);

  if (!subOrders || subOrders.length === 0) return;

  const statuses = subOrders.map((s) => s.status);
  let masterStatus = "processing";

  if (statuses.every((s) => s === "delivered")) {
    masterStatus = "delivered";
  } else if (statuses.every((s) => s === "cancelled")) {
    masterStatus = "cancelled";
  } else if (statuses.some((s) => s === "delivered") && statuses.some((s) => s !== "delivered")) {
    masterStatus = "partially_delivered";
  } else if (statuses.some((s) => s === "return_initiated" || s === "returned")) {
    masterStatus = "return_initiated";
  } else if (statuses.some((s) => s === "out_for_delivery")) {
    masterStatus = "out_for_delivery";
  } else if (statuses.every((s) => s === "packed" || s === "rider_assigned" || s === "picked_up")) {
    masterStatus = "processing";
  } else if (statuses.every((s) => s === "confirmed" || s === "packed")) {
    masterStatus = "confirmed";
  } else if (statuses.every((s) => s === "placed")) {
    masterStatus = "placed";
  }

  await supabase.from("orders").update({ status: masterStatus }).eq("id", orderId);
}
