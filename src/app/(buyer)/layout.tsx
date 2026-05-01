import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import MobileNav from "@/components/shared/mobile-nav";

/**
 * Server-side buyer layout guard.
 * Verifies the user is authenticated before rendering account pages.
 * Any authenticated user can access buyer routes (all roles can shop).
 */
export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  // Check blocked / deactivated
  const { data: profile } = await supabase
    .from("users")
    .select("is_blocked, is_active")
    .eq("id", user.id)
    .single();

  if (profile?.is_blocked || profile?.is_active === false) {
    redirect("/login?error=blocked");
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 w-full bg-white border-b" />}>
        <Header />
      </Suspense>
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <Footer />
      <MobileNav />
    </>
  );
}
