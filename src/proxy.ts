import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { ROLE_DASHBOARDS, type UserRole } from "@/lib/constants";

// ── Auth routes: logged-in users get redirected to their dashboard ────
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/seller/login",
  "/seller/register",
  "/admin/login",
  "/rider/login",
];

// ── Allowed roles per route prefix (defense-in-depth) ────────────────
// Only the specified roles may access routes starting with the given prefix.
// Admin gets access to seller/rider areas for support/management purposes.
const ROLE_ROUTE_MAP: Record<string, UserRole[]> = {
  "/admin":  ["admin"],
  "/seller": ["seller", "admin"],
  "/rider":  ["rider", "admin"],
  // Buyer routes (/account, /checkout, etc.) require any authenticated role
};

function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/product/") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/services") ||
    pathname.startsWith("/landscape") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/refund-policy") ||
    pathname.startsWith("/track-order") ||
    pathname.startsWith("/verify-otp") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Injects common security headers onto every response.
 * These protect against click-jacking, MIME-sniffing, referrer leaks, etc.
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(self)"
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Normalise /Landscape → /landscape (case-insensitive redirect) ──
  if (pathname === "/Landscape" || pathname.startsWith("/Landscape/")) {
    const normalizedUrl = new URL(
      pathname.replace(/^\/Landscape/, "/landscape"),
      request.url
    );
    return NextResponse.redirect(normalizedUrl, 308);
  }

  // ── Public routes — always accessible ──────────────────────────────
  if (isPublicRoute(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // ── Supabase session refresh + JWT claim extraction ────────────────
  const { supabase, claims, supabaseResponse } = await updateSession(request);

  // ── Auth routes — redirect to dashboard if already logged in ───────
  if (isAuthRoute(pathname)) {
    // Generic buyer auth pages (/login, /register, /forgot-password) are always accessible
    if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
      return addSecurityHeaders(supabaseResponse);
    }

    if (claims) {
      const userId = claims.sub as string;
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      const role = (profile?.role || "buyer") as UserRole;

      // Allow buyers to visit /seller/register or /seller/login
      // (they're upgrading their account)
      if (
        (pathname === "/seller/register" || pathname === "/seller/login") &&
        role === "buyer"
      ) {
        return addSecurityHeaders(supabaseResponse);
      }

      // Otherwise redirect to their dashboard
      const dashboardUrl = new URL(ROLE_DASHBOARDS[role], request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return addSecurityHeaders(supabaseResponse);
  }

  // ── Protected routes — redirect to login if not authenticated ──────
  if (!claims) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Get user role for role-based access ────────────────────────────
  const userId = claims.sub as string;
  const { data: profile } = await supabase
    .from("users")
    .select("role, is_blocked, is_active")
    .eq("id", userId)
    .single();

  if (!profile) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ── Blocked user — sign out and redirect ───────────────────────────
  if (profile.is_blocked) {
    await supabase.auth.signOut();
    const blockedUrl = new URL("/login?error=blocked", request.url);
    return NextResponse.redirect(blockedUrl);
  }

  // ── Deactivated user — sign out and redirect ───────────────────────
  if (profile.is_active === false) {
    await supabase.auth.signOut();
    const deactivatedUrl = new URL("/login?error=deactivated", request.url);
    return NextResponse.redirect(deactivatedUrl);
  }

  const role = profile.role as UserRole;

  // ── Role-based route guard (deny-by-default for role prefixes) ─────
  for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTE_MAP)) {
    if (pathname.startsWith(prefix) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(
        new URL(ROLE_DASHBOARDS[role], request.url)
      );
    }
  }

  return addSecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
