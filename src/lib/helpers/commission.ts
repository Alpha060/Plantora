import { DEFAULT_COMMISSION_RATE } from "@/lib/constants";

interface CommissionResult {
  commission_rate: number;
  commission_amount: number;
  seller_amount: number;
}

// Calculate commission for a sub-order
export function calculateCommission(
  subtotal: number,
  customRate?: number | null
): CommissionResult {
  const rate = customRate ?? DEFAULT_COMMISSION_RATE;
  const commission_amount = Math.round((subtotal * rate) / 100 * 100) / 100;
  const seller_amount = Math.round((subtotal - commission_amount) * 100) / 100;

  return {
    commission_rate: rate,
    commission_amount,
    seller_amount,
  };
}
