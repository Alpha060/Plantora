"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
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

const categories = [
  { name: "Flowers & Bouquets", slug: "flowers-bouquets", icon: "🌸" },
  { name: "Plants", slug: "plants", icon: "🌿" },
  { name: "Pots & Accessories", slug: "pots-accessories", icon: "🪴" },
];

const navLinks = [
  { name: "Shop", href: "/shop" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, toggleSearch } =
    useUIStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const { user, isAuthenticated, isLoading: isAuthLoading, clearUser } = useAuthStore();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    router.push("/");
    router.refresh();
  };

  const userInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

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
              +91 XXXXXXXXXX
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/track-order" className="hover:underline">
              Track Order
            </Link>
            <Link href="/become-a-seller" className="hover:underline">
              Sell on {APP_NAME}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
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
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleSearch}
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="relative" nativeButton={false} render={<Link href="/account/wishlist" />}>
                <Heart className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="relative" nativeButton={false} render={<Link href="/cart" />}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-emerald-600">
                    {totalItems()}
                  </Badge>
                )}
              </Button>

              {isAuthLoading ? (
                <div className="size-8 rounded-lg flex items-center justify-center">
                  <div className="size-5 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
                </div>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="inline-flex items-center justify-center size-9 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs hover:bg-emerald-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      />
                    }
                  >
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || "Profile"}
                        className="size-9 rounded-full object-cover"
                      />
                    ) : (
                      userInitials
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-0">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-emerald-50/50 border-b">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
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

                    {/* Account Links */}
                    <div className="py-1.5">
                      <Link href="/account/profile">
                        <DropdownMenuItem className="gap-3 px-4 py-2.5 cursor-pointer">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>My Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/account/orders">
                        <DropdownMenuItem className="gap-3 px-4 py-2.5 cursor-pointer">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span>My Orders</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/account/addresses">
                        <DropdownMenuItem className="gap-3 px-4 py-2.5 cursor-pointer">
                          <MapPinned className="h-4 w-4 text-gray-500" />
                          <span>Saved Addresses</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/account/wishlist">
                        <DropdownMenuItem className="gap-3 px-4 py-2.5 cursor-pointer">
                          <Heart className="h-4 w-4 text-gray-500" />
                          <span>My Wishlist</span>
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

                    {/* Become Seller / Track Order */}
                    <div className="py-1.5">
                      <Link href="/become-a-seller">
                        <DropdownMenuItem className="gap-3 px-4 py-2.5 cursor-pointer">
                          <Store className="h-4 w-4 text-gray-500" />
                          <span>Become a Seller</span>
                        </DropdownMenuItem>
                      </Link>
                    </div>

                    <DropdownMenuSeparator className="my-0" />

                    {/* Logout */}
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
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white hidden sm:flex"
                    nativeButton={false}
                    render={<Link href="/login" />}
                  >
                    Login
                  </Button>
                  <Button variant="ghost" size="icon" className="sm:hidden" nativeButton={false} render={<Link href="/login" />}>
                    <User className="h-5 w-5" />
                  </Button>
                </>
              )}

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
                          pathname === link.href
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
                          {cat.icon} {cat.name}
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
        <div className="hidden md:block border-t bg-gray-50/50">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1 h-10 text-sm">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop/${cat.slug}`}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${
                    pathname.includes(cat.slug)
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-gray-600"
                  }`}
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
              <div className="h-4 w-px bg-gray-300 mx-2" />
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors hover:bg-gray-100 ${
                    pathname === link.href ? "text-emerald-700" : "text-gray-600"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
