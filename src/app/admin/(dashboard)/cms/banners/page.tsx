"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function AdminBannersAddPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("hero");
  const [sortOrder, setSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!imageUrl.trim()) { toast.error("Image URL is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          image_url: imageUrl.trim(),
          link_url: linkUrl.trim() || null,
          position,
          sort_order: parseInt(sortOrder, 10) || 0,
        }),
      });
      const json = await res.json();
      if (res.ok) { toast.success("Banner created"); router.push("/admin/cms"); }
      else toast.error(json.error || "Failed to create");
    } catch { toast.error("Failed to create"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/cms"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Add Banner</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a new promotional banner</p>
        </div>
      </div>
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50"><CardTitle className="text-base">Banner Details</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="Optional banner title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Image URL *</Label>
            <Input placeholder="https://example.com/banner.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            {imageUrl && (
              <div className="h-32 bg-gray-100 rounded-lg overflow-hidden mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Link URL</Label>
            <Input placeholder="e.g. /shop?sale=weekend" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={position} onValueChange={(v) => { if (v) setPosition(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
          </div>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleCreate} disabled={saving}>
            <ImageIcon className="h-4 w-4 mr-2" />{saving ? "Creating..." : "Create Banner"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
