import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/constants";

// ── Types ────────────────────────────────────────────────────────────

/** Authenticated user context returned by the guard helpers. */
export interface AuthContext {
  userId: string;
  role: UserRole;
  isBlocked: boolean;
  isActive: boolean;
}

/** Standard error response shape. */
type ErrorResponse = NextResponse<{ error: string }>;

/** Result of an auth guard: either a verified context or an error response. */
type GuardResult =
  | { ok: true; ctx: AuthContext }
  | { ok: false; response: ErrorResponse };

// ── Core: verify any authenticated user ──────────────────────────────

/**
 * Verifies the request is from an authenticated, active, unblocked user.
 * Returns the user context or a 401/403 NextResponse.
 *
 * Usage in API routes:
 * ```ts
 * const guard = await requireAuth();
 * if (!guard.ok) return guard.response;
 * const { userId, role } = guard.ctx;
 * ```
 */
export async function requireAuth(): Promise<GuardResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_blocked, is_active")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "User profile not found" },
        { status: 401 }
      ),
    };
  }

  if (profile.is_blocked) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Account has been blocked" },
        { status: 403 }
      ),
    };
  }

  if (profile.is_active === false) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    ctx: {
      userId: user.id,
      role: profile.role as UserRole,
      isBlocked: Boolean(profile.is_blocked),
      isActive: Boolean(profile.is_active ?? true),
    },
  };
}

// ── Role-specific guards ─────────────────────────────────────────────

/**
 * Verifies the request is from an authenticated user whose role matches
 * one of the `allowedRoles`.
 *
 * Usage:
 * ```ts
 * const guard = await requireRole(["admin"]);
 * if (!guard.ok) return guard.response;
 * ```
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<GuardResult> {
  const result = await requireAuth();
  if (!result.ok) return result;

  if (!allowedRoles.includes(result.ctx.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}

/** Shorthand: require admin role. */
export async function requireAdmin(): Promise<GuardResult> {
  return requireRole(["admin"]);
}

/** Shorthand: require seller or admin role. */
export async function requireSeller(): Promise<GuardResult> {
  return requireRole(["seller", "admin"]);
}

/** Shorthand: require rider or admin role. */
export async function requireRider(): Promise<GuardResult> {
  return requireRole(["rider", "admin"]);
}

/** Shorthand: require buyer role (or any authenticated user). */
export async function requireBuyer(): Promise<GuardResult> {
  return requireAuth();
}
