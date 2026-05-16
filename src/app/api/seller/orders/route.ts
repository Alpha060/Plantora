import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

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

    const supabaseAdmin = createAdminClient();

    // Fetch order_sellers (sub-orders) for this store
    let query = supabaseAdmin
      .from("order_sellers")
      .select(`
        id,
        order_id,
        status,
        seller_amount,
        created_at,
        orders!inner(order_number, status, total, delivery_date, created_at),
        order_items(quantity, total_price)
      `)
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("orders.status", status);
    }

    const { data: subOrders, error } = await query;

    if (error) {
      console.error("Orders DB Error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Format orders for the frontend
    const formattedOrders: FormattedSellerOrder[] = (subOrders || []).map((subOrder: any) => {
      // Sum items quantity
      const itemsCount = subOrder.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
      // We can use seller_amount for the total, or sum order_items total_price.
      // Seller cut is seller_amount.
      return {
        id: subOrder.order_id, // frontend expects order.id to navigate to /orders/[id]
        order_number: subOrder.orders.order_number,
        status: subOrder.status,
        date: subOrder.orders.created_at,
        delivery_date: subOrder.orders.delivery_date,
        items: itemsCount,
        total: Number(subOrder.seller_amount || 0)
      };
    });

    return NextResponse.json(formattedOrders, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });

  } catch (error: unknown) {
    console.error("Orders API Error:", getErrorMessage(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
