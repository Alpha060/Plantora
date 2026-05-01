import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from("platform_settings")
      .select("*")
      .order("key");

    if (error) {
      console.error("Settings fetch error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ settings: settings || [] });
  } catch (err) {
    console.error("Admin Settings API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const body = await request.json();
    const { key, value } = body;

    if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });

    const { error } = await supabase
      .from("platform_settings")
      .upsert({ key, value, updated_by: guard.ctx.userId, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) {
      console.error("Update settings error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin Settings PUT Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
