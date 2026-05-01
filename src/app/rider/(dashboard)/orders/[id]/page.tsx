"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Package, MapPin, Store, Phone, Banknote, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency } from "@/lib/utils";

interface OrderDetail {
  id: string;
  status: string;
  subtotal: number;
  order_number: string;
  delivery_address: Record<string, string>;
  order_total: number;
  payment_method: string;
  store_name: string;
  store_address: string;
  store_phone: string;
  items: Array<{ product_name: string; quantity: number; unit_price: number }>;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  rider_assigned: "bg-blue-100 text-blue-700 border-blue-200",
  picked_up: "bg-purple-100 text-purple-700 border-purple-200",
  out_for_delivery: "bg-amber-100 text-amber-700 border-amber-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function RiderOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rider/orders/${params.id}`);
      const json = await res.json();
      if (res.ok) setOrder(json.order);
      else toast.error(json.error || "Failed to load order");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return <LoadingSpinner text="Loading order..." className="h-64" />;
  if (!order) return <div className="text-center py-12 text-muted-foreground">Order not found</div>;

  const addr = order.delivery_address;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono text-gray-900">#{order.order_number}</h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
          {order.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Pickup: Store */}
      <Card className="shadow-sm border-blue-100/50">
        <CardHeader className="border-b bg-blue-50/30">
          <CardTitle className="text-sm flex items-center gap-2"><Store className="h-4 w-4 text-blue-600" />Pickup Location</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="font-semibold text-gray-900">{order.store_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{order.store_address}</p>
          {order.store_phone && (
            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1"><Phone className="h-3 w-3" />{order.store_phone}</p>
          )}
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card className="shadow-sm border-emerald-100/50">
        <CardHeader className="border-b bg-emerald-50/30">
          <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" />Delivery Address</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="font-semibold text-gray-900">{addr?.name || "Customer"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{addr?.full_address || addr?.address || "—"}</p>
          {addr?.city && <p className="text-xs text-muted-foreground">{addr.city}{addr.pincode ? ` - ${addr.pincode}` : ""}</p>}
          {addr?.phone && <p className="text-xs text-gray-600 flex items-center gap-1 mt-1"><Phone className="h-3 w-3" />{addr.phone}</p>}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-gray-600" />Order Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {order.items && order.items.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(item.unit_price * item.quantity)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-xs text-muted-foreground text-center">Item details not available</div>
          )}
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {order.payment_method === "cod" ? (
              <><Banknote className="h-4 w-4 text-amber-600" /><span className="text-sm font-medium text-amber-700">Cash on Delivery</span></>
            ) : (
              <><CreditCard className="h-4 w-4 text-blue-600" /><span className="text-sm font-medium text-blue-700">UPI (Prepaid)</span></>
            )}
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(order.order_total)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
