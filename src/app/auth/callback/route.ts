import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback handler.
 * Exchanges the auth code for a session and redirects based on user role.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if public.users entry exists
        const { data: profile } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // New OAuth user — create a basic profile
          await supabase.from("users").insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            email: user.email || null,
            phone: user.phone || null,
            role: "buyer",
          });
          return NextResponse.redirect(new URL("/", requestUrl.origin));
        }

        // Redirect based on role
        if (profile.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", requestUrl.origin));
        } else if (profile.role === "seller") {
          return NextResponse.redirect(new URL("/seller/dashboard", requestUrl.origin));
        } else if (profile.role === "rider") {
          return NextResponse.redirect(new URL("/rider/dashboard", requestUrl.origin));
        }
      }
    }
  }

  // Default redirect
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
