"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Image as ImageIcon, Layout, Plus, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";

interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const positionColors: Record<string, string> = {
  hero: "bg-purple-100 text-purple-700 border-purple-200",
  middle: "bg-blue-100 text-blue-700 border-blue-200",
  bottom: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function AdminCMSPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const json = await res.json();
      if (res.ok) setBanners(json.banners);
      else toast.error(json.error || "Failed to load banners");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const heroBanners = banners.filter((b) => b.position === "hero");
  const middleBanners = banners.filter((b) => b.position === "middle");
  const bottomBanners = banners.filter((b) => b.position === "bottom");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Content Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage banners and marketing content</p>
        </div>
        <Link href="/admin/cms/banners">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" />Add Banner
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{banners.length}</p>
          <p className="text-xs text-muted-foreground">Total Banners</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{banners.filter((b) => b.is_active).length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{heroBanners.length}</p>
          <p className="text-xs text-muted-foreground">Hero Banners</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading banners..." className="h-64" />
      ) : banners.length === 0 ? (
        <EmptyState icon={Layout} title="No banners" description="Add your first banner to showcase on the storefront." />
      ) : (
        <div className="space-y-6">
          {[
            { label: "Hero", items: heroBanners },
            { label: "Middle", items: middleBanners },
            { label: "Bottom", items: bottomBanners },
          ].map((section) => section.items.length > 0 && (
            <div key={section.label}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{section.label} Banners</h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {section.items.map((banner) => (
                  <Card key={banner.id} className={`shadow-sm overflow-hidden ${!banner.is_active ? "opacity-60" : ""}`}>
                    <div className="h-36 bg-gray-100 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={banner.image_url} alt={banner.title || "Banner"} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] ${positionColors[banner.position] || positionColors.hero}`}>
                          {banner.position}
                        </Badge>
                        {banner.is_active ? (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" />Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 text-[10px] px-2 py-0.5 rounded-full">
                            <XCircle className="h-3 w-3 mr-0.5" />Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm text-gray-900 truncate">{banner.title || "Untitled"}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                        <span>Order: {banner.sort_order}</span>
                        {banner.link_url && (
                          <span className="flex items-center gap-0.5"><ExternalLink className="h-3 w-3" />Has link</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
