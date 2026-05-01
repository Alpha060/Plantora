import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

const DEV_PASSWORD = "dev-bypass-password-123!";

/**
 * GET /api/auth/dev-callback?phone=9876543210&redirect=/&mode=login
 * Dev-only: authenticates user, sets cookies, redirects.
 * mode=login  → only works for users who have a profile in the users table
 * mode=register → creates auth user if needed (profile created separately)
 */
export async function GET(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEV_OTP_BYPASS !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const phone = request.nextUrl.searchParams.get("phone");
  const redirect = request.nextUrl.searchParams.get("redirect") || "/";
  const mode = request.nextUrl.searchParams.get("mode") || "login";

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.redirect(new URL("/login?error=invalid_phone", request.url));
  }

  const fullPhone = `+91${phone}`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Admin client for user management
  const admin = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // For LOGIN mode: check that a profile exists in the users table first
    if (mode === "login") {
      const { data: profile } = await admin
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (!profile) {
        const errorUrl = new URL("/login", request.url);
        errorUrl.searchParams.set("error", "not_registered");
        return NextResponse.redirect(errorUrl);
      }
    }

    // Find or create auth user
    let userId: string;

    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      phone: fullPhone,
      phone_confirm: true,
      password: DEV_PASSWORD,
    });

    if (createError) {
      if (createError.code === "phone_exists") {
        const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
        const existing = listData?.users?.find(
          (u) => u.phone === fullPhone || u.phone === fullPhone.replace("+", "")
        );
        if (!existing) {
          return NextResponse.redirect(new URL("/login?error=user_not_found", request.url));
        }
        await admin.auth.admin.updateUserById(existing.id, { password: DEV_PASSWORD });
        userId = existing.id;
      } else {
        console.error("Dev callback error:", createError);
        return NextResponse.redirect(new URL("/login?error=create_failed", request.url));
      }
    } else {
      userId = newUser.user!.id;
    }

    // Sign in with password to get tokens
    const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: anonKey },
      body: JSON.stringify({ phone: fullPhone, password: DEV_PASSWORD }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Dev callback sign-in error:", tokenData);
      return NextResponse.redirect(new URL("/login?error=signin_failed", request.url));
    }

    // Build response with redirect
    const redirectUrl = new URL(redirect, request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Create a Supabase SSR client that writes cookies to the response
    const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // Set the session — this writes auth cookies to the response
    await supabase.auth.setSession({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });

    return response;
  } catch (error) {
    console.error("Dev callback error:", error);
    return NextResponse.redirect(new URL("/login?error=internal", request.url));
  }
}

