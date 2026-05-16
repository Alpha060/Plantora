"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Package, MapPin, Phone, Copy, Shield, Truck, Store,
  CheckCircle2, Clock, Loader2, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { formatPrice, formatDate, formatStatus, getStatusColor } from "@/lib/helpers/format";
import { createClient } from "@/lib/supabase/client";

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  delivery_address: {
    full_name: string;
    phone: string;
    full_address: string;
    landmark?: string;
    pin_code: string;
    city: string;
    state: string;
  };
  delivery_otp: string;
  delivery_date: string;
  gift_message: string | null;
  special_instructions: string | null;
  created_at: string;
  order_sellers: {
    id: string;
    status: string;
    subtotal: number;
    commission_rate: number;
    seller_amount: number;
    stores: { id: string; store_name: string } | null;
    rider: { id: string; name: string; phone: string } | null;
    order_items: {
      id: string;
      product_name: string;
      product_image: string | null;
      variant_name: string | null;
      quantity: number;
      unit_price: number;
      total_price: number;
      is_reviewed: boolean;
    }[];
  }[];
}

const STATUS_STEPS = [
  { key: "placed", label: "Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "packed", label: "Packed", icon: Store },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();

    const supabase = createClient();
    const channel = supabase
      .channel(`order_${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        () => fetchOrder()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "order_sellers", filter: `order_id=eq.${orderId}` },
        () => fetchOrder()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (res.ok) setOrder(json.data);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  const copyOtp = async (otp: string) => {
    try {
      await navigator.clipboard.writeText(otp);
      toast.success("OTP copied!");
    } catch { /* empty */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-botanical" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-on-surface-variant">Order not found</p>
          <Link href="/account/orders" className="inline-block px-6 py-2.5 rounded-full bg-botanical-gradient text-white text-sm font-medium">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Get the highest sub-order status for timeline
  const getStatusIndex = (status: string) => STATUS_STEPS.findIndex((s) => s.key === status);
  
  let overallStatusIdx = -1;
  if (order.status === "cancelled") {
    overallStatusIdx = -1;
  } else if (order.status === "delivered") {
    overallStatusIdx = 4;
  } else if (order.order_sellers && order.order_sellers.length > 0) {
    overallStatusIdx = Math.max(...order.order_sellers.map(s => getStatusIndex(s.status)));
  } else {
    overallStatusIdx = getStatusIndex(order.status);
  }

  const addr = order.delivery_address;

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: "Orders", href: "/account/orders" }, { label: order.order_number }]} />

        <div className="flex items-center gap-3 mt-6 mb-6">
          <Link href="/account/orders" className="p-2 rounded-full hover:bg-surface-low transition-colors">
            <ArrowLeft className="h-5 w-5 text-on-surface-variant" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-on-surface">{order.order_number}</h1>
            <p className="text-xs text-on-surface-variant">{formatDate(order.created_at)}</p>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
            {formatStatus(order.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {/* Status Timeline */}
            {order.status !== "cancelled" && (
              <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6">
                <h3 className="font-heading font-semibold text-on-surface mb-5">Order Progress</h3>
                <div className="flex items-center justify-between relative">
                  {/* Line */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-surface-high" />
                  <div className="absolute top-4 left-6 h-0.5 bg-botanical transition-all" style={{ width: `${Math.max(0, overallStatusIdx) * 25}%` }} />

                  {STATUS_STEPS.map((step, idx) => {
                    const done = idx <= overallStatusIdx;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${done ? "bg-botanical-gradient text-white shadow-ambient-sm" : "bg-surface-high text-on-surface-variant/40"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`text-[10px] mt-2 font-medium ${done ? "text-botanical" : "text-on-surface-variant/50"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-orders */}
            {order.order_sellers.map((subOrder, idx) => (
              <div key={subOrder.id} className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-sm font-medium text-on-surface">
                      {subOrder.stores?.store_name || "Seller"}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(subOrder.status)}`}>
                    {formatStatus(subOrder.status)}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {subOrder.order_items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-14 w-14 rounded-xl bg-surface-low overflow-hidden shrink-0">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center"><Package className="h-5 w-5 text-on-surface-variant/30" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">{item.product_name}</p>
                        {item.variant_name && <p className="text-xs text-on-surface-variant">{item.variant_name}</p>}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-on-surface-variant">Qty: {item.quantity}</span>
                          <span className="text-sm font-medium text-on-surface">{formatPrice(item.total_price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rider info */}
                {subOrder.rider && (subOrder.status === "out_for_delivery" || subOrder.status === "picked_up") && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center gap-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{subOrder.rider.name}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Your delivery rider</p>
                    </div>
                    <a href={`tel:${subOrder.rider.phone}`} className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Delivery OTP */}
            {order.delivery_otp && order.status !== "delivered" && order.status !== "cancelled" && (
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-5 text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Delivery OTP</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <p className="font-mono text-2xl font-bold tracking-[0.3em] text-amber-800 dark:text-amber-300">
                    {order.delivery_otp}
                  </p>
                  <button
                    onClick={() => copyOtp(order.delivery_otp)}
                    className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <Copy className="h-4 w-4 text-amber-600" />
                  </button>
                </div>
                <p className="text-[10px] text-amber-600">Share this OTP with rider to verify delivery</p>
              </div>
            )}

            {/* Address */}
            <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-botanical" />
                <span className="text-sm font-semibold text-on-surface">Delivery Address</span>
              </div>
              <div className="text-sm text-on-surface-variant space-y-0.5">
                <p className="font-medium text-on-surface">{addr.full_name}</p>
                <p>{addr.full_address}</p>
                {addr.landmark && <p>Near: {addr.landmark}</p>}
                <p>{addr.city}, {addr.state} - {addr.pin_code}</p>
                <p>📞 {addr.phone}</p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 space-y-3">
              <h4 className="font-heading font-semibold text-on-surface">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="text-on-surface">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Delivery</span>
                  <span className={order.delivery_fee === 0 ? "text-botanical" : "text-on-surface"}>
                    {order.delivery_fee === 0 ? "FREE" : formatPrice(order.delivery_fee)}
                  </span>
                </div>
                <div className="h-px bg-surface-high" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-botanical">{formatPrice(order.total)}</span>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="uppercase font-medium">{order.payment_method}</span>
                <span>•</span>
                <span className={`${getStatusColor(order.payment_status)} px-2 py-0.5 rounded-full text-[10px] font-semibold`}>
                  {formatStatus(order.payment_status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
