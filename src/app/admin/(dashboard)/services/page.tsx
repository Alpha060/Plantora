"use client";

import { useEffect, useState, useCallback } from "react";
import { Wrench, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price_starts_at: number | null;
  is_active: boolean;
  sort_order: number;
  booking_count: number;
  created_at: string;
}

export default function AdminLandscapePage() {
  const [Landscape, setLandscape] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/Landscape");
      const json = await res.json();
      if (res.ok) setLandscape(json.Landscape);
      else toast.error(json.error || "Failed to load Landscape");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Landscape</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage platform Landscape like gardening and consultations</p>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{Landscape.length}</p>
          <p className="text-xs text-muted-foreground">Total Landscape</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{Landscape.filter((s) => s.is_active).length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{Landscape.reduce((s, sv) => s + sv.booking_count, 0)}</p>
          <p className="text-xs text-muted-foreground">Total Bookings</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading Landscape..." className="h-64" />
      ) : Landscape.length === 0 ? (
        <EmptyState icon={Wrench} title="No Landscape" description="No Landscape have been created yet." />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Landscape.map((svc) => (
            <Card key={svc.id} className={`shadow-sm transition-colors ${!svc.is_active ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{svc.name}</p>
                      {svc.category && <p className="text-xs text-muted-foreground">{svc.category}</p>}
                    </div>
                  </div>
                  {svc.is_active ? (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3 mr-0.5" />Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] px-2 py-0.5 rounded-full">
                      <XCircle className="h-3 w-3 mr-0.5" />Inactive
                    </Badge>
                  )}
                </div>
                {svc.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{svc.description}</p>}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{svc.booking_count} bookings
                  </span>
                  {svc.price_starts_at && <span className="font-semibold text-gray-900">From {formatCurrency(svc.price_starts_at)}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
