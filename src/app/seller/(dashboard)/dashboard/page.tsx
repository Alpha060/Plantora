"use client";

import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingBag, Users, Calendar, Plus, ExternalLink, Settings, Edit, Bell, ClipboardList, TrendingUp, CheckCircle, Clock, XCircle, Info, Check, Loader2, Truck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

interface SellerDashboardMetrics {
  totalOrders: number;
  totalSales: number;
  totalProducts: number;
  totalCustomers: number;
}

interface OrderSummary {
  newOrders: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  orders: number;
  stock: number;
  status: "Active" | "Out of Stock";
}

interface Notification {
  id: string;
  type: "success" | "info" | "warning";
  message: string;
  time: string;
}

interface RecentOrder {
  id: string;
  order_number: string;
  items: string[];
  total: number;
  status: string;
}

interface SellerDashboardData {
  metrics: SellerDashboardMetrics;
  orderSummary: OrderSummary;
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  notifications: Notification[];
}

const defaultData: SellerDashboardData = {
    metrics: { totalOrders: 0, totalSales: 0, totalProducts: 0, totalCustomers: 0 },
    orderSummary: { newOrders: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
    topProducts: [],
    recentOrders: [],
    notifications: []
  };

export default function SellerDashboard() {
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/seller/dashboard");
        const json = await res.json();
        if (json && json.metrics) {
          setData(json);
        } else {
          setData(defaultData);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const dataToUse = {
    metrics: data?.metrics || defaultData.metrics,
    orderSummary: data?.orderSummary || defaultData.orderSummary,
    topProducts: data?.topProducts || defaultData.topProducts,
    recentOrders: data?.recentOrders || defaultData.recentOrders,
    notifications: data?.notifications || defaultData.notifications,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-500">Welcome back, {user?.full_name || "Seller"}!</p>
        </div>
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
      {/* Metrics Row */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-100 bg-green-50/30 shadow-none border-none">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <h3 className="text-3xl font-bold text-gray-900">{dataToUse.metrics.totalOrders}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> 12% from last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-100 bg-blue-50/30 shadow-none border-none">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Sales</p>
                <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(dataToUse.metrics.totalSales)}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> 15% from last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-orange-50/30 shadow-none border-none">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                <h3 className="text-3xl font-bold text-gray-900">{dataToUse.metrics.totalProducts}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> 5 new this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-purple-50/30 shadow-none border-none">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Customers</p>
                <h3 className="text-3xl font-bold text-gray-900">{dataToUse.metrics.totalCustomers}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> 8% from last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Left Column (Orders Summary + Top Products) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Orders Summary */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50 mb-4">
              <CardTitle className="text-base font-bold text-gray-800">Orders Summary</CardTitle>
              <Link href="/seller/orders" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                View All Orders
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 divide-x divide-gray-100 text-center">
                <div className="px-2">
                  <div className="mx-auto h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                    <ClipboardList className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{dataToUse.orderSummary.newOrders}</h4>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">New Orders</p>
                </div>
                <div className="px-2">
                  <div className="mx-auto h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                    <ShoppingBag className="h-5 w-5 text-orange-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{dataToUse.orderSummary.processing}</h4>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Processing</p>
                </div>
                <div className="px-2">
                  <div className="mx-auto h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                    <Truck className="h-5 w-5 text-blue-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{dataToUse.orderSummary.shipped}</h4>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Shipped</p>
                </div>
                <div className="px-2">
                  <div className="mx-auto h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{dataToUse.orderSummary.delivered}</h4>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Delivered</p>
                </div>
                <div className="px-2">
                  <div className="mx-auto h-10 w-10 rounded-full bg-red-50 flex items-center justify-center mb-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{dataToUse.orderSummary.cancelled}</h4>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-800">Top Selling Products</CardTitle>
              <Link href="/seller/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                View All Products
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Product</th>
                      <th className="px-6 py-3 font-semibold">Price</th>
                      <th className="px-6 py-3 font-semibold">Orders</th>
                      <th className="px-6 py-3 font-semibold">Stock</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dataToUse.topProducts.length > 0 ? (
                      dataToUse.topProducts.map((product) => (
                        <tr key={product.id} className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            {product.name}
                          </td>
                          <td className="px-6 py-4">₹{product.price}</td>
                          <td className="px-6 py-4">{product.orders}</td>
                          <td className="px-6 py-4">{product.stock}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                              {product.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                          <p>No products yet. Start by adding your first product!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Quick Actions + Recent Orders + Notifications) */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-start text-emerald-700 bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50 hover:text-emerald-800">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                  <Plus className="h-3 w-3" />
                </div>
                Add New Product
              </Button>
              <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-200 hover:bg-gray-50">
                <ExternalLink className="h-4 w-4 mr-4 text-gray-400" />
                View My Store
              </Button>
              <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-200 hover:bg-gray-50">
                <Settings className="h-4 w-4 mr-4 text-gray-400" />
                Manage Discounts
              </Button>
              <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-200 hover:bg-gray-50">
                <Edit className="h-4 w-4 mr-4 text-gray-400" />
                Update Store Info
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders List */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-800">Recent Orders</CardTitle>
              <Link href="/seller/orders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View All
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {dataToUse.recentOrders.length > 0 ? (
                  dataToUse.recentOrders.map((o) => (
                    <div key={o.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Order #{o.order_number}</p>
                          <p className="text-[11px] text-gray-500">{o.items?.join(", ") || "Order placed"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 mb-1">₹{o.total}</p>
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-semibold border-none
                          ${o.status === 'New' ? 'bg-emerald-50 text-emerald-600' : 
                            o.status === 'Processing' ? 'bg-orange-50 text-orange-600' :
                            o.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                            'bg-green-50 text-green-600'}
                        `}>
                          {o.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p>No orders yet.</p>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-50 text-center">
                <Link href="/seller/orders" className="text-xs font-semibold text-emerald-600 hover:underline">
                  View All Orders
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-800">Notifications</CardTitle>
              <Link href="/seller/notifications" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View All
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {dataToUse.notifications.map((n) => (
                  <div key={n.id} className="flex gap-3 items-start">
                    <div className={`mt-0.5 rounded-full p-1 
                      ${n.type === 'success' ? 'bg-green-100 text-green-600' : 
                        n.type === 'info' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                      {n.type === 'success' ? <Check className="h-3 w-3" /> : 
                       n.type === 'info' ? <Info className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
