import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*, users!notifications_user_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Notifications error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const formatted = (notifications || []).map((n) => {
      const targetUser = n.users as { full_name: string } | null;
      return { ...n, user_name: targetUser?.full_name || "Unknown" };
    });

    return NextResponse.json({ notifications: formatted });
  } catch (err) {
    console.error("Admin Notifications API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const body = await request.json();
    const { title, message, type, target } = body;

    if (!title || !message) return NextResponse.json({ error: "Title and message required" }, { status: 400 });

    let userIds: string[] = [];

    if (target === "all") {
      const { data: users } = await supabase.from("users").select("id").eq("is_active", true);
      userIds = (users || []).map((u) => u.id);
    } else if (target === "buyers") {
      const { data: users } = await supabase.from("users").select("id").eq("role", "buyer").eq("is_active", true);
      userIds = (users || []).map((u) => u.id);
    } else if (target === "sellers") {
      const { data: users } = await supabase.from("users").select("id").eq("role", "seller").eq("is_active", true);
      userIds = (users || []).map((u) => u.id);
    }

    if (userIds.length === 0) return NextResponse.json({ error: "No users to send to" }, { status: 400 });

    const notifications = userIds.map((uid) => ({
      user_id: uid,
      title,
      message,
      type: type || "system",
    }));

    const { error } = await supabase.from("notifications").insert(notifications);
    if (error) {
      console.error("Send notifications error:", error);
      return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
    }

    return NextResponse.json({ success: true, sent: userIds.length });
  } catch (err) {
    console.error("Admin Notifications POST Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
