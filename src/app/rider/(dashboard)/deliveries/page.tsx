"use client";

import { useEffect, useState, useCallback } from "react";
import { Truck, CheckCircle2, MapPin, Store, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface Delivery {
  id: string;
  status: string;
  order_number: string;
  order_total: number;
  store_name: string;
  delivery_address: Record<string, string>;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export default function RiderDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rider/orders?status=completed");
      const json = await res.json();
      if (res.ok) setDeliveries(json.orders);
      else toast.error(json.error || "Failed to load");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Completed Deliveries</h1>
        <p className="text-sm text-muted-foreground mt-1">Your delivery history</p>
      </div>

      <Card className="shadow-sm border-emerald-100/50">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{deliveries.length}</p>
            <p className="text-xs text-muted-foreground">Completed Deliveries</p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSpinner text="Loading deliveries..." className="h-64" />
      ) : deliveries.length === 0 ? (
        <EmptyState icon={Truck} title="No completed deliveries" description="Your delivered orders will appear here." />
      ) : (
        <div className="space-y-3">
          {deliveries.map((d) => (
            <Card key={d.id} className="shadow-sm border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-gray-900">#{d.order_number}</span>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                      Delivered
                    </Badge>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(d.order_total)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Store className="h-3 w-3" />{d.store_name}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {d.delivery_address?.city || d.delivery_address?.full_address || "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(d.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
