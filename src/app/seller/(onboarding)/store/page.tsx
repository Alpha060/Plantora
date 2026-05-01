"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/image-upload";

const storeSchema = z.object({
  store_name: z.string().min(2, "Store name is required"),
  description: z.string().min(10, "Provide a short description (min 10 chars)"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  address: z.string().min(10, "Full address required"),
  pin_code: z.string().min(6, "Valid 6-digit PIN code required").max(6),
  gst_number: z.string().optional(),
});

type StoreFormData = z.infer<typeof storeSchema>;

export default function OnboardingStorePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrls, setLogoUrls] = useState<string[]>([]);
  const [bannerUrls, setBannerUrls] = useState<string[]>([]);

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      store_name: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      pin_code: "",
      gst_number: "",
    },
  });

  const onSubmit = async (data: StoreFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/seller/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          logo_url: logoUrls[0] || null,
          banner_url: bannerUrls[0] || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to save store details");
        return;
      }

      toast.success("Store details saved successfully");
      router.push("/seller/documents");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-lowest rounded-2xl shadow-ambient border border-surface-container-high p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-on-surface mb-2">Store Profile</h1>
        <p className="text-on-surface-variant">Setup your public store identity and contact information.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="font-semibold text-on-surface">Store Logo</Label>
            <p className="text-xs text-on-surface-variant mb-2">Recommended: 400x400px (1:1)</p>
            <ImageUpload 
              value={logoUrls} 
              onChange={setLogoUrls} 
              maxImages={1} 
              bucket="store-assets"
              folder="logos"
            />
          </div>
          <div className="space-y-3">
            <Label className="font-semibold text-on-surface">Store Banner</Label>
            <p className="text-xs text-on-surface-variant mb-2">Recommended: 1200x400px (3:1)</p>
            <ImageUpload 
              value={bannerUrls} 
              onChange={setBannerUrls} 
              maxImages={1} 
              bucket="store-assets"
              folder="banners"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-surface-container-high">
          {/* Text fields */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="store_name">Store Name *</Label>
            <Input id="store_name" placeholder="E.g., Green Haven Nursery" {...form.register("store_name")} />
            {form.formState.errors.store_name && <p className="text-xs text-error">{form.formState.errors.store_name.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Store Description *</Label>
            <Textarea 
              id="description" 
              placeholder="Tell buyers about your plants, specialties, and history..." 
              className="resize-none h-24"
              {...form.register("description")} 
            />
            {form.formState.errors.description && <p className="text-xs text-error">{form.formState.errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Contact Phone *</Label>
            <Input id="phone" placeholder="10-digit mobile number" {...form.register("phone")} />
            {form.formState.errors.phone && <p className="text-xs text-error">{form.formState.errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Contact Email *</Label>
            <Input id="email" type="email" placeholder="store@example.com" {...form.register("email")} />
            {form.formState.errors.email && <p className="text-xs text-error">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Physical Address *</Label>
            <Input id="address" placeholder="Complete shop/nursery address in Daltonganj" {...form.register("address")} />
            {form.formState.errors.address && <p className="text-xs text-error">{form.formState.errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin_code">PIN Code *</Label>
            <Input id="pin_code" placeholder="E.g., 822101" maxLength={6} {...form.register("pin_code")} />
            {form.formState.errors.pin_code && <p className="text-xs text-error">{form.formState.errors.pin_code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_number">GST Number (Optional)</Label>
            <Input id="gst_number" placeholder="15-digit GSTIN" {...form.register("gst_number")} />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-surface-container-high">
          <Button type="submit" disabled={isLoading} className="bg-primary px-8 rounded-full h-12 shadow-md">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
