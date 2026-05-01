import { Suspense } from "react";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import MobileNav from "@/components/shared/mobile-nav";
import WhatsAppButton from "@/components/shared/whatsapp-button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-16 w-full bg-white border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </>
  );
}
