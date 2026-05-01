import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/customers
 * Returns all buyer accounts with order counts
 */
export async function GET(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = 20;
    const offset = (page - 1) * perPage;

    const { data: customers, error, count } = await supabase
      .from("users")
      .select("id, full_name, email, phone, role, is_active, avatar_url, created_at", { count: "exact" })
      .eq("role", "buyer")
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);

    if (error) {
      console.error("Admin customers error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Get order counts per customer
    const customerIds = (customers || []).map((c) => c.id);
    const orderCounts: Record<string, number> = {};

    if (customerIds.length > 0) {
      const { data: orderData } = await supabase
        .from("orders")
        .select("user_id")
        .in("user_id", customerIds);

      if (orderData) {
        for (const o of orderData) {
          orderCounts[o.user_id] = (orderCounts[o.user_id] || 0) + 1;
        }
      }
    }

    const formattedCustomers = (customers || []).map((c) => ({
      id: c.id,
      full_name: c.full_name,
      email: c.email,
      phone: c.phone,
      is_active: c.is_active,
      avatar_url: c.avatar_url,
      order_count: orderCounts[c.id] || 0,
      date: c.created_at,
    }));

    return NextResponse.json({
      customers: formattedCustomers,
      total: count || 0,
      page,
      perPage,
    });
  } catch (err) {
    console.error("Admin Customers API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/customers
 * Suspend or reactivate a customer account
 * Body: { id: string, is_active: boolean }
 */
export async function PATCH(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { id, is_active } = body;

    if (!id || typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "id and is_active (boolean) are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("users")
      .update({ is_active })
      .eq("id", id)
      .eq("role", "buyer");

    if (error) {
      console.error("Suspend customer error:", error);
      return NextResponse.json({ error: "Failed to update customer status" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: is_active ? "Customer account activated" : "Customer account suspended",
    });
  } catch (err) {
    console.error("PATCH /api/admin/customers error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/customers?id=<user_id>
 * Permanently delete a customer account (DB row + Supabase Auth user)
 */
export async function DELETE(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Customer id is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify the user is actually a buyer before deleting
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", id)
      .eq("role", "buyer")
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Delete from users table first (cascades will handle related data)
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete customer DB error:", deleteError);
      return NextResponse.json({ error: "Failed to delete customer data" }, { status: 500 });
    }

    // Delete from Supabase Auth using admin client
    const adminClient = createAdminClient();
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(id);

    if (authDeleteError) {
      console.error("Delete auth user error:", authDeleteError);
      // DB row is already deleted; log but don't fail the request
    }

    return NextResponse.json({ success: true, message: "Customer account deleted permanently" });
  } catch (err) {
    console.error("DELETE /api/admin/customers error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
