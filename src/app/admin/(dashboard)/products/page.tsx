"use client";

import { useEffect, useState, useCallback } from "react";
import { Package, Search, ChevronLeft, ChevronRight, Star, Store, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock_qty: number;
  is_active: boolean;
  is_featured: boolean;
  store_name: string;
  category_name: string;
  image: string | null;
  date: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const perPage = 20;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/products?${params}`);
      const json = await res.json();
      if (res.ok) {
        setProducts(json.products);
        setTotal(json.total);
      } else {
        toast.error(json.error || "Failed to load products");
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / perPage);

  const filtered = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.store_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground mt-1">Moderate and manage all platform listings</p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(1); } }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSpinner text="Loading products..." className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="No products match your search or filters."
        />
      ) : (
        <>
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Store</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-600">Price</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Stock</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate max-w-[200px]">{product.name}</p>
                              {product.is_featured && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0 rounded-full mt-0.5">
                                  <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-400" />Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Store className="h-3.5 w-3.5" />{product.store_name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{product.category_name}</td>
                        <td className="py-3 px-4 text-right">
                          {product.sale_price ? (
                            <div>
                              <span className="font-bold text-gray-900">{formatCurrency(product.sale_price)}</span>
                              <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(product.price)}</span>
                            </div>
                          ) : (
                            <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-semibold ${product.stock_qty <= 0 ? "text-red-600" : product.stock_qty <= 5 ? "text-amber-600" : "text-gray-900"}`}>
                            {product.stock_qty}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {product.is_active ? (
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                              <Eye className="h-3 w-3 mr-1" />Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] px-2 py-0.5 rounded-full">
                              <EyeOff className="h-3 w-3 mr-1" />Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(product.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{page}/{totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
