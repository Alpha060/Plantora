import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * GET /api/auth/logout
 * Server-side logout: clears auth cookies and redirects to home.
 */
export async function GET(request: NextRequest) {
  const redirectUrl = new URL("/", request.url);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  await supabase.auth.signOut();

  // Also manually delete any remaining supabase cookies
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.delete(cookie.name);
    }
  });

  return response;
}
