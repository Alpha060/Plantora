"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Phone,
  MapPin,
  Leaf,
  Package,
  MapPinned,
  Bell,
  LogOut,
  Store,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";
import { useContact } from "@/hooks/use-contact";
import { useIsClient } from "@/hooks/use-is-client";

const categories = [
  { name: "Flowers", slug: "flowers" },
  { name: "Plants", slug: "plants" },
  { name: "Pots & Accessories", slug: "pots-accessories" },
  { name: "Gifts", slug: "gifts" },
  { name: "Occasions", slug: "occasions" },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Landscaping Services", href: "/landscape" },
  { name: "Contact Us", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { contact, formatPhone } = useContact();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, toggleSearch } =
    useUIStore();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const { user, isAuthenticated, isLoading: isAuthLoading, clearUser } = useAuthStore();
  const isClient = useIsClient();

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setLoadingOrders(true);
      fetch(`/api/orders?pageSize=3`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data) setRecentOrders(json.data.slice(0, 3));
          setLoadingOrders(false);
        })
        .catch(() => setLoadingOrders(false));
    }
  }, [isAuthenticated, user?.id]);

  const handleLogout = () => {
    clearUser();
    const supabase = createClient();
    supabase.auth.signOut().catch(() => {});
    window.location.assign("/api/auth/logout");
  };

  const userInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const currentCategory = searchParams.get("category");
  const normalizedPathname =
    pathname === "/services" ? "/landscape" : pathname;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-emerald-800 text-white text-xs py-1.5">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Daltonganj, Jharkhand
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span className="font-medium text-xs hidden sm:inline-block" suppressHydrationWarning>
                {isClient ? formatPhone(contact.phone) : ""}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/track-order" className="hover:underline">
              Track Order
            </Link>
            {!isAuthenticated && (
              <Link href="/seller/register" className="hover:underline">
                Sell on {APP_NAME}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-emerald-800 tracking-tight">
                {APP_NAME}
              </span>
            </Link>

            {/* Search Bar — Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search flowers, plants, bouquets..."
                  className="w-full h-10 pl-10 pr-4 rounded-full border border-emerald-200 bg-emerald-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                  onClick={toggleSearch}
                  readOnly
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 md:gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleSearch}
              >
                <Search className="h-5 w-5" />
              </Button>

              <div className="hidden md:flex items-center gap-6">
                {isAuthLoading ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="size-5 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-2.5 w-8 rounded bg-gray-200 animate-pulse hidden sm:block" />
                </div>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="cursor-pointer flex flex-col items-center gap-1 hover:text-emerald-700 transition-colors focus:outline-none">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.full_name || "Profile"}
                        width={20}
                        height={20}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                    <span className="text-[10px] font-medium text-gray-600">Profile</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-0">
                    <div className="px-4 py-3 bg-emerald-50/50 border-b">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center shrink-0">
                          {userInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {user?.full_name || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.phone ? `+91 ${user.phone}` : user?.email || "Welcome!"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2 border-b">
                      <div className="px-4 flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Recent Orders</span>
                      </div>
                      {loadingOrders ? (
                        <div className="px-4 py-2 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-emerald-600" /></div>
                      ) : recentOrders.length > 0 ? (
                        <div className="space-y-1">
                          {recentOrders.map((order) => (
                            <Link key={order.id} href={`/account/orders/${order.id}`}>
                              <DropdownMenuItem className="cursor-pointer px-4 py-2 gap-3 group">
                                <Package className="h-4 w-4 text-emerald-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-0.5">
                                    <p className="text-xs font-semibold text-gray-900 truncate">#{order.order_number}</p>
                                    <span className="text-[10px] text-gray-500 uppercase">{order.status}</span>
                                  </div>
                                  <p className="text-[10px] text-gray-500">₹{order.total}</p>
                                </div>
                              </DropdownMenuItem>
                            </Link>
                          ))}
                          <div className="px-4 pt-1 pb-1">
                            <Link href="/account/orders" className="block w-full text-center py-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors">
                              View all orders
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-center text-xs text-gray-500">
                          No recent orders
                        </div>
                      )}
                    </div>
                    <div className="py-1.5">
                      <Link href="/account/profile">
                        <DropdownMenuItem className="gap-3 px-4 py-2.5 cursor-pointer">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>My Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/account/addresses">
                        <DropdownMenuItem className="gap-3 px-4 py-2.5 cursor-pointer">
                          <MapPinned className="h-4 w-4 text-gray-500" />
                          <span>Saved Addresses</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/account/notifications">
                        <DropdownMenuItem className="gap-3 px-4 py-2.5 cursor-pointer">
                          <Bell className="h-4 w-4 text-gray-500" />
                          <span>Notifications</span>
                        </DropdownMenuItem>
                      </Link>
                    </div>
                    <DropdownMenuSeparator className="my-0" />
                    <div className="py-1.5">
                      <DropdownMenuItem
                        className="gap-3 px-4 py-2.5 text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-700 transition-colors">
                  <User className="h-5 w-5" />
                  <span className="text-[10px] font-medium hidden sm:block">Login</span>
                </Link>
              )}

              <Link href="/account/wishlist" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-700 transition-colors">
                <Heart className="h-5 w-5" />
                <span className="text-[10px] font-medium hidden sm:block">Wishlist</span>
              </Link>

              <Link href="/cart" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-700 transition-colors relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-[10px] font-medium hidden sm:block">Cart</span>
                {isClient && cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[9px] bg-emerald-600">
                    {cartCount}
                  </Badge>
                )}
              </Link>
              </div>




              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={toggleMobileMenu}>
                <SheetTrigger
                  render={
                    <Button variant="ghost" size="icon" className="md:hidden" />
                  }
                >
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetTitle className="flex items-center gap-2 mb-6">
                    <Leaf className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-emerald-800">
                      {APP_NAME}
                    </span>
                  </SheetTitle>
                  <nav className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          normalizedPathname === link.href
                            ? "bg-emerald-50 text-emerald-700"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                    <div className="pt-3 border-t">
                      <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        Categories
                      </p>
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/shop/${cat.slug}`}
                          onClick={closeMobileMenu}
                          className="block px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Categories Bar — Desktop */}
        <div className="hidden md:block border-t bg-white">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-between h-12 text-[13px] font-semibold tracking-wide">
              <Link
                href={navLinks[0].href}
                className={`transition-colors hover:text-emerald-700 ${
                  normalizedPathname === navLinks[0].href ? "text-emerald-700 border-b-2 border-emerald-700 py-3" : "text-gray-700"
                }`}
              >
                {navLinks[0].name}
              </Link>
              
              {categories.map((cat) => (
                <div key={cat.slug} className="group relative py-3">
                  <Link
                    href={`/shop/${cat.slug}`}
                    className={`transition-colors hover:text-emerald-700 flex items-center gap-1 ${
                      currentCategory === cat.slug
                        ? "text-emerald-700 border-b-2 border-emerald-700"
                        : "text-gray-700"
                    }`}
                  >
                    {cat.name} <ChevronDown className="h-3 w-3 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
                  </Link>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-left -translate-y-2 group-hover:translate-y-0">
                    <div className="py-2 flex flex-col">
                      <Link 
                        href={`/shop/${cat.slug}`} 
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        All {cat.name}
                      </Link>
                      <Link 
                        href={`/shop/${cat.slug}?sort=new`} 
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        New Arrivals
                      </Link>
                      <Link 
                        href={`/shop/${cat.slug}?sort=popular`} 
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        Best Sellers
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href={navLinks[1].href}
                className={`transition-colors hover:text-emerald-700 ${
                  normalizedPathname === navLinks[1].href ? "text-emerald-700 border-b-2 border-emerald-700 py-3" : "text-gray-700"
                }`}
              >
                {navLinks[1].name}
              </Link>

              <Link
                href={navLinks[2].href}
                className={`transition-colors hover:text-emerald-700 ${
                  normalizedPathname === navLinks[2].href ? "text-emerald-700 border-b-2 border-emerald-700 py-3" : "text-gray-700"
                }`}
              >
                {navLinks[2].name}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
