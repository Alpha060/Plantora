import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/seller/notifications
 * Returns notifications for the authenticated seller's store
 * 
 * PUT /api/seller/notifications
 * Marks notifications as read
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const { data: notifications, error } = await supabase
      .from("seller_notifications")
      .select("id, type, title, message, data, is_read, created_at")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Notifications DB Error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount,
    });
  } catch (err) {
    console.error("Notifications API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const { notificationIds, markAll } = body as { notificationIds?: string[]; markAll?: boolean };

    if (markAll) {
      // Mark all as read
      const { error } = await supabase
        .from("seller_notifications")
        .update({ is_read: true })
        .eq("store_id", store.id)
        .eq("is_read", false);

      if (error) {
        return NextResponse.json({ error: "Failed to mark notifications" }, { status: 500 });
      }
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      const { error } = await supabase
        .from("seller_notifications")
        .update({ is_read: true })
        .eq("store_id", store.id)
        .in("id", notificationIds);

      if (error) {
        return NextResponse.json({ error: "Failed to mark notifications" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Notifications PUT Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
