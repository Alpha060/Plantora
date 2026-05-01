import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RiderDashboardShell } from "@/components/rider/dashboard-shell";

/**
 * Server-side rider layout guard.
 * Verifies the user is authenticated AND has the "rider" role before
 * rendering the dashboard shell. Defense-in-depth layer.
 */
export default async function RiderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/rider/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_blocked, is_active")
    .eq("id", user.id)
    .single();

  // No profile or wrong role → bounce out
  if (!profile || (profile.role !== "rider" && profile.role !== "admin")) {
    redirect("/");
  }

  // Blocked or deactivated
  if (profile.is_blocked || profile.is_active === false) {
    redirect("/login?error=blocked");
  }

  return <RiderDashboardShell>{children}</RiderDashboardShell>;
}
