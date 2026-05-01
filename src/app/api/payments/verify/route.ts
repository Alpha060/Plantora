import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPaymentSignature } from "@/lib/razorpay/utils";

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature after successful payment.
 * Called from the client after Razorpay checkout popup success callback.
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
        { status: 400 }
      );
    }

    // Verify the signature
    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        data: {
          verified: true,
          razorpay_order_id,
          razorpay_payment_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
