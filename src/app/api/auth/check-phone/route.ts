import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/auth/check-phone?phone=9876543210
 * Checks if a phone number has a registered profile in the users table.
 */
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ exists: false, error: "Invalid phone" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("phone", phone)
    .single();

  return NextResponse.json({ exists: !!data });
}
