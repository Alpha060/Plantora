"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/seller/product-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  sku: string | null;
  stock_qty: number;
  unit: string;
  category_id: string;
  occasion: string[] | null;
  care_instructions: string | null;
  tags: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  product_images: Array<{ image_url: string; sort_order: number }>;
  product_variants: Array<{
    variant_name: string;
    price: number;
    sale_price: number | null;
    stock_qty: number;
    sku: string | null;
  }>;
}

export default function SellerProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setProduct(json.data);
      } else {
        toast.error(json.error || "Product not found");
        router.push("/seller/products");
      }
    } catch {
      toast.error("Failed to load product");
      router.push("/seller/products");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (isLoading) {
    return <LoadingSpinner text="Loading product..." className="h-64" />;
  }

  if (!product) return null;

  // Transform product data into the shape ProductForm expects
  const sortedImages = [...(product.product_images || [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const initialData = {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: Number(product.price),
    sale_price: product.sale_price ? Number(product.sale_price) : undefined,
    sku: product.sku || "",
    stock_qty: product.stock_qty,
    unit: product.unit,
    category_id: product.category_id || "",
    occasion: product.occasion?.length ? product.occasion[0] : undefined,
    care_instructions: product.care_instructions || "",
    tags: (product.tags || []).join(", "),
    is_featured: product.is_featured,
    is_active: product.is_active,
    images: sortedImages.map((img) => img.image_url),
    variants: (product.product_variants || []).map((v) => ({
      variant_name: v.variant_name,
      price: Number(v.price),
      sale_price: v.sale_price ? Number(v.sale_price) : undefined,
      stock_qty: v.stock_qty,
      sku: v.sku || "",
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Product"
        description={`Editing "${product.name}"`}
        breadcrumbs={[
          { label: "Dashboard", href: "/seller/dashboard" },
          { label: "Products", href: "/seller/products" },
          { label: "Edit Product" },
        ]}
      />
      <ProductForm mode="edit" initialData={initialData} />
    </div>
  );
}
