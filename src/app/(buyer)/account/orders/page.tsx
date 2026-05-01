"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Search, ChevronRight, Loader2, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { formatPrice, formatDate, getStatusColor, formatStatus } from "@/lib/helpers/format";

interface OrderListItem {
  id: string;
  order_number: string;
  status: string;
  total: number;
  payment_method: string;
  created_at: string;
  order_sellers: {
    id: string;
    status: string;
    subtotal: number;
    stores: { id: string; store_name: string } | null;
    order_items: { id: string; product_name: string; product_image: string | null; quantity: number; unit_price: number }[];
  }[];
}

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "placed", label: "Active" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      params.set("pageSize", "50");
      const res = await fetch(`/api/orders?${params}`);
      const json = await res.json();
      if (res.ok) setOrders(json.data || []);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  const filtered = orders.filter((o) =>
    !search || o.order_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: "My Orders" }]} />
        <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight mt-6 mb-6">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${activeTab === tab.value ? "bg-botanical-gradient text-white" : "bg-surface-low text-on-surface-variant hover:bg-surface-high"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order number..." className="bg-surface-lowest border-0 pl-10 shadow-ambient-sm" />
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-botanical" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <ShoppingBag className="h-12 w-12 mx-auto text-on-surface-variant/30" />
            <p className="text-on-surface-variant">No orders found</p>
            <Link href="/shop" className="inline-block px-6 py-2.5 rounded-full bg-botanical-gradient text-white text-sm font-medium">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const itemCount = order.order_sellers.reduce((s, os) => s + os.order_items.length, 0);
              const firstImage = order.order_sellers[0]?.order_items[0]?.product_image;
              return (
                <Link key={order.id} href={`/account/orders/${order.id}`}>
                  <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-4 sm:p-5 hover:shadow-ambient transition-shadow group">
                    <div className="flex items-start gap-4">
                      {/* Image preview */}
                      <div className="h-16 w-16 rounded-xl bg-surface-low overflow-hidden shrink-0">
                        {firstImage ? (
                          <img src={firstImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center"><Package className="h-6 w-6 text-on-surface-variant/30" /></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-mono text-sm font-semibold text-on-surface">{order.order_number}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{formatDate(order.created_at)}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex gap-3 text-xs text-on-surface-variant">
                            <span>{itemCount} item{itemCount > 1 ? "s" : ""}</span>
                            <span className="uppercase">{order.payment_method}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-on-surface">{formatPrice(order.total)}</span>
                            <ChevronRight className="h-4 w-4 text-on-surface-variant/50 group-hover:text-botanical transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
