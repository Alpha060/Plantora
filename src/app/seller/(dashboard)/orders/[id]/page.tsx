"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Package, Clock, User, MapPin, Truck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type SellerOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

interface DeliveryAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  landmark?: string;
}

interface SellerOrderDetail {
  id: string;
  order_number: string;
  status: SellerOrderStatus;
  created_at: string;
  delivery_address: DeliveryAddress | null;
}

interface SellerOrderItem {
  id: string;
  product_image: string | null;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface SellerOrderDetailResponse {
  order: SellerOrderDetail;
  items: SellerOrderItem[];
}

export default function SellerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [data, setData] = useState<SellerOrderDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/seller/orders/${id}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.error || "Failed to load order");
        router.push("/seller/orders");
      }
    } catch {
      toast.error("Failed to load order");
      router.push("/seller/orders");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (newStatus: SellerOrderStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/seller/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Order marked as ${newStatus.replace("_", " ")}`);
        fetchOrder();
      } else {
        toast.error(json.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading order details...</div>;
  }

  if (!data) return null;

  const { order, items } = data;
  const deliveryAddress = order.delivery_address || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/seller/orders")} className="shrink-0 bg-white shadow-sm border border-gray-200">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 tracking-tight flex items-center gap-3">
            Order #{order.order_number}
            <Badge
              variant="outline"
              className={`px-3 py-1 rounded-full font-medium uppercase tracking-wider text-[10px] shadow-sm
                ${
                  order.status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                  order.status === "processing" ? "bg-blue-100 text-blue-700 border-blue-200" :
                  order.status === "shipped" ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                  order.status === "out_for_delivery" ? "bg-purple-100 text-purple-700 border-purple-200" :
                  order.status === "delivered" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                  "bg-red-100 text-red-700 border-red-200"
                }
              `}
            >
              {order.status.replace("_", " ")}
            </Badge>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Items to Fulfill ({items.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border shadow-sm">
                    {item.product_image ? (
                      <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{item.product_name}</h4>
                    {item.variant_name && (
                      <p className="text-xs text-gray-500 mt-0.5">Variant: {item.variant_name}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700">Qty: {item.quantity}</span>
                      <span className="text-gray-500">@ {formatCurrency(item.unit_price)} each</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">{formatCurrency(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Your Fulfillable Total</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(items.reduce((sum, item) => sum + Number(item.total_price), 0))}
              </span>
            </div>
          </div>

          {/* Action Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-emerald-600" />
              Update Order Status
            </h3>
            
            <div className="flex flex-wrap gap-3">
              {order.status === "pending" && (
                <Button 
                  onClick={() => updateStatus("processing")} 
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark as Processing
                </Button>
              )}
              {order.status === "processing" && (
                <Button 
                  onClick={() => updateStatus("shipped")} 
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Mark as Shipped
                </Button>
              )}
              {order.status === "shipped" && (
                <span className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border">
                  Waiting for Rider to mark &apos;Out for Delivery&apos;.
                </span>
              )}
              {!["pending", "processing"].includes(order.status) && order.status !== "shipped" && (
                <span className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border">
                  Status cannot be updated by seller at this stage.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              Customer Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Name</p>
                <p className="font-medium text-gray-900">{deliveryAddress.fullName || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Contact</p>
                <p className="font-medium text-gray-900">{deliveryAddress.phone || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Delivery Address
            </h3>
            <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="font-medium text-gray-900">{deliveryAddress.fullName}</p>
              <p className="mt-1">{deliveryAddress.addressLine1}</p>
              {deliveryAddress.addressLine2 && <p>{deliveryAddress.addressLine2}</p>}
              <p className="mt-1">{deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.pinCode}</p>
              {deliveryAddress.landmark && <p className="mt-2 text-xs text-gray-500">Landmark: {deliveryAddress.landmark}</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
