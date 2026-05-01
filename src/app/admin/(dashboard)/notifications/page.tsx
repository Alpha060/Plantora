"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, Send, User } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  user_name: string;
  created_at: string;
}

const typeColors: Record<string, string> = {
  order: "bg-blue-100 text-blue-700 border-blue-200",
  promo: "bg-purple-100 text-purple-700 border-purple-200",
  system: "bg-gray-100 text-gray-700 border-gray-200",
  review: "bg-amber-100 text-amber-700 border-amber-200",
  delivery: "bg-indigo-100 text-indigo-700 border-indigo-200",
  settlement: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const json = await res.json();
      if (res.ok) setNotifications(json.notifications);
      else toast.error(json.error || "Failed to load");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">View and broadcast platform notifications</p>
        </div>
        <Link href="/admin/notifications/send">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Send className="h-4 w-4 mr-2" />Broadcast
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
          <p className="text-xs text-muted-foreground">Total Sent</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{notifications.filter((n) => n.is_read).length}</p>
          <p className="text-xs text-muted-foreground">Read</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{notifications.filter((n) => !n.is_read).length}</p>
          <p className="text-xs text-muted-foreground">Unread</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading notifications..." className="h-64" />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="Broadcast a notification to get started." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={`shadow-sm transition-colors ${n.is_read ? "border-gray-100" : "border-amber-100/50"}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 shrink-0">
                  <Bell className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-gray-900">{n.title}</span>
                    <Badge variant="outline" className={`px-2 py-0 rounded-full text-[10px] ${typeColors[n.type] || typeColors.system}`}>{n.type}</Badge>
                    {!n.is_read && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                  </div>
                  <p className="text-xs text-gray-600 truncate">{n.message}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                    <User className="h-3 w-3" />{n.user_name}
                    <span>·</span>
                    <span>{new Date(n.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
