import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/webhooks/razorpay
 * Handles Razorpay webhooks for payment events.
 * Verifies webhook signature to ensure authenticity.
 */
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Webhook signature mismatch");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const supabase = await createClient();

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;

        // Update order payment status
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            razorpay_payment_id: payment.id,
          })
          .eq("razorpay_order_id", razorpayOrderId);

        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;

        await supabase
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("razorpay_order_id", razorpayOrderId);

        break;
      }

      case "refund.processed": {
        const refund = event.payload.refund.entity;
        const paymentId = refund.payment_id;

        // Find the order by payment ID and update
        const { data: order } = await supabase
          .from("orders")
          .select("id, total")
          .eq("razorpay_payment_id", paymentId)
          .single();

        if (order) {
          const isFullRefund = refund.amount >= order.total * 100;
          await supabase
            .from("orders")
            .update({
              payment_status: isFullRefund ? "refunded" : "partially_refunded",
            })
            .eq("id", order.id);
        }

        break;
      }

      default:
        // Acknowledge unhandled events
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
