import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/coupons — List all coupons (admin)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userData?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/coupons — Create a new coupon (admin)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userData?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const body = await request.json();

    // Check duplicate code
    const { data: existing } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", body.code.toUpperCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code: body.code.toUpperCase(),
        type: body.type,
        value: body.value,
        min_order_amount: body.min_order_amount || null,
        max_discount: body.max_discount || null,
        valid_from: body.valid_from || null,
        valid_to: body.valid_to || null,
        usage_limit: body.usage_limit || null,
        per_user_limit: body.per_user_limit || 1,
        is_active: body.is_active ?? true,
      })
      .select("id, code")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Coupon POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
