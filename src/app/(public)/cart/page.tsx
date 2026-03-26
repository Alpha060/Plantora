"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/helpers/format";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemsByStore, clearCart } = useCartStore();
  const storeGroups = itemsByStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Breadcrumbs items={[{ label: "Cart" }]} />
          <div className="mt-12">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Browse our collection and add some beautiful plants to your cart!"
              actionLabel="Explore Collection"
              onAction={() => window.location.href = "/shop"}
            />
          </div>
        </div>
      </div>
    );
  }

  const deliveryFee = subtotal() >= 500 ? 0 : 49;
  const total = subtotal() + deliveryFee;

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Breadcrumbs items={[{ label: "Cart" }]} />

        <div className="flex items-end justify-between mt-6 mb-8">
          <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight">Your Cart</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 transition-colors">
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {Array.from(storeGroups.entries()).map(([storeId, { storeName, items: storeItems }]) => (
              <div key={storeId} className="bg-surface-lowest rounded-2xl shadow-ambient-sm overflow-hidden">
                <div className="px-5 py-3 bg-surface-low">
                  <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                    Sold by: {storeName}
                  </p>
                </div>
                <div className="divide-y divide-[rgba(188,202,192,0.15)]">
                  {storeItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 sm:p-5">
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-surface-low shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-on-surface-variant/30">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product_id}`} className="font-medium text-sm text-on-surface hover:text-botanical transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        <p className="text-botanical font-semibold mt-1.5 text-sm">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <QuantitySelector value={item.quantity} onChange={(qty) => updateQuantity(item.id, qty)} size="sm" />
                        <button onClick={() => removeItem(item.id)} className="h-8 w-8 rounded-full bg-surface-high flex items-center justify-center hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-24 bg-surface-lowest rounded-2xl shadow-ambient p-6 space-y-5">
              <h3 className="font-heading font-semibold text-on-surface text-lg">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Subtotal ({items.length} items)</span>
                  <span className="font-medium text-on-surface">{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Delivery</span>
                  <span className={`font-medium ${deliveryFee === 0 ? "text-botanical" : "text-on-surface"}`}>
                    {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-on-surface-variant">Free delivery on orders above ₹500</p>
                )}
              </div>

              <div className="h-px bg-surface-high" />

              <div className="flex justify-between font-semibold text-lg">
                <span className="text-on-surface">Total</span>
                <span className="text-botanical">{formatPrice(total)}</span>
              </div>

              {/* Coupon */}
              <div className="flex gap-2">
                <Input placeholder="Coupon code" className="h-10 text-sm bg-surface-high border-0 rounded-full px-4" />
                <button className="h-10 px-4 rounded-full ghost-border text-sm font-medium text-botanical hover:bg-surface-low transition-colors shrink-0">
                  <Tag className="h-3.5 w-3.5 inline mr-1" />Apply
                </button>
              </div>

              <Link href="/checkout" className="block">
                <button className="w-full h-12 rounded-full bg-botanical-gradient text-white font-medium text-sm flex items-center justify-center gap-2 shadow-ambient-sm hover:shadow-ambient transition-shadow">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
