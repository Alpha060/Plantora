import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim().replace(/^['"`\s]+|['"`\s]+$/g, "");

  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  return null;
}

export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(numericAmount || 0);
}
