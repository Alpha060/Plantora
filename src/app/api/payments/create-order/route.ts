import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRazorpayInstance, getRazorpayKeyId } from "@/lib/razorpay/client";
import { toPaise } from "@/lib/razorpay/utils";

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for online payment.
 * Called BEFORE placing the actual order — buyer pays, then we create the order.
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
    const { amount, currency = "INR", receipt } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const razorpay = getRazorpayInstance();

    const orderOptions = {
      amount: toPaise(amount),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        user_id: user.id,
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    return NextResponse.json(
      {
        data: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key_id: getRazorpayKeyId(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
