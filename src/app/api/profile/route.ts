import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/profile
 * Returns the authenticated user's profile from the users table
 * 
 * PUT /api/profile
 * Updates the user's profile (full_name, email)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("id, full_name, email, phone, role, avatar_url, is_active, created_at")
      .eq("id", user.id)
      .single();

    if (error || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userData });
  } catch (err) {
    console.error("Profile GET Error:", err);
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

    const body = await request.json();
    const { full_name, email } = body as { full_name?: string; email?: string };

    if (!full_name || full_name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    const updateData: Record<string, string> = {
      full_name: full_name.trim(),
      updated_at: new Date().toISOString(),
    };

    if (email !== undefined) {
      updateData.email = email.trim();
    }

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile PUT Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
