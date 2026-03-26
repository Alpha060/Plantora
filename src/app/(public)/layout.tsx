import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import MobileNav from "@/components/shared/mobile-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/91XXXXXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-4 z-40 h-12 w-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <span className="text-white text-xl">💬</span>
      </a>
    </>
  );
}
