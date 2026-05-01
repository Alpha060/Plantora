"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Package, MapPin, Store, Phone, Banknote, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface RiderOrder {
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
  created_at: string;
}

const statusColors: Record<string, string> = {
  rider_assigned: "bg-blue-100 text-blue-700 border-blue-200",
  picked_up: "bg-purple-100 text-purple-700 border-purple-200",
  out_for_delivery: "bg-amber-100 text-amber-700 border-amber-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function RiderOrdersPage() {
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rider/orders?status=${filter}`);
      const json = await res.json();
      if (res.ok) setOrders(json.orders);
      else toast.error(json.error || "Failed to load");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">My Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your assigned deliveries</p>
      </div>

      <div className="flex gap-2">
        {[
          { key: "active", label: "Active" },
          { key: "completed", label: "Completed" },
          { key: "all", label: "All" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading orders..." className="h-64" />
      ) : orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders" description={filter === "active" ? "No active deliveries assigned." : "No orders found."} />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/rider/orders/${order.id}`}>
              <Card className="shadow-sm border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer mb-3">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-gray-900">#{order.order_number}</span>
                      <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${statusColors[order.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                      {order.payment_method === "cod" && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-2 py-0.5 rounded-full">
                          <Banknote className="h-3 w-3 mr-0.5" />COD
                        </Badge>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(order.order_total)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <Store className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{order.store_name}</p>
                        <p className="text-muted-foreground">{order.store_address}</p>
                        {order.store_phone && <p className="flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{order.store_phone}</p>}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Delivery</p>
                        <p className="text-muted-foreground">{order.delivery_address?.full_address || order.delivery_address?.city || "—"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
