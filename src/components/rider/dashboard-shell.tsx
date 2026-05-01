"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  DollarSign,
  User,
  Bell,
  LogOut,
  Leaf,
  ToggleLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";

const sidebarLinks = [
  { name: "Dashboard", href: "/rider/dashboard", icon: LayoutDashboard },
  { name: "Active Orders", href: "/rider/orders", icon: Package },
  { name: "Deliveries", href: "/rider/deliveries", icon: Truck },
  { name: "COD Collections", href: "/rider/cod-collections", icon: DollarSign },
  { name: "Earnings", href: "/rider/earnings", icon: DollarSign },
  { name: "Profile", href: "/rider/profile", icon: User },
  { name: "Notifications", href: "/rider/notifications", icon: Bell },
];

export function RiderDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-56 bg-white border-r hidden md:flex flex-col">
        <div className="h-16 flex items-center gap-2 px-4 border-b">
          <Leaf className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-emerald-800">{APP_NAME}</p>
            <p className="text-[10px] text-muted-foreground">Delivery Partner</p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2 text-sm">
            <ToggleLeft className="h-4 w-4 text-emerald-600" />
            <span className="font-medium">Available</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-56">
        <header className="h-16 bg-white border-b sticky top-0 z-30 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">
            {sidebarLinks.find(
              (l) => pathname === l.href || pathname.startsWith(l.href + "/")
            )?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/rider/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
