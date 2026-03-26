import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validations";

/**
 * POST /api/auth/register
 * Creates a public.users profile record after Supabase auth signup.
 * Uses admin client to bypass RLS.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the registration data
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const { full_name, phone, email } = parsed.data;
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if user profile already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .single();

    if (existing) {
      return NextResponse.json(
        { data: existing, message: "User already exists" },
        { status: 200 }
      );
    }

    // Create the user profile
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        id,
        full_name,
        phone,
        email: email || null,
        role: "buyer",
      })
      .select()
      .single();

    if (error) {
      console.error("Register error:", error);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
