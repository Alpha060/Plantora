"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, CheckCircle2, Clock, Store } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface Settlement {
  id: string;
  settlement_number: string;
  period_start: string;
  period_end: string;
  total_orders: number;
  total_delivered: number;
  gross_sales: number;
  total_commission: number;
  net_amount: number;
  status: string;
  store_name: string;
  paid_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  calculated: "bg-gray-100 text-gray-700 border-gray-200",
  pending_approval: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-purple-100 text-purple-700 border-purple-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  disputed: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/finance/settlements");
      const json = await res.json();
      if (res.ok) setSettlements(json.settlements);
      else toast.error(json.error || "Failed to load settlements");
    } catch { toast.error("Failed to load settlements"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPaid = settlements.filter((s) => s.status === "paid").reduce((sum, s) => sum + s.net_amount, 0);
  const totalPending = settlements.filter((s) => s.status !== "paid").reduce((sum, s) => sum + s.net_amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Settlements</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage seller payouts and settlement cycles</p>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{settlements.length}</p>
          <p className="text-xs text-muted-foreground">Total Settlements</p>
        </CardContent></Card>
        <Card className="shadow-sm border-emerald-100/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-muted-foreground">Total Paid</p>
        </CardContent></Card>
        <Card className="shadow-sm border-amber-100/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-muted-foreground">Pending Payout</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading settlements..." className="h-64" />
      ) : settlements.length === 0 ? (
        <EmptyState icon={DollarSign} title="No settlements yet" description="Settlements will appear here once generated." />
      ) : (
        <div className="space-y-3">
          {settlements.map((s) => (
            <Card key={s.id} className="shadow-sm border-gray-100">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                    {s.status === "paid" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Clock className="h-5 w-5 text-amber-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-gray-900">#{s.settlement_number}</span>
                      <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${statusColors[s.status] || statusColors.calculated}`}>
                        {s.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Store className="h-3 w-3" />{s.store_name}</span>
                      <span>{new Date(s.period_start).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} – {new Date(s.period_end).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                      <span>{s.total_delivered} delivered</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(s.net_amount)}</p>
                  <p className="text-[10px] text-muted-foreground">Commission: {formatCurrency(s.total_commission)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
