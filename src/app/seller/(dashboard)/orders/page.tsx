"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, PackageOpen, Filter } from "lucide-react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency } from "@/lib/utils";

interface OrderRow {
  id: string; // The order.id
  order_number: string;
  status: string;
  date: string;
  delivery_date: string | null;
  items: number;
  total: number;
}

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/orders");
      const json = await res.json();
      if (res.ok) {
        setOrders(json || []);
      } else {
        toast.error("Failed to load orders");
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns: ColumnDef<OrderRow>[] = [
    {
      accessorKey: "order_number",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-semibold font-mono text-gray-900">
          #{row.original.order_number}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {new Date(row.original.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => (
        <span className="text-gray-600 flex items-center gap-1.5">
          <PackageOpen className="h-4 w-4 text-gray-400" />
          {row.original.items} items
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total (Your Cut)",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant="outline"
            className={`px-3 py-1 rounded-full font-medium uppercase tracking-wider text-[10px]
              ${
                s === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                s === "processing" ? "bg-blue-100 text-blue-700 border-blue-200" :
                s === "shipped" ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                s === "out_for_delivery" ? "bg-purple-100 text-purple-700 border-purple-200" :
                s === "delivered" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                "bg-red-100 text-red-700 border-red-200"
              }
            `}
          >
            {s.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/seller/orders/${row.original.id}`)}
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Orders"
        description="Manage your incoming orders and update delivery statuses."
        action={
          <Button variant="outline" className="bg-white rounded-full font-medium" onClick={fetchOrders}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading orders...</div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            searchColumn="order_number"
          />
        )}
      </div>
    </div>
  );
}
