import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  min_order_amount: z.number().nonnegative().nullish(),
  max_discount: z.number().nonnegative().nullish(),
  valid_from: z.string().nullish(),
  valid_to: z.string().nullish(),
  usage_limit: z.number().int().positive().nullish(),
  per_user_limit: z.number().int().positive().default(1),
  applicable_to: z.enum(["all", "specific_category"]).default("all"),
  category_id: z.string().uuid().nullish(),
  is_active: z.boolean().default(true),
});

/**
 * GET /api/admin/coupons — List all coupons
 */
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Coupons fetch error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const formatted = (coupons || []).map((c) => ({
      ...c,
      value: Number(c.value),
      min_order_amount: c.min_order_amount ? Number(c.min_order_amount) : null,
      max_discount: c.max_discount ? Number(c.max_discount) : null,
      category_name: (c.categories as { name: string } | null)?.name || null,
    }));

    return NextResponse.json({ coupons: formatted });
  } catch (err) {
    console.error("Admin Coupons API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/coupons — Create a new coupon
 */
export async function POST(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const body = await request.json();
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", parsed.data.code)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      console.error("Create coupon error:", error);
      return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err) {
    console.error("Admin Coupons POST Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
