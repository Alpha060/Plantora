import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({
  items,
  showHome = true,
  className,
}: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: "Home", href: "/" }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;

        return (
          <span key={item.label} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-emerald-600 transition-colors flex items-center gap-1"
              >
                {index === 0 && showHome && (
                  <Home className="h-3.5 w-3.5" />
                )}
                {index === 0 && showHome ? (
                  <span className="sr-only">{item.label}</span>
                ) : (
                  item.label
                )}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
