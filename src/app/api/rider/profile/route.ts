import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: rider, error } = await supabase
      .from("riders")
      .select("id, name, phone, vehicle_type, vehicle_number, is_available, is_active, total_deliveries, current_lat, current_lng, created_at")
      .eq("user_id", user.id)
      .single();

    if (error || !rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

    // Get email from users table
    const { data: userData } = await supabase.from("users").select("email").eq("id", user.id).single();

    return NextResponse.json({
      profile: { ...(rider as Record<string, unknown>), email: userData?.email || "" },
    });
  } catch (err) {
    console.error("Rider Profile API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
