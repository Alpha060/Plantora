import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SellerOrderListItem {
  order_id: string;
  total_price: number;
  orders: {
    order_number: string;
    status: string;
    delivery_date: string | null;
    created_at: string;
  };
}

interface FormattedSellerOrder {
  id: string;
  order_number: string;
  status: string;
  date: string;
  delivery_date: string | null;
  items: number;
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
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Parse filters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Fetch order items belonging to the seller
    let query = supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        product_name,
        quantity,
        total_price,
        created_at,
        orders!inner(order_number, status, total, delivery_date, created_at)
      `)
      .eq("order_seller_id", store.id)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      // Must filter orders!inner by status
      query = query.eq("orders.status", status);
    }

    const { data: orderItems, error } = await query;

    if (error) {
      console.error("Orders DB Error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Group items by order to present one row per Order
    const ordersMap = new Map<string, FormattedSellerOrder>();
    (orderItems as SellerOrderListItem[] | null)?.forEach((item) => {
      if (!ordersMap.has(item.order_id)) {
        ordersMap.set(item.order_id, {
          id: item.order_id,
          order_number: item.orders.order_number,
          status: item.orders.status,
          date: item.orders.created_at,
          delivery_date: item.orders.delivery_date,
          items: 1,
          total: Number(item.total_price)
        });
      } else {
        const existing = ordersMap.get(item.order_id);
        if (existing) {
          existing.items += 1;
          existing.total += Number(item.total_price);
        }
      }
    });

    const formattedOrders = Array.from(ordersMap.values()).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(formattedOrders);

  } catch (error: unknown) {
    console.error("Orders API Error:", getErrorMessage(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
