"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  ShoppingBag,
  Truck,
  Star,
  DollarSign,
  Ticket,
  Image,
  FileText,
  Bell,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  Leaf,
  User,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { APP_NAME } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarSection {
  title: string;
  links: { name: string; href: string; icon: React.ElementType }[];
}

const sections: SidebarSection[] = [
  {
    title: "Overview",
    links: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { name: "Sellers", href: "/admin/sellers", icon: Store },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: FileText },
      { name: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "Orders & Delivery",
    links: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { name: "Riders", href: "/admin/riders", icon: Truck },
      { name: "Returns", href: "/admin/returns", icon: Undo2 },
    ],
  },
  {
    title: "Finance",
    links: [
      { name: "Settlements", href: "/admin/finance/settlements", icon: DollarSign },
      { name: "COD Collections", href: "/admin/finance/cod", icon: DollarSign },
      { name: "Revenue", href: "/admin/finance/revenue", icon: BarChart3 },
    ],
  },
  {
    title: "Content",
    links: [
      { name: "Reviews", href: "/admin/reviews", icon: Star },
      { name: "Coupons", href: "/admin/coupons", icon: Ticket },
      { name: "Banners", href: "/admin/cms/banners", icon: Image },
      { name: "Services", href: "/admin/services", icon: Package },
    ],
  },
  {
    title: "System",
    links: [
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      { name: "Reports", href: "/admin/reports", icon: BarChart3 },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar — Dark theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-slate-900 text-white transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-60"
        } hidden md:flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-bold">{APP_NAME}</p>
                <p className="text-[10px] text-slate-400">Admin Panel</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={toggleSidebar}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-3 px-2">
          {sections.map((section) => (
            <div key={section.title} className="mb-3">
              {!isSidebarCollapsed && (
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-3 py-1.5">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(link.href + "/");

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      title={isSidebarCollapsed ? link.name : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                        isActive
                          ? "bg-emerald-600/20 text-emerald-400"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isSidebarCollapsed && <span>{link.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="p-2 border-t border-slate-700">
          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-slate-800 w-full transition-colors ${
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
        <header className="h-16 bg-white border-b sticky top-0 z-30 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">
            {sections
              .flatMap((s) => s.links)
              .find(
                (l) =>
                  pathname === l.href || pathname.startsWith(l.href + "/")
              )?.name || "Admin"}
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/notifications/send">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
