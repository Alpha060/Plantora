"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, CheckCircle2, Clock, Banknote, FileText } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface SettlementSummary {
  totalPaid: number;
  totalPending: number;
  totalSettlements: number;
}

interface Settlement {
  id: string;
  settlement_number: string;
  period_start: string;
  period_end: string;
  total_orders: number;
  total_delivered: number;
  total_returned: number;
  gross_sales: number;
  total_commission: number;
  total_returns_deduction: number;
  net_amount: number;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
}

interface SettlementsData {
  summary: SettlementSummary;
  settlements: Settlement[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  calculated: { label: "Calculated", className: "bg-gray-100 text-gray-700 border-gray-200" },
  pending_approval: { label: "Pending Approval", className: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Approved", className: "bg-blue-100 text-blue-700 border-blue-200" },
  processing: { label: "Processing", className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  paid: { label: "Paid", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  disputed: { label: "Disputed", className: "bg-red-100 text-red-700 border-red-200" },
};

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} — ${e.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
}

export default function SellerSettlementsPage() {
  const [data, setData] = useState<SettlementsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettlements = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/settlements");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.error || "Failed to load settlements");
      }
    } catch {
      toast.error("Failed to load settlements");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  if (isLoading) {
    return <LoadingSpinner text="Loading settlements..." className="h-64" />;
  }

  if (!data) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <PageHeader
          title="Settlements"
          description="Track your payout history and pending payments."
          breadcrumbs={[
            { label: "Dashboard", href: "/seller/dashboard" },
            { label: "Settlements" },
          ]}
        />
        <EmptyState
          icon={Wallet}
          title="No settlements yet"
          description="Settlements will be generated weekly based on delivered orders."
        />
      </div>
    );
  }

  const { summary, settlements } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Settlements"
        description="Track your payout history and pending payments."
        breadcrumbs={[
          { label: "Dashboard", href: "/seller/dashboard" },
          { label: "Settlements" },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-emerald-100/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Paid</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalPaid)}</div>
          </CardContent>
        </Card>

        <Card className="border-amber-100/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Pending Payout</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalPending)}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-100/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Settlements</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <Banknote className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{summary.totalSettlements}</div>
          </CardContent>
        </Card>
      </div>

      {/* Settlements List */}
      {settlements.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No settlements yet"
          description="Weekly settlements will appear here after your orders are delivered."
        />
      ) : (
        <div className="space-y-4">
          {settlements.map((s) => {
            const config = statusConfig[s.status] || statusConfig.calculated;
            return (
              <Card key={s.id} className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 font-mono text-sm">
                          {s.settlement_number}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${config.className}`}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Period: {formatPeriod(s.period_start, s.period_end)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(s.net_amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">Net payout</p>
                    </div>
                  </div>

                  {/* Breakdown row */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="text-sm font-semibold text-gray-900">{s.total_delivered}/{s.total_orders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gross Sales</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(s.gross_sales)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Commission</p>
                      <p className="text-sm font-semibold text-red-600">-{formatCurrency(s.total_commission)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Returns</p>
                      <p className="text-sm font-semibold text-red-600">-{formatCurrency(s.total_returns_deduction)}</p>
                    </div>
                    {s.paid_at && (
                      <div>
                        <p className="text-xs text-muted-foreground">Paid On</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(s.paid_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    )}
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
