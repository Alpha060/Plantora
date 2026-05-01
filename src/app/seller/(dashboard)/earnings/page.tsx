"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, TrendingUp, Wallet, Clock, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface EarningsSummary {
  totalEarnings: number;
  totalCommission: number;
  totalOrders: number;
  pendingSettlement: number;
  thisMonthEarnings: number;
  thisWeekEarnings: number;
}

interface OrderEarning {
  id: string;
  order_number: string;
  order_status: string;
  payment_method: string;
  subtotal: number;
  commission_rate: number;
  commission_amount: number;
  seller_amount: number;
  settlement_status: string;
  date: string;
}

interface EarningsData {
  summary: EarningsSummary;
  orders: OrderEarning[];
}

export default function SellerEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/earnings");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.error || "Failed to load earnings");
      }
    } catch {
      toast.error("Failed to load earnings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  if (isLoading) {
    return <LoadingSpinner text="Loading earnings..." className="h-64" />;
  }

  if (!data) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No earnings data"
        description="Your earnings will appear here once orders start coming in."
      />
    );
  }

  const { summary, orders } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Earnings"
        description="Track your revenue, commissions, and settlement status."
        breadcrumbs={[
          { label: "Dashboard", href: "/seller/dashboard" },
          { label: "Earnings" },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-100/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Earnings</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">From {summary.totalOrders} orders</p>
          </CardContent>
        </Card>

        <Card className="border-blue-100/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">This Month</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.thisMonthEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">Current month revenue</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Pending Settlement</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.pendingSettlement)}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payout</p>
          </CardContent>
        </Card>

        <Card className="border-red-100/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Commission Paid</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
              <Wallet className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalCommission)}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform commission</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Order Breakdown Table */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-base font-semibold">Order-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              No order data yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/30">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Order</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Payment</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Order Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Commission</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Your Earnings</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold font-mono text-gray-900">
                          #{order.order_number}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(order.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider
                            ${
                              order.order_status === "delivered"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : order.order_status === "cancelled"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : order.order_status === "placed"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-amber-100 text-amber-700 border-amber-200"
                            }
                          `}
                        >
                          {order.order_status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <CreditCard className="h-3.5 w-3.5" />
                          {order.payment_method === "cod" ? "COD" : "UPI"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(order.subtotal)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="flex items-center justify-end gap-1 text-red-600 font-medium">
                          <ArrowDownRight className="h-3.5 w-3.5" />
                          {formatCurrency(order.commission_amount)}
                          <span className="text-gray-400 text-xs">({order.commission_rate}%)</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="flex items-center justify-end gap-1 text-emerald-600 font-bold">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          {formatCurrency(order.seller_amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider
                            ${
                              order.settlement_status === "settled"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-amber-100 text-amber-700 border-amber-200"
                            }
                          `}
                        >
                          {order.settlement_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
