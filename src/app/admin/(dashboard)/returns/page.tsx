"use client";

import { useEffect, useState, useCallback } from "react";
import { Undo2, ShoppingBag, User, Phone, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface Return {
  id: string;
  return_number: string;
  reason: string;
  description: string | null;
  photos: string[];
  status: string;
  resolution_type: string | null;
  refund_amount: number | null;
  admin_notes: string | null;
  order_number: string;
  order_total: number;
  customer_name: string;
  customer_phone: string;
  date: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  initiated: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  rider_returning: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Undo2 },
  returned_to_seller: { color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: ShoppingBag },
  admin_review: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
  refund_approved: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  refund_processed: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  resolved: { color: "bg-gray-100 text-gray-700 border-gray-200", icon: CheckCircle2 },
  rejected: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchReturns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/returns");
      const json = await res.json();
      if (res.ok) {
        setReturns(json.returns);
      } else {
        toast.error(json.error || "Failed to load returns");
      }
    } catch {
      toast.error("Failed to load returns");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const pendingCount = returns.filter((r) => ["initiated", "admin_review", "rider_returning"].includes(r.status)).length;
  const resolvedCount = returns.filter((r) => ["resolved", "refund_processed", "rejected"].includes(r.status)).length;

  const filtered = filter === "all"
    ? returns
    : filter === "pending"
      ? returns.filter((r) => ["initiated", "admin_review", "rider_returning", "returned_to_seller"].includes(r.status))
      : returns.filter((r) => ["resolved", "refund_processed", "refund_approved", "rejected"].includes(r.status));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Returns & Refunds</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage return requests and process refunds</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{returns.length}</p>
            <p className="text-xs text-muted-foreground">Total Returns</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-100/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-100/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{resolvedCount}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "resolved", label: "Resolved" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading returns..." className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Undo2}
          title="No returns found"
          description="No return requests match the current filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((ret) => {
            const config = statusConfig[ret.status] || { color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock };
            const StatusIcon = config.icon;

            return (
              <Card key={ret.id} className="shadow-sm border-gray-100 hover:border-gray-200 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold font-mono text-gray-900">#{ret.return_number}</span>
                        <Badge
                          variant="outline"
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${config.color}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-0.5" />
                          {ret.status.replace(/_/g, " ")}
                        </Badge>
                        {ret.resolution_type && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-[10px] px-2 py-0.5 rounded-full">
                            {ret.resolution_type}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Reason:</span> {ret.reason}
                      </p>
                      {ret.description && (
                        <p className="text-xs text-gray-500 mb-2">{ret.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" />Order #{ret.order_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />{ret.customer_name}
                        </span>
                        {ret.customer_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />{ret.customer_phone}
                          </span>
                        )}
                        <span>
                          {new Date(ret.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">{formatCurrency(ret.order_total)}</p>
                      {ret.refund_amount && (
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">
                          Refund: {formatCurrency(ret.refund_amount)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
