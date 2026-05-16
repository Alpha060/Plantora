import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/user/addresses — List user's saved addresses
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Normalize: expose full_address as address_line1 so all consumers agree on field names
    const normalized = (data || []).map((a: Record<string, unknown>) => ({
      ...a,
      address_line1: a.full_address,
    }));
    return NextResponse.json({ data: normalized });
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/user/addresses — Add new address
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Check address count (max 5)
    const { count } = await supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count || 0) >= 5) {
      return NextResponse.json({ error: "Maximum 5 addresses allowed" }, { status: 400 });
    }

    // If this is first address, make it default
    const isFirst = (count || 0) === 0;

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        label: body.label || "Home",
        full_name: body.full_name,
        phone: body.phone,
        full_address: body.address_line1 || body.full_address,
        city: body.city || "Daltonganj",
        state: body.state || "Jharkhand",
        pin_code: body.pin_code,
        landmark: body.landmark || null,
        is_default: isFirst,
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Address POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
