"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="bg-surface-lowest rounded-3xl shadow-ambient p-8 sm:p-12 max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-botanical-gradient opacity-10 animate-ping" />
          <div className="relative h-20 w-20 rounded-full bg-botanical-gradient flex items-center justify-center shadow-ambient-sm">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
        </div>

        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Order Placed! 🎉
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            Your order has been placed successfully. We&apos;ll send you updates via SMS.
          </p>
        </div>

        {/* Order Number */}
        {orderNumber && (
          <div className="bg-surface-low rounded-xl px-5 py-3 inline-block">
            <p className="text-xs text-on-surface-variant mb-0.5">Order Number</p>
            <p className="font-mono font-semibold text-on-surface tracking-wider">
              {orderNumber}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Link href="/account/orders" className="block">
            <button className="w-full h-12 rounded-full bg-botanical-gradient text-white font-medium text-sm flex items-center justify-center gap-2 shadow-ambient-sm hover:shadow-ambient transition-shadow">
              <Package className="h-4 w-4" />
              View My Orders
            </button>
          </Link>
          <Link href="/shop" className="block">
            <button className="w-full h-12 rounded-full ghost-border text-sm font-medium text-on-surface flex items-center justify-center gap-2 hover:bg-surface-low transition-colors">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
