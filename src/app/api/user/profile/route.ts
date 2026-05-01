import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/user/profile — Get current user's profile
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, phone, email, avatar_url, role, created_at")
      .eq("id", user.id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/user/profile — Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.full_name) updateData.full_name = body.full_name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select("id, full_name, email")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
