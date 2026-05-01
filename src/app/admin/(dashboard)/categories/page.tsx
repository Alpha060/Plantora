"use client";

import { useEffect, useState, useCallback } from "react";
import { FolderTree, Plus, Package, CheckCircle2, XCircle, Edit2, Trash2, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { ImageUpload } from "@/components/shared/image-upload";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("none");
  const [imageUrl, setImageUrl] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (res.ok) setCategories(json.categories);
      else toast.error(json.error || "Failed to load categories");
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setParentId(cat.parent_id || "none");
    setImageUrl(cat.image_url ? [cat.image_url] : []);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setParentId("none");
    setImageUrl([]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    setSaving(true);
    try {
      const isEdit = !!editingCategory;
      const payload = {
        id: editingCategory?.id,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || null,
        parent_id: parentId === "none" ? null : parentId,
        image_url: imageUrl[0] || null,
      };

      const res = await fetch("/api/admin/categories", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(isEdit ? "Category updated" : "Category created");
        setDialogOpen(false);
        fetchData();
      } else {
        toast.error(json.error || "Failed to save category");
      }
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently delete the category.")) return;
    
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        toast.success("Category deleted");
        fetchData();
      } else {
        toast.error(json.error || "Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const parentCategories = categories.filter((c) => !c.parent_id);
  const childCategories = categories.filter((c) => c.parent_id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize products into categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto px-1">
              <div className="space-y-2">
                <Label>Category Image</Label>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  maxImages={1}
                  bucket="categories"
                />
              </div>

              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select value={parentId} onValueChange={(val) => setParentId(val || "none")}>
                  <SelectTrigger>
                    <SelectValue placeholder="No Parent (Top Level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent (Top Level)</SelectItem>
                    {parentCategories
                      .filter(pc => pc.id !== editingCategory?.id)
                      .map((pc) => (
                        <SelectItem key={pc.id} value={pc.id}>
                          {pc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="e.g. Indoor Plants"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  placeholder="e.g. indoor-plants"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Optional description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading categories..." className="h-64" />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories"
          description="Create your first category to organize products."
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {parentCategories.map((cat) => {
            const children = childCategories.filter((c) => c.parent_id === cat.id);
            return (
              <Card key={cat.id} className="shadow-sm border-gray-100 flex flex-col h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center overflow-hidden border border-emerald-100 shrink-0">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                        ) : (
                          <FolderTree className="h-6 w-6 text-emerald-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate leading-tight">{cat.name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">/{cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(cat)}>
                        <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-full">
                      <Package className="h-3 w-3" />
                      {cat.product_count} products
                    </span>
                    {children.length > 0 && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                        <LayoutGrid className="h-3 w-3" />
                        {children.length} sub-categories
                      </span>
                    )}
                  </div>

                  {children.length > 0 && (
                    <div className="mt-auto space-y-1.5 border-t pt-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sub-categories</p>
                      {children.map((child) => (
                        <div key={child.id} className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-gray-50/50 border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-gray-700 font-medium truncate">{child.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono opacity-60">({child.slug})</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditDialog(child)} className="p-1 hover:text-emerald-600 transition-colors">
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button onClick={() => handleDelete(child.id)} className="p-1 hover:text-red-600 transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
