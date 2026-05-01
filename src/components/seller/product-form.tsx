"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/shared/image-upload";
import { PRODUCT_UNITS, OCCASIONS, STORAGE_BUCKETS } from "@/lib/constants";
import type { Category } from "@/types";

// ---------- Schema ----------
const variantSchema = z.object({
  variant_name: z.string().min(1, "Required"),
  price: z.number().min(0, "Price must be positive"),
  sale_price: z.number().min(0).optional(),
  stock_qty: z.number().min(0),
  sku: z.string().optional(),
});

const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().min(1, "Price is required"),
  sale_price: z.number().min(0).optional(),
  sku: z.string().optional(),
  stock_qty: z.number().min(0),
  unit: z.string(),
  category_id: z.string().min(1, "Category is required"),
  occasion: z.string().optional(),
  care_instructions: z.string().optional(),
  tags: z.string().optional(), // comma separated
  is_featured: z.boolean(),
  is_active: z.boolean(),
  variants: z.array(variantSchema).optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: ProductFormData & { id?: string; images?: string[] };
  mode: "create" | "edit";
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.images || []
  );

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      sale_price: undefined,
      sku: "",
      stock_qty: 0,
      unit: "piece",
      category_id: "",
      occasion: "",
      care_instructions: "",
      tags: "",
      is_featured: false,
      is_active: true,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (res.ok && json.data) {
          // Flatten tree for select
          const flat: Category[] = [];
          for (const parent of json.data) {
            flat.push(parent);
            if (parent.children) {
              for (const child of parent.children) {
                flat.push(child);
              }
            }
          }
          setCategories(flat);
        }
      } catch {
        // silent
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = useCallback(
    async (data: ProductFormData) => {
      if (imageUrls.length === 0) {
        toast.error("Please upload at least one image");
        return;
      }

      setIsSaving(true);
      try {
        const payload = {
          ...data,
          tags: data.tags
            ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          images: imageUrls,
        };

        const url =
          mode === "edit" && initialData?.id
            ? `/api/products/${initialData.id}`
            : "/api/products";
        const method = mode === "edit" ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (!res.ok) {
          toast.error(json.error || "Operation failed");
          return;
        }

        toast.success(
          mode === "edit" ? "Product updated!" : "Product created! 🎉"
        );
        router.push("/seller/products");
        router.refresh();
      } catch {
        toast.error("Something went wrong");
      } finally {
        setIsSaving(false);
      }
    },
    [imageUrls, mode, initialData, router]
  );

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 max-w-4xl mx-auto pb-24">
      {/* Section 1: Basic Info */}
      <Card className="bg-surface-lowest border-0 shadow-ambient rounded-3xl overflow-hidden">
        <CardHeader className="bg-surface-container-lowest/50 px-8 pt-8 pb-6 border-b border-outline-variant/20">
          <CardTitle className="text-xl font-serif text-on-surface">Basic Information</CardTitle>
          <CardDescription className="text-on-surface-variant">Product name, category, and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 py-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-on-surface font-semibold">Product Name *</Label>
            <Input 
              id="name" 
              placeholder="e.g. Rare Monstera Albo" 
              className="h-12 bg-surface-container-low border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl px-4 text-base shadow-none"
              {...form.register("name")} 
            />
            {form.formState.errors.name && (
              <p className="text-xs text-error mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-on-surface font-semibold">Category *</Label>
              <Select
                value={form.watch("category_id") || ""}
                onValueChange={(val) => form.setValue("category_id", val ?? "")}
              >
                <SelectTrigger className="h-12 bg-surface-container-low border-0 shadow-none rounded-xl px-4 font-medium">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-ambient border-0 bg-surface-lowest">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="rounded-lg">
                      {c.parent_id ? `↳ ${c.name}` : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category_id && (
                <p className="text-xs text-error mt-1">{form.formState.errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-on-surface font-semibold">Occasion</Label>
              <Select
                value={form.watch("occasion") ?? "none"}
                onValueChange={(val) => form.setValue("occasion", !val || val === "none" ? undefined : val)}
              >
                <SelectTrigger className="h-12 bg-surface-container-low border-0 shadow-none rounded-xl px-4 font-medium">
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-ambient border-0 bg-surface-lowest">
                  <SelectItem value="none" className="rounded-lg">None</SelectItem>
                  {OCCASIONS.map((o) => (
                    <SelectItem key={o} value={o} className="rounded-lg">{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-on-surface font-semibold">Description</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe your plant's unique botanical traits..."
              className="bg-surface-container-low border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl px-4 py-3 text-base shadow-none resize-y"
              {...form.register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-on-surface font-semibold">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. full-sun, air-purifying, pet-friendly"
              className="h-12 bg-surface-container-low border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl px-4 text-base shadow-none"
              {...form.register("tags")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Pricing */}
      <Card className="bg-surface-lowest border-0 shadow-ambient rounded-3xl overflow-hidden">
        <CardHeader className="bg-surface-container-lowest/50 px-8 pt-8 pb-6 border-b border-outline-variant/20">
          <CardTitle className="text-xl font-serif text-on-surface">Pricing & Inventory</CardTitle>
          <CardDescription className="text-on-surface-variant">Set price, stock, and SKU tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-on-surface font-semibold">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={1}
                className="h-12 bg-surface-container-low border-0 shadow-none rounded-xl px-4"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-xs text-error mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price" className="text-on-surface font-semibold">Sale Price (₹)</Label>
              <Input
                id="sale_price"
                type="number"
                min={0}
                step={1}
                className="h-12 bg-surface-container-low border-0 shadow-none rounded-xl px-4"
                {...form.register("sale_price", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_qty" className="text-on-surface font-semibold">Stock Qty</Label>
              <Input
                id="stock_qty"
                type="number"
                min={0}
                className="h-12 bg-surface-container-low border-0 shadow-none rounded-xl px-4"
                {...form.register("stock_qty", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-on-surface font-semibold">Unit</Label>
              <Select
                value={form.watch("unit") || "piece"}
                onValueChange={(val) => form.setValue("unit", val ?? "piece")}
              >
                <SelectTrigger className="h-12 bg-surface-container-low border-0 shadow-none rounded-xl px-4 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-ambient border-0 bg-surface-lowest">
                  {PRODUCT_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value} className="rounded-lg">{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku" className="text-on-surface font-semibold">SKU / Item Code</Label>
            <Input 
              id="sku" 
              placeholder="e.g. M-ALBO-001" 
              className="h-12 bg-surface-container-low border-0 shadow-none rounded-xl px-4"
              {...form.register("sku")} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Images */}
      <Card className="bg-surface-lowest border-0 shadow-ambient rounded-3xl overflow-hidden">
        <CardHeader className="bg-surface-container-lowest/50 px-8 pt-8 pb-6 border-b border-outline-variant/20">
          <CardTitle className="text-xl font-serif text-on-surface">Botanical Imagery</CardTitle>
          <CardDescription className="text-on-surface-variant">Upload up to 8 high-quality photos. The first acts as the cover.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 py-6">
          <ImageUpload
            value={imageUrls}
            onChange={setImageUrls}
            maxImages={8}
            bucket={STORAGE_BUCKETS.PRODUCT_IMAGES}
            folder="products"
          />
        </CardContent>
      </Card>

      {/* Section 4: Variants */}
      <Card className="bg-surface-lowest border-0 shadow-ambient rounded-3xl overflow-hidden">
        <CardHeader className="bg-surface-container-lowest/50 px-8 pt-8 pb-6 border-b border-outline-variant/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-serif text-on-surface">Pot Sizes & Variations</CardTitle>
            <CardDescription className="text-on-surface-variant mt-1">Add size or pot variations (optional)</CardDescription>
          </div>
          <Button
            type="button"
            className="rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors h-10 shadow-sm border-0 font-medium"
            onClick={() =>
              append({ variant_name: "", price: 0, stock_qty: 0 })
            }
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Variant
          </Button>
        </CardHeader>
        {fields.length > 0 && (
          <CardContent className="space-y-4 px-8 py-6">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 relative">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Name *</Label>
                    <Input
                      placeholder="e.g. 6 inch Pot"
                      className="h-10 bg-surface-lowest border border-outline-variant/30 rounded-lg px-3 shadow-none focus-visible:ring-1 focus-visible:ring-primary text-sm"
                      {...form.register(`variants.${index}.variant_name`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Price (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      className="h-10 bg-surface-lowest border border-outline-variant/30 rounded-lg px-3 shadow-none focus-visible:ring-1 focus-visible:ring-primary text-sm"
                      {...form.register(`variants.${index}.price`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Stock</Label>
                    <Input
                      type="number"
                      min={0}
                      className="h-10 bg-surface-lowest border border-outline-variant/30 rounded-lg px-3 shadow-none focus-visible:ring-1 focus-visible:ring-primary text-sm"
                      {...form.register(`variants.${index}.stock_qty`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">SKU</Label>
                    <Input
                      placeholder="Optional"
                      className="h-10 bg-surface-lowest border border-outline-variant/30 rounded-lg px-3 shadow-none focus-visible:ring-1 focus-visible:ring-primary text-sm"
                      {...form.register(`variants.${index}.sku`)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-error/70 hover:text-error hover:bg-error/10 rounded-xl sm:mt-6 absolute top-3 right-3 sm:static transition-colors"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Section 5: Settings */}
      <Card className="bg-surface-lowest border-0 shadow-ambient rounded-3xl overflow-hidden">
        <CardHeader className="bg-surface-container-lowest/50 px-8 pt-8 pb-6 border-b border-outline-variant/20">
          <CardTitle className="text-xl font-serif text-on-surface">Status & Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-8 py-6">
          <div className="space-y-2">
            <Label htmlFor="care_instructions" className="text-on-surface font-semibold">Care Instructions</Label>
            <Textarea
              id="care_instructions"
              rows={3}
              placeholder="e.g. Keep in bright indirect light, water when top 2 inches dry..."
              className="bg-surface-container-low border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl px-4 py-3 text-base shadow-none resize-y"
              {...form.register("care_instructions")}
            />
          </div>

          <Separator className="bg-outline-variant/20" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-on-surface">Publish Listing</p>
              <p className="text-sm text-on-surface-variant">
                Make this product visible in your store catalog
              </p>
            </div>
            <Switch
              checked={form.watch("is_active")}
              onCheckedChange={(val) => form.setValue("is_active", val)}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-on-surface">Featured Placements</p>
              <p className="text-sm text-on-surface-variant">
                Showcase on your store&apos;s featured row
              </p>
            </div>
            <Switch
              checked={form.watch("is_featured")}
              onCheckedChange={(val) => form.setValue("is_featured", val)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-end pt-4 w-full">
        <Button
          type="button"
          className="h-14 px-8 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-semibold shadow-none border-0 w-full sm:w-auto"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-14 px-8 bg-gradient-premium text-on-primary rounded-xl shadow-ambient hover:-translate-y-0.5 transition-transform font-bold text-base w-full sm:w-auto"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          {mode === "edit" ? "Update Plant Listing" : "Create Plant Listing"}
        </Button>
      </div>
    </form>
  );
}
