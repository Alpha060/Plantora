"use client";

import { useEffect, useState, useCallback } from "react";
import { Banknote, Truck, Phone, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
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
  collected_at: string | null;
  deposited_at: string | null;
  deposit_method: string | null;
  deposit_reference: string | null;
  discrepancy_amount: number | null;
  discrepancy_note: string | null;
  rider_name: string;
  rider_phone: string;
  order_number: string;
  created_at: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  collected: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  deposited: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Banknote },
  verified: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  discrepancy: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
};

export default function AdminCodPage() {
  const [collections, setCollections] = useState<CodCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/finance/cod");
      const json = await res.json();
      if (res.ok) setCollections(json.collections);
      else toast.error(json.error || "Failed to load COD data");
    } catch { toast.error("Failed to load COD data"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalCollected = collections.filter((c) => c.status === "collected").reduce((s, c) => s + c.amount, 0);
  const totalVerified = collections.filter((c) => c.status === "verified").reduce((s, c) => s + c.amount, 0);

  const filtered = filter === "all" ? collections : collections.filter((c) => c.status === filter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">COD Collections</h1>
        <p className="text-sm text-muted-foreground mt-1">Track cash-on-delivery collections from riders</p>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{collections.length}</p>
          <p className="text-xs text-muted-foreground">Total Collections</p>
        </CardContent></Card>
        <Card className="shadow-sm border-amber-100/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalCollected)}</p>
          <p className="text-xs text-muted-foreground">Pending Deposit</p>
        </CardContent></Card>
        <Card className="shadow-sm border-emerald-100/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalVerified)}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </CardContent></Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "collected", "deposited", "verified", "discrepancy"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading COD data..." className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Banknote} title="No COD collections" description="No collections match the selected filter." />
      ) : (
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Order</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Rider</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Collected</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Deposit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((c) => {
                    const config = statusConfig[c.status] || statusConfig.collected;
                    const StatusIcon = config.icon;
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-gray-900">#{c.order_number}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Truck className="h-3.5 w-3.5 text-gray-400" />
                            <span>{c.rider_name}</span>
                            {c.rider_phone && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Phone className="h-3 w-3" />{c.rider_phone}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">{formatCurrency(c.amount)}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${config.color}`}>
                            <StatusIcon className="h-3 w-3 mr-0.5" />{c.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {c.collected_at ? new Date(c.collected_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          {c.deposit_method ? `${c.deposit_method}${c.deposit_reference ? ` · ${c.deposit_reference}` : ""}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
