"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Star, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { ImageUpload } from "@/components/shared/image-upload";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  is_featured: boolean;
  created_at: string;
}

export default function AdminLandscapeGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const fetchGallery = async () => {
    try {
      const res = await fetch("/api/landscape-gallery");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages(data);
    } catch (err) {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAddImage = async () => {
    if (!newImageUrl) {
      toast.error("Please upload an image first");
      return;
    }
    
    setUploading(true);
    try {
      const res = await fetch("/api/landscape-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: newImageUrl,
          title: newTitle || null,
          is_featured: false
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Image added to gallery");
      setNewImageUrl("");
      setNewTitle("");
      fetchGallery();
    } catch (err: any) {
      toast.error(err.message || "Failed to add image");
    } finally {
      setUploading(false);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/landscape-gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setImages(images.map(img => img.id === id ? { ...img, is_featured: !currentStatus } : img));
      toast.success(currentStatus ? "Removed from featured" : "Added to featured");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await fetch(`/api/landscape-gallery/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete image");
      
      setImages(images.filter(img => img.id !== id));
      toast.success("Image deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landscape Gallery"
        description="Manage images shown on the landscape page and main page."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageUpload
                bucket="store-assets"
                value={newImageUrl ? [newImageUrl] : []}
                onChange={(urls) => setNewImageUrl(urls[0] || "")}
                maxImages={1}
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title (Optional)</label>
                <Input
                  placeholder="e.g. Balcony Garden Design"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleAddImage} 
                disabled={!newImageUrl || uploading}
                className="w-full gap-2"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add to Gallery
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-surface-low rounded-lg border border-dashed border-border">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No images in gallery yet.</p>
          </div>
        ) : (
          images.map((img) => (
            <Card key={img.id} className="overflow-hidden group relative">
              <div className="aspect-4/3 bg-surface-low relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.title || "Gallery image"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => toggleFeatured(img.id, img.is_featured)}
                    title={img.is_featured ? "Remove from Main Page" : "Feature on Main Page"}
                    className={img.is_featured ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : ""}
                  >
                    <Star className={`h-4 w-4 ${img.is_featured ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteImage(img.id)}
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {img.is_featured && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </div>
                )}
              </div>
              {img.title && (
                <div className="p-3 border-t bg-white">
                  <p className="text-sm font-medium truncate">{img.title}</p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
