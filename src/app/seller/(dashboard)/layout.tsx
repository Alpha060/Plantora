"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  DollarSign,
  Wallet,
  Star,
  Store,
  User,
  Bell,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { APP_NAME } from "@/lib/constants";

const sidebarLinks = [
  { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/seller/products", icon: Package },
  { name: "Orders", href: "/seller/orders", icon: ShoppingBag },
  { name: "Earnings", href: "/seller/earnings", icon: DollarSign },
  { name: "Settlements", href: "/seller/settlements", icon: Wallet },
  { name: "Reviews", href: "/seller/reviews", icon: Star },
  { name: "Store Settings", href: "/seller/store-settings", icon: Store },
  { name: "Profile", href: "/seller/profile", icon: User },
  { name: "Notifications", href: "/seller/notifications", icon: Bell },
];

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r shadow-sm transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-60"
        } hidden md:flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-800">{APP_NAME}</p>
                <p className="text-[10px] text-muted-foreground">Seller Hub</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={toggleSidebar}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Links */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                title={isSidebarCollapsed ? link.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50"
                } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!isSidebarCollapsed && <span>{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t">
          <button
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors ${
              isSidebarCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-16" : "md:ml-60"
        }`}
      >
        {/* Topbar */}
        <header className="h-16 bg-white border-b sticky top-0 z-30 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">
            {sidebarLinks.find(
              (l) =>
                pathname === l.href || pathname.startsWith(l.href + "/")
            )?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/seller/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/seller/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
