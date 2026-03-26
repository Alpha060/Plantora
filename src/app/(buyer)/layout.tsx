import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import MobileNav from "@/components/shared/mobile-nav";
import {
  User,
  Package,
  MapPin,
  Heart,
  Bell,
  LogOut,
} from "lucide-react";

const sidebarLinks = [
  { name: "Profile", href: "/account/profile", icon: User },
  { name: "My Orders", href: "/account/orders", icon: Package },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Wishlist", href: "/account/wishlist", icon: Heart },
  { name: "Notifications", href: "/account/notifications", icon: Bell },
];

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="flex gap-6">
          {/* Sidebar — Desktop */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border p-4 space-y-1">
              <h2 className="font-semibold text-sm text-muted-foreground px-3 py-2 uppercase tracking-wider">
                My Account
              </h2>
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-2 border-t mt-2">
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
      <MobileNav />
    </>
  );
}
