"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Shop", href: "/shop", icon: Search },
  { name: "Cart", href: "/cart", icon: ShoppingCart, showBadge: true },
  { name: "Wishlist", href: "/account/wishlist", icon: Heart },
  { name: "Account", href: "/account/profile", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive
                  ? "text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.showBadge && totalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-3 h-4 min-w-4 flex items-center justify-center p-0 text-[9px] bg-emerald-600">
                    {totalItems()}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
