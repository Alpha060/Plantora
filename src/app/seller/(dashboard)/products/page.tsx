"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Package, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PriceDisplay } from "@/components/shared/price-display";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock_qty: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  product_images: { id: string; image_url: string; is_primary: boolean }[];
  stores: { id: string; store_name: string; slug: string };
  categories?: { id: string; name: string; slug: string };
}

export default function SellerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products?pageSize=100");
      const json = await res.json();
      if (res.ok) {
        setProducts(json.data || []);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deactivated");
        fetchProducts();
      } else {
        const json = await res.json();
        toast.error(json.error || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<ProductRow>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        const primaryImage = product.product_images?.find((i) => i.is_primary);
        return (
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/50 shadow-sm">
              {primaryImage ? (
                <Image
                  src={primaryImage.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-on-surface-variant">
                  <Package className="h-5 w-5 opacity-50" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-on-surface truncate text-base">{product.name}</p>
              <p className="text-sm text-primary font-medium tracking-tight">
                /{product.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <PriceDisplay
          price={row.original.price}
          salePrice={row.original.sale_price}
          size="sm"
        />
      ),
    },
    {
      accessorKey: "stock_qty",
      header: "Stock",
      cell: ({ row }) => {
        const qty = row.original.stock_qty;
        return (
          <Badge
            variant="outline"
            className={qty > 10 ? "bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full font-medium" : qty > 0 ? "bg-amber-100 text-amber-700 border-amber-200 px-3 py-1 rounded-full font-medium" : "bg-error/10 text-error border-error/20 px-3 py-1 rounded-full font-medium"}
          >
            {qty} in stock
          </Badge>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge 
          variant="outline"
          className={row.original.is_active ? "bg-primary-container text-primary-fixed font-medium px-3 py-1 rounded-full border-0 shadow-sm" : "bg-surface-container-high text-on-surface-variant font-medium px-3 py-1 rounded-full border-0 shadow-sm"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-surface-container text-on-surface hover:text-primary transition-colors hover:shadow-sm rounded-xl"
            onClick={() => router.push(`/product/${row.original.slug}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-surface-container text-on-surface hover:text-primary transition-colors hover:shadow-sm rounded-xl"
            onClick={() =>
              router.push(`/seller/products/edit/${row.original.id}`)
            }
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-error/10 text-error transition-colors hover:shadow-sm rounded-xl"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Products"
        description="Manage your botanical collection and add new items."
        breadcrumbs={[
          { label: "Dashboard", href: "/seller/dashboard" },
          { label: "Products" },
        ]}
        action={
          <Button
            size="lg"
            className="bg-gradient-premium text-on-primary rounded-xl shadow-ambient hover:-translate-y-0.5 transition-transform font-semibold h-12 px-6"
            onClick={() => router.push("/seller/products/add")}
          >
            <Plus className="h-5 w-5 mr-1.5" />
            Add New Plant
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner text="Loading products..." className="h-64" />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Build your collection by adding your first plant to the marketplace."
          actionLabel="Add Product"
          onAction={() => router.push("/seller/products/add")}
        />
      ) : (
        <DataTable
          columns={columns}
          data={products}
          searchColumn="name"
          searchPlaceholder="Search collection..."
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Deactivate Product"
        description="This will hide the product from buyers. You can reactivate it later."
        confirmLabel="Deactivate"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
