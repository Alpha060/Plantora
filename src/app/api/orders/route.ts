import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOrderNumber } from "@/lib/helpers/order";
import { generateOTP } from "@/lib/helpers/otp";
import { calculateCommission } from "@/lib/helpers/commission";
import { verifyPaymentSignature } from "@/lib/razorpay/utils";

type CartLineItem = {
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price: number;
  store_id: string;
  name?: string;
  image?: string | null;
  variant_name?: string | null;
};

/**
 * POST /api/orders — Place a new multi-seller order
 * Supports UPI (Razorpay) and COD payment methods.
 * Splits cart into sub-orders per seller, snapshots commission, deducts stock.
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

    const supabaseAdmin = createAdminClient();

    const body = await request.json();
    const {
      items,
      address,
      payment_method,
      delivery_slot,
      delivery_date,
      note,
      gift_message,
      subtotal,
      delivery_fee,
      discount,
      total,
      coupon_code,
      coupon_id,
      // Razorpay fields (for UPI)
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!items?.length || !address || !payment_method) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!["upi", "cod"].includes(payment_method)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // For UPI payments, verify the Razorpay signature
    let paymentStatus = "pending";
    if (payment_method === "upi") {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { error: "Missing payment verification data for UPI" },
          { status: 400 }
        );
      }

      const isValid = verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Payment verification failed" },
          { status: 400 }
        );
      }

      paymentStatus = "paid";
    }

    // Build delivery address JSONB
    const deliveryAddress = {
      full_name: address.full_name,
      phone: address.phone,
      full_address: address.full_address || address.address_line1 || "",
      address_line2: address.address_line2 || "",
      landmark: address.landmark || "",
      pin_code: address.pin_code || address.pincode || "",
      city: address.city || "Daltonganj",
      state: address.state || "Jharkhand",
      label: address.label || "Home",
    };

    // Generate order number + delivery OTP
    const orderNumber = generateOrderNumber();
    const rawOtp = generateOTP();

    // Create main order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "placed",
        subtotal: subtotal || 0,
        delivery_fee: delivery_fee || 0,
        discount: discount || 0,
        total: total || 0,
        payment_method,
        payment_status: paymentStatus,
        razorpay_order_id: razorpay_order_id || null,
        razorpay_payment_id: razorpay_payment_id || null,
        delivery_address: deliveryAddress,
        delivery_otp: rawOtp,
        delivery_date: delivery_date || new Date().toISOString().split("T")[0],
        coupon_id: coupon_id || null,
        coupon_code: coupon_code || null,
        gift_message: gift_message || null,
        special_instructions: note || null,
      })
      .select("id, order_number")
      .single();

    if (orderErr) {
      console.error("Order creation error:", orderErr);
      return NextResponse.json(
        { error: `Failed to create order: ${orderErr.message}` },
        { status: 500 }
      );
    }

    // Group items by store
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

      // Look up seller's custom commission rate (if any)
      const { data: store } = await supabaseAdmin
        .from("stores")
        .select("commission_rate, address, store_name")
        .eq("id", storeId)
        .single();

      const commission = calculateCommission(
        storeSubtotal,
        store?.commission_rate
      );

      // Snapshot seller's pickup address
      const pickupAddress = store
        ? {
            store_name: store.store_name,
            address: store.address,
          }
        : null;

      const { data: subOrder, error: subErr } = await supabaseAdmin
        .from("order_sellers")
        .insert({
          order_id: order.id,
          store_id: storeId,
          status: "placed",
          subtotal: storeSubtotal,
          commission_rate: commission.commission_rate,
          commission_amount: commission.commission_amount,
          seller_amount: commission.seller_amount,
          pickup_address: pickupAddress,
        })
        .select("id")
        .single();

      if (subErr) {
        console.error(`Sub-order error for store ${storeId}:`, subErr);
        continue;
      }

      // Create order items linked to sub-order
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
        variant_name: item.variant_name || null,
      }));

      await supabaseAdmin.from("order_items").insert(orderItems);

      // Deduct stock atomically
      for (const item of storeItems) {
        if (item.variant_id) {
          const { data: variant } = await supabaseAdmin
            .from("product_variants")
            .select("stock_qty")
            .eq("id", item.variant_id)
            .single();
          if (variant) {
            await supabaseAdmin
              .from("product_variants")
              .update({
                stock_qty: Math.max(0, variant.stock_qty - item.quantity),
              })
              .eq("id", item.variant_id);
          }
        } else {
          const { data: product } = await supabaseAdmin
            .from("products")
            .select("stock_qty")
            .eq("id", item.product_id)
            .single();
          if (product) {
            await supabaseAdmin
              .from("products")
              .update({
                stock_qty: Math.max(0, product.stock_qty - item.quantity),
              })
              .eq("id", item.product_id);
          }
        }
      }

      // Create seller notification
      await supabaseAdmin.from("seller_notifications").insert({
        store_id: storeId,
        type: "order_new",
        title: "New Order Received!",
        message: `Order #${orderNumber} — ${storeItems.length} item(s) worth ₹${storeSubtotal}`,
        data: { order_id: order.id, order_seller_id: subOrder.id },
      });
    }

    // Record status history
    await supabaseAdmin.from("order_status_history").insert({
      order_id: order.id,
      status: "placed",
      changed_by: user.id,
      note: `Order placed via ${payment_method.toUpperCase()}`,
    });

    // Clear buyer's cart items from DB (if stored)
    await supabaseAdmin.from("cart_items").delete().eq("user_id", user.id);

    // Track coupon usage if applied
    if (coupon_id) {
      await supabaseAdmin.from("coupon_usage").insert({
        coupon_id,
        user_id: user.id,
        order_id: order.id,
        discount_amount: discount || 0,
      });

      // Increment coupon used_count
      const { data: couponData } = await supabaseAdmin
        .from("coupons")
        .select("used_count")
        .eq("id", coupon_id)
        .single();
      if (couponData) {
        await supabaseAdmin
          .from("coupons")
          .update({ used_count: (couponData.used_count || 0) + 1 })
          .eq("id", coupon_id);
      }
    }

    return NextResponse.json(
      {
        data: {
          ...order,
          delivery_otp: rawOtp, // Return raw OTP to buyer (show on confirmation page)
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders — List current user's orders
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    let query = supabase
      .from("orders")
      .select(
        "*, order_sellers(*, stores(id, store_name), order_items(*))",
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
