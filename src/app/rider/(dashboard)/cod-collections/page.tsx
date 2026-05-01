"use client";

import { useEffect, useState, useCallback } from "react";
import { Banknote, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface CodCollection {
  id: string;
  amount: number;
  status: string;
  order_number: string;
  collected_at: string | null;
  deposited_at: string | null;
  deposit_method: string | null;
  created_at: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  collected: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  deposited: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Banknote },
  verified: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  discrepancy: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
};

export default function RiderCodCollectionsPage() {
  const [collections, setCollections] = useState<CodCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rider/cod-collections");
      const json = await res.json();
      if (res.ok) setCollections(json.collections);
      else toast.error(json.error || "Failed to load");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pendingAmount = collections.filter((c) => c.status === "collected").reduce((s, c) => s + c.amount, 0);
  const depositedAmount = collections.filter((c) => c.status !== "collected").reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">COD Collections</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your cash-on-delivery collections and deposits</p>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{collections.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent></Card>
        <Card className="shadow-sm border-amber-100/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</p>
          <p className="text-xs text-muted-foreground">Pending Deposit</p>
        </CardContent></Card>
        <Card className="shadow-sm border-emerald-100/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(depositedAmount)}</p>
          <p className="text-xs text-muted-foreground">Deposited</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading COD data..." className="h-64" />
      ) : collections.length === 0 ? (
        <EmptyState icon={Banknote} title="No COD collections" description="Your cash collections will appear here." />
      ) : (
        <div className="space-y-3">
          {collections.map((c) => {
            const config = statusConfig[c.status] || statusConfig.collected;
            const StatusIcon = config.icon;
            return (
              <Card key={c.id} className="shadow-sm border-gray-100">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <StatusIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-gray-900">#{c.order_number}</span>
                        <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${config.color}`}>
                          {c.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>{c.collected_at ? new Date(c.collected_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</span>
                        {c.deposit_method && <span>· {c.deposit_method}</span>}
                      </div>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(c.amount)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
