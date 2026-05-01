"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DollarSign, TrendingUp, CreditCard, Banknote, ArrowRight, Undo2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency } from "@/lib/utils";

interface FinanceData {
  metrics: {
    totalRevenue: number;
    totalCommission: number;
    upiRevenue: number;
    codRevenue: number;
    totalRefunds: number;
    totalSettled: number;
    pendingSettlements: number;
    netProfit: number;
  };
  chartData: Array<{ month: string; revenue: number }>;
}

export default function AdminFinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/finance");
      const json = await res.json();
      if (res.ok) setData(json);
      else toast.error(json.error || "Failed to load finance data");
    } catch { toast.error("Failed to load finance data"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return <LoadingSpinner text="Loading finance..." className="h-64" />;
  if (!data) return null;

  const { metrics, chartData } = data;
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Finance</h1>
          <p className="text-sm text-muted-foreground mt-1">Revenue overview and financial metrics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/finance/settlements">
            <Button variant="outline" size="sm">Settlements <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
          </Link>
          <Link href="/admin/finance/cod">
            <Button variant="outline" size="sm">COD <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
          </Link>
        </div>
      </div>

      {/* Top Metrics */}
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
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Commission Earned</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalCommission)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Settled</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <Wallet className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalSettled)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending: {formatCurrency(metrics.pendingSettlements)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-red-100/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Refunds</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
              <Undo2 className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRefunds)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Breakdown */}
      <div className="grid gap-4 grid-cols-2">
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
              <CreditCard className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.upiRevenue)}</p>
              <p className="text-xs text-muted-foreground">UPI Payments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.codRevenue)}</p>
              <p className="text-xs text-muted-foreground">COD Collections</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-base font-semibold">Revenue — Last 6 Months</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-end gap-3 h-48">
            {chartData.map((m) => {
              const height = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-gray-500">
                    {m.revenue > 0 ? formatCurrency(m.revenue) : ""}
                  </span>
                  <div
                    className="w-full bg-emerald-500 rounded-t-md transition-all duration-500 min-h-[4px]"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <span className="text-[10px] text-gray-500 font-medium mt-1">{m.month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
