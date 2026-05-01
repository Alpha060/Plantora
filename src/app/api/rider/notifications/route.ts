import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("id, title, message, type, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Rider notifications error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ notifications: notifications || [] });
  } catch (err) {
    console.error("Rider Notifications API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
