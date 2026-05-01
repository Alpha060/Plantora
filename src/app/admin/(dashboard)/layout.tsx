import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardShell } from "@/components/admin/dashboard-shell";

/**
 * Server-side admin layout guard.
 * Verifies the user is authenticated AND has the "admin" role before
 * rendering the dashboard shell. This is a defense-in-depth layer
 * in addition to the proxy (middleware) check.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_blocked, is_active")
    .eq("id", user.id)
    .single();

  // No profile or wrong role → bounce out
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Blocked or deactivated
  if (profile.is_blocked || profile.is_active === false) {
    redirect("/login?error=blocked");
  }

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
