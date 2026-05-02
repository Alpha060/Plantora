"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ShoppingBag, Search, ChevronLeft, ChevronRight, CreditCard, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  date: string;
}

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  packed: "bg-purple-100 text-purple-700 border-purple-200",
  rider_assigned: "bg-cyan-100 text-cyan-700 border-cyan-200",
  picked_up: "bg-teal-100 text-teal-700 border-teal-200",
  out_for_delivery: "bg-orange-100 text-orange-700 border-orange-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  return_initiated: "bg-rose-100 text-rose-700 border-rose-200",
  returned: "bg-gray-100 text-gray-700 border-gray-200",
  refunded: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const perPage = 20;

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      if (res.ok) {
        setOrders(json.orders);
        setTotal(json.total);
      }
    } catch {
      // silent on poll errors
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(false), 20000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const totalPages = Math.ceil(total / perPage);

  const filtered = searchQuery
    ? orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all platform orders</p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(1); } }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSpinner text="Loading orders..." className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description={statusFilter !== "all" ? "Try changing the status filter." : "No orders have been placed yet."}
        />
      ) : (
        <>
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Order</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Payment</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold font-mono text-gray-900">#{order.order_number}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            {order.customer_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />{order.customer_phone}
                              </span>
                            )}
                            {order.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />{order.city}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${statusColors[order.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <CreditCard className="h-3.5 w-3.5" />
                            {order.payment_method === "cod" ? "COD" : "UPI"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(order.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{page}/{totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
