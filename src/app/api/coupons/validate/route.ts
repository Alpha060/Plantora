import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/coupons/validate
 * Validates a coupon code at checkout and returns the discount.
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
    const { code, order_total } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    // Find the coupon
    const { data: coupon, error: couponErr } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (couponErr || !coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    const now = new Date();

    // Check validity dates
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ error: "This coupon is not yet active" }, { status: 400 });
    }
    if (coupon.valid_to && new Date(coupon.valid_to) < now) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    // Check global usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    // Check per-user usage limit
    if (coupon.per_user_limit) {
      const { count } = await supabase
        .from("coupon_usage")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", coupon.id)
        .eq("user_id", user.id);

      if (count !== null && count >= coupon.per_user_limit) {
        return NextResponse.json(
          { error: "You have already used this coupon" },
          { status: 400 }
        );
      }
    }

    // Check minimum order amount
    if (coupon.min_order_amount && order_total < coupon.min_order_amount) {
      return NextResponse.json(
        {
          error: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.round((order_total * coupon.value) / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      // fixed
      discountAmount = coupon.value;
    }

    // Discount cannot exceed order total
    discountAmount = Math.min(discountAmount, order_total);

    return NextResponse.json(
      {
        data: {
          coupon_id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount_amount: discountAmount,
          message: `Coupon applied! You save ₹${discountAmount}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
