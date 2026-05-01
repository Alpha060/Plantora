"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface Earning {
  id: string;
  amount: number;
  type: string;
  status: string;
  order_number: string | null;
  date: string;
}

interface EarningsData {
  earnings: Earning[];
  summary: { totalEarned: number; totalPending: number; totalPaid: number };
}

const typeColors: Record<string, string> = {
  delivery_fee: "bg-emerald-100 text-emerald-700 border-emerald-200",
  bonus: "bg-purple-100 text-purple-700 border-purple-200",
  tip: "bg-blue-100 text-blue-700 border-blue-200",
  incentive: "bg-amber-100 text-amber-700 border-amber-200",
  penalty: "bg-red-100 text-red-700 border-red-200",
};

export default function RiderEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rider/earnings");
      const json = await res.json();
      if (res.ok) setData(json);
      else toast.error(json.error || "Failed to load");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return <LoadingSpinner text="Loading earnings..." className="h-64" />;
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">My Earnings</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your delivery income and payouts</p>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card className="shadow-sm border-emerald-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">{formatCurrency(data.summary.totalEarned)}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-amber-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{formatCurrency(data.summary.totalPending)}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{formatCurrency(data.summary.totalPaid)}</div></CardContent>
        </Card>
      </div>

      {data.earnings.length === 0 ? (
        <EmptyState icon={DollarSign} title="No earnings yet" description="Your earnings from deliveries will appear here." />
      ) : (
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Order</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.earnings.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${typeColors[e.type] || typeColors.delivery_fee}`}>
                          {e.type.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">{e.order_number ? `#${e.order_number}` : "—"}</td>
                      <td className={`py-3 px-4 text-right font-bold ${e.type === "penalty" ? "text-red-600" : "text-gray-900"}`}>
                        {e.type === "penalty" ? "-" : "+"}{formatCurrency(e.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] ${e.status === "paid" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                          {e.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
