import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { ROLE_DASHBOARDS, type UserRole } from "@/lib/constants";

export async function proxy(request: NextRequest) {
  const { supabase, user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Public routes — always accessible
  if (
    pathname === "/" ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/product/") ||
    pathname.startsWith("/services") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/refund-policy") ||
    pathname.startsWith("/track-order") ||
    pathname.startsWith("/become-a-seller") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return supabaseResponse;
  }

  // Auth routes — redirect to dashboard if already logged in
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (user) {
      // Get user role
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = (profile?.role || "buyer") as UserRole;
      const dashboardUrl = new URL(ROLE_DASHBOARDS[role], request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return supabaseResponse;
  }

  // Protected routes — redirect to login if not authenticated
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user role for role-based access
  const { data: profile } = await supabase
    .from("users")
    .select("role, is_blocked")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Blocked user
  if (profile.is_blocked) {
    const blockedUrl = new URL("/login?error=blocked", request.url);
    return NextResponse.redirect(blockedUrl);
  }

  const role = profile.role as UserRole;

  // Role-based route protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role], request.url));
  }

  if (pathname.startsWith("/seller") && role !== "seller" && role !== "admin") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role], request.url));
  }

  if (pathname.startsWith("/rider") && role !== "rider" && role !== "admin") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role], request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
