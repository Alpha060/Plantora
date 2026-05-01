import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

// API-specific schema for profile creation (password handled by Supabase Auth)
const registerApiSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number").optional().or(z.literal("")).nullable(),
});

// Roles that can be self-assigned during registration.
// "admin" is intentionally excluded — admins must be created manually.
const ALLOWED_SELF_ASSIGN_ROLES = ["buyer", "seller", "rider"] as const;
type SelfAssignRole = (typeof ALLOWED_SELF_ASSIGN_ROLES)[number];

function isAllowedRole(role: string): role is SelfAssignRole {
  return (ALLOWED_SELF_ASSIGN_ROLES as readonly string[]).includes(role);
}

/**
 * POST /api/auth/register
 * Creates a public.users profile record after Supabase auth signup.
 * Uses admin client to bypass RLS.
 *
 * SECURITY:
 * - The `role` field is validated against an allowlist.
 * - "admin" role cannot be self-assigned; it must be set manually
 *   in the database or via a dedicated admin endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the registration data
    const parsed = registerApiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const { full_name, phone, email } = parsed.data;
    const { id, role } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // ── Role validation: never allow self-assigning "admin" ──────────
    const safeRole: SelfAssignRole = isAllowedRole(role) ? role : "buyer";

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

    // Create the user profile — phone is optional (can be added in profile later)
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        id,
        full_name,
        phone: phone || null,
        email: email || null,
        role: safeRole,
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
