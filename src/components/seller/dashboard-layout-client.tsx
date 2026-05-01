"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
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
  ChevronRight,
  ChevronLeft,
  Leaf,
  LogOut,
  Menu,
  ChevronDown,
  Users,
  Tag,
  Truck,
  HeadphonesIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { APP_NAME } from "@/lib/constants";

const sidebarLinks = [
  { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/seller/products", icon: Package },
  { name: "Orders", href: "/seller/orders", icon: ShoppingBag, badge: 5 },
  { name: "Payments", href: "/seller/payments", icon: DollarSign },
  { name: "Payouts", href: "/seller/payouts", icon: Wallet },
  { name: "Customers", href: "/seller/customers", icon: Users },
  { name: "Reviews", href: "/seller/reviews", icon: Star },
  { name: "Discounts", href: "/seller/discounts", icon: Tag },
  { name: "Store Settings", href: "/seller/store-settings", icon: Store },
  { name: "Shipping", href: "/seller/shipping", icon: Truck },
  { name: "Profile", href: "/seller/profile", icon: User },
  { name: "Support", href: "/seller/support", icon: HeadphonesIcon },
];

export function SellerDashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, clearUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      clearUser();
      toast.success("Logged out successfully");
      router.push("/seller/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#014f36] text-white border-r border-[#016040] shadow-sm transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        } hidden md:flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#016040]">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded-full">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-wide">GreenBloom</p>
                <p className="text-[9px] text-white/70 uppercase tracking-widest">Daltanganj</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-white hover:bg-white/10"
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
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {!isSidebarCollapsed && (
            <p className="px-3 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 mt-2">Seller Panel</p>
          )}
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                title={isSidebarCollapsed ? link.name : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#016545] text-white shadow-sm"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!isSidebarCollapsed && <span>{link.name}</span>}
                </div>
                {!isSidebarCollapsed && link.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#016040]">
          <button
            onClick={handleLogout}
            className={`cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-colors ${
              isSidebarCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        {/* Topbar */}
        <header className="h-16 bg-white border-b sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex text-gray-400" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-gray-800 hidden sm:block">
              {sidebarLinks.find(
                (l) => pathname === l.href || pathname.startsWith(l.href + "/")
              )?.name || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-semibold text-emerald-700">Shop Status: Active</span>
            </div>

            <div className="flex items-center gap-4 border-l pl-6">
              <button className="cursor-pointer relative text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden">
                  {user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold">
                      {user?.full_name
                        ? user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "S"}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-sm">
                  <p className="font-bold text-gray-900 leading-none mb-1">
                    {user?.full_name || user?.email || "Seller"}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-none">
                    {user?.role === "seller" ? "GreenBloom Store" : "GreenBloom Seller"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
