import crypto from "crypto";

/**
 * Verify Razorpay payment signature to ensure payment authenticity.
 * Uses HMAC SHA256 with the key secret.
 */
export function verifyPaymentSignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET not configured");
  }

  const body = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  return expectedSignature === params.razorpay_signature;
}

/**
 * Convert INR amount to paise for Razorpay (which uses smallest currency unit)
 */
export function toPaise(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert paise back to INR
 */
export function fromPaise(paise: number): number {
  return paise / 100;
}
