import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SellerDashboardLayoutClient } from "@/components/seller/dashboard-layout-client";

/**
 * Server-side seller layout guard.
 * Verifies the user is authenticated AND has the "seller" (or "admin") role
 * before rendering the dashboard shell. Defense-in-depth layer.
 */
export default async function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/seller/login");
  }

  // Verify role + account status
  const { data: profile } = await supabase
    .from("users")
    .select("role, is_blocked, is_active")
    .eq("id", user.id)
    .single();

  // No profile or wrong role → bounce out
  if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
    redirect("/");
  }

  // Blocked or deactivated
  if (profile.is_blocked || profile.is_active === false) {
    redirect("/login?error=blocked");
  }

  // Check onboarding status for sellers (admins bypass)
  if (profile.role === "seller") {
    const { data: store } = await supabase
      .from("stores")
      .select("status, id")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      redirect("/seller/store");
    }

    // Check onboarding progress: documents and bank details
    const [docsResult, bankResult] = await Promise.all([
      supabase
        .from("seller_documents")
        .select("id")
        .eq("store_id", store.id)
        .single(),
      supabase
        .from("seller_bank_details")
        .select("id")
        .eq("store_id", store.id)
        .single(),
    ]);

    if (!docsResult.data) {
      redirect("/seller/documents");
    }

    if (!bankResult.data) {
      redirect("/seller/bank");
    }

    // Pending / rejected store — show approval page
    if (store.status === "pending" || store.status === "rejected") {
      redirect("/seller/pending-approval");
    }
  }

  return (
    <SellerDashboardLayoutClient>
      {children}
    </SellerDashboardLayoutClient>
  );
}
