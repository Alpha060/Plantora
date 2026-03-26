import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
          <Icon className="h-4.5 w-4.5 text-emerald-600" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                isPositive ? "text-emerald-600" : "text-red-600"
              )}
            >
              {isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
