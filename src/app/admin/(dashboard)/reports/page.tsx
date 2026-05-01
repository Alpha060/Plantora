"use client";

import Link from "next/link";
import { BarChart3, ShoppingBag, Users, Package, Truck, Store, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const reportSections = [
  { key: "sales", label: "Sales Reports", description: "Revenue trends, order volume, and average order value", icon: BarChart3, color: "bg-emerald-50 text-emerald-600", href: "/admin/reports/sales" },
  { key: "products", label: "Product Reports", description: "Best sellers, stock levels, and category performance", icon: Package, color: "bg-blue-50 text-blue-600", href: "/admin/reports/products" },
  { key: "customers", label: "Customer Reports", description: "New signups, retention, and lifetime value", icon: Users, color: "bg-purple-50 text-purple-600", href: "/admin/reports/customers" },
  { key: "sellers", label: "Seller Reports", description: "Seller performance, commission, and settlement data", icon: Store, color: "bg-amber-50 text-amber-600", href: "/admin/reports/sellers" },
  { key: "riders", label: "Rider Reports", description: "Delivery metrics, COD collection, and performance", icon: Truck, color: "bg-indigo-50 text-indigo-600", href: "/admin/reports/riders" },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Analytics & Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive data on sales, growth, and platform performance</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {reportSections.map((section) => (
          <Link key={section.key} href={section.href}>
            <Card className="shadow-sm border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${section.color}`}>
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{section.label}</p>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
