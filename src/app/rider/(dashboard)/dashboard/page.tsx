"use client";

import { useEffect, useState, useCallback } from "react";
import { Truck, Package, DollarSign, MapPin, Banknote, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency } from "@/lib/utils";

interface ActiveOrder {
  id: string;
  status: string;
  order_number: string;
  delivery_address: Record<string, string>;
  total: number;
}

interface DashboardData {
  rider: { id: string; name: string; is_available: boolean };
  metrics: {
    totalDeliveries: number;
    todayDeliveries: number;
    activeOrders: number;
    todayEarnings: number;
    codPending: number;
  };
  activeOrders: ActiveOrder[];
}

const statusColors: Record<string, string> = {
  rider_assigned: "bg-blue-100 text-blue-700 border-blue-200",
  picked_up: "bg-purple-100 text-purple-700 border-purple-200",
  out_for_delivery: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function RiderDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rider/dashboard");
      const json = await res.json();
      if (res.ok) setData(json);
      else toast.error(json.error || "Failed to load dashboard");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return <LoadingSpinner text="Loading dashboard..." className="h-64" />;
  if (!data) return null;

  const { metrics, activeOrders } = data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">
          Welcome, {data.rider.name} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s your delivery overview for today</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Active</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-600">{metrics.activeOrders}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-600">{metrics.todayDeliveries}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-amber-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Today Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{formatCurrency(metrics.todayEarnings)}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-red-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">COD Pending</CardTitle>
            <Banknote className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.codPending)}</div></CardContent>
        </Card>
      </div>

      {/* Overall Stats */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center"><Truck className="h-6 w-6 text-indigo-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalDeliveries}</p>
            <p className="text-xs text-muted-foreground">Total Lifetime Deliveries</p>
          </div>
        </CardContent>
      </Card>

      {/* Active Orders */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Deliveries</h2>
        {activeOrders.length === 0 ? (
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-8 text-center">
              <Package className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-muted-foreground">No active deliveries right now</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <Card key={order.id} className="shadow-sm border-gray-100 hover:border-emerald-200 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Package className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-gray-900">#{order.order_number}</span>
                        <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${statusColors[order.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {order.delivery_address?.full_address || order.delivery_address?.city || "Address pending"}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
