import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const DEV_PASSWORD = "dev-bypass-password-123!";

/**
 * POST /api/auth/dev-verify
 * Dev-only: bypasses real OTP. Accepts any 6-digit code.
 * Creates user via admin API if needed, then signs in with a temp password.
 */
export async function POST(request: NextRequest) {
  // Block in production
  if (process.env.NEXT_PUBLIC_DEV_OTP_BYPASS !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  try {
    const { phone } = await request.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }

    const fullPhone = `+91${phone}`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const admin = createClient<Database>(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try creating user first; if phone already exists, find and update
    let userId: string;

    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      phone: fullPhone,
      phone_confirm: true,
      password: DEV_PASSWORD,
    });

    if (createError) {
      if (createError.code === "phone_exists") {
        // User exists — find them and update password
        const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
        const existing = listData?.users?.find((u) => u.phone === fullPhone);

        if (!existing) {
          // Fallback: search without + prefix
          const existing2 = listData?.users?.find((u) => u.phone === fullPhone.replace("+", ""));
          if (!existing2) {
            return NextResponse.json({ error: "User exists but couldn't be found" }, { status: 500 });
          }
          await admin.auth.admin.updateUserById(existing2.id, { password: DEV_PASSWORD });
          userId = existing2.id;
        } else {
          await admin.auth.admin.updateUserById(existing.id, { password: DEV_PASSWORD });
          userId = existing.id;
        }
      } else {
        console.error("Dev verify: create user error", createError);
        return NextResponse.json(
          { error: createError.message || "Failed to create user" },
          { status: 500 }
        );
      }
    } else {
      userId = newUser.user!.id;
    }

    // Sign in with password to get real session tokens
    const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify({
        phone: fullPhone,
        password: DEV_PASSWORD,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Dev verify: sign-in error", tokenData);
      return NextResponse.json(
        { error: tokenData.error_description || "Sign-in failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
      },
      user: {
        id: userId,
        phone: fullPhone,
      },
    });
  } catch (error) {
    console.error("Dev verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
