import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface OrderItemWithStatus {
  order_id: string;
  total_price: number;
  created_at: string;
  orders: {
    status: string;
  };
}

interface RecentOrderItem {
  order_id: string;
  product_name: string;
  total_price: number;
  created_at: string;
  orders: {
    order_number: string;
    status: string;
    total: number;
  };
}

interface RecentOrderSummary {
  id: string;
  order_number: string;
  status: string;
  date: string;
  items: string[];
  total: number;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: store } = await supabase
      .from("stores")
      .select("id, rating")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // 1. Total Products
    const { count: productCount, error: productError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("store_id", store.id)
      .eq("is_deleted", false);

    // 2. Low Stock Products
    const { data: lowStockProducts } = await supabase
      .from("products")
      .select("id, name, stock_qty, price")
      .eq("store_id", store.id)
      .eq("is_deleted", false)
      .lt("stock_qty", 10)
      .order("stock_qty", { ascending: true })
      .limit(5);

    // 3. Sales & Active Orders
    // We get order_items for this seller, joined with their parent order
    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        total_price,
        created_at,
        orders!inner(status)
      `)
      .eq("order_seller_id", store.id);

    let totalSales = 0;
    const activeOrders = new Set<string>();
    const salesByDate: Record<string, number> = {};

    if (orderItems) {
      (orderItems as OrderItemWithStatus[]).forEach((item) => {
        // Calculate Total Sales (excluding cancelled)
        if (item.orders.status !== "cancelled") {
          totalSales += Number(item.total_price);
          
          // Construct 7-day chart data
          const date = new Date(item.created_at).toISOString().split("T")[0];
          salesByDate[date] = (salesByDate[date] || 0) + Number(item.total_price);
        }
        
        // Calculate Active Orders count
        if (!["delivered", "cancelled", "returned"].includes(item.orders.status)) {
          activeOrders.add(item.order_id);
        }
      });
    }

    // Format chart date for last 7 days
    const chartData: Array<{ date: string; sales: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const displayDate = d.toLocaleDateString("en-US", { weekday: "short" });
      chartData.push({
        date: displayDate,
        sales: salesByDate[dateString] || 0
      });
    }

    // 4. Recent Orders
    const { data: recentOrderItems } = await supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        product_name,
        total_price,
        created_at,
        orders!inner(order_number, status, total)
      `)
      .eq("order_seller_id", store.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // Deduplicate recent orders (since one order might have multiple items)
    const recentOrdersMap = new Map<string, RecentOrderSummary>();
    if (recentOrderItems) {
      (recentOrderItems as RecentOrderItem[]).forEach((item) => {
        if (!recentOrdersMap.has(item.order_id)) {
          recentOrdersMap.set(item.order_id, {
            id: item.order_id,
            order_number: item.orders.order_number,
            status: item.orders.status,
            date: item.created_at,
            items: [item.product_name],
            total: item.total_price // we sum it up below
          });
        } else {
          const existing = recentOrdersMap.get(item.order_id);
          if (existing) {
            existing.items.push(item.product_name);
            existing.total += item.total_price;
          }
        }
      });
    }

    const recentOrders = Array.from(recentOrdersMap.values()).slice(0, 5);

    return NextResponse.json({
      metrics: {
        totalSales,
        activeOrders: activeOrders.size,
        totalProducts: productCount || 0,
        averageRating: store.rating || 0,
      },
      chartData,
      lowStockProducts: lowStockProducts || [],
      recentOrders
    });

  } catch (error: unknown) {
    console.error("Dashboard API Error:", getErrorMessage(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
