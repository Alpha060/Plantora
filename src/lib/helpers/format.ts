import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";

// Format price in INR
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Calculate discount percentage
export function calcDiscountPercent(price: number, salePrice: number): number {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, "h:mm a")}`;
  return format(date, "dd MMM yyyy, h:mm a");
}

// Format date short (no time)
export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), "dd MMM yyyy");
}

// Relative time (e.g., "2 hours ago")
export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

// Format phone number
export function formatPhone(phone: string): string {
  if (phone.length === 10) {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Get status badge color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    placed: "bg-blue-100 text-blue-800",
    confirmed: "bg-indigo-100 text-indigo-800",
    processing: "bg-yellow-100 text-yellow-800",
    packed: "bg-purple-100 text-purple-800",
    rider_assigned: "bg-cyan-100 text-cyan-800",
    picked_up: "bg-teal-100 text-teal-800",
    out_for_delivery: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    return_initiated: "bg-rose-100 text-rose-800",
    returned: "bg-gray-100 text-gray-800",
    refunded: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

// Format status label
export function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// Get effective price (sale or regular)
export function getEffectivePrice(price: number, salePrice?: number | null): number {
  return salePrice && salePrice < price ? salePrice : price;
}
