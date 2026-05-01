"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, TrendingUp, DollarSign, ArrowUp, ArrowDown, Loader2, ShoppingBag, CreditCard, Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface RevenueStats {
  total_revenue: number;
  total_commission: number;
  total_delivery_fees: number;
  total_refunds: number;
  net_profit: number;
  total_orders: number;
  upi_revenue: number;
  cod_revenue: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export default function AdminRevenuePage() {
  const [stats, setStats] = useState<RevenueStats>({
    total_revenue: 0, total_commission: 0, total_delivery_fees: 0,
    total_refunds: 0, net_profit: 0, total_orders: 0, upi_revenue: 0, cod_revenue: 0,
  });
  const [dailyData, setDailyData] = useState<DailyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finance/revenue?period=${period}`);
      const json = await res.json();
      if (res.ok) {
        setStats(json.stats || stats);
        setDailyData(json.daily || []);
      }
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue), 1);

  const statCards = [
    { label: "Total Revenue", value: stats.total_revenue, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: "Commission Earned", value: stats.total_commission, icon: DollarSign, color: "text-blue-600 bg-blue-50" },
    { label: "Delivery Fees", value: stats.total_delivery_fees, icon: ShoppingBag, color: "text-purple-600 bg-purple-50" },
    { label: "Refunds", value: stats.total_refunds, icon: ArrowDown, color: "text-red-600 bg-red-50" },
    { label: "Net Profit", value: stats.net_profit, icon: ArrowUp, color: "text-emerald-700 bg-emerald-100" },
    { label: "Total Orders", value: stats.total_orders, icon: BarChart3, color: "text-gray-600 bg-gray-50", isCurrency: false },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Revenue</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform revenue analytics and breakdown</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["7d", "30d", "90d"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${card.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {card.isCurrency === false ? card.value : formatCurrency(card.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">{card.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Payment Split */}
          <div className="grid gap-4 grid-cols-2">
            <Card className="shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.upi_revenue)}</p>
                  <p className="text-xs text-muted-foreground">UPI / Online</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Banknote className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.cod_revenue)}</p>
                  <p className="text-xs text-muted-foreground">Cash on Delivery</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Revenue Chart (simple bar chart) */}
          {dailyData.length > 0 && (
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Daily Revenue</h3>
                <div className="flex items-end gap-1 h-40">
                  {dailyData.map((d) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative" title={`${new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}: ${formatCurrency(d.revenue)} (${d.orders} orders)`}>
                      <div className="w-full rounded-t-sm bg-emerald-400 transition-all group-hover:bg-emerald-500" style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue > 0 ? "4px" : "0px" }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
                  <span>{dailyData[0]?.date ? new Date(dailyData[0].date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : ""}</span>
                  <span>{dailyData[dailyData.length - 1]?.date ? new Date(dailyData[dailyData.length - 1].date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : ""}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
