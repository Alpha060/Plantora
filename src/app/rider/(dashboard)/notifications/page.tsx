"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Package, DollarSign, Truck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const typeIcons: Record<string, React.ElementType> = {
  order: Package,
  delivery: Truck,
  settlement: DollarSign,
  system: Bell,
};

const typeColors: Record<string, string> = {
  order: "bg-blue-100 text-blue-700 border-blue-200",
  delivery: "bg-indigo-100 text-indigo-700 border-indigo-200",
  settlement: "bg-emerald-100 text-emerald-700 border-emerald-200",
  system: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function RiderNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rider/notifications");
      const json = await res.json();
      if (res.ok) setNotifications(json.notifications);
      else toast.error(json.error || "Failed to load");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Stay updated on your deliveries and earnings</p>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading notifications..." className="h-64" />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <Card key={n.id} className={`shadow-sm transition-colors ${n.is_read ? "border-gray-100" : "border-emerald-100/50 bg-emerald-50/30"}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-gray-900">{n.title}</span>
                      <Badge variant="outline" className={`px-2 py-0 rounded-full text-[10px] ${typeColors[n.type] || typeColors.system}`}>{n.type}</Badge>
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                    </div>
                    <p className="text-xs text-gray-600">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
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
