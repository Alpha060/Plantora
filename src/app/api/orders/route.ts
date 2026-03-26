import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/orders — Place a new order
 * Splits into sub-orders per seller, deducts stock
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, address, payment_method, delivery_slot, note, subtotal, delivery_fee, total } = body;

    if (!items?.length || !address || !payment_method) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Build delivery address JSON blob
    const deliveryAddress = {
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || "",
    };

    // Generate order number + 6-digit delivery OTP
    const orderNumber = `PLT-${Date.now().toString(36).toUpperCase()}`;
    const deliveryOtp = String(Math.floor(100000 + Math.random() * 900000));

    // Create main order (delivery_address is a Json column)
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "placed",
        subtotal,
        delivery_fee,
        discount: 0,
        total,
        payment_method,
        payment_status: "pending",
        delivery_address: deliveryAddress,
        delivery_otp: deliveryOtp,
        delivery_date: new Date().toISOString().split("T")[0],
        special_instructions: note || null,
      })
      .select("id, order_number")
      .single();

    if (orderErr) {
      return NextResponse.json({ error: `Order error: ${orderErr.message}` }, { status: 500 });
    }

    // Group items by store
    type CartLineItem = { product_id: string; variant_id: string | null; quantity: number; price: number; store_id: string; name?: string; image?: string | null };
    const itemsByStore = new Map<string, CartLineItem[]>();
    for (const item of items as CartLineItem[]) {
      if (!itemsByStore.has(item.store_id)) {
        itemsByStore.set(item.store_id, []);
      }
      itemsByStore.get(item.store_id)!.push(item);
    }

    // Create sub-orders per store
    for (const [storeId, storeItems] of itemsByStore.entries()) {
      const storeSubtotal = storeItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );

      const commissionRate = 15;
      const commissionAmount = Math.round(storeSubtotal * (commissionRate / 100));
      const sellerAmount = storeSubtotal - commissionAmount;

      const { data: subOrder, error: subErr } = await supabase
        .from("order_sellers")
        .insert({
          order_id: order.id,
          store_id: storeId,
          status: "placed",
          subtotal: storeSubtotal,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          seller_amount: sellerAmount,
        })
        .select("id")
        .single();

      if (subErr) continue;

      // Create order items
      const orderItems = storeItems.map((item) => ({
        order_id: order.id,
        order_seller_id: subOrder.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        product_name: item.name || "Product",
        product_image: item.image || null,
      }));

      await supabase.from("order_items").insert(orderItems);

      // Deduct stock via direct update
      for (const item of storeItems) {
        if (item.variant_id) {
          const { data: variant } = await supabase
            .from("product_variants")
            .select("stock_qty")
            .eq("id", item.variant_id)
            .single();
          if (variant) {
            await supabase
              .from("product_variants")
              .update({ stock_qty: Math.max(0, variant.stock_qty - item.quantity) })
              .eq("id", item.variant_id);
          }
        } else {
          const { data: product } = await supabase
            .from("products")
            .select("stock_qty")
            .eq("id", item.product_id)
            .single();
          if (product) {
            await supabase
              .from("products")
              .update({ stock_qty: Math.max(0, product.stock_qty - item.quantity) })
              .eq("id", item.product_id);
          }
        }
      }
    }

    // Record status history
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "placed",
      changed_by: user.id,
      note: "Order placed by customer",
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/orders — List user's orders
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        "*, order_sellers(*, stores(id, store_name), order_items(*))"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
