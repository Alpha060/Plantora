"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  DollarSign,
  Users,
  Store,
  Truck,
  Package,
  TrendingUp,
  CreditCard,
  ArrowRight,
  Leaf,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency } from "@/lib/utils";

interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalBuyers: number;
  totalSellers: number;
  pendingSellers: number;
  totalRiders: number;
  pendingRiders: number;
  totalProducts: number;
  totalLandscapeBookings: number;
  pendingLandscapeBookings: number;
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_method: string;
  customer_name: string;
  date: string;
}

interface DashboardData {
  metrics: DashboardMetrics;
  statusCounts: Record<string, number>;
  chartData: ChartDataPoint[];
  recentOrders: RecentOrder[];
}

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  out_for_delivery: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.error || "Failed to load dashboard");
      }
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." className="h-64" />;
  }

  if (!data) return null;

  const { metrics, chartData, recentOrders } = data;
  const maxChartRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  const hasPendingApprovals = metrics.pendingSellers > 0 || metrics.pendingRiders > 0 || metrics.pendingLandscapeBookings > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview and key metrics</p>
      </div>

      {/* Pending Approvals Alert */}
      {hasPendingApprovals && (
        <Card className="shadow-sm border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900">Pending Approvals</h3>
                <div className="flex flex-wrap gap-3 mt-2">
                  {metrics.pendingSellers > 0 && (
                    <Link href="/admin/sellers" className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-amber-200 hover:border-amber-300 transition-colors">
                      <Store className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-800">{metrics.pendingSellers} seller{metrics.pendingSellers > 1 ? "s" : ""}</span>
                      <ArrowRight className="h-3 w-3 text-amber-400" />
                    </Link>
                  )}
                  {metrics.pendingRiders > 0 && (
                    <Link href="/admin/riders" className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-amber-200 hover:border-amber-300 transition-colors">
                      <Truck className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-800">{metrics.pendingRiders} rider{metrics.pendingRiders > 1 ? "s" : ""}</span>
                      <ArrowRight className="h-3 w-3 text-amber-400" />
                    </Link>
                  )}
                  {metrics.pendingLandscapeBookings > 0 && (
                    <Link href="/admin/landscape" className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-amber-200 hover:border-amber-300 transition-colors">
                      <Leaf className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-800">{metrics.pendingLandscapeBookings} landscape inquiry{metrics.pendingLandscapeBookings > 1 ? "s" : ""}</span>
                      <ArrowRight className="h-3 w-3 text-amber-400" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-emerald-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Revenue</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Today: {formatCurrency(metrics.todayRevenue)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Orders</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Today: {metrics.todayOrders} · Pending: {metrics.pendingOrders}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Commission</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalCommission)}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform earnings</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-teal-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Landscape</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
              <Leaf className="h-4 w-4 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalLandscapeBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.pendingLandscapeBookings > 0 ? (
                <span className="text-amber-600 font-medium">{metrics.pendingLandscapeBookings} new inquiries</span>
              ) : (
                "All caught up"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
              <Users className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalBuyers}</p>
              <p className="text-xs text-muted-foreground">Customers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <Store className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalSellers}</p>
              <p className="text-xs text-muted-foreground">
                Sellers
                {metrics.pendingSellers > 0 && (
                  <Badge variant="outline" className="ml-1.5 bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0 rounded-full">
                    {metrics.pendingSellers} pending
                  </Badge>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <Truck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalRiders}</p>
              <p className="text-xs text-muted-foreground">
                Riders
                {metrics.pendingRiders > 0 && (
                  <Badge variant="outline" className="ml-1.5 bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0 rounded-full">
                    {metrics.pendingRiders} pending
                  </Badge>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-base font-semibold">Revenue — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-end gap-2 h-48">
              {chartData.map((day) => {
                const height = maxChartRevenue > 0 ? (day.revenue / maxChartRevenue) * 100 : 0;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-gray-500">
                      {day.revenue > 0 ? formatCurrency(day.revenue) : ""}
                    </span>
                    <div
                      className="w-full bg-emerald-500 rounded-t-md transition-all duration-500 min-h-[4px]"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <span className="text-[10px] text-gray-500 font-medium mt-1">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="border-b bg-gray-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700">
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No orders yet</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.slice(0, 8).map((order) => (
                  <div key={order.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 font-mono">#{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${statusColors[order.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                          <CreditCard className="h-3 w-3" />
                          {order.payment_method === "cod" ? "COD" : "UPI"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/admin/landscape">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:border-emerald-300 hover:bg-emerald-50/50">
                <Leaf className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-medium">Landscape Bookings</span>
              </Button>
            </Link>
            <Link href="/admin/sellers">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-300 hover:bg-blue-50/50">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium">Approve Sellers</span>
              </Button>
            </Link>
            <Link href="/admin/riders">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/50">
                <Truck className="h-5 w-5 text-indigo-600" />
                <span className="text-xs font-medium">Manage Riders</span>
              </Button>
            </Link>
            <Link href="/admin/customers">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:border-sky-300 hover:bg-sky-50/50">
                <Users className="h-5 w-5 text-sky-600" />
                <span className="text-xs font-medium">View Customers</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
