"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";

interface SellerRow {
  id: string;
  store_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  logo_url: string | null;
}

export default function AdminSellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSellers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/sellers");
      const json = await res.json();
      if (res.ok) {
        setSellers(json || []);
      } else {
        toast.error("Failed to load sellers");
      }
    } catch {
      toast.error("Failed to load sellers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const columns: ColumnDef<SellerRow>[] = [
    {
      accessorKey: "store_name",
      header: "Store",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 border shrink-0">
              {s.logo_url ? (
                <Image src={s.logo_url} alt={s.store_name} fill className="object-cover" sizes="40px" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <Store className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{s.store_name}</p>
              <p className="text-xs text-gray-500 truncate">{s.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.phone || "N/A"}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Registered",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant="outline"
            className={`px-3 py-1 rounded-full font-medium uppercase tracking-wider text-[10px]
              ${
                status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                status === "suspended" ? "bg-red-100 text-red-700 border-red-200" :
                status === "rejected" ? "bg-gray-100 text-gray-700 border-gray-200" :
                "bg-gray-50 text-gray-600"
              }
            `}
          >
            {status || "Unknown"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/sellers/${row.original.id}`)}
          className="rounded-full shadow-sm"
        >
          <Eye className="h-4 w-4 mr-2 text-primary" />
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Seller Management"
        description="Approve new registrations, suspend violators, and monitor platform merchants."
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading sellers...</div>
        ) : (
          <DataTable
            columns={columns}
            data={sellers}
            searchColumn="store_name"
            searchPlaceholder="Search store name..."
          />
        )}
      </div>
    </div>
  );
}
