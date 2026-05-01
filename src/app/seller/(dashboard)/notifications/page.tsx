"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  Package,
  DollarSign,
  Star,
  Shield,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; bgColor: string }> = {
  order_new: { icon: ShoppingBag, color: "text-blue-600", bgColor: "bg-blue-50" },
  order_cancelled: { icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-50" },
  product_deleted: { icon: Package, color: "text-red-600", bgColor: "bg-red-50" },
  settlement_ready: { icon: DollarSign, color: "text-amber-600", bgColor: "bg-amber-50" },
  settlement_paid: { icon: DollarSign, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  account_approved: { icon: Shield, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  account_rejected: { icon: Shield, color: "text-red-600", bgColor: "bg-red-50" },
  account_suspended: { icon: Shield, color: "text-red-600", bgColor: "bg-red-50" },
  review_received: { icon: Star, color: "text-amber-600", bgColor: "bg-amber-50" },
  general: { icon: Info, color: "text-gray-600", bgColor: "bg-gray-50" },
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/notifications");
      const json = await res.json();
      if (res.ok) {
        setNotifications(json.notifications);
        setUnreadCount(json.unreadCount);
      } else {
        toast.error(json.error || "Failed to load notifications");
      }
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/seller/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to mark notifications");
    }
  };

  const markSingleRead = async (notificationId: string) => {
    try {
      await fetch("/api/seller/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silent fail for marking single notification
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading notifications..." className="h-64" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Notifications"
        description="Stay updated on orders, reviews, and payments."
        breadcrumbs={[
          { label: "Dashboard", href: "/seller/dashboard" },
          { label: "Notifications" },
        ]}
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="text-sm"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {unreadCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 rounded-full px-3 py-1 text-xs font-medium">
            {unreadCount} unread
          </Badge>
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Notifications about orders, reviews, and payments will appear here."
        />
      ) : (
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-0 divide-y divide-gray-100">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type] || typeConfig.general;
              const IconComponent = config.icon;

              return (
                <div
                  key={notification.id}
                  className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                    notification.is_read
                      ? "hover:bg-gray-50/30"
                      : "bg-emerald-50/20 hover:bg-emerald-50/40"
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markSingleRead(notification.id);
                    }
                  }}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${config.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-semibold ${notification.is_read ? "text-gray-700" : "text-gray-900"}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {getTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm mt-0.5 ${notification.is_read ? "text-gray-500" : "text-gray-700"}`}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
