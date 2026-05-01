"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Settings, DollarSign, Truck, CreditCard, Shield, Globe, Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface PlatformSetting {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
}

const settingsSections = [
  { key: "commission", label: "Commission Settings", description: "Configure seller commission rates", icon: DollarSign, color: "bg-emerald-50 text-emerald-600", href: "/admin/settings/commission" },
  { key: "delivery", label: "Delivery Settings", description: "Manage delivery zones, fees, and slots", icon: Truck, color: "bg-blue-50 text-blue-600", href: "/admin/settings/delivery" },
  { key: "payment", label: "Payment Settings", description: "Configure payment gateways and COD limits", icon: CreditCard, color: "bg-purple-50 text-purple-600", href: "/admin/settings/payment" },
  { key: "seller-approval", label: "Seller Approval", description: "Set verification requirements for sellers", icon: Shield, color: "bg-amber-50 text-amber-600", href: "/admin/settings/seller-approval" },
  { key: "seo", label: "SEO & Meta", description: "Platform meta tags and SEO configuration", icon: Globe, color: "bg-indigo-50 text-indigo-600", href: "/admin/settings/seo" },
  { key: "contact", label: "Contact & WhatsApp", description: "Update phone number, WhatsApp, and support email", icon: Phone, color: "bg-green-50 text-green-600", href: "/admin/settings/contact" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (res.ok) setSettings(json.settings);
      else toast.error(json.error || "Failed to load settings");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return <LoadingSpinner text="Loading settings..." className="h-64" />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure global platform parameters</p>
      </div>

      <Card className="shadow-sm border-emerald-100/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-emerald-600 animate-spin" style={{ animationDuration: "3s" }} />
            <div>
              <p className="text-sm font-medium text-gray-900">{settings.length} settings configured</p>
              <p className="text-xs text-muted-foreground">All settings use the platform_settings table with JSON values</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {settingsSections.map((section) => (
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
